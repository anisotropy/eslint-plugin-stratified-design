# Disallow calling functions in the same file. (no-same-level-funcs)

This rule disallows calling functions in the same file.

## Rule Details

Examples of **incorrect** code for this rule:

```js
function func1(...) {
  ...
}

const func2(...) => { ... }

function func3(...) {
  func1(...)
  func2(...)
}
```

Examples of **correct** code for this rule:

```js
function func1(...) {
  const func2(...) => { ... }
  ...
  func2(...)
}
```
