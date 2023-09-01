"use strict";

const { resolvePath, reducedPaths } = require("../common");
const {
  toStructure,
  replaceAlias,
  readRawStructure,
  findLevel,
  findLayerWithReducedPath,
  readStructure,
  hasBarrier,
  isNotRegisteredNodeModule,
} = require("./2 layer");

const SUCCESS = "success";
const FAIL = "fail";
const BARRIER = "barrier";

/**
 * @typedef {number | null | SUCCESS | FAIL | BARRIER} Level
 */

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
 * @param {number} fileLevel
 */
const findLevelInCurrent = (structure, fileLevel) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => {
    const level = findLevel(structure)(modulePath);
    if (level === null) return null;
    return hasBarrier(structure, fileLevel)(level) ? BARRIER : level;
  };
};

/**
 * @param {import('./2 layer').Structure} structure
 */
const findLevelInChild = (structure) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => {
    const layer = findLayerWithReducedPath(structure)(modulePath);
    if (!layer) return null;
    const fileDir = layer.name;
    const rawChildStructure = readRawStructure(fileDir);
    const childStructure = toStructure(rawChildStructure, fileDir);
    const childLevel = findLevel(childStructure)(modulePath);
    return childLevel !== null ? findLevel(structure)(fileDir) : null;
  };
};

/**
 * @param {string} cwd
 * @param {string} fileDir
 * @param {number} fileLevel
 */
const findLevelInParent = (cwd, fileDir, fileLevel) => {
  const originalFileDir = fileDir;
  const originalFileLevel = fileLevel;
  /**
   * @param {string} modulePath
   */
  return (modulePath) => {
    const parentDir = resolvePath(originalFileDir, "..");
    const parentDirs = reducedPaths(parentDir);
    /**
     * @param {[Level, string]} param
     * @param {string} dir
     */
    const searchLevel = ([level, filePath], dir) => {
      /**
       * @param {Level} lv
       * @return {[lv: Level, dir: string]}
       */
      const result = (lv) => [lv, dir];

      if (level !== null) {
        return result(level);
      }

      const structure = readStructure(dir);
      if (structure.length === 0) {
        return result(FAIL);
      }

      const fileLevel = findLevel(structure)(filePath);
      const moduleLevel = findLevel(structure)(modulePath);

      if (hasBarrier(structure, fileLevel)(moduleLevel)) {
        return result(BARRIER);
      } else if (fileLevel === null) {
        return result(FAIL);
      } else if (moduleLevel === null) {
        return result(null);
      } else {
        return result(originalFileLevel + moduleLevel - fileLevel);
      }
    };

    const [level] = parentDirs.reduce(searchLevel, [null, originalFileDir]);

    if (
      (level === null || level == FAIL) &&
      isNotRegisteredNodeModule(cwd)(modulePath)
    ) {
      return SUCCESS;
    }
    return level === FAIL ? null : level;
  };
};

module.exports = {
  createModulePath,
  findLevelInCurrent,
  findLevelInChild,
  findLevelInParent,
  FAIL,
  SUCCESS,
  BARRIER,
};
