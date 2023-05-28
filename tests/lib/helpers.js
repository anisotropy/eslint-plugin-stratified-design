/**
 * @fileoverview Tests for helpers
 * @author Hodoug Joung
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("node:assert/strict");
const {
  parse,
  makeStructure,
  isLowerThan,
  replaceAlias,
} = require("../../lib/helpers");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const structure = {
  "/": ["layer1", { name: "layer2", interface: true }, "layer3"],
  "/layer1": ["subLayer1", "subLayer2"],
  "/layer2": ["subLayer1", "subLayer2"],
  "/layer3": ["subLayer1", "subLayer2"],
};

// describe("helpers", () => {
//   describe("parse()", () => {
//     const tests = [
//       {
//         args: [
//           ["src", "layer1", "subLayer1"],
//           ["src", "layer2", "subLayer1"],
//         ],
//         expected: [["src"], ["layer1", "subLayer1"], ["layer2", "subLayer1"]],
//       },
//       {
//         args: [
//           ["src", "layer1"],
//           ["src", "layer1", "subLayer1"],
//         ],
//         expected: [["src", "layer1"], [], ["subLayer1"]],
//       },
//       {
//         args: [["layer1"], ["layer2"]],
//         expected: [[], ["layer1"], ["layer2"]],
//       },
//     ];
//     tests.forEach(({ args, expected }) => {
//       it(`${JSON.stringify(args)} -> ${JSON.stringify(expected)}`, () => {
//         assert.deepEqual(parse(...args), expected);
//       });
//     });
//   });
//   describe("makeStructure()", () => {
//     const tests = [
//       {
//         args: [
//           "/path/to/foo",
//           "./src",
//           { "/": ["layer"], "/layer": ["subLayer"] },
//         ],
//         expected: {
//           "/path/to/foo/src": ["layer"],
//           "/path/to/foo/src/layer": ["subLayer"],
//         },
//       },
//       {
//         args: [
//           "/path/to/foo",
//           undefined,
//           { "/": ["layer"], "/layer": ["subLayer"] },
//         ],
//         expected: {
//           "/path/to/foo": ["layer"],
//           "/path/to/foo/layer": ["subLayer"],
//         },
//       },
//     ];
//     tests.forEach(({ args, expected }) => {
//       it(`${JSON.stringify(args)} -> ${JSON.stringify(expected)}`, () => {
//         assert.deepEqual(makeStructure(...args), expected);
//       });
//     });
//   });
//   describe("isLowerThan()", () => {
//     const tests = [
//       {
//         args: ["layer1", "layer2"],
//         expected: false,
//       },
//       {
//         args: ["layer1", "layer3"],
//         expected: false,
//       },
//       {
//         args: ["layer1", "layer1"],
//         expected: false,
//       },
//       {
//         args: ["layer2", "layer1"],
//         expected: true,
//       },
//       {
//         args: ["layer3", "layer1"],
//         expected: true,
//       },
//     ];
//     tests.forEach(({ args, expected }) => {
//       it(`${JSON.stringify(args)} -> ${expected}`, () => {
//         assert.equal(isLowerThan(...args, structure["/"]), expected);
//       });
//     });
//   });
//   describe("replaceAlias()", () => {
//     const tests = [
//       {
//         args: ["@f/layer", { "@": "./bar", "@f": "./foo" }],
//         expected: "./foo/layer",
//       },
//     ];
//     tests.forEach(({ args, expected }) => {
//       it(`${args[0]} -> ${expected}`, () => {
//         assert.equal(replaceAlias(...args), expected);
//       });
//     });
//   });
// });
