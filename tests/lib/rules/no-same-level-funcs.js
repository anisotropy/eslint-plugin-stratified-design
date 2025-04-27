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
      options: [{ include: ["src/**/*.*"], exclude: ["src/foo.js"] }],
    },

    {
      code: "// @level 2\nfunction func2(){};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/function func2(){}; /*@level 1*/function func1(){ func2(); }",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/function func2(){}; function func1(){ func2(); }",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/export function func2(){}; /*@level 1*/function func1(){ func2(); }",
      filename: "./src/foo.js",
    },

    {
      code: "// @level 2\nconst func2 = () => {};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
    },
    {
      code: "// @level 2\nexport const func2 = () => {};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
    },

    {
      code: "// @level 2\nconst func2 = () => {};\n// @level 1\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "// @level 2\nexport const func2 = () => {};\n// @level 1\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },

    {
      code: "/*@level 2*/\nconst func2 = () => {};\n/*@level 1*/\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/\nexport const func2 = () => {};\n/*@level 1*/\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },

    {
      code: "// @level 2 something\nconst func2 = () => {};\n// @level 1 something\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "// @level 2 something\nexport const func2 = () => {};\n// @level 1 something\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },

    {
      code: "/*\n@level 2\nsomething\n*/\nconst func2 = () => {};\n/*something\n@level 1\n*/\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },
    {
      code: "/*\n@level 2\nsomething\n*/\nexport const func2 = () => {};\n/*something\n@level 1\n*/\nconst func1 = () => func2();",
      filename: "./src/foo.js",
    },

    {
      code: "// @level 2\nfunction func2(){};\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func2" } }],
    },
    {
      code: "// @level 2\nexport function func2(){};\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func2" } }],
    },

    {
      code: "function recursiveFunc() { recursiveFunc() }",
      filename: "./src/foo.js",
    },
    {
      code: "const recursiveFunc = () => { recursiveFunc() }",
      filename: "./src/foo.js",
    },
    {
      code: "export const recursiveFunc = () => { recursiveFunc() }",
      filename: "./src/foo.js",
    },
    {
      code: "//@level 2\nconst recursiveFunc = () => { recursiveFunc() }",
      filename: "./src/foo.js",
    },

    {
      code: "const funcWithInnerFunc = () => { const innerFunc = () => {}; innerFunc()  }",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/const func2 = () => {}; /*@level 1*/const func1 = () => { const innerFunc = () => { func2() }; innerFunc(); }",
      filename: "./src/foo.js",
    },

    {
      code: "/*@level 2*/const func = () => 'a'; /*@level 1*/const obj = { a: func() } ",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/const func = () => 'a'; /*@level 1*/const obj = { func: () => { func() } } ",
      filename: "./src/foo.js",
    },

    {
      code: "const func = () => 'a'; const obj = { a: func() } ",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/const func = () => 'a'; /*@level 1*/const obj = { func: () => { func() } } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "obj" } }],
    },
    {
      code: "/*@level 2*/const obj = { func2: () => {} }; /*@level 1*/const func1 = () => { obj.func2() } ",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/const obj = { func2(){} }; /*@level 1*/const func1 = () => { obj.func2() } ",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 3*/const func3 = () => 'a'; /*@level 2*/const obj = { func2: func3 }; /*@level 1*/const func1 = () => { obj.func2() } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "obj" } }],
    },

    {
      code: "const func = () => 'a'; const arr = [func()];",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/const func = () => 'a'; /*@level 1*/const arr = [() => { func() }];",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 2*/const arr = [() => {}]; /*@level 1*/const func1 = () => { arr[0]() } ",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 3*/const func3 = () => 'a'; /*@level 2*/const arr = [func3]; /*@level 1*/const func1 = () => { arr[0]() } ",
      filename: "./src/foo.js",
    },
    {
      code: "import { func } from './module'; const arr = [{a: {b: {c: [func]}}}];",
      filename: "./src/foo.js",
    },
    {
      code: "const func = () => {}; const arr = [{a: {b: {c: [func]}}}];",
      filename: "./src/foo.js",
    },
    {
      code: "/*@level 3*/const func3 = () => {}; /*@level 2*/const arr = [{a: {b: {c: [func3]}}}]; /*@level 1*/const func1 = () => arr[0].a.b.c[0]();",
      filename: "./src/foo.js",
    },
    {
      code: "const obj2 = {}; const obj1 = {...obj2};",
      filename: "./src/foo.js",
    },
    {
      code: "const arr2 = []; const arr1 = [...arr2];",
      filename: "./src/foo.js",
    },

    {
      code: "//@level 2\nconst [dat, fn2] = someFn()\nconst fn1 = () => { fn2() }\n",
      filename: "./src/foo.js",
    },
    {
      code: "//@level 2\nconst {dat, fn2} = someFn()\nconst fn1 = () => { fn2() }\n",
      filename: "./src/foo.js",
    },
    {
      code: "//@level 2\nconst {dat, fn2: func2} = someFn()\nconst fn1 = () => { func2() }\n",
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
      code: "export function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "export default function func1(){}; function func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "function func2(){ func1(); }; function func1(){}",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "export function func2(){ func1(); }; function func1(){}",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "export default function func2(){ func1(); }; function func1(){}",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const func1 = () => {}; const func2 = () => { func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "export const func1 = () => {}; const func2 = () => { func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const func1 = function(){}; const func2 = function(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "export const func1 = function(){}; const func2 = function(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const func1 = function func1(){}; const func2 = function func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "export const func1 = function func1(){}; const func2 = function func2(){ func1(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func1" } }],
    },
    {
      code: "const fn = () => 1; const value = fn()",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fn" } }],
    },
    {
      code: "export const fn = () => 1; const value = fn()",
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
      code: "const fn1 = template``; const fn2 = () => fn1();",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fn1" } }],
    },
    {
      code: "const Comp1 = styled.div``; const Comp2 = () => <Comp1 />",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "Comp1" } }],
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
      code: "function func2(){};\n// @level 1\nfunction func1(){ func2(); }",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func2" } }],
    },

    {
      code: "const func = () => 'a'; const obj = { func: () => { func() } };",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func" } }],
    },
    {
      code: "const obj = { func2: () => {} }; const func1 = () => { obj.func2() } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "obj" } }],
    },
    {
      code: "const obj = { func2(){} }; const func1 = () => { obj.func2() } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "obj" } }],
    },
    {
      code: "const func3 = () => 'a'; const obj = { func2: func3 }; const func1 = () => { obj.func2() } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "obj" } }],
    },

    {
      code: "const func = () => 'a'; const arr = [() => { func() }];",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func" } }],
    },
    {
      code: "const arr = [() => {}]; const func1 = () => { arr[0]() } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "arr" } }],
    },
    {
      code: "const func3 = () => 'a'; const arr = [func3]; const func1 = () => { arr[0]() } ",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "arr" } }],
    },
    {
      code: "const func3 = () => {}; const arr = [{a: {b: {c: [func3]}}}]; const func1 = () => arr[0].a.b.c[0]();",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "arr" } }],
    },

    {
      code: "const [dat, fn2] = someFn()\nconst fn1 = () => { fn2() }\n",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fn2" } }],
    },
    {
      code: "const {dat, fn2} = someFn()\nconst fn1 = () => { fn2() }\n",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "fn2" } }],
    },
    {
      code: "const {dat, fn2: func2} = someFn()\nconst fn1 = () => { func2() }\n",
      filename: "./src/foo.js",
      errors: [{ messageId: "no-same-level-funcs", data: { func: "func2" } }],
    },
  ],
});
