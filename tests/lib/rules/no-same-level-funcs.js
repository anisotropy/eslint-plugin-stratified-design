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
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("no-same-level-funcs", rule, {
  valid: [
    {
      code: "function func1(){ function func2(){} func2() }",
      filename: "./src/foo.js",
    },
    {
      code: "function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.test.js",
    },
    {
      code: "function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.js",
      options: [{ exclude: ["**/foo.js"] }],
    },
    {
      code: "function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.js",
      options: [{ include: ["**/*.ts"] }],
    },
    {
      code: "function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.js",
      options: [{ include: ["**/src/**/*.*"], exclude: ["**/foo.js"] }],
    },
    {
      code: "// @level 2\nfunction func2(){};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
    },
    {
      code: "// @level 2\nconst func2 = () => {};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
    },
    {
      code: "// @level 2\nconst func2 = () => {};\n// @level 1\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/\nconst func2 = () => {};\n/*@level 1*/\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "// @level 2 something\nconst func2 = () => {};\n// @level 1 something\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "/*\n@level 2\nsomething\n*/\nconst func2 = () => {};\n/*something\n@level 1\n*/\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
  ],
  invalid: [
    {
      code: "function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "function func2(){ func1(); }; function func1(){}",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const func1 = () => {}; const func2 = () => { func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const func1 = function(){}; const func2 = function(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const func1 = function func1(){}; const func2 = function func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const fn = () => 1; const value = fn()",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fn" } }],
    },
    {
      code: "const hof = (fn) => fn(); const fnByHof = hof(() => 1);",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "hof" } }],
    },
    {
      code: "const fnByHof = hof(() => 1); const value = fnByHof()",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fnByHof" } }],
    },
    {
      code: "const fnByHof = hof(() => 1); const fn = fnByHof(() => 1)",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fnByHof" } }],
    },
    {
      code: "const fn = () => 1; const fnByHof = hof(fn)",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fn" } }],
    },
    {
      code: "function CompA() { return <div /> }; function CompB() { return <CompA /> };",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "CompA" } }],
    },
    {
      code: "// @level 1\nfunction func1(){};\n// @level 2\nfunction func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "// @level 2\nfunction func2(){};\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func2" } }],
    },
    {
      code: "function func2(){};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func2" } }],
    },
  ],
});
