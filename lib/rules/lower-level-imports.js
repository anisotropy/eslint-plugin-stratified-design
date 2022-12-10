/**
 * @fileoverview Should import lower level
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path");
const { parse, isLowerThan, compareWithInterface, makeStructure } = require("../../lib/helpers");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// TODO: 기본 전제
// - 동일한 폴더 내의 폴더는 동일한 레벨을 가진다.
// - 하위 폴더는 상위 폴더보다 레이어 레벨이 낮다.
// - 상위 레벨 폴더의 모든 하위 폴더는 하위 레벨 폴더의 모든 하위 폴더보다 레벨이 높다
// - 이 규칙은 동일한 폴더 내의 폴더에 대한 위계를 결정하기 위한 것
// - 테스트 코드 제외

const layerSchema = {
  oneOf: [
    { type: "string" },
    {
      type: "object",
      properties: {
        name: { type: "string" },
        interface: { type: "boolean" },
      },
      additionalProperties: false,
    },
  ],
};

// TODO: root 추가

const dirPattern = "^/|(/[\\w-]+)+$";

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
            structure: {
              type: "object",
              patternProperties: {
                [dirPattern]: { type: "array", items: [layerSchema] },
              },
              additionalProperties: false,
            },
            root: {
              type: "string", pattern: "^\\.{1,2}(/[\\w-]+)+$"
            },
            alias: {
              type: "object",
              patternProperties: {
                "^[\\w-]+(/[\\w-]+)*$": { type: "string", pattern: dirPattern },
              },
            },
          },
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
    messages: {
      "not-lower-level": "Please import a lower level module",
      "lower-interface":
        "Modules at a lower level than interfaces can NOT be imported.",
    },
  },
  create(context) {
    const options = context.options[0]

    const filename = path.resolve(context.getFilename()).split(path.sep).join('/');
    const fileDir = path.dirname(filename)

    const structure = makeStructure(context.getCwd(), options.root, options.structure)

    const isTestFile = path.basename(filename).includes(".test");

    const hasInterface = (common, layers, predicate) => {
      return layers.reduce((error, layer, i) => {
        if (error) return error;
        const subLayers = structure[path.resolve(...common, ...layers.slice(0, i))]
        const result = compareWithInterface(layer, subLayers);
        return predicate(result, i, layers.length);
      }, false);
    };

    return {
      ImportDeclaration(node) {
        if (isTestFile) return;

        const moduleDir = path.dirname(path.resolve(fileDir, node.source.value))

        const [common, relModule, relFile] = parse(moduleDir.split('/'),  fileDir.split('/'));
        if (relModule.length > 0 && relFile.length === 0) return;

        const subLayers = structure[path.resolve(...common)]
        if (isLowerThan(relModule[0], relFile[0], subLayers) === false) {
          context.report({ node, messageId: "not-lower-level" });
          return;
        }

        if (
          hasInterface(
            common,
            relModule,
            (result, i, len) => result === "lower" || (result === "same" && i < len - 1)
          ) ||
          hasInterface(common, relFile, (result) => result === "higher")
        ) {
          context.report({ node, messageId: "lower-interface" });
        }
      },
    };
  },
};
