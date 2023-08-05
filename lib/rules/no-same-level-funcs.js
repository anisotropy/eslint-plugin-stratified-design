/**
 * @fileoverview Disallow calling functions in the same file.
 * @author Hodoug Joung
 */
"use strict";

const { minimatch } = require("minimatch");
const path = require("path");

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
            exclude: {
              type: "array",
              items: [{ type: "string" }],
            },
            include: {
              type: "array",
              items: [{ type: "string" }],
            },
          },
        },
      ],
      additionalItems: false,
    },
    messages: {
      "no-same-level-funcs": "Disallow calling {{func}} in the same file.",
    },
  },

  create(context) {
    const options = {
      exclude: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
      include: ["**/*.{js,ts,jsx,tsx}"],
      ...(context.options[0] || {}),
    };

    const fileSource = path.resolve(context.getFilename());

    const isIncludedFile = options.include.find((pattern) =>
      minimatch(fileSource, pattern)
    );

    const isExcludedFile =
      !isIncludedFile ||
      options.exclude.find((pattern) => minimatch(fileSource, pattern));

    if (isExcludedFile) return {};

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
