/**
 * @fileoverview Require that lower level modules be imported (lower-level-layer-imports)
 * @author Hodoug Joung
 */

"use strict";

const { parsePath } = require("../helpers/common");
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const helper = require("../helpers/lowerLevelLayerImports");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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
      "not-registered": "'{{file}}' does NOT registered at .stratified.json",
    },
  },
  create(context) {
    const options = {
      exclude: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
      include: ["**/*.{js,ts,jsx,tsx}"],
      aliases: {},
      ...(context.options[0] || {}),
    };

    const { fileDir, filePath, isExcludedFile } = helper.parseFileSource(
      options,
      context.filename
    );

    if (isExcludedFile) return {};

    const structure = helper.createStructure(fileDir);

    const fileLevel = helper.findLevel(structure)(filePath);

    const createModulePath = helper.createModulePath(
      context.cwd,
      fileDir,
      helper.createAliases(options.aliases)
    );

    const findLevel = helper.findLevel(structure);

    const isNotRegisteredNodeModule = helper.isNotRegisteredNodeModule(
      context.cwd
    );

    /**
     * @param {number} moduleLevel
     */
    const hasBarrier = (moduleLevel) => {
      const layerBarrier = structure
        .slice(fileLevel + 1, moduleLevel)
        .find((layers) => layers.find((layer) => layer.barrier));
      return Boolean(layerBarrier);
    };

    /**
     * @param {import('../helpers/type').Node} node
     * @param {'not-lower-level'|'barrier'|'not-registered'} messageId
     * @param {string | undefined} modulePath
     */
    const reportError = (node, messageId, modulePath) => {
      context.report({
        node,
        messageId,
        data: {
          file: parsePath(filePath).name,
          ...(modulePath ? { module: parsePath(modulePath).name } : {}),
        },
      });
    };

    /**
     * @param {import('../helpers/type').Node} node
     * @returns
     */
    const report = (node) => {
      // TODO: invalid .stratified.json

      if (fileLevel === null) {
        reportError(node, "not-registered");
        return;
      }

      const modulePath = createModulePath(node.source.value);
      const moduleLevel = findLevel(modulePath);

      if (moduleLevel === null) {
        if (isNotRegisteredNodeModule(modulePath)) return;
        reportError(node, "not-lower-level", modulePath);
        return;
      }

      if (hasBarrier(moduleLevel)) {
        reportError(node, "barrier", modulePath);
        return;
      }

      if (moduleLevel <= fileLevel) {
        reportError(node, "not-lower-level", modulePath);
        return;
      }
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
