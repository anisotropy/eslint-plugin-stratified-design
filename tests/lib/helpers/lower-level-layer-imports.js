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
} = require("../../../lib/helpers/lowerLevelLayerImports/2 layer");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

// TODO: more test for helper

describe("helpers/lower-level-layer-imports", () => {
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
});
