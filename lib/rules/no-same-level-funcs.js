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

/**
 * @typedef {import('eslint').Rule.Node} Node
 * @typedef {import('eslint').AST.Token} Token
 * @typedef {import('eslint').SourceCode} SourceCode
 */

/**
 * @param {SourceCode} sourceCode
 * @param {Node | Token} nodeOrToken
 *
 */
const deriveLevel = (sourceCode, nodeOrToken) => {
  const comments = sourceCode.getCommentsBefore(nodeOrToken);
  for (const { value } of comments) {
    const levelInStr = value.replace(/^[^]*@level\s+?([0-9]+)[^0-9]*$/, "$1");
    const levelInNum = Number(levelInStr);
    if (levelInStr && !Number.isNaN(levelInNum)) {
      return levelInNum;
    }
  }
  return null;
};

/**
 *
 * @param {Node} node
 */
const traceAncestor = (node) => {
  let parent = node;
  let nextParent = node.parent;
  while (nextParent.type !== "Program") {
    parent = parent.parent;
    nextParent = parent.parent;
  }
  return parent;
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
      "no-same-level-funcs": "{{func}} is NOT lower level",
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

    /**
     * @type {({[name: string]: number | null})}
     */
    const levels = {};

    const sourceCode = context.getSourceCode();

    return {
      Program(node) {
        node.body.forEach((token) => {
          const isFuncDeclaration = token.type === "FunctionDeclaration";
          const isVarDeclaration =
            token.type === "VariableDeclaration" &&
            [
              "ArrowFunctionExpression",
              "FunctionExpression",
              "CallExpression",
            ].includes(token.declarations[0].init.type);

          if (isFuncDeclaration || isVarDeclaration) {
            const level = deriveLevel(sourceCode, token);
            const name = isFuncDeclaration
              ? token.id.name
              : token.declarations[0].id.name;
            levels[name] = level;
          }
        });
      },
      CallExpression(node) {
        const calleeLevel = levels[node.callee.name];
        if (calleeLevel === undefined) return;
        if (calleeLevel !== null) {
          const ancestor = traceAncestor(node);
          const ancestorLevel = deriveLevel(sourceCode, ancestor);
          if (ancestorLevel < calleeLevel) return;
        }
        context.report({
          node,
          messageId: "no-same-level-funcs",
          data: { func: node.callee.name },
        });
      },
    };
  },
};
