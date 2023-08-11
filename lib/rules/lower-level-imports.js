/**
 * @fileoverview Require that lower level modules be imported (lower-level-imports)
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const {
  reportHasProperLayerLevel,
  reportInSubDirOf,
  FINISHED,
  reportHasProperLayerLevelNumber,
  createModulePathFromSource,
  findLevel,
  createStructure,
  createAliases,
  parseFileSource,
  createRootDir,
} = require("../helpers/lowerLevelImports/");
const { isFileIndexOfModule } = require("../helpers/lowerLevelImports/1 layer");

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
        barrier: { type: "boolean" },
        interface: { type: "boolean" },
        nodeModule: { type: "boolean" },
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
            include: {
              type: "array",
              items: [{ type: "string" }],
            },
            useLevelNumber: {
              type: "boolean",
            },
            isIndexHighest: {
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
      barrier:
        "An ABSTRACT BARRIER prevents '{{file}}' from importing '{{module}}'",
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
      exclude: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
      include: ["**/*.{js,ts,jsx,tsx}"],
      aliases: {},
      useLevelNumber: false,
      ...(context.options[0] || {}),
    };

    const cwd = context.getCwd();
    const rootDir = createRootDir(cwd, options);

    const { fileDir, filePath, isExcludedFile } = parseFileSource(
      options,
      context.getFilename()
    );

    const structure = createStructure(options, rootDir);

    const createModulePath = createModulePathFromSource(
      cwd,
      fileDir,
      createAliases(options)
    );

    const fileLevel = findLevel(structure)(filePath);

    const reportHasProperLevelNumber = reportHasProperLayerLevelNumber(
      context,
      options,
      rootDir,
      filePath
    );

    const reportInSubDirOfFileDir = reportInSubDirOf(fileDir);

    const reportHasProperLevel = reportHasProperLayerLevel(
      context,
      structure,
      rootDir,
      fileLevel,
      filePath
    );

    const isFileIndex = isFileIndexOfModule(options, fileDir, filePath);

    const report = (node) => {
      if (isExcludedFile) return;

      const modulePath = createModulePath(node.source.value);

      if (isFileIndex(modulePath)) return;

      if (reportHasProperLevelNumber(node, modulePath) === FINISHED) return;

      if (reportInSubDirOfFileDir(node, modulePath) === FINISHED) return;

      reportHasProperLevel(node, modulePath);
    };

    return {
      ImportDeclaration(node) {
        report(node);
      },
      ExportNamedDeclaration(node) {
        if (node.source) report(node);
      },
      ExportAllDeclaration(node) {
        if (node.source) report(node);
      },
    };
  },
};
