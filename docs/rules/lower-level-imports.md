# Require that lower level modules be imported (lower-level-imports)

This rule requires that lower level modules be imported. Basically,

- functions in the same file in the same folder are considered to be at the same level,
- child folders are considered to be at a lower level than the parent folder, and
- installed modules (node modules) are considered to be at the lowest level.

However, you can alter this hierarchy using the structure option.

This rule works properly on POSIX systems, where the path segment separator is `/`. It will be modified to work well on Windows systems in the future.

Test files, `*.test.*`, are not restricted by this rule.

### Options

The syntax to specify the level structure looks like this:

```json
"lower-level-imports": ["error", {
  "structure":  {
    "/": ["layer1", "layer2", "layer3"],
    "/layer2": ["subLayer1", "subLayer2"],
  },
}]

```

In a folder array, the module or folder on the left is considered to be at a higher level than the one on the right.

To make a folder an interface layer, set `interface` as `true`:

```json
"lower-level-imports": ["error", {
  "structure":  {
    "/": ["layer1", { "name": "layer2", "interface": true }, "layer3"],
  },
}]

```

For 'interface layer', refer to "[Grokking Simplicity](https://grokkingsimplicity.com)".

To locate a node module in the structure, set `isNodeModule` as `true`:

```json
"lower-level-imports": ["error", {
  "structure":  { "/": ["layer1", { "name": "nodeModule", "isNodeModule": true }, "layer3"] },
}]

```

The default root directory is the current working directory. To change the root directory, use the option `root`:

```json
"lower-level-imports": ["error", {
  "structure":  { "/": ["layer1", "layer2", "layer3"] },
  "root": "./src"
}]
```

If a module name has an alias, register the alias using the option `aliases`:

```json
"lower-level-imports": ["error", {
  "structure":  { "/": ["layer1", "layer2", "layer3"] },
  "aliases": { "@": "./src" }
}]
```

## Rule Details

If a file structure is as follows:

```
src/
 ┣ layer1/
 ┣ layer2/
 ┃ ┣ module.js
 ┃ ┣ otherModule.js
 ┃ ┗ subLayer/
 ┗ layer3/
```

Examples of **incorrect** code for this rule:

```js
/* "lower-level-imports": ["error"] */
// ./src/layer1/module.js
import { func } from "../layer2/module";
```

```js
/* "lower-level-imports": ["error"] */
// ./src/layer2/module.js
import { func } from "./otherModule";
```

```js
/* "lower-level-imports": ["error", { "structure": { "/": ["layer1", "layer2"] } }] */
// ./src/layer2/module.js
import { func } from "../layer1/module";
```

```js
/* "lower-level-imports": [ "error", {
  "structure": { "/": ["layer1", { name: "layer2", interface: true }, "layer3"] }
}] */
// ./src/layer1/module.js
import { func } from "../layer3/module";
```

```js
/* "lower-level-imports": ["error", {
  "structure":  { "/": ["layer1", { "name": "nodeModule", "isNodeModule": true }, "layer3"] },
}] */
// ./src/layer3/module.js
import { func } from "nodeModule";
```

Examples of **correct** code for this rule:

```js
/* "lower-level-imports": ["error"] */
// ./src/layer2/module.js
import { func } from "./subLayer/module";
```

```js
/* "lower-level-imports": ["error", { "structure": { "/": ["layer1", "layer2"] } }] */
// ./src/layer1/module.js
import { func } from "../layer2/module";
```

```js
/* "lower-level-imports": ["error", {
  "structure": { "/": ["layer1", "layer2"] },
  "alias": { "@": "./" }
}] */
// ./src/layer1/module.js
import { func } from "@/layer2/module";
```
