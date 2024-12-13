/**
 * @fileoverview Disallow calling functions in the same file.
 * @author Hodoug Joung
 */
"use strict";

const path = require("path");
const { fromCwd, match } = require("../helpers/common");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// FIXME: const Body = styled.div``; const Body2 = styled(Body)`` (TaggedTemplateExpression)

/**
 * @typedef {import('eslint').Rule.Node} Node
 * @typedef {import('eslint').AST.Token} Token
 * @typedef {import('eslint').SourceCode} SourceCode
 * @typedef {({[name: string]: number | null})} Levels
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
 * @param {SourceCode} sourceCode
 * @param {Node} node
 */
const traceAncestor = (sourceCode, node) => {
  return sourceCode.getAncestors(node)[1];
};

/**
 * @param {SourceCode} sourceCode
 * @param {Levels} levels
 */
const isCalleeLowerLevel = (sourceCode, levels) => {
  /**
   * @param {Node} node
   * @param {string} calleeName
   */
  return (node, calleeName) => {
    const calleeLevel = levels[calleeName];
    if (calleeLevel === undefined) return true;
    if (calleeLevel !== null) {
      const caller = traceAncestor(sourceCode, node);
      const callerLevel = deriveLevel(sourceCode, caller);
      if (callerLevel !== null && callerLevel < calleeLevel) return true;
    }
    return false;
  };
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
    /**
     * @type {{include: string[], exclude: string[]}}
     */
    const options = {
      exclude: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
      include: ["**/*.{js,ts,jsx,tsx}"],
      ...(context.options[0] || {}),
    };

    const fileSource = path.resolve(context.filename);

    const fileSourceFromCwd = fromCwd(context.cwd, fileSource);

    const isIncludedFile = options.include.find(match(fileSourceFromCwd));

    const isExcludedFile =
      !isIncludedFile || options.exclude.find(match(fileSourceFromCwd));

    if (isExcludedFile) return {};

    /**
     * @type {Levels}
     */
    const levels = {};

    const sourceCode = context.sourceCode;

    /**
     * @param {Node} node
     * @param {string} calleeName
     */
    const report = (node, calleeName) => {
      if (isCalleeLowerLevel(sourceCode, levels)(node, calleeName))
        return false;
      context.report({
        node,
        messageId: "no-same-level-funcs",
        data: { func: calleeName },
      });
      return true;
    };

    return {
      Program(node) {
        node.body.forEach((token) => {
          const declaration = (token.type === 'ExportNamedDeclaration' || token.type === 'ExportDefaultDeclaration') && Boolean(token.declaration) ? token.declaration : token
          const isFuncDeclaration = declaration.type === "FunctionDeclaration";
          const isVarDeclaration =
          declaration.type === "VariableDeclaration" &&
            [
              "ArrowFunctionExpression",
              "FunctionExpression",
              "CallExpression",
              "TaggedTemplateExpression",
            ].includes(declaration.declarations[0].init.type);

          if (isFuncDeclaration || isVarDeclaration) {
            const level = deriveLevel(sourceCode, token);
            const name = isFuncDeclaration
              ? declaration.id.name
              : declaration.declarations[0].id.name;
            levels[name] = level;
          }
        });
      },
      CallExpression(node) {
        for (const { name } of node.arguments) {
          const isReported = report(node, name);
          if (isReported) return;
        }
        report(node, node.callee.name);
      },
      JSXOpeningElement(node) {
        report(node, node.name.name);
      },
    };
  },
};
