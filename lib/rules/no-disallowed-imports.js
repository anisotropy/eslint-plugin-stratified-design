/**
 * @fileoverview ...
 * @author Hodoug Joung
 */
"use strict";

const { minimatch } = require("minimatch");
const path = require("path");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @typedef {import('eslint').Rule.Node} Node
 * @typedef {import('eslint').AST.Token} Token
 * @typedef {import('eslint').SourceCode} SourceCode
 */

const importSchema = {
  type: "object",
  properties: {
    path: { type: "string" },
    specifier: {
      type: "array",
      items: [{ type: "string" }], // 'default' means default specifier
    },
    allow: {
      type: "array",
      items: [{ type: "string" }],
    },
    disallow: {
      type: "array",
      items: [{ type: "string" }],
    },
  },
  required: ["path", "specifier", "allow"],
  additionalProperties: false,
};

const aliasesSchema = {
  type: "object",
  patternProperties: {
    ["^.+$"]: {
      type: "string",
      pattern: "^\\.{1,2}(/[^/]+)*/?$",
    },
  },
  additionalProperties: false,
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
            importPaths: {
              type: "array",
              items: [importSchema],
            },
            aliases: aliasesSchema,
          },
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
    messages: {
      "no-same-level-funcs": "{{func}} is NOT lower level",
    },
  },
  create(context) {
    return {};
  },
};
