"use strict";

const { createStructure, createModulePath } = require("./1 layer");
const { createAliases, findLevel } = require("./2 layer");

const { parseFileSource } = require("../lowerLevelImports");

module.exports = {
  createStructure,
  createModulePath,
  createAliases,
  parseFileSource,
  findLevel,
};
