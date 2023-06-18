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

const structure = [
  "layer1/subLayer1",
  "layer1/subLayer2",
  { name: "layer2/subLayer1", interface: true },
  "layer2/subLayer2",
  { name: "node-module", isNodeModule: true },
  "layer3/subLayer1",
  "layer3/subLayer2",
  "layer3/subLayer3",
];

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
    {
      code: "import { func } from '@/layer1/subLayer2'",
      filename: "./src/layer1/subLayer1.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
    },
    {
      code: "import { func } from 'node-module'",
      filename: "./src/otherLayerA.js",
      options: [{ structure, root: "./src" }],
    },
    {
      code: "import { func } from 'node-module'",
      filename: "./src/layer2/subLayer1.js",
      options: [{ structure, root: "./src" }],
    },
    {
      code: "import { func } from '@/layer2/subLayer1'",
      filename: "./src/layer1/subLayer2.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
    },
    {
      code: "import { func } from '@/layer3/subLayer1'",
      filename: "./src/layer2/subLayer1.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
    },
    {
      code: "import { func } from './otherLayerB'",
      filename: "./src/otherLayerA.js",
      options: [{ structure, root: "./src", exclude: ["**/otherLayerA.js"] }],
    },
    {
      code: "import { func } from './2 otherLayerB'",
      filename: "./src/1 otherLayerA.js",
      options: [{ structure, root: "./src", useLevelNumber: true }],
    },
    {
      code: "import { func } from './1 otherSubLayerB'",
      filename: "./src/otherLayerA/index.js",
      options: [{ structure, root: "./src", useLevelNumber: true }],
    },
  ],
  invalid: [
    {
      code: "import { func } from './otherLayerB'",
      filename: "./src/otherLayerA.js",
      options: [{ structure, root: "./src" }],
      errors: [
        {
          messageId: "not-registered:file",
          data: { module: "otherLayerB", file: "otherLayerA" },
        },
      ],
    },
    {
      code: "import { func } from 'node-module'",
      filename: "./src/layer3/subLayer1.js",
      options: [{ structure, root: "./src" }],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "node-module", file: "layer3/subLayer1" },
        },
      ],
    },
    {
      code: "import { func } from '@/layer2/subLayer2'",
      filename: "./src/layer1/subLayer2.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
      errors: [
        {
          messageId: "interface",
          data: { module: "layer2/subLayer2", file: "layer1/subLayer2" },
        },
      ],
    },
  ],
});
