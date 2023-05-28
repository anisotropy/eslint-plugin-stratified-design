/**
 * @fileoverview Require that lower level modules be imported (lower-level-imports)
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { resolve, join, relative, parse } = require("path");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const dirNamePattern = "[\\w-]+";
const strPattern = "[^/\\s]+";
const dirPattern = `^/|(/${dirNamePattern})+$`;
const relDirPattern = `^\\.{1,2}(/${dirNamePattern})*$`;

const layerSchema = {
  oneOf: [
    { type: "string", pattern: `${dirNamePattern}(/${dirNamePattern})*` },
    {
      type: "object",
      properties: {
        name: {
          type: "string",
          pattern: `${dirNamePattern}(/${dirNamePattern})*`,
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
              pattern: relDirPattern,
            },
            aliases: {
              type: "object",
              patternProperties: {
                [`^${strPattern}$`]: { type: "string", pattern: relDirPattern },
              },
              additionalProperties: false,
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
    },
  },
  create(context) {
    const options = {
      root: "./",
      structure: [],
      ...(context.options[0] || {}),
    };

    const rootDir = resolve(resolve(context.getCwd()), options.root);

    const parsedFilePath = parse(context.getFilename());
    const fileDir = resolve(parsedFilePath.dir);
    const filePath = resolve(fileDir, parsedFilePath.name);

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
      return theAlias
        ? moduleSource.replace(theAlias, options.aliases[theAlias])
        : moduleSource;
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

    const findLevel = (path) => {
      const segments = toSegments(path);
      const level = segments.reduce((level, _, index) => {
        if (level >= 0) return level;
        const path = toPath(segments.slice(0, segments.length - index));
        return structure.findIndex((layer) => layer.name === path);
      }, -1);
      return structure.length - level - 1;
    };

    const fileLevel = findLevel(filePath);

    const isLowerLevelThanFile = (modulePath) => {
      if (fileLevel < 0) return isNodeModule(modulePath);
      const moduleLevel = findLevel(modulePath);
      return moduleLevel >= 0 && moduleLevel < fileLevel;
    };

    return {
      ImportDeclaration(node) {
        const modulePath = createModulePath(node.source.value);

        if (isInSubDirOfFileDir(modulePath)) return;

        if (isLowerLevelThanFile(modulePath)) return;

        context.report({
          node,
          messageId: "not-lower-level",
          data: {
            module: isNodeModule(modulePath)
              ? modulePath
              : toRelative(modulePath),
            file: toRelative(filePath),
          },
        });
      },
    };
  },
};
