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
  ["layerJ"],
  ["layerK"]
]

// layerB/.stratified.json
[
  ["layerBA"],
  ["layerBB"]
]

// layerJ/.stratified.json
[
  ["entryJA", "entryJB"],
  ["layerJC"]
]
*/

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("lower-level-layer-imports", rule, {
  valid: [
    {
      code: "import { func } from './layerB'",
      filename: "./mocked/lower-level-layer-imports/layerA.js",
      options: [],
    },
    {
      code: "import { func } from './layerC'",
      filename: "./mocked/lower-level-layer-imports/layerA.js",
      options: [],
    },
    {
      code: "import { func } from 'notRegisteredNodeModule'",
      filename: "./mocked/lower-level-layer-imports/layerA.js",
      options: [],
    },
    {
      code: "import { func } from 'nodeModuleE'",
      filename: "./mocked/lower-level-layer-imports/layerD.js",
      options: [],
    },
    {
      code: "import { func } from './layerH'",
      filename: "./mocked/lower-level-layer-imports/layerF.js",
      options: [],
    },
    {
      code: "import { func } from './layerI'",
      filename: "./mocked/lower-level-layer-imports/layerH.js",
      options: [],
    },
    {
      code: "import { func } from './layerBB'",
      filename: "./mocked/lower-level-layer-imports/layerB/layerBA.js",
      options: [],
    },
    {
      code: "import { func } from '../layerC'",
      filename: "./mocked/lower-level-layer-imports/layerB/layerBA.js",
      options: [],
    },
    {
      code: "import { func } from './layerJC'",
      filename: "./mocked/lower-level-layer-imports/layerJ/entryJA.js",
      options: [],
    },
    {
      code: "import { func } from './layerJC'",
      filename: "./mocked/lower-level-layer-imports/layerJ/entryJB.js",
      options: [],
    },
    {
      code: "import { func } from '../layerK'",
      filename: "./mocked/lower-level-layer-imports/layerJ/layerJC.js",
      options: [],
    },
  ],
  invalid: [
    {
      code: "import { func } from './layerA'",
      filename: "./mocked/lower-level-layer-imports/layerB.js",
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
      filename: "./mocked/lower-level-layer-imports/layerB.js",
      options: [],
      errors: [
        {
          messageId: "barrier",
          data: { module: "layerD", file: "layerB" },
        },
      ],
    },
    {
      code: "import { func } from './layerBA'",
      filename: "./mocked/lower-level-layer-imports/layerB/layerBB.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerBA", file: "layerBB" },
        },
      ],
    },
    {
      code: "import { func } from '../layerA'",
      filename: "./mocked/lower-level-layer-imports/layerB/layerBA.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerA", file: "layerBA" },
        },
      ],
    },
    {
      code: "import { func } from './entryJA'",
      filename: "./mocked/lower-level-layer-imports/layerJ/layerJC.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "entryJA", file: "layerJC" },
        },
      ],
    },
    {
      code: "import { func } from '../layerI'",
      filename: "./mocked/lower-level-layer-imports/layerJ/layerJC.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerI", file: "layerJC" },
        },
      ],
    },
  ],
});
