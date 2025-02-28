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
    {
      code: "import { foo } from 'nodeModule'",
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
    },
    {
      code: "import { anyMember } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import * as namespace from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import { anyMember } from './fileA.act'",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              allow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import { anyMember } from 'fileA.cal'",
      filename: "./src/fileB.act.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              disallow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },
    {
      code: "import { anyMember } from 'nodeModule'",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              disallow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },

    {
      code: "export { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [],
    },
    {
      code: "export { foo } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [{ import: { member: ["foo"], from: "src/fileA" } }],
        },
      ],
    },
    {
      code: "export { foo } from './fileA'",
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
      code: "export { foo } from './fileA'",
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
      code: "export { foo } from './fileA'",
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
      code: "export { foo } from '@/fileA'",
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
      code: "export * from './fileA'",
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
    {
      code: "export * as name from './fileA'",
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
    {
      code: "export { foo } from 'nodeModule'",
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
    },
    {
      code: "export { anyMember } from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
    {
      code: "export * as namespace from './fileA'",
      filename: "./src/fileB.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "src/fileA" },
              allow: ["src/**/*.js"],
            },
          ],
        },
      ],
    },
    {
      code: "export { anyMember } from './fileA.act'",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              allow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },
    {
      code: "export { anyMember } from 'fileA.cal'",
      filename: "./src/fileB.act.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              disallow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },
    {
      code: "export { anyMember } from 'nodeModule'",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              disallow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },

    {
      code: "const foo = 'a'; export { foo };",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo"], from: "**/*.act" },
              disallow: ["src/**/*.cal.js"],
            },
          ],
        },
      ],
    },
    {
      code: "const foo = 'a'; export default foo;",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: ["foo"], from: "**/*.act" },
              disallow: ["src/**/*.cal.js"],
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
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
        { messageId: "no-disallowed-imports", data: { member: "'name'", from: "src/fileA" } },
      ],
    },
    {
      code: "import { anyMember } from './fileA.act'",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              disallow: ["**/*.cal.js"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { member: "Any member", from: "**/*.act" } },
      ],
    },

    {
      code: "export { foo } from './fileA'",
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
    },
    {
      code: "export { foo } from './fileA'",
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
    },
    {
      code: "export { foo } from './fileA'",
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'foo'", from: "src/fileA" } }],
    },
    {
      code: "export * from './fileA'",
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
      errors: [{ messageId: "no-disallowed-imports", data: { member: "'*'", from: "src/fileA" } }],
    },
    {
      code: "export * as name from './fileA'",
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
        { messageId: "no-disallowed-imports", data: { member: "'name'", from: "src/fileA" } },
      ],
    },
    {
      code: "export { anyMember } from './fileA.act'",
      filename: "./src/fileB.cal.js",
      options: [
        {
          imports: [
            {
              import: { member: "*", from: "**/*.act" },
              disallow: ["**/*.cal.js"],
            },
          ],
        },
      ],
      errors: [
        { messageId: "no-disallowed-imports", data: { member: "Any member", from: "**/*.act" } },
      ],
    },
  ],
});
