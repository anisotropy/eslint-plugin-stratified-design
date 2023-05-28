/**
 * @fileoverview test for lower-level-imports
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

/* 
src
 ┣ layer1
 ┃ ┣ subLayer1
 ┃ ┗ subLayer2
 ┣ layer2
 ┃ ┣ subLayer1
 ┃ ┣ subLayer2
 ┃ ┣ subOtherLayer
 ┃ layer3
 ┃ ┣ subLayer1
 ┃ ┗ subLayer2
 ┗ otherLayer
*/

const structure = [
  "layer1/subLayer1",
  "layer1/subLayer2",
  "layer2/subLayer1",
  "layer2/subLayer2",
  "layer3/subLayer1",
  "layer3/subLayer2",
  "layer3/subLayer3",
];

const structureWithOptions = {
  "/": ["layer1", { name: "layer2", interface: true }, "layer3"],
  "/layer1": ["subLayer1", "subLayer2"],
  "/layer2": [
    "subLayer1",
    "subLayer2",
    { name: "nodeModule", isNodeModule: true },
  ],
  "/layer3": ["subLayer1", { name: "subLayer2", interface: true }, "subLayer3"],
};

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("lower-level-imports", rule, {
  valid: [
    {
      code: "import { func } from './otherLayerB/otherSubLayer'",
      filename: "./src/otherLayerA.js",
      options: [{ structure, root: "./src" }],
    },
    {
      code: "import { func } from '../layer1/subLayer2'",
      filename: "./src/layer1/subLayer1.js",
      options: [{ structure, root: "./src" }],
    },
    // {
    //   code: "import { func } from '../layer2/subLayer1'",
    //   filename: "./src/layer1/subLayer1.js",
    //   options: [{ structure, root: "./src" }],
    // },
    // {
    //   code: "import { func } from './subOtherLayer/module'",
    //   filename: "./src/layer2/module.js",
    //   options: [{ structure, root: "./src" }],
    // },
    // {
    //   code: "import { func } from '../../layer2/module'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure, root: "./src" }],
    // },
    // {
    //   code: "import { func } from '../../layer2/subLayer1/module'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure, root: "./src" }],
    // },
    // {
    //   code: "import { func } from '../layer1/module'",
    //   filename: "./src/layer2/module.test.js",
    //   options: [{ structure, root: "./src" }],
    // },
    // {
    //   code: "import { func } from '../layer2/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    // },
    // {
    //   code: "import { func } from '../../layer2/module'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    // },
    // {
    //   code: "import { func } from 'nodeModule'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure, root: "./src" }],
    // },
    // {
    //   code: "import { func } from 'otherNodeModule'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    // },
    // {
    //   code: "import { func } from './subLayer2/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [],
    // },
    // {
    //   code: "import { func } from './subLayer1/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [{ structure, root: "." }],
    // },
    // {
    //   code: "import { func } from './subLayer1/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [{ structure, aliases: { "@": "." } }],
    // },
  ],
  invalid: [
    {
      code: "import { func } from './otherLayerB'",
      filename: "./src/otherLayerA.js",
      options: [{ structure, root: "./src" }],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "otherLayerB", file: "otherLayerA" },
        },
      ],
    },
    // {
    //   code: "import { func } from '../layer1/module'",
    //   filename: "./src/layer2/module.js",
    //   options: [{ structure, root: "./src" }],
    //   errors: [
    //     {
    //       messageId: "not-lower-level",
    //       data: { module: "layer1", file: "layer2" },
    //     },
    //   ],
    // },
    // {
    //   code: "import { func } from '../subLayer1/module'",
    //   filename: "./src/layer1/subLayer2/module.js",
    //   options: [{ structure, root: "./src" }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from '../subOtherLayer/module'",
    //   filename: "./src/layer2/subLayer1/module.js",
    //   options: [{ structure, root: "./src" }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from '../../layer3/module'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [
    //     {
    //       messageId: "interface",
    //       data: { module: "layer3", file: "subLayer1" },
    //     },
    //   ],
    // },
    // {
    //   code: "import { func } from '../subLayer3/module'",
    //   filename: "./src/layer3/subLayer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "interface" }],
    // },
    // {
    //   code: "import { func } from '../../layer3/subLayer3/module'",
    //   filename: "./src/layer2/subLayer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "interface" }],
    // },
    // {
    //   code: "import { func } from '../layer2/subLayer1/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "interface" }],
    // },
    // {
    //   code: "import { func } from '../../layer2/subLayer1/module'",
    //   filename: "./src/layer1/subLayer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "interface" }],
    // },
    // {
    //   code: "import { func } from '../layer3/subLayer1/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "interface" }],
    // },
    // {
    //   code: "import { func } from '@/layer1/subLayer1/module'",
    //   filename: "./src/layer2/module.js",
    //   options: [{ structure, root: "./src", aliases: { "@": "./src" } }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from '@/otherLayer/module'",
    //   filename: "./src/layer2/module.js",
    //   options: [{ structure, root: "./src", aliases: { "@": "./src" } }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from 'nodeModule'",
    //   filename: "./src/layer3/subLayer2/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from 'nodeModule/path/to'",
    //   filename: "./src/layer3/subLayer2/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from 'nodeModule/path/to'",
    //   filename: "./src/layer1/subLayer2/module.js",
    //   options: [{ structure: structureWithOptions, root: "./src" }],
    //   errors: [{ messageId: "interface" }],
    // },
    // {
    //   code: "import { func } from '../layer2/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
    // {
    //   code: "import { func } from '@/layer2/module'",
    //   filename: "./src/layer1/module.js",
    //   options: [{ aliases: { "@": "./src" } }],
    //   errors: [{ messageId: "not-lower-level" }],
    // },
  ],
});
