/**
 * @fileoverview Require that lower level modules be imported (stratified-imports)
 * @author Hodoug Joung
 */

"use strict";

const { parsePath } = require("../helpers/common");
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const helper = require("../helpers/stratifiedImports");

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
            excludeImports: {
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
      "invalid-json": "'.stratified.json' is NOT valid or does NOT exist.",
    },
  },
  create(context) {
    const options = {
      exclude: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
      include: ["**/*.{js,ts,jsx,tsx}"],
      excludeImports: [],
      aliases: {},
      ...(context.options[0] || {}),
    };

    const { fileDir, filePath, isExcludedFile } = helper.parseFileSource(
      options,
      context.filename
    );

    const rawStructure = helper.readRawStructure(fileDir);
    const isStructureValid = helper.validateRawStructure(rawStructure);
    const structure = helper.toStructure(rawStructure, fileDir);

    const fileLevel = helper.findLevel(structure)(filePath);

    const createModulePath = helper.createModulePath(
      context.cwd,
      options.excludeImports,
      fileDir,
      helper.createAliases(options.aliases)
    );

    const isInChildren = helper.isInChildren(fileDir);

    const findLevelInCurrent = helper.findLevelInCurrent(structure, fileLevel);

    const findLevelInChild = helper.findLevelInChild(structure);

    const findLevelInParent = helper.findLevelInParent(
      context.cwd,
      fileDir,
      fileLevel
    );

    /**
     * @param {import('../helpers/type').Node} node
     * @param {'not-lower-level'|'barrier'|'not-registered'|'invalid-json'} messageId
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
      if (!isStructureValid) {
        reportError(node, "invalid-json");
        return;
      }

      if (fileLevel === null) {
        reportError(node, "not-registered");
        return;
      }

      const { modulePath, isModuleExcluded } = createModulePath(
        node.source.value
      );
      if (isModuleExcluded) return;

      const moduleLevel = (() => {
        const level = findLevelInCurrent(modulePath);
        if (level !== null) return level;
        if (isInChildren(modulePath)) {
          return findLevelInChild(modulePath);
        }
        return findLevelInParent(modulePath);
      })();

      if (moduleLevel === helper.SUCCESS) return;

      if (moduleLevel === null) {
        reportError(node, "not-lower-level", modulePath);
        return;
      }

      if (moduleLevel === helper.BARRIER) {
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
        if (!isExcludedFile) report(node);
      },
      ExportNamedDeclaration(node) {
        if (!isExcludedFile && node.source) report(node);
      },
      ExportAllDeclaration(node) {
        if (!isExcludedFile && node.source) report(node);
      },
    };
  },
};
