/**
 * @fileoverview test for helpers/lower-level-imports
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert");
const {
  createModulePath,
} = require("../../../lib/helpers/lowerLevelImports/1 layer");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("helpers/lower-level-imports", () => {
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
});
