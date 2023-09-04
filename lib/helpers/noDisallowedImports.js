"use strict";

const { replaceAlias, resolvePath, parsePath } = require("./common");

/**
 * @param {string} contextFileSource
 */
const parseFileSource = (contextFileSource) => {
  const fileSource = resolvePath(contextFileSource);
  const parsedFileSource = parsePath(fileSource);
  const fileDir = resolvePath(parsedFileSource.dir);
  return { fileDir, fileSource };
};

/**
 * @param {string} cwd
 * @param {string} fileDir
 * @param {import("./common").Aliases} aliases
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
    const modulePath = isNodeModule
      ? moduleSource
      : resolvePath(fileDir, moduleSource);
    return modulePath;
  };
};

module.exports = { parseFileSource, createModulePath };
