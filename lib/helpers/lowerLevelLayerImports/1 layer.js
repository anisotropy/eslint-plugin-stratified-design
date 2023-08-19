"use strict";

const { readFileSync } = require("fs");
const { resolvePath } = require("../common");
const { toStructure, replaceAlias } = require("./2 layer");

/**
 * @param {string} fileDir
 */
const createStructure = (fileDir) => {
  // TODO: 부모 폴더에서 .stratified.json을 가져와 하위 계층들에 대한 정보를 가져온다.
  /**
   * @type {import('./2 layer').RawStructure}
   */
  const rawStructure = (() => {
    try {
      return JSON.parse(
        readFileSync(resolvePath(fileDir, "./.stratified.json"), "utf-8")
      );
    } catch (err) {
      return [];
    }
  })();
  return toStructure(rawStructure, fileDir);
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

module.exports = { createStructure, createModulePath };
