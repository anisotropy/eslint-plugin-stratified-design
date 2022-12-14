/**
 * @fileoverview Require that lower level modules be imported (lower-level-imports)
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

const dirNamePattern = "[\\w-]+";
const strPattern = "[^/\\s]+";
const dirPattern = `^/|(/${dirNamePattern})+$`;
const relDirPattern = `^\\.{1,2}(/${dirNamePattern})*$`;

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
      "not-lower-level": "'{{module}}' is NOT LOWER level than '{{file}}'",
      interface: "An INTERFACE prevents '{{file}}' from importing '{{module}}'",
    },
  },
  create(context) {
    const options = {
      root: "./",
      structure: {},
      ...(context.options[0] || {}),
    };

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
     * module??? node module????????? structure??? ???????????? ?????? ?????????, null??? return
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
          context.report({
            node,
            messageId: "not-lower-level",
            data: {
              module: relModule[relModule.length - 1],
              file: relFile[relFile.length - 1],
            },
          });
          return;
        }

        const moduleLevel = compareLayerWithInterface(commonDir, relModule);
        const fileLevel = compareLayerWithInterface(commonDir, relFile);

        if (!moduleLevel && !fileLevel) return;
        if (moduleLevel === "same" || fileLevel === "same") return;

        context.report({
          node,
          messageId: "interface",
          data: {
            module: relModule[relModule.length - 1],
            file: relFile[relFile.length - 1],
          },
        });
      },
    };
  },
};
