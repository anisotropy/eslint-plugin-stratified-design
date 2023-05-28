/**
 * @fileoverview Disallow calling functions in the same file.
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-same-level-funcs"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("no-same-level-funcs", rule, {
  valid: [
    // { code: "function func1(){ function func2(){} func2() }" }
  ],
  invalid: [
    // {
    //   code: "function func1(){}; function func2(){ func1(); }",
    //   errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    // },
    // {
    //   code: "function func2(){ func1(); }; function func1(){}",
    //   errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    // },
    // {
    //   code: "const func1 = () => {}; const func2 = () => { func1(); }",
    //   errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    // },
    // {
    //   code: "const func1 = function(){}; const func2 = function(){ func1(); }",
    //   errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    // },
    // {
    //   code: "const func1 = function func1(){}; const func2 = function func2(){ func1(); }",
    //   errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    // },
  ],
});
