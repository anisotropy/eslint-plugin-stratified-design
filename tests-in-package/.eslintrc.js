module.exports = {
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["stratified-design"],
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "stratified-design/lower-level-imports": [
      "error",
      {
        structure: ["layer1", "layer2", "layer3"],
        root: "./src",
        useLevelNumber: true,
      },
    ],
  },
};
