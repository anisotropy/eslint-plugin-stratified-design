/**
 * @fileoverview ...
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
      options: [
        {
          importPaths: [
            {
              import: { specifiers: ["foo"], path: "**/src/fileA" },
              allow: ["**/src/**/*.js"],
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
          importPaths: [
            {
              import: { specifiers: ["baz"], path: "**/src/fileC" },
              allow: ["**/src/**/*.js"],
            },
            {
              import: { specifiers: ["foo", "bar"], path: "**/src/fileA" },
              allow: ["**/src/**/*.js"],
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
          importPaths: [
            {
              import: { specifiers: ["foo", "bar"], path: "**/src/fileA" },
              disallow: ["**/src/**/*.test.js"],
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
          importPaths: [
            {
              import: { specifiers: ["foo", "bar"], path: "**/src/fileA" },
              allow: ["**/src/**/*.js"],
              disallow: ["**/src/**/*.test.js"],
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
          importPaths: [
            {
              import: { specifiers: ["foo"], path: "**/src/fileA" },
              allow: ["**/src/**/*.js"],
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
          importPaths: [
            {
              import: { specifiers: ["default"], path: "**/src/fileA" },
              allow: ["**/src/**/*.js"],
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
          importPaths: [
            {
              import: { specifiers: ["foo"], path: "**/src/fileA" },
              allow: ["**/src/**/*.test.js"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { specifier: "foo" } },
      ],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          importPaths: [
            {
              import: { specifiers: ["foo"], path: "**/src/fileA" },
              disallow: ["**/src/**/*.js"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { specifier: "foo" } },
      ],
    },
    {
      code: "import { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          importPaths: [
            {
              import: { specifiers: ["foo"], path: "**/src/fileA" },
              allow: ["**/src/**/*.js"],
              disallow: ["**/src/**/fileB.*"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { specifier: "foo" } },
      ],
    },
    {
      code: "import foo from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          importPaths: [
            {
              import: { specifiers: ["default"], path: "**/src/fileA" },
              disallow: ["**/src/**/*.js"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { specifier: "foo" } },
      ],
    },
  ],
});
