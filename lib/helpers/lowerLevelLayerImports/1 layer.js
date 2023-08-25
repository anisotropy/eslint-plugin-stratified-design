"use strict";

const {
  resolvePath,
  joinPath,
  toSegments,
  readArray,
  findLastIndex,
} = require("../common");
const {
  toStructure,
  replaceAlias,
  readRawStructure,
  findLevel,
  findLayerWithSimilarPath,
} = require("./2 layer");

/**
 * @param {string} fileDir
 */
const createStructure = (fileDir) => {
  const parentFileDir = joinPath(fileDir, "..");

  const rawStructure = readRawStructure(fileDir);
  const parentRawStructure = readRawStructure(parentFileDir);

  const fileDirname = `${readArray(toSegments(fileDir), -1)}/`;
  const theIndex = findLastIndex(parentRawStructure, (rawLayers) => {
    return Boolean(
      rawLayers.find((rawLayer) => {
        if (typeof rawLayer === "string")
          return `${rawLayer}/`.startsWith(fileDirname);
        return `${rawLayer.name}/`.startsWith(fileDirname);
      })
    );
  });

  const structure = toStructure(rawStructure, fileDir);
  const parentStructure = toStructure(parentRawStructure, parentFileDir);

  for (let i = theIndex + 1; i <= parentRawStructure.length - 1; i++) {
    structure.push(parentStructure[i]);
  }

  return structure;
};

/**
 * @param {string} cwd
 * @param {string} fileDir
 * @param {import('./2 layer').Aliases} aliases
 */
const createModulePath = (cwd, fileDir, aliases) => {
  /**
   * @param {string} moduleSourceWithAlias
   */
  return (moduleSourceWithAlias) => {
    const moduleSource = replaceAlias(
      cwd,
      fileDir,
      aliases
    )(moduleSourceWithAlias);
    const isNodeModule = moduleSource.startsWith(".") === false;
    return isNodeModule ? moduleSource : resolvePath(fileDir, moduleSource);
  };
};

/**
 * @param {import('./2 layer').Structure} structure
 */
const findLevelInChild = (structure) => {
  /**
   * @param {string} path
   */
  return (path) => {
    const layer = findLayerWithSimilarPath(structure)(path);
    if (!layer) return null;
    const fileDir = layer.name;
    const rawChildStructure = readRawStructure(fileDir);
    const childStructure = toStructure(rawChildStructure, fileDir);
    const childLevel = findLevel(childStructure)(path);
    return childLevel !== null ? findLevel(structure)(fileDir) : null;
  };
};

module.exports = { createStructure, createModulePath, findLevelInChild };
