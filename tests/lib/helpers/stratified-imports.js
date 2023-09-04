/**
 * @fileoverview test for helpers/stratified-imports
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert");
const {
  findLevel,
  findLayerWithReducedPath,
  toStructure,
  validateRawStructure,
  isInParent,
  isInChildren,
} = require("../../../lib/helpers/stratifiedImports/2 layer");
const {
  createModulePath,
  parseFileSource,
} = require("../../../lib/helpers/stratifiedImports/1 layer");
const { resolvePath } = require("../../../lib/helpers/common");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("helpers/stratified-imports", () => {
  describe("toStructure()", () => {
    const fileDir = "/src";
    const testCases = [
      { rawStructure: [["layer"]], structure: [[{ name: "/src/layer" }]] },
      {
        rawStructure: [[{ name: "layer" }]],
        structure: [[{ name: "/src/layer" }]],
      },
      {
        rawStructure: [[{ name: "layer", barrier: true }]],
        structure: [[{ name: "/src/layer", barrier: true }]],
      },
    ];
    testCases.forEach(({ rawStructure, structure }) => {
      it(`${JSON.stringify(rawStructure)} -> ${JSON.stringify(
        structure
      )}`, () => {
        assert.deepEqual(toStructure(rawStructure, fileDir), structure);
      });
    });
  });

  describe("findLevel()", () => {
    const structure = [[{ name: "/src/layerA" }], [{ name: "/src/layerB" }]];
    const testCases = [
      { path: "/src/layerA", level: 0 },
      { path: "/src/layerB", level: 1 },
      { path: "/src/layerA/entry", level: null },
    ];
    testCases.forEach(({ path, level }) => {
      it(`The level of ${path} is ${level}`, () => {
        assert.equal(findLevel(structure)(path), level);
      });
    });
  });

  describe("findLayerWithReducedPath()", () => {
    const structure = [[{ name: "/src/layerA" }], [{ name: "/src/layerB" }]];
    const testCases = [
      { path: "/src/layerA", layer: structure[0][0] },
      { path: "/src/layerB", layer: structure[1][0] },
      { path: "/src/layerA/entry", layer: structure[0][0] },
    ];
    testCases.forEach(({ path, layer }) => {
      it(`The level of ${path} is ${JSON.stringify(layer)}`, () => {
        assert.equal(findLayerWithReducedPath(structure)(path), layer);
      });
    });
  });

  describe("createModulePath()", () => {
    const cwd = "/proj";
    const fileDir = "/proj/src/layerA";
    const aliases = [{ alias: "@/", path: "./src/" }];
    const testCases = [
      {
        moduleSource: "@/layerA/layerAA",
        excludeImports: [],
        expected: {
          modulePath: "/proj/src/layerA/layerAA",
          isModuleExcluded: false,
        },
      },
      {
        moduleSource: "@/layerA/layerAA",
        excludeImports: ["**/layerAA"],
        expected: {
          modulePath: "/proj/src/layerA/layerAA",
          isModuleExcluded: true,
        },
      },
      {
        moduleSource: "@/layerA/style.css",
        excludeImports: ["**/*.css"],
        expected: {
          modulePath: "/proj/src/layerA/style.css",
          isModuleExcluded: true,
        },
      },
      {
        moduleSource: "nodeModule",
        excludeImports: [],
        expected: {
          modulePath: "nodeModule",
          isModuleExcluded: false,
        },
      },
      {
        moduleSource: "nodeModule",
        excludeImports: ["nodeModule"],
        expected: {
          modulePath: "nodeModule",
          isModuleExcluded: true,
        },
      },
    ];
    testCases.forEach(({ moduleSource, excludeImports, expected }) => {
      it(`${moduleSource} -> ${JSON.stringify(expected)}`, () => {
        assert.deepEqual(
          createModulePath(cwd, excludeImports, fileDir, aliases)(moduleSource),
          expected
        );
      });
    });
  });

  describe("validateRawStructure()", () => {
    const testCases = [
      {
        expected: true,
        rawStructure: [["layerA", { name: "layerB" }], ["layerC"]],
      },
      {
        expected: true,
        rawStructure: [
          ["layerA", { name: "layerB", nodeModule: true }],
          ["layerC"],
        ],
      },
      {
        expected: true,
        rawStructure: [
          ["layerA", { name: "layerB", barrier: true }],
          ["layerC"],
        ],
      },
      {
        expected: false,
        rawStructure: [],
      },
      {
        expected: false,
        rawStructure: {},
      },
      {
        expected: false,
        rawStructure: "string",
      },
      {
        expected: false,
        rawStructure: [{ name: "layerA" }],
      },
      {
        expected: false,
        rawStructure: [["layerA/layerAA"]],
      },
      {
        expected: false,
        rawStructure: [[{ name: ["layerA"] }]],
      },
      {
        expected: false,
        rawStructure: [[{ nodeModule: true }]],
      },
      {
        expected: false,
        rawStructure: [[{ nodeModule: "true" }]],
      },
      {
        expected: false,
        rawStructure: [[{ barrier: true }]],
      },
      {
        expected: false,
        rawStructure: [[{ barrier: "true" }]],
      },
      {
        expected: false,
        rawStructure: [[{ name: "layerA", notAllowedKey: false }]],
      },
    ];
    testCases.forEach(({ rawStructure, expected }) => {
      it(`${JSON.stringify(rawStructure)} -> ${expected}`, () => {
        assert.equal(validateRawStructure(rawStructure), expected);
      });
    });
  });

  describe("parseFileSource()", () => {
    const makeOptions = (options) => ({ alias: {}, ...options });
    const fileSource = "proj/src/layerA/layerAA.js";
    const testCases = [
      {
        options: makeOptions({
          include: ["**/*.js"],
          exclude: ["**/*.test.js"],
        }),
        expected: {
          fileDir: resolvePath("proj/src/layerA"),
          filePath: resolvePath("proj/src/layerA/layerAA"),
          isExcludedFile: false,
        },
      },
      {
        options: makeOptions({
          include: ["**/*.js"],
          exclude: ["**/layerAA.js"],
        }),
        expected: {
          fileDir: resolvePath("proj/src/layerA"),
          filePath: resolvePath("proj/src/layerA/layerAA"),
          isExcludedFile: true,
        },
      },
      {
        options: makeOptions({
          include: ["**/*.ts"],
          exclude: ["**/*.test.js"],
        }),
        expected: {
          fileDir: resolvePath("proj/src/layerA"),
          filePath: resolvePath("proj/src/layerA/layerAA"),
          isExcludedFile: true,
        },
      },
    ];
    testCases.forEach(({ options, expected }) => {
      it(`${JSON.stringify(options)} => ${JSON.stringify(expected)}`, () => {
        assert.deepEqual(parseFileSource(options, fileSource), expected);
      });
    });
  });

  describe("isInParent()", () => {
    const testCases = [
      {
        fileDir: "src/layerA",
        modulePath: "src/layerB/layerBA",
        expected: true,
      },
      {
        fileDir: "src/layerA",
        modulePath: "src/layerA/layerAA",
        expected: false,
      },
      {
        fileDir: "src/layerA",
        modulePath: "nodeModule",
        expected: true,
      },
    ];
    testCases.forEach(({ fileDir, modulePath, expected }) => {
      it(`${fileDir}, ${modulePath} -> ${expected}`, () => {
        assert.equal(isInParent(fileDir)(modulePath), expected);
      });
    });
  });

  describe("isInChildren()", () => {
    const testCases = [
      {
        fileDir: "src/layerA",
        modulePath: "src/layerA/layerAA",
        expected: true,
      },
      {
        fileDir: "src/layerA",
        modulePath: "src/layerB/layerBA",
        expected: false,
      },
      {
        fileDir: "src/layerA",
        modulePath: "nodeModule",
        expected: false,
      },
    ];
    testCases.forEach(({ fileDir, modulePath, expected }) => {
      it(`${fileDir}, ${modulePath} -> ${expected}`, () => {
        assert.equal(isInChildren(fileDir)(modulePath), expected);
      });
    });
  });
});
