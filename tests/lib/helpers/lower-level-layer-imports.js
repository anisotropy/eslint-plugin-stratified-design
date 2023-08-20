/**
 * @fileoverview test for helpers/lower-level-layer-imports
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert");
const {
  findLevel,
  toStructure,
  createAliases,
  replaceAlias,
} = require("../../../lib/helpers/lowerLevelLayerImports/2 layer");
const {
  createModulePath,
} = require("../../../lib/helpers/lowerLevelLayerImports/1 layer");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("helpers/lower-level-layer-imports", () => {
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
      it(`${rawStructure} -> ${structure}`, () => {
        assert.deepEqual(toStructure(rawStructure, fileDir), structure);
      });
    });
  });

  describe("createAliases()", () => {
    const testCases = [
      {
        rawAliases: { "@/": "./src/" },
        aliases: [{ alias: "@/", path: "./src/" }],
      },
      {
        rawAliases: { "@/": "./src/", "@layer/": "./src/layer/" },
        aliases: [
          { alias: "@layer/", path: "./src/layer/" },
          { alias: "@/", path: "./src/" },
        ],
      },
    ];
    testCases.forEach(({ rawAliases, aliases }) => {
      it(`${rawAliases} -> ${aliases}`, () => {
        assert.deepEqual(createAliases(rawAliases), aliases);
      });
    });
  });

  describe("replaceAlias()", () => {
    const cwd = "/proj";
    const fileDir = "/proj/src/layerA";
    const aliases = [{ alias: "@/", path: "./src/" }];
    const testCases = [
      { moduleSource: "@/layerA/layerAA", relPath: "./layerAA" },
      { moduleSource: "nodeModule", relPath: "nodeModule" },
    ];
    testCases.forEach(({ moduleSource, relPath }) => {
      it(`${moduleSource} -> ${relPath}`, () => {
        assert.equal(
          replaceAlias(cwd, fileDir, aliases)(moduleSource),
          relPath
        );
      });
    });
  });

  describe("findLevel()", () => {
    const structure = [[{ name: "/src/layerA" }], [{ name: "/src/layerB" }]];
    const testCases = [
      { path: "/src/layerA", level: 0 },
      { path: "/src/layerB", level: 1 },
      { path: "/src/layerA/entry", level: 0 },
    ];
    testCases.forEach(({ path, level }) => {
      it(`The level of ${path} is ${level}`, () => {
        assert.equal(findLevel(structure)(path), level);
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
        modulePath: "/proj/src/layerA/layerAA",
      },
      {
        moduleSource: "nodeModule",
        modulePath: "nodeModule",
      },
    ];
    testCases.forEach(({ moduleSource, modulePath }) => {
      it(`${moduleSource} -> ${modulePath}`, () => {
        assert.equal(
          createModulePath(cwd, fileDir, aliases)(moduleSource),
          modulePath
        );
      });
    });
  });
});
