/**
 * @fileoverview Tests for helpers
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("node:assert/strict");
const { parse, findSubStructure, compareLevels } = require("../../lib/helpers");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const structure = {
  "/": [["layer1"], ["layer2"], ["layer3"]],
  "/layer1": [["subLayer1"], ["subLayer2"]],
  "/layer2": [["subLayer1"], ["subLayer2"], ["subLayer3WithIndex"]],
  "/layer3": [["subLayer1"], ["subLayer2"]],
};

describe("helpers", () => {
  describe("parse()", () => {
    const tests = [
      {
        args: [
          ["src", "layer1", "subLayer1"],
          ["src", "layer2", "subLayer1"],
        ],
        expected: [["src"], ["layer1", "subLayer1"], ["layer2", "subLayer1"]],
      },
      {
        args: [
          ["src", "layer1"],
          ["src", "layer1", "subLayer1"],
        ],
        expected: [["src", "layer1"], [], ["subLayer1"]],
      },
      {
        args: [["layer1"], ["layer2"]],
        expected: [[], ["layer1"], ["layer2"]],
      },
    ];
    tests.forEach(({ args, expected }) => {
      it(`${JSON.stringify(args)} -> ${JSON.stringify(expected)}`, () => {
        assert.deepEqual(parse(...args), expected);
      });
    });
  });
  describe("findSubStructure()", () => {
    const tests = [
      {
        arg: [],
        expected: "/",
      },
      {
        arg: ["src"],
        expected: "/",
      },
      {
        arg: ["layer1"],
        expected: "/layer1",
      },
      {
        arg: ["src", "layer1"],
        expected: "/layer1",
      },
    ];
    tests.forEach(({ arg, expected }) => {
      it(`${JSON.stringify(arg)} -> struncture["${expected}"]`, () => {
        assert.deepEqual(findSubStructure(arg, structure), structure[expected]);
      });
    });
  });
  describe("compareLevels", () => {
    const tests = [
      {
        args: ["layer1", "layer2"],
        expected: -1,
      },
      {
        args: ["layer1", "layer3"],
        expected: -2,
      },
      {
        args: ["layer1", "layer1"],
        expected: 0,
      },
      {
        args: ["layer2", "layer1"],
        expected: 1,
      },
    ];
    tests.forEach(({ args, expected }) => {
      it(`${JSON.stringify(args)} -> ${expected}`, () => {
        assert.equal(compareLevels(...args, structure["/"]), expected);
      });
    });
  });
});
