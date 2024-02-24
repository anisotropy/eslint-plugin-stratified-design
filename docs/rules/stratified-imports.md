# Require that lower-level modules be imported (stratified-imports)

(Note: This rule works correctly on POSIX systems, where the path segment separator is `/`. It will be updated to work well on Windows systems in the future.)

This rule enforces the requirement for importing lower-level modules. The hierarchy should be set by `.stratified.json` in **each folder** as follows:

```json
[
  ["layerA"],
  [{ "name": "layerB", "barrier": true }],
  [{ "name": "nodeModuleC", "nodeModule": true }],
  ["layerD", "layerE"]
  [{ "name": "layerF", "language": true }]
]
```

And consider that the folder structure is as follows:

```
 ┣ layerA
 ┣ layerB
 ┣ layerD
 ┣ layerE
 ┃ ┣ index.js
 ┃ ┣ entry
 ┃ ┣ layerEA
 ┃ ┗ .stratified.json
 ┣ layerF
 ┗ .stratified.json
```

The above JSON file indicates the following:

- The `layerA` file/folder at the highest level.
- The `layerB` file/folder is a lower-level layer than `layerA` and serves as an abstract barrier. (For the concept of 'abstract barrier,' refer to '[Grokking Simplicity](https://grokkingsimplicity.com).')
- `nodeModuleC` is an **installed module** (node module) and is at a lower level than `layerB`. (Unregistered node modules are considered to be the lowest layers.)
- The `layerD` file/folder and the `layerE` file/folder are at the same level and represent the lowest level layers.
- The `layerF` file/folder is a language layer and 'pass' any abstract barrier.

Consider that the `.stratified.json` in the `layerE` folder is as follows:

```json
[["index", "entry"], ["layerEA"]]
```

Higher-level layers than `layerE` can import `./layerE` and `./layer/entry` as follows:

```js
import { func } from "./layerE";
import { func } from "./layerE/entry";
```

However, `./layer/layerEA` should not be imported.

## Options

If an imported module has an alias, register the alias using the `aliases` option:

```json
{
  "stratified-design/stratified-imports": [
    "error",
    {
      "aliases": { "@/": "./src/" }
    }
  ]
}
```

You can register the files to which the rule (`stratified-imports`) should apply using the `include` and `exclude` options:

```json
{
  "stratified-design/stratified-imports": [
    "error",
    { "include": ["**/*.js"], "exclude": ["**/*.test.js"] }
  ]
}
```

The default configuration is as follows:

```json
{
  "include": ["**/*.{js,ts,jsx,tsx}"],
  "exclude": ["**/*.{spec,test}.{js,ts,jsx,tsx}"]
}
```

Imported modules can be excluded from the rule (`stratified-imports`) using the `excludeImports` option:

```json
{
  "stratified-design/stratified-imports": [
    "error",
    { "excludeImports": ["**/*.css"] }
  ]
}
```

## Rule Details

Consider the following folder structure:

```
src/
 ┣ layerA.js
 ┣ layerB.js
 ┣ layerD.js
 ┣ layerE/
 ┃ ┣ index.js
 ┃ ┣ entry
 ┃ ┣ layerEA.js
 ┃ ┗ .stratified.json
 ┣ layerF
 ┗ .stratified.json
```

and the `.stratified.json` in `src/` is as follows:

```json
[
  ["layerA"],
  [{ "name": "layerB", "barrier": true }],
  [{ "name": "nodeModuleC", "nodeModule": true }],
  ["layerD", "layerE"],
  [{ "name": "layerF", "language": true }]
]
```

and the `.stratified.json` in `layerE/` is as follows:

```json
[["index", "entry"], ["layerEA"]]
```

Examples of **incorrect** code for this rule:

```js
// ./layerB.js
import { func } from "./layerA";
```

```js
// ./layerA.js
import { func } from "./layerD";
```

```js
// ./layerD.js
import { func } from "nodeModuleC";
```

```js
// ./layerD.js
import { func } from "layerE";
```

```js
// ./layerB.js
import { func } from "layerE/layerEA";
```

Examples of **correct** code for this rule:

```js
// ./layerA.js
import { func } from "./layerB";
```

```js
// ./layerB.js
import { func } from "nodeModuleC";
```

```js
// ./layerD.js
import { func } from "some-node-module";
```

```js
// ./layerB.js
import { func } from "./layerD";
```

```js
// ./layerB.js
import { func } from "./layerE";
```

```js
// ./layerB.js
import { func } from "./layerE/entry";
```

```js
// ./layerA.js
import { func } from "./layerF";
```
