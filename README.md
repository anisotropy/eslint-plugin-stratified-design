# eslint-plugin-stratified-design

ESlint rules for stratified design. It is inspired by "[Grokking Simplicity](https://grokkingsimplicity.com)" written by Erick Normand and for practicing stratified design.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `@anisotropy/eslint-plugin-stratified-design`:

```sh
npm install @anisotropy/eslint-plugin-stratified-design --save-dev
```

## Usage

Add `@anisotropy/stratified-design` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-`:

```json
{
  "plugins": ["@anisotropy/stratified-design"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@anisotropy/stratified-design/rule-name": ["error"]
  }
}
```

## Supported Rules

- [lower-level-imports](https://github.com/anisotropy/eslint-plugin-stratified-design/blob/main/docs/rules/lower-level-imports.md): Require that lower level modules be imported
