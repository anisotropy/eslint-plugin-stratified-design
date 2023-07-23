# Require that lower-level modules be imported (lower-level-imports)

This rule enforces the requirement for importing lower-level modules. Here's an explanation:

- Functions in the same file within the same folder are considered to be at the same level.
- Child folders are considered to be at a lower level than the parent folder.
- Installed modules (node modules) are considered to be at the lowest level.

However, you can modify this hierarchy using the `structure` option.

This rule works correctly on POSIX systems, where the path segment separator is `/`. It will be updated to work well on Windows systems in the future.

### Options

The syntax to specify the level structure is as follows:

```json
"lower-level-imports": ["error", {
  "structure": ["layer1", "layer2", "layer3"]
}]
```

In the folder array, the file or folder on the left is considered to be at a higher level than the one on the right.

To designate a layer as an abstract barrier, set `barrier` to `true`:

```json
"lower-level-imports": ["error", {
  "structure": ["layer1", { "name": "layer2", "barrier": true }, "layer3"],
}]
```

For the 'abstract barrier,' refer to "[Grokking Simplicity](https://grokkingsimplicity.com)."

To locate a node module in the structure, set `nodeModule` to `true`:

```json
"lower-level-imports": ["error", {
  "structure": ["layer1", { "name": "nodeModule", "nodeModule": true }, "layer3"],
}]
```

The default root directory is the current working directory. To change the root directory, use the `root` option:

```json
"lower-level-imports": ["error", {
  "structure": ["layer1", "layer2", "layer3"],
  "root": "./src"
}]
```

If the name of an imported module has an alias, register the alias using the `aliases` option:

```json
"lower-level-imports": ["error", {
  "structure": ["layer1", "layer2", "layer3"],
  "aliases": { "@": "./src" }
}]
```

If you want to register the level of a layer by 'number,' set the option `useLevelNumber` to `true`:

```json
"lower-level-imports": ["error", { "useLevelNumber": true }]
```

The options `structure` and `useLevelNumber` can be used together.

You can register the files to apply the rule (`lower-level-imports`) using the `include` and `exclude` options:

```json
"lower-level-imports": ["error", { "include": ["**/*.js"], "exclude": ["**/*.test.js"] }]
```

The default is as follows:

```json
{
  "include": ["**/*.{js,ts,jsx,tsx}"],
  "exclude": ["**/*.{spec,test}.{js,ts,jsx,tsx}"]
}
```

## Rule Details

If a file structure is as follows:

```
src/
 ┣ layer1.js
 ┣ layer2/
 ┃ ┣ file.js
 ┃ ┣ otherFile.js
 ┃ ┗ subFolder/
 ┗ layer3/
   ┣ entry.js
   ┣ 1 layer.js
   ┗ 2 layer.js
```

Examples of **incorrect** code for this rule:

```js
/* "lower-level-imports": ["error"] */
// ./src/layer1.js
import { func } from "../layer2/file";
```

```js
/* "lower-level-imports": ["error"] */
// ./src/layer2/file.js
import { func } from "./otherFile";
```

```js
/* "lower-level-imports": ["error", { "structure": ["layer1", "layer2"] }] */
// ./src/layer2/file.js
import { func } from "../layer1";
```

```js
/* "lower-level-imports": ["error", {
  "structure": ["layer1", { name: "layer2", barrier: true }, "layer3"]
}] */
// ./src/layer1.js
import { func } from "../layer3/entry";
```

```js
/* "lower-level-imports": ["error", {
  "structure":  ["layer1", { "name": "nodeModule", "nodeModule": true }, "layer3"],
}] */
// ./src/layer3/entry.js
import { func } from "nodeModule";
```

```js
/* "lower-level-imports": ["error", { "useLevelNumber": true }}] */
// ./src/layer1.js
import { func } from "layer3/1 layer";
```

Examples of **correct** code for this rule:

```js
/* "lower-level-imports": ["error"] */
// ./src/layer2/file.js
import { func } from "./subFolder/file";
```

```js
/* "lower-level-imports": ["error", { "structure": ["layer1", "layer2"] }] */
// ./src/layer1.js
import { func } from "../layer2/file";
```

```js
/* "lower-level-imports": ["error", {
  "structure": ["layer1", "layer2"],
  "alias": { "@/": "./src/" }
}] */
// ./src/layer1.js
import { func } from "@/layer2/file";
```

```js
/* "lower-level-imports": ["error", { "useLevelNumber": true }] */
// ./src/layer3/1 layer.js
import { func } from "./2 layer";
```

```js
/* "lower-level-imports": ["error", { "useLevelNumber": true }] */
// ./src/layer3/entry.js
import { func } from "./1 layer";
```

```js
/* "lower-level-imports": ["error", { "structure": ["layer1", "layer3"], "useLevelNumber": true }] */
// ./src/layer.js
import { func } from "../layer3/entry";
```
