/**
 * @fileoverview Should import lower level
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/lower-level-imports"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
});

const options = [
  {
    "/": [["layer1"], ["layer2"]],
    layer1: [["layer1-1"], ["layer1-2"]],
  },
];

ruleTester.run("lower-level-imports", rule, {
  valid: [
    {
      code: "import { func } from '../layer2/module'",
      filename: "/src/layer1/module.js",
      options,
    },
  ],
  invalid: [
    {
      code: "import { func } from '../layer1/module'",
      filename: "/src/layer2/module.js",
      errors: [{ messageId: "not-lower-level" }],
      options,
    },
  ],
});
