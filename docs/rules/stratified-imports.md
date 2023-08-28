# Require that lower-level modules be imported (stratified-imports)

(This rule works correctly on POSIX systems, where the path segment separator is `/`. It will be updated to work well on Windows systems in the future.)

This rule enforces the requirement for importing lower level modules. The hierarchy should be set by `.stratified.json` in **each folder** as follows:

```json
[
  ["layerA"],
  [{ "name": "layerB", "barrier": true }],
  [{ "name": "nodeModuleC", "nodeModule": true }],
  ["layerD", "layerE"]
]
```

and consider that the folder structure is as follows:

```
 ┣ layerA
 ┣ layerB
 ┣ layerD
 ┣ layerE
 ┃ ┣ index.js
 ┃ ┣ entry
 ┃ ┣ layerEA
 ┃ ┗ .stratified.json
 ┗ .stratified.json
```

The above json file tells us:

- `layerA` file/folder is the highest level layer.
- `layerB` file/folder is a lower-level layer then `layerA` and a abstract barrier. (For the 'abstract barrier,' refer to '[Grokking Simplicity](https://grokkingsimplicity.com).')
- `nodeModuleC` is a **installed module**(node module) and a lower level layer then `layerB`. (Not registered node modules are regard to be the lowest layers.)
- `layerD` file/folder and `layerE` file/folder are same level layers and the lowest level layer.

Consider that the `.stratified.json` in `layerE` folder is as follows:

```json
[["index", "entry"], ["layerEA"]]
```

Higher level layers than `layerE` can import `./layerE` and `./layer/entry` as follows:

```js
import { func } from "./layerE";
import { func } from "./layerE/entry";
```

However, `./layer/layerEA` should not be imported.

### Options

If the name of an imported module has an alias, register the alias using the `aliases` option:

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

You can register the files to apply the rule (`stratified-imports`) using the `include` and `exclude` options:

```json
{
  "stratified-design/lower-level-imports": [
    "error",
    { "include": ["**/*.js"], "exclude": ["**/*.test.js"] }
  ]
}
```

The default is as follows:

```json
{
  "include": ["**/*.{js,ts,jsx,tsx}"],
  "exclude": ["**/*.{spec,test}.{js,ts,jsx,tsx}"]
}
```

## Rule Details

Consider a folder structure is as follows:

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
 ┗ .stratified.json
```

and the `.stratified.json` in `src/` is as follows:

```json
[
  ["layerA"],
  [{ "name": "layerB", "barrier": true }],
  [{ "name": "nodeModuleC", "nodeModule": true }],
  ["layerD", "layerE"]
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
