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
 * @typedef {({[name: string]: number})} Levels
 */

const hasArrFunction = (elements, levels) => {
  return elements.reduce((hasFunc, element) => {
    if (hasFunc) return true;
    const type = element.type;
    if (type === "FunctionExpression" || type === "ArrowFunctionExpression")
      return true;
    if (type === "ObjectExpression") return hasObjFunction(element.properties);
    if (type === "ArrayExpression") return hasArrFunction(element.elements);
    if ("name" in element && element.name in levels) return true;
    return false;
  }, false);
};

const hasObjFunction = (properties, levels) => {
  return properties.reduce((hasFunc, property) => {
    if (hasFunc) return true;
    const type = property.value.type;
    if (type === "FunctionExpression" || type === "ArrowFunctionExpression")
      return true;
    if (type === "ObjectExpression")
      return hasObjFunction(property.value.properties);
    if (type === "ArrayExpression")
      return hasArrFunction(property.value.elements);
    if ("name" in property.value && property.value.name in levels) return true;
    return false;
  }, false);
};

/**
 * @param {Node | Token} nodeOrToken
 */
const deriveDeclaration = (nodeOrToken) => {
  return (nodeOrToken.type === "ExportNamedDeclaration" ||
    nodeOrToken.type === "ExportDefaultDeclaration") &&
    Boolean(nodeOrToken.declaration)
    ? nodeOrToken.declaration
    : nodeOrToken;
};

/**
 * @param {Node | Token} nodeOrToken
 * @returns {string | null}
 */
const deriveFuncName = (nodeOrToken) => {
  const declaration = deriveDeclaration(nodeOrToken);

  if (declaration.type === "FunctionDeclaration") return declaration.id.name;
  if (declaration.type !== "VariableDeclaration") return null;

  const { init, id } = declaration.declarations[0];
  if (
    [
      "ArrowFunctionExpression",
      "FunctionExpression",
      "CallExpression",
      "TaggedTemplateExpression",
    ].includes(init.type)
  ) {
    return id.name;
  }

  return null;
};

/**
 * @param {Node | Token} nodeOrToken
 * @param {Levels} levels
 * @returns {string | null}
 */
const deriveVarName = (nodeOrToken, levels) => {
  const declaration = deriveDeclaration(nodeOrToken);
  if (declaration.type !== "VariableDeclaration") return null;
  const { init, id } = declaration.declarations[0];
  if (
    init.type === "ObjectExpression" &&
    hasObjFunction(init.properties, levels)
  ) {
    return id.name;
  } else if (
    init.type === "ArrayExpression" &&
    hasArrFunction(init.elements, levels)
  ) {
    return id.name;
  } else {
    return null;
  }
};

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
  return 1;
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
    if (calleeLevel === undefined) return true; // 호출되는 함수가 존재하지 않으면 true 리턴. 함수 내의 함수의 경우에는 항상 calleeLevel 이 undefined 이다.

    const caller = traceAncestor(sourceCode, node);
    const callerName = deriveFuncName(caller) || deriveVarName(caller, levels);
    const callerLevel = levels[callerName];

    if (callerLevel === undefined) return true;
    if (callerLevel < calleeLevel) return true;
    if (callerName === calleeName) return true; // recursive function

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
     * @description 함수들의 레벨. 함수 내의 함수는 여기에 기록되지 않는다.
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
          const name = deriveFuncName(token);
          if (name !== null) levels[name] = deriveLevel(sourceCode, token);
        });
        node.body.forEach((token) => {
          const name = deriveVarName(token, levels);
          if (name !== null) levels[name] = deriveLevel(sourceCode, token);
        });
      },
      CallExpression(node) {
        for (const { name } of node.arguments) {
          const isReported = report(node, name);
          if (isReported) return;
        }
        if (node.callee.type === "MemberExpression") {
          report(node, node.callee.object.name);
        } else {
          report(node, node.callee.name);
        }
      },
      JSXOpeningElement(node) {
        report(node, node.name.name);
      },
    };
  },
};
