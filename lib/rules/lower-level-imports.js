/**
 * @fileoverview Should import lower level
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: [],
    messages: {
      notLowerLevel: "Lower level modules should be imported.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value.endsWith("/higherLevel")) {
          context.report({
            node,
            messageId: "notLowerLevel",
          });
        }
      },
    };
  },
};
