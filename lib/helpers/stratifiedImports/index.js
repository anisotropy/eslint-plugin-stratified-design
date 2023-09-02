"use strict";

const {
  createModulePath,
  findLevelInCurrent,
  findLevelInChild,
  findLevelInParent,
  FAIL,
  SUCCESS,
  BARRIER,
} = require("./1 layer");
const {
  readStructure,
  toStructure,
  createAliases,
  findLevel,
  isNotRegisteredNodeModule,
  isInParent,
  validateRawStructure,
  readRawStructure,
} = require("./2 layer");

const { parseFileSource } = require("../lowerLevelImports");

module.exports = {
  readRawStructure,
  toStructure,
  readStructure,
  createModulePath,
  createAliases,
  parseFileSource,
  findLevel,
  isNotRegisteredNodeModule,
  findLevelInCurrent,
  findLevelInChild,
  findLevelInParent,
  isInParent,
  validateRawStructure,
  FAIL,
  SUCCESS,
  BARRIER,
};
