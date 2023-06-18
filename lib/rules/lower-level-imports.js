/**
 * @fileoverview Require that lower level modules be imported (lower-level-imports)
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { resolve, join, relative, parse } = require("path");
const { minimatch } = require("minimatch");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const layerNamePattern = "^[^/]+(/[^/]+)*$";

const layerSchema = {
  oneOf: [
    { type: "string", pattern: layerNamePattern },
    {
      type: "object",
      properties: {
        name: {
          type: "string",
          pattern: layerNamePattern,
        },
        interface: { type: "boolean" },
        isNodeModule: { type: "boolean" },
      },
      required: ["name"],
      additionalProperties: false,
    },
  ],
};

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: {
      type: "array",
      items: [
        {
          type: "object",
          properties: {
            structure: {
              type: "array",
              items: layerSchema,
            },
            root: {
              type: "string",
              pattern: "^\\.{1,2}(/[^/]+)*$",
            },
            aliases: {
              type: "object",
              patternProperties: {
                ["^.+$"]: {
                  type: "string",
                  pattern: "^\\.{1,2}(/[^/]+)*/?$",
                },
              },
              additionalProperties: false,
            },
            exclude: {
              type: "array",
              items: [{ type: "string" }],
            },
            useLevelNumber: {
              type: "boolean",
            },
          },
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
    messages: {
      "not-lower-level": "'{{module}}' is NOT LOWER level than '{{file}}'",
      interface: "An INTERFACE prevents '{{file}}' from importing '{{module}}'",
      "not-registered:file":
        "'{{file}}' does NOT registered at layer structure",
      "not-registered:module":
        "'{{module}}' does NOT registered at layer structure",
    },
  },
  create(context) {
    const options = {
      root: "./",
      structure: [],
      exclude: [],
      useLevelNumber: false,
      ...(context.options[0] || {}),
    };

    const cwd = context.getCwd();
    const rootDir = resolve(cwd, options.root);

    const fileSource = resolve(context.getFilename());
    const parsedFileSource = parse(fileSource);
    const fileDir = resolve(parsedFileSource.dir);
    const filePath = resolve(fileDir, parsedFileSource.name);
    const isExcludedFile = options.exclude.find((pattern) =>
      minimatch(fileSource, pattern)
    );

    const structure = options.structure.map((layer) => {
      const theLayer = typeof layer === "string" ? { name: layer } : layer;
      return theLayer.isNodeModule
        ? theLayer
        : { ...theLayer, name: join(rootDir, theLayer.name) };
    });

    const toSegments = (path) => path.split("/");

    const toPath = (segments) => segments.join("/");

    const toRelative = (path) => relative(rootDir, path);

    const removeAlias = (moduleSource) => {
      if (!options.aliases) return moduleSource;
      const aliases = Object.keys(options.aliases);
      aliases.sort((a, b) => b.length - a.length);
      const theAlias = aliases.find((alias) => moduleSource.startsWith(alias));
      if (!theAlias) return moduleSource;
      const modulePath = resolve(
        cwd,
        moduleSource.replace(theAlias, options.aliases[theAlias])
      );
      return modulePath.startsWith(`${fileDir}/`)
        ? `./${relative(fileDir, modulePath)}`
        : relative(fileDir, modulePath);
    };

    const createModulePath = (moduleSourceWithAlias) => {
      const moduleSource = removeAlias(moduleSourceWithAlias);
      const isNodeModule = moduleSource.startsWith(".") === false;
      return isNodeModule ? moduleSource : resolve(fileDir, moduleSource);
    };

    const isNodeModule = (modulePath) => {
      return modulePath.startsWith(rootDir) === false;
    };

    const isInSubDirOfFileDir = (modulePath) => {
      const relModulePath = relative(fileDir, modulePath);
      return (
        relModulePath.startsWith("..") === false &&
        toSegments(relModulePath).length >= 2
      );
    };

    const report = (messageId, node, modulePath) => {
      const module = isNodeModule(modulePath)
        ? modulePath
        : toRelative(modulePath);
      const file = toRelative(filePath);
      context.report({ node, messageId, data: { module, file } });
    };

    const reportUseLevelNumber = (node, modulePath) => {
      if (!options.useLevelNumber) return;

      const findParent = (segments) => toPath(segments.slice(0, -1));

      const findLevel = (segments) => {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment === "index") return -1;
        const level = lastSegment.split(" ")[0];
        return /^[\d]+$/.test(level) ? Number(level) : null;
      };

      const fileSegments = toSegments(filePath);
      const moduleSegments = toSegments(modulePath);
      const fileLevel = findLevel(fileSegments);
      const moduleLevel = findLevel(moduleSegments);

      if (
        findParent(fileSegments) !== findParent(moduleSegments) &&
        moduleLevel !== null
      ) {
        report("interface", node, modulePath);
        return "finished";
      }

      if (
        findParent(fileSegments) === findParent(moduleSegments) &&
        fileLevel !== null &&
        moduleLevel !== null &&
        fileLevel < moduleLevel
      ) {
        return "finished";
      }
    };

    const findLevel = (path) => {
      const segments = toSegments(path);
      const level = segments.reduce((level, _, index) => {
        if (level >= 0) return level;
        const path = toPath(segments.slice(0, segments.length - index));
        return structure.findIndex((layer) => layer.name === path);
      }, -1);
      return level >= 0 ? structure.length - level - 1 : null;
    };

    const hasInterface = (fileLevel, moduleLevel) => {
      const fileIndex = structure.length - fileLevel - 1;
      const moduleIndex = structure.length - moduleLevel - 1;
      const layerInterface = structure
        .slice(fileIndex + 1, moduleIndex)
        .find((layer) => layer.interface);
      return Boolean(layerInterface);
    };

    const fileLevel = findLevel(filePath);

    const checkHasProperLevel = (modulePath) => {
      const createResult = (messageId) =>
        messageId ? { result: false, messageId } : { result: true };

      const isNodeModulePath = isNodeModule(modulePath);

      if (fileLevel === null) {
        return createResult(isNodeModulePath ? null : "not-registered:file");
      }

      const moduleLevel = findLevel(modulePath);
      if (moduleLevel === null) {
        return createResult(isNodeModulePath ? null : "not-registered:module");
      }

      if (fileLevel <= moduleLevel) {
        return createResult("not-lower-level");
      }

      if (hasInterface(fileLevel, moduleLevel)) {
        return createResult("interface");
      }

      return createResult();
    };

    const createReportData = (modulePath) => ({
      module: isNodeModule(modulePath) ? modulePath : toRelative(modulePath),
      file: toRelative(filePath),
    });

    return {
      ImportDeclaration(node) {
        if (isExcludedFile) return;

        const modulePath = createModulePath(node.source.value);

        if (reportUseLevelNumber(node, modulePath) === "finished") return;

        if (isInSubDirOfFileDir(modulePath)) return;

        const { result, messageId } = checkHasProperLevel(modulePath);
        if (result) return;

        const data = createReportData(modulePath);
        context.report({ node, messageId, data });
      },
    };
  },
};
