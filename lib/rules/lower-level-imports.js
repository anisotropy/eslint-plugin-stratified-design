/**
 * @fileoverview Should import lower level
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { isLowerLevel } = require("../../lib/helpers");

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
          patternProperties: {
            "/|\\w+": {
              type: "array",
              items: [{ type: "array", items: [{ type: "string" }] }],
            },
          },
          additionalProperties: false,
        },
      ],
    },
    messages: {
      "not-lower-level": "Please import a lower level module",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (
          isLowerLevel(
            node.source.value,
            context.getFilename(),
            context.options[0]
          ) === false
        ) {
          context.report({
            node,
            messageId: "not-lower-level",
          });
        }
      },
    };
  },
};
