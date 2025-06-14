# Disallow calling functions in the same file (no-same-level-funcs)

This rule prohibits calling functions at the same level in the same file.

### Options

You can register the files to apply the rule (`no-same-level-funcs`) using the `include` and `exclude` options:

```json
{
  "stratified-design/no-same-level-funcs": [
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

Examples of **incorrect** code for this rule:

```js
function func1(...) { ... }

const func2(...) => { ... }

function func3(...) {
  func1(...);
  func2(...);
}

const func4 = (...) => {
  func1(...);
  func2(...);
}
```

```js
const func1 = (...) => { ...}

const func2(func1) => { ... }
```

```js
const hof = (...) => { ... }

const funcByHof = hof((...) => {...})
```

```js
const ComponentA = (...) => { ... }

const ComponentB = (...) => {
  ...
  return (
    ...
    <ComponentA>{...}</ComponentA>
    ...
  )
}
```

```js
// @level 1
const funcA = (...) => { ... }

// @level 1
function funcB(...) { ... }

// @level 2
const funcC = (...) => {
  ...
  funcA(...)
  funcB(...)
  ...
}
```

```js
const func = () => "a";
const obj = { a: func() };
```

Examples of **correct** code for this rule:

```js
function func1(...) { ... }

const func2(...) => { ... }
```

```js
function func1(...) {
  const func2(...) => { ... };
  ...
  func2(...);
}
```

```js
// @level 2
const funcA = (...) => { ... }

// @level 2
function funcB(...) { ... }

// @level 1
const funcC = (...) => {
  ...
  funcA(...)
  funcB(...)
  ...
}
```

```js
const func = () => "a";
// @data
const obj = { a: func() };
```

```js
import { lib } from "module";
//@import
const { fn2 } = lib;
const fn1 = () => fn2();
```
