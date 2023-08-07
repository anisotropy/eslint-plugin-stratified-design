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
  { name: "layer2/subLayer1", barrier: true },
  "layer2/subLayer2",
  { name: "node-module", nodeModule: true },
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
      code: "import { func } from '@/layer1/subLayer2/otherLayerA'",
      filename: "./src/layer1/subLayer1.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
    },
    {
      code: "import { func } from '@/layer1/subLayer2/otherLayerB'",
      filename: "./src/layer1/subLayer1/otherLayerA.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
    },
    {
      code: "import { func } from 'other-node-module'",
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
      filename: "./src/otherLayerA.test.js",
      options: [
        {
          structure,
          root: "./src",
          exclude: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
        },
      ],
    },
    {
      code: "import { func } from './otherLayerB'",
      filename: "./src/otherLayerA.test.js",
      options: [
        { structure, root: "./src", include: ["**/*.{js,ts,jsx,tsx}"] },
      ],
    },
    {
      code: "import { func } from './otherLayerB'",
      filename: "./src/otherLayerA.test.js",
      options: [
        {
          structure,
          root: "./src",
          include: ["**/*.js"],
          exclude: ["**/otherLayerA.test.js"],
        },
      ],
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
    {
      code: "import { func } from './1 otherSubLayerB'",
      filename: "./src/otherLayerA/subLayer.js",
      options: [{ structure, root: "./src", useLevelNumber: true }],
    },
    {
      code: "import { func } from '@/component/99 library'",
      filename: "./src/component/1 layer/CompA/index.ts",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
    },
    {
      code: "import { func } from '@/component/99 library'",
      filename: "./src/component/1 layer/CompA/ComponentA.ts",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
    },
    {
      code: "import { func } from '@/component/99 library'",
      filename: "./src/component/1 layer/CompA/1 style.tsx",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
    },
    {
      code: "import { func } from '@/component/1 layer/2 style'",
      filename: "./src/component/1 layer/1 style.tsx",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
    },
    {
      code: "import { func } from 'other-node-module'",
      filename: "./src/1 otherLayerA.js",
      options: [{ structure, root: "./src", useLevelNumber: true }],
    },
    {
      code: "import { func } from 'node-module'",
      filename: "./src/layer2/subLayer1/1 layer.js",
      options: [
        {
          structure,
          root: "./src",
          aliases: { "@/": "./src/" },
          useLevelNumber: true,
        },
      ],
    },
    {
      code: "import { func } from '@/layer1/subLayer2/sub'",
      filename: "./src/layer1/subLayer1/1 layer.js",
      options: [
        {
          structure,
          root: "./src",
          aliases: { "@/": "./src/" },
          useLevelNumber: true,
        },
      ],
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
          data: { module: "./otherLayerB", file: "./otherLayerA" },
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
          data: { module: "node-module", file: "./layer3/subLayer1" },
        },
      ],
    },
    {
      code: "import { func } from '@/layer2/subLayer2'",
      filename: "./src/layer1/subLayer2.js",
      options: [{ structure, root: "./src", aliases: { "@/": "./src/" } }],
      errors: [
        {
          messageId: "barrier",
          data: { module: "./layer2/subLayer2", file: "./layer1/subLayer2" },
        },
      ],
    },
    {
      code: "import { func } from '@/layer3/subLayer2/1 otherLayerA'",
      filename: "./src/layer3/subLayer1.js",
      options: [
        {
          structure,
          useLevelNumber: true,
          root: "./src",
          aliases: { "@/": "./src/" },
        },
      ],
      errors: [
        {
          messageId: "barrier",
          data: {
            module: "./layer3/subLayer2/1 otherLayerA",
            file: "./layer3/subLayer1",
          },
        },
      ],
    },
    {
      code: "import { func } from '@/layer3/subLayer2/1 otherLayerA'",
      filename: "./src/layer3/subLayer1/1 otherLayerA.js",
      options: [
        {
          structure,
          useLevelNumber: true,
          root: "./src",
          aliases: { "@/": "./src/" },
        },
      ],
      errors: [
        {
          messageId: "barrier",
          data: {
            module: "./layer3/subLayer2/1 otherLayerA",
            file: "./layer3/subLayer1/1 otherLayerA",
          },
        },
      ],
    },
    {
      code: "import { func } from '@/component/2 layer/CompA'",
      filename: "./src/component/1 layer.ts",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
      errors: [
        {
          messageId: "barrier",
          data: {
            module: "./component/2 layer/CompA",
            file: "./component/1 layer",
          },
        },
      ],
    },
    {
      code: "import { func } from '@/component/1 layer/1 style'",
      filename: "./src/component/1 layer/2 style.ts",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
      errors: [
        {
          messageId: "not-lower-level",
          data: {
            module: "./component/1 layer/1 style",
            file: "./component/1 layer/2 style",
          },
        },
      ],
    },
    {
      code: "import { func } from '@/component/2 layer/1 style'",
      filename: "./src/component/1 layer/1 style.ts",
      options: [
        {
          structure,
          root: "./src",
          useLevelNumber: true,
          aliases: { "@/": "./src/" },
        },
      ],
      errors: [
        {
          messageId: "barrier",
          data: {
            module: "./component/2 layer/1 style",
            file: "./component/1 layer/1 style",
          },
        },
      ],
    },
    {
      code: "import { func } from 'node-module'",
      filename: "./src/layer3/subLayer1/1 layer.js",
      options: [{ structure, root: "./src", useLevelNumber: true }],
      errors: [
        {
          messageId: "not-lower-level",
          data: { module: "node-module", file: "./layer3/subLayer1/1 layer" },
        },
      ],
    },
  ],
});
