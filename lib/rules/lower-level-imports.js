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
  isLowerThan,
  compareWithInterface,
  makeStructure,
  replaceAlias,
  resolvePath,
  properNodeModuleName,
  isNodeModule,
} = require("../../lib/helpers");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// TODO: 기본 전제
// - 모든 path에서 separator는 '/'이고 path.sep='/'이다.
// - 동일한 폴더 내의 폴더는 동일한 레벨을 가진다.
// - 하위 폴더는 상위 폴더보다 레이어 레벨이 낮다.
// - 상위 레벨 폴더의 모든 하위 폴더는 하위 레벨 폴더의 모든 하위 폴더보다 레벨이 높다
// - 이 규칙은 동일한 폴더 내의 폴더에 대한 위계를 결정하기 위한 것
// - 테스트 코드 제외

const dirNamePattern = "[\\w-]+";
const strPattern = "[^/\\s]+";
const dirPattern = `^/|(/${dirNamePattern})+$`;
const relDirPattern = `^\\.{1,2}(/${dirNamePattern})+$`;

const layerSchema = {
  oneOf: [
    { type: "string", pattern: `^${dirNamePattern}$` },
    {
      type: "object",
      properties: {
        name: {
          type: "string",
          pattern: `^${strPattern}$`,
        },
        interface: { type: "boolean" },
        isNodeModule: { type: "boolean" },
      },
      required: ["name"],
      additionalProperties: false,
    },
  ],
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
            structure: {
              type: "object",
              patternProperties: {
                [dirPattern]: { type: "array", items: layerSchema },
              },
              additionalProperties: false,
            },
            root: {
              type: "string",
              pattern: relDirPattern,
            },
            aliases: {
              type: "object",
              patternProperties: {
                [`^${strPattern}$`]: { type: "string", pattern: relDirPattern },
              },
              additionalProperties: false,
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
    const options = context.options[0];

    const cwd = path.resolve(context.getCwd());

    const filename = path.resolve(context.getFilename());
    const fileDir = path.dirname(filename);

    const structure = makeStructure(cwd, options.root, options.structure);

    const isTestFile = path.basename(filename).includes(".test");

    const makeNodeModulePath = (nodeModule) => {
      return Object.entries(structure).reduce(
        (nodeModulePath, [layerPath, subLayers]) => {
          if (nodeModulePath) return nodeModulePath;
          if (
            subLayers.find(
              (l) => isNodeModule(l) && nodeModule.startsWith(l.name)
            )
          ) {
            return [layerPath, properNodeModuleName(nodeModule), "module"].join(
              "/"
            );
          }
          return null;
        },
        null
      );
    };

    /**
     * makeModuleDir
     * module이 node module이지만 structure에 등록되어 있지 않다면, null을 return
     */
    const makeModuleDir = (module) => {
      const moduleWithAlias = replaceAlias(module, options.aliases);
      const absModule = (() => {
        if (module === moduleWithAlias) {
          if (module.startsWith(".")) return resolvePath(fileDir, module);
          const nodeModulePath = makeNodeModulePath(module);
          return nodeModulePath ? resolvePath(nodeModulePath) : null;
        }
        return resolvePath(cwd, moduleWithAlias);
      })();
      return absModule ? path.dirname(absModule) : null;
    };

    const compareLayerWithInterface = (commonDir, layers) => {
      return layers.reduce((theResult, layer, i) => {
        if (theResult) return theResult;
        const subLayers = structure[resolvePath(commonDir, layers.slice(0, i))];
        const result = compareWithInterface(layer, subLayers);
        if (result === "same" && i < layers.length - 1) return "not-same";
        return result;
      }, "");
    };

    return {
      ImportDeclaration(node) {
        if (isTestFile) return;

        const moduleDir = makeModuleDir(node.source.value);
        if (!moduleDir) return;

        const { commonDir, relModule, relFile } = parsePath(moduleDir, fileDir);
        if (relModule.length > 0 && relFile.length === 0) return;

        const subLayers = structure[commonDir];
        if (isLowerThan(relModule[0], relFile[0], subLayers) === false) {
          context.report({ node, messageId: "not-lower-level" });
          return;
        }

        const moduleLevel = compareLayerWithInterface(commonDir, relModule);
        const fileLevel = compareLayerWithInterface(commonDir, relFile);

        if (!moduleLevel && !fileLevel) return;
        if (moduleLevel === "same" || fileLevel === "same") return;

        context.report({ node, messageId: "lower-interface" });
      },
    };
  },
};
