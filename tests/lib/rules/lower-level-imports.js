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

ruleTester.run("lower-level-imports", rule, {
  valid: ["import { func } from './lowerLevel'"],
  invalid: [
    {
      code: "import { func } from './higherLevel'",
      errors: [{ message: "Lower level modules should be imported." }],
    },
  ],
});
