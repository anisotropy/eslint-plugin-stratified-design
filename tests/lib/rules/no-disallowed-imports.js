/**
 * @fileoverview Allow or disallow importing specified modules
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-disallowed-imports");
const RuleTester = require("eslint").RuleTester;

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

ruleTester.run("no-disallowed-imports", rule, {
  valid: [
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [{ import: { member: ["foo"], from: "src/fileA" } }],
        },
      ],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["baz"], from: "src/fileC" },
              allow: ["src/**/*.js"],
            },
            {
              import: { member: ["foo", "bar"], from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo", "bar"], from: "src/fileA" },
              disallow: ["src/**/*.test.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo", "bar"], from: "src/fileA" },
              allow: ["src/**/*.js"],
              disallow: ["src/**/*.test.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import { foo } from '@/fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo"], from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
          aliases: { "@/": "./src/" },
        },
      ],
    },
    {
      code: "import foo from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["default"], from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import * as name from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["*"], from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
  ],
  invalid: [
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo"], from: "src/fileA" },
              allow: ["src/**/*.test.js"],
            },
          ],
        },
      ],
      errors: [{ messageId: "no-disallowed-imports", data: { member: "foo" } }],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo"], from: "src/fileA" },
              disallow: ["src/**/*.js"],
            },
          ],
        },
      ],
      errors: [{ messageId: "no-disallowed-imports", data: { member: "foo" } }],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo"], from: "src/fileA" },
              allow: ["src/**/*.js"],
              disallow: ["src/**/fileB.*"],
            },
          ],
        },
      ],
      errors: [{ messageId: "no-disallowed-imports", data: { member: "foo" } }],
    },
    {
      code: "import foo from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["default"], from: "src/fileA" },
              disallow: ["src/**/*.js"],
            },
          ],
        },
      ],
      errors: [{ messageId: "no-disallowed-imports", data: { member: "foo" } }],
    },
    {
      code: "import * as name from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: ["*"], from: "src/fileA" },
              disallow: ["src/**/*.js"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { member: "name" } },
      ],
    },
  ],
});
