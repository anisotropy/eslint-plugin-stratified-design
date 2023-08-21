"use strict";

const {
  resolvePath,
  joinPath,
  toSegments,
  readArray,
  findLastIndex,
  toPath,
} = require("../common");
const {
  toStructure,
  replaceAlias,
  readRawStructure,
  findLevel,
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
 * @param {string} fileDir
 */
const findLevelInChild = (structure) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => {
    const segments = toSegments(modulePath);

    const [childFileDir, level] = segments.reduce(
      ([childFileDir, level], _, index) => {
        if (childFileDir && level !== null) return [childFileDir, level];
        const path = toPath(segments.slice(0, segments.length - index));
        let secondaryIndex = -1;
        const primaryIndex = structure.findIndex((layers) => {
          secondaryIndex = layers.findIndex((layer) => layer.name === path);
          return secondaryIndex >= 0;
        });
        if (primaryIndex >= 0) {
          const childFileDir = structure[primaryIndex][secondaryIndex].name;
          const level = primaryIndex;
          return [childFileDir, level];
        }
        return [childFileDir, level];
      },
      ["", null]
    );
    if (!childFileDir || level === null) return null;

    const rawChildStructure = readRawStructure(childFileDir);
    const childStructure = toStructure(rawChildStructure, childFileDir);
    const childLevel = findLevel(childStructure)(modulePath);
    return childLevel !== null ? level : null;
  };
};

module.exports = { createStructure, createModulePath, findLevelInChild };
