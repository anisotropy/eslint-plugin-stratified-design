# eslint-plugin-stratified-design

ESLint rules for stratified design, inspired by "[Grokking Simplicity](https://grokkingsimplicity.com)" written by Erick Normand, for practicing stratified design.

## Installation

First, ensure you have [ESLint](https://eslint.org/) installed:

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-stratified-design`:

```sh
npm install eslint-plugin-stratified-design --save-dev
```

## Usage

Add `stratified-design` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["stratified-design"]
}
```

Then configure the rules you wish to use under the rules section:

```json
{
  "rules": {
    "stratified-design/[rule-name]": ["error"]
  }
}
```


## Supported Rules

- [lower-level-imports](https://github.com/anisotropy/eslint-plugin-stratified-design/blob/main/docs/rules/lower-level-imports.md): Requires lower-level modules to be imported.
- [stratified-imports](https://github.com/anisotropy/eslint-plugin-stratified-design/blob/main/docs/rules/stratified-imports.md): Requires lower-level modules to be imported. The stratified structure is set by `.stratified.json`.
- [no-same-level-funcs](https://github.com/anisotropy/eslint-plugin-stratified-design/blob/main/docs/rules/no-same-level-funcs.md): Disallows calling functions in the same file.
- [no-disallowed-imports](https://github.com/anisotropy/eslint-plugin-stratified-design/blob/main/docs/rules/no-disallowed-imports.md): Allow or disallow importing specified modules
