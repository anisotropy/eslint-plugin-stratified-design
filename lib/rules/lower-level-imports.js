/**
 * @fileoverview Should import lower level
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path");
const {
  parsePath,
  findSubStructure,
  compareLevels,
} = require("../../lib/helpers");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// TODO:
// ## 기본 전제
// - 동일한 폴더 내의 폴더는 동일한 레벨을 가진다.
// - 하위 폴더는 상위 폴더보다 레이어 레벨이 낮다.
// - 상위 레벨 폴더의 모든 하위 폴더는 하위 레벨 폴더의 모든 하위 폴더보다 레벨이 높다
// - 이 규칙은 동일한 폴더 내의 폴더에 대한 위계를 결정하기 위한 것
// - 테스트 코드 제외

function isLowerLevel(diffSource, diffFile, subStructure) {
  if (diffSource.length > 0 && diffFile.length === 0) return true;
  return compareLevels(diffSource[0], diffFile[0], subStructure) > 0;
}

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
                "^\\S+$": { type: "array", items: [{ type: "string" }] },
              },
              additionalProperties: false,
            },
            interfaces: { type: "array", items: [{ type: "string" }] },
          },
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
    messages: {
      "not-lower-level": "Please import a lower level module",
    },
  },
  create(context) {
    const filename = context.getFilename();
    const { structure } = context.options[0];
    const isTestFile = path.basename(filename).includes(".test");
    return {
      ImportDeclaration(node) {
        if (isTestFile) return;

        const [common, diffSource, diffFile] = parsePath(
          node.source.value,
          filename
        );
        const subStructure = findSubStructure(common, structure);

        if (!isLowerLevel(diffSource, diffFile, subStructure)) {
          context.report({ node, messageId: "not-lower-level" });
          return;
        }
      },
    };
  },
};
