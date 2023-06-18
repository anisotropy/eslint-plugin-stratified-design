const {
  createRootDir,
  reportHasProperLevel: reportHasProperLayerLevel,
  reportInSubDirOfFileDir: reportInSubDirOf,
  FINISHED,
  reportHasProperLevelNumber: reportHasProperLayerLevelNumber,
  parseFileSource,
  createModulePath: createModulePathFromSource,
} = require("./1 layer");
const { findLevel, createStructure, createAliases } = require("./3 layer");

module.exports = {
  FINISHED,
  createRootDir,
  parseFileSource,
  reportHasProperLayerLevel,
  reportInSubDirOf,
  reportHasProperLayerLevelNumber,
  createModulePathFromSource,
  findLevel,
  createStructure,
  createAliases,
};
