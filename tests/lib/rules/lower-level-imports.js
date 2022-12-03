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

/* 
src
 ┣ layer1
 ┃ ┣ subLayer1
 ┃ ┗ subLayer2
 ┣ layer2
 ┃ ┣ subLayer1
 ┃ ┣ subLayer2
 ┃ ┣ subOtherLayer
 ┗ layer3
 ┃ ┣ subLayer1
 ┃ ┗ subLayer2
*/

const structure = {
  "/": ["layer1", "layer2", "layer3"],
  "/layer1": ["subLayer1", "subLayer2"],
  "/layer2": ["subLayer1", "subLayer2"],
  "/layer3": ["subLayer1", "subLayer2"],
};

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("lower-level-imports", rule, {
  valid: [
    {
      code: "import { func } from './subLayer1/module'",
      filename: "/src/layer1/module.js",
      options: [{ structure }],
    },
    {
      code: "import { func } from './subOtherLayer/module'",
      filename: "/src/layer2/module.js",
      options: [{ structure }],
    },
    {
      code: "import { func } from '../../layer2/module'",
      filename: "/src/layer1/subLayer1/module.js",
      options: [{ structure }],
    },
    {
      code: "import { func } from '../../layer2/subLayer1/module'",
      filename: "/src/layer1/subLayer1/module.js",
      options: [{ structure }],
    },
    {
      code: "import { func } from '../layer1/module'",
      filename: "/src/layer2/module.test.js",
      options: [{ structure }],
    },
  ],
  invalid: [
    {
      code: "import { func } from '../layer1/module'",
      filename: "/src/layer2/module.js",
      options: [{ structure }],
      errors: [{ messageId: "not-lower-level" }],
    },
    {
      code: "import { func } from '../subLayer1/module'",
      filename: "/src/layer1/subLayer2/module.js",
      options: [{ structure }],
      errors: [{ messageId: "not-lower-level" }],
    },
    {
      code: "import { func } from '../subOtherLayer/module'",
      filename: "/src/layer2/subLayer1/module.js",
      options: [{ structure }],
      errors: [{ messageId: "not-lower-level" }],
    },
  ],
});
