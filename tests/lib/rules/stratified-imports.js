/**
 * @fileoverview test for lower-level-imports
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/stratified-imports");
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

// layerD/.stratified.json
[
  ["layerDA"],
  ["layerDB"]
]

// layerD/layerDB/.stratified.json 
[
  ["layerDBA"],
  ["layerDBB"]
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

ruleTester.run("stratified-imports", rule, {
  valid: [
    {
      code: "import { func } from './layerB'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [],
    },
    {
      code: "import { func } from './layerC'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [],
    },
    {
      code: "import { func } from 'notRegisteredNodeModule'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [],
    },
    {
      code: "import { func } from 'nodeModuleE'",
      filename: "./mocked/stratified-imports/layerD/layerDA.js",
      options: [],
    },
    {
      code: "import { func } from './layerH'",
      filename: "./mocked/stratified-imports/layerF.js",
      options: [],
    },
    {
      code: "import { func } from './layerI'",
      filename: "./mocked/stratified-imports/layerH.js",
      options: [],
    },
    {
      code: "import { func } from './layerBB'",
      filename: "./mocked/stratified-imports/layerB/layerBA.js",
      options: [],
    },
    {
      code: "import { func } from '../layerC'",
      filename: "./mocked/stratified-imports/layerB/layerBA.js",
      options: [],
    },
    {
      code: "import { func } from './layerJC'",
      filename: "./mocked/stratified-imports/layerJ/entryJA.js",
      options: [],
    },
    {
      code: "import { func } from '../layerJ/entryJA'",
      filename: "./mocked/stratified-imports/layerD/layerDA.js",
      options: [],
    },
    {
      code: "import { func } from './layerJC'",
      filename: "./mocked/stratified-imports/layerJ/entryJB.js",
      options: [],
    },
    {
      code: "import { func } from '../layerK'",
      filename: "./mocked/stratified-imports/layerJ/layerJC.js",
      options: [],
    },
    {
      code: "import { func } from '@/layerB'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [{ aliases: { "@/": "./mocked/stratified-imports/" } }],
    },
    {
      code: "import { func } from './notRegisteredLayer'",
      filename: "./mocked/stratified-imports/layerA.test.js",
      options: [],
    },
    {
      code: "import { func } from './notRegisteredLayer'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [{ include: ["**/*.ts"] }],
    },
    {
      code: "import { func } from './notRegisteredLayer'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [{ exclude: ["**/*.js"] }],
    },
    {
      code: "import { func } from './notRegisteredLayer'",
      filename: "./mocked/stratified-imports/layerA.js",
      options: [{ include: ["**/*.js"], exclude: ["**/layerA.js"] }],
    },
    {
      code: "import { func } from './layerJ/entryJA'",
      filename: "./mocked/stratified-imports/layerI.js",
      options: [],
    },
    {
      code: "import { func } from '@/layerF'",
      filename: "./mocked/stratified-imports/layerD/layerDB/layerDBA.js",
      options: [{ aliases: { "@/": "./mocked/stratified-imports/" } }],
    },
  ],
  invalid: [
    {
      code: "import { func } from './layerA'",
      filename: "./mocked/stratified-imports/notRegisteredLayer.js",
      options: [],
      errors: [
        {
          messageId: "not-registered",
          data: { file: "notRegisteredLayer" },
        },
      ],
    },
    {
      code: "import { func } from './layerA'",
      filename: "./mocked/stratified-imports/layerB.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerA", file: "layerB" },
        },
      ],
    },
    {
      code: "import { func } from 'nodeModuleE'",
      filename: "./mocked/stratified-imports/layerF.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "nodeModuleE", file: "layerF" },
        },
      ],
    },
    {
      code: "import { func } from 'nodeModuleE'",
      filename: "./mocked/stratified-imports/layerJ/layerJC.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "nodeModuleE", file: "layerJC" },
        },
      ],
    },
    {
      code: "import { func } from './layerD'",
      filename: "./mocked/stratified-imports/layerB.js",
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
      filename: "./mocked/stratified-imports/layerB/layerBB.js",
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
      filename: "./mocked/stratified-imports/layerB/layerBA.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerA", file: "layerBA" },
        },
      ],
    },
    {
      code: "import { func } from '../../layerA'",
      filename: "./mocked/stratified-imports/layerD/layerDB/layerDBA.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerA", file: "layerDBA" },
        },
      ],
    },
    {
      code: "import { func } from './entryJA'",
      filename: "./mocked/stratified-imports/layerJ/layerJC.js",
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
      filename: "./mocked/stratified-imports/layerJ/layerJC.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "layerI", file: "layerJC" },
        },
      ],
    },
    {
      code: "import { func } from './layerJ/notRegisteredEntry'",
      filename: "./mocked/stratified-imports/layerI.js",
      options: [],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "notRegisteredEntry", file: "layerI" },
        },
      ],
    },
  ],
});
