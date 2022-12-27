module.exports = {
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@anisotropy/stratified-design"],
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "@anisotropy/stratified-design/lower-level-imports": [
      "error",
      {
        structure: {
          "/": ["layer1", "layer2", "layer3"],
        },
        root: "./src",
      },
    ],
  },
};
