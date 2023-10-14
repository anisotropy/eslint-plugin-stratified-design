# Allow or disallow importing specified modules (no-disallowed-imports)

In certain cases, it is necessary to restrict the importation of specific modules. For instance:

- In a stratified design approach, higher-level modules should not be imported into lower-level modules.
- There may be situations where global variables should only be writable within a specific context.

## Options

To control module imports, use the `imports` option:

```json
{
  "stratified-design/no-disallowed-imports": [
    "error",
    {
      "imports": [
        {
          "import": { "member": ["foo"], "from": "src/fileA" },
          "allow": ["src/some-dir/*.js"]
        },
        {
          "import": { "member": ["foo", "bar"], "from": "src/fileB" },
          "disallow": ["src/not-allowed-file.js"]
        },
        {
          "import": { "member": ["baz"], "from": "src/fileC" },
          "allow": ["src/some-dir/*.js"],
          "disallow": ["src/not-allowed-file.js"]
        }
      ]
    }
  ]
}
```

If an imported module uses an alias, you can register the alias with the `aliases` option:

```json
{
  "stratified-design/no-disallowed-imports": [
    "error",
    {
      "aliases": { "@/": "./src/" }
    }
  ]
}
```

## Rule Details

Examples of **incorrect** code for this rule:

```js
// "stratified-design/no-disallowed-imports": [
//   "error",
//   {
//     "imports": [
//       {
//         "import": { "member": ["foo", "default", "*"], "from": "src/fileA" },
//         "allow": ["src/**/fileB.js"],
//         "disallow": ["src/**/fileC.*"]
//       }
//     ]
//   }
// ]

// ./src/fileC.js
import { foo } from "./fileA";
```

```js
// "stratified-design/no-disallowed-imports": [
//   "error",
//   {
//     "imports": [
//       {
//         "import": { "member": ["foo", "default", "*"], "from": "src/fileA" },
//         "allow": ["src/**/fileB.js"],
//         "disallow": ["src/**/fileC.*"]
//       }
//     ]
//   }
// ]

// ./src/fileC.js
import foo from "./fileA";
```

```js
// "stratified-design/no-disallowed-imports": [
//   "error",
//   {
//     "imports": [
//       {
//         "import": { "member": ["foo", "default", "*"], "from": "src/fileA" },
//         "allow": ["src/**/fileB.js"],
//         "disallow": ["src/**/fileC.*"]
//       }
//     ]
//   }
// ]

// ./src/fileC.js
import * as foo from "./fileA";
```

Examples of **correct** code for this rule:

```js
// "stratified-design/no-disallowed-imports": [
//   "error",
//   {
//     "imports": [
//       {
//         "import": { "member": ["foo", "default", "*"], "from": "src/fileA" },
//         "allow": ["src/**/fileB.js"],
//         "disallow": ["src/**/fileC.*"]
//       }
//     ]
//   }
// ]

// ./src/fileB.js
import { foo } from "./fileA";
```
