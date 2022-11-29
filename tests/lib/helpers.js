/**
 * @fileoverview Tests for helpers
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("node:assert/strict");
const { getLayer, getLayerLevel, compareLevel } = require("../../lib/helpers");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const options = [
  {
    "/": [["layer1"], ["layer2"]],
    layer1: [["layer1-1"], ["layer1-2"]],
  },
];

describe("helpers", () => {
  describe("getLayer()", () => {
    it("should extract the directory name from filename", () => {
      const layer = getLayer("/src/layer/module.js");
      assert.equal(layer, "layer");
    });
    it("should extract the directory name from module source", () => {
      const layer = getLayer("./layer/module");
      assert.equal(layer, "layer");
    });
    it("should return empty string in the case of single module name", () => {
      const layer = getLayer("module");
      assert.equal(layer, "");
    });
    it("should return dot in the case of module in the current directory", () => {
      const layer = getLayer("./module");
      assert.equal(layer, ".");
    });
  });
  describe("getLayerLevel()", () => {
    it("should return [1] for a second-level-layer", () => {
      const level = getLayerLevel("layer2", options[0]);
      assert.deepEqual(level, [1]);
    });
    it("should return [0, 1] for a second-level-layer in a first-level", () => {
      const level = getLayerLevel("layer1-2", options[0]);
      assert.deepEqual(level, [0, 1]);
    });
  });
  describe("compareLevel()", () => {
    it("should return -1 for [0] and [0, 1]", () => {
      const result = compareLevel([0], [0, 1]);
      assert.equal(result, -1);
    });
    it("should return 1 for [0, 1] and [0]", () => {
      const result = compareLevel([0, 1], [0]);
      assert.equal(result, 1);
    });
    it("should return -1 for [0, 1] and [0, 2]", () => {
      const result = compareLevel([0, 1], [0, 2]);
      assert.equal(result, -1);
    });
    it("should return 1 for [0, 2] and [0, 1]", () => {
      const result = compareLevel([0, 2], [0, 1]);
      assert.equal(result, 1);
    });
    it("should return 0 for [0, 1] and [0, 1]", () => {
      const result = compareLevel([0, 1], [0, 1]);
      assert.equal(result, 0);
    });
  });
});
