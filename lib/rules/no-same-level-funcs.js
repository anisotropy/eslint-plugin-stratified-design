/**
 * @fileoverview Disallow calling functions in the same file.
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
      "no-same-level-funcs": "Disallow calling {{func}} in the same file.",
    },
  },

  create(context) {
    let funcNames;
    return {
      Program(node) {
        funcNames = node.body.reduce((names, { type, id, declarations }) => {
          if (type === "FunctionDeclaration") {
            names.push(id.name);
          } else if (
            type === "VariableDeclaration" &&
            (declarations[0].init.type === "ArrowFunctionExpression" ||
              declarations[0].init.type === "FunctionExpression")
          ) {
            names.push(declarations[0].id.name);
          }
          return names;
        }, []);
      },
      CallExpression(node) {
        if (funcNames.includes(node.callee.name)) {
          context.report({
            node,
            messageId: "no-same-level-funcs",
            data: { func: node.callee.name },
          });
        }
      },
    };
  },
};
