/**
 * @fileoverview Should import lower level
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path");
const { parse, findSubStructure, compareLevels } = require("../../lib/helpers");

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

function isLowerLevel(moduleSource, filename, options) {
  if (path.basename(filename).includes(".test")) return true;

  const [structure] = options;
  const dirname = path.dirname(filename);
  const source = path
    .dirname(path.resolve(dirname, moduleSource))
    .split(path.sep);
  const file = dirname.split(path.sep);

  const [common, diffSource, diffFile] = parse(source, file);
  if (diffSource.length > 0 && diffFile.length === 0) return true;

  const subStructure = findSubStructure(common, structure);
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
          patternProperties: {
            "^\\S+$": {
              type: "array",
              items: [{ type: "string" }],
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
          !isLowerLevel(
            node.source.value,
            context.getFilename(),
            context.options
          )
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
