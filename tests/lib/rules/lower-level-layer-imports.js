/**
 * @fileoverview test for lower-level-imports
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/lower-level-layer-imports");
const RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

/*
// .stratified.json
[
  ["layerA"],
  ["layerB"],
  [{ "name": "layerC", "barrier": true }],
  ["layerD"],
  [{ "name": "nodeModuleE", "nodeModule": "true" }],
  ["layerF"],
  ["layerG", "layerH"],
  ["layerI"],
  ["layerJ/entryA", "layerJ/entryB"]
]
*/

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("lower-level-layer-imports", rule, {
  valid: [
    {
      code: "import { func } from './layerB'",
      filename: "./mocked/layerA.js",
      options: [],
    },
    {
      code: "import { func } from './layerC'",
      filename: "./mocked/layerA.js",
      options: [],
    },
    {
      code: "import { func } from 'nodeModuleE'",
      filename: "./mocked/layerD.js",
      options: [],
    },
    {
      code: "import { func } from './layerH'",
      filename: "./mocked/layerF.js",
      options: [],
    },
    {
      code: "import { func } from './layerI'",
      filename: "./mocked/layerH.js",
      options: [],
    },
  ],
  invalid: [
    {
      code: "import { func } from './layerA'",
      filename: "./mocked/layerB.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerA", file: "layerB" },
        },
      ],
    },
    {
      code: "import { func } from './layerD'",
      filename: "./mocked/layerB.js",
      options: [],
      errors: [
        {
          messageId: "barrier",
          data: { module: "layerD", file: "layerB" },
        },
      ],
    },
  ],
});
