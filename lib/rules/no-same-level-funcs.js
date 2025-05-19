/**
 * @fileoverview Disallow calling functions in the same file.
 * @author Hodoug Joung
 * @description 최상위에 있는 node가 함수인지 데이터인지 구분하지 않고 모두 함수로 취급힌다. (데이터인 경우에는 주석으로 '@data'를 붙여줘야 한다. 단, 명백하게 데이터인 경우에는 그 주석을 붙여주지 않아도 된다.)
 */
"use strict";

const path = require("path");
const { fromCwd, match, or } = require("../helpers/common");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @typedef {import('eslint').Rule.Node} Node
 * @typedef {import('eslint').AST.Token} Token
 * @typedef {import('eslint').SourceCode} SourceCode
 * @typedef {({[name: string]: number})} Levels
 */

/**
 * @param {Node | Token} nodeOrToken
 */
const deriveDeclaration = (nodeOrToken) => {
  const declaration =
    (nodeOrToken.type === "ExportNamedDeclaration" ||
      nodeOrToken.type === "ExportDefaultDeclaration") &&
    Boolean(nodeOrToken.declaration)
      ? nodeOrToken.declaration
      : nodeOrToken;
  return or(
    () => declaration.declarations[0],
    () => declaration
  );
};

const isDataOrImported = (declarationInit, levels) => {
  const expression = or(
    () => declarationInit.expression,
    () => declarationInit
  );
  if (!expression) return false;

  const type = expression.type;
  if (type === "Literal") return true;
  if (type === "Identifier") {
    const name = or(() => expression.name);
    return name && !levels[name];
  }
  if (type === "MemberExpression") {
    const name = or(() => expression.object.name);
    return name && !levels[name];
  }
  if (type === "CallExpression") {
    const name = or(() => expression.callee.name);
    return name && !levels[name];
  }
  if (type === "JSXElement") {
    const name = or(() => expression.openingElement.name.name);
    return name && !levels[name];
  }
  if (type === "SpreadElement")
    return isDataOrImported(expression.argument, levels);
  if (type === "ArrayExpression")
    return expression.elements.every((init) => isDataOrImported(init, levels));
  if (type === "ObjectExpression")
    return expression.properties.every(({ value }) =>
      isDataOrImported(value, levels)
    );
  return false;
};

/**
 * @param {Node | Token} nodeOrToken
 * @param {Levels} levels
 * @returns {string[] | undefined}
 */
const deriveNames = (nodeOrToken, levels) => {
  const declaration = deriveDeclaration(nodeOrToken);
  if (isDataOrImported(declaration.init, levels)) return [];
  const names = or(
    () => declaration.id.name,
    () => declaration.id.elements.map(({ name }) => name),
    () => declaration.id.properties.map(({ value }) => value.name)
  );
  return names === undefined ? [] : Array.isArray(names) ? names : [names];
};

/**
 * @param {Node | Token} nodeOrToken
 * @returns {string | undefined}
 */
const deriveCallerName = (nodeOrToken) =>
  or(() => deriveDeclaration(nodeOrToken).id.name);

/**
 * @param {SourceCode} sourceCode
 * @param {Node | Token} nodeOrToken
 * @returns {number | null}
 */
const deriveLevel = (sourceCode, nodeOrToken) => {
  const comments = sourceCode.getCommentsBefore(nodeOrToken);
  for (const { value: comment } of comments) {
    if (comment.includes("@data") || comment.includes("@import")) return null;
    const levelInStr = comment.replace(/^[^]*@level\s+?([0-9]+)[^0-9]*$/, "$1");
    const levelInNum = Number(levelInStr);
    if (levelInStr && !Number.isNaN(levelInNum)) {
      return levelInNum;
    }
  }
  return 1;
};

/**
 * root node(Program) 바로 아래에 있는 부모 노드를 리턴한다.
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
    const callerName = deriveCallerName(caller);
    const callerLevel = levels[callerName];

    if (callerLevel === undefined) return true;
    if (callerLevel < calleeLevel) return true;
    if (callerName === calleeName) return true; // recursive function

    return false;
  };
};

const deriveCalleeName = (callee) => {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression")
    return deriveCalleeName(callee.object);
  return null;
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
          deriveNames(token, levels).forEach((name) => {
            const level = deriveLevel(sourceCode, token);
            if (name && level) levels[name] = level;
          });
        });
      },
      VariableDeclarator(node) {
        const init = or(() => node.init.name);
        const id = or(() => node.id.name);
        if (!init || !id) return;
        if (levels[init] && !levels[id]) {
          levels[id] = levels[init];
        }
      },
      CallExpression(node) {
        for (const { name } of node.arguments) {
          const isReported = report(node, name);
          if (isReported) return;
        }
        report(node, deriveCalleeName(node.callee));
      },
      JSXOpeningElement(node) {
        report(node, node.name.name);
      },
    };
  },
};
