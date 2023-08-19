"use strict";

const {
  resolvePath,
  toRelative,
  toSegments,
  toPath,
  joinPath,
} = require("../common");

/**
 * @typedef {{
 *  name: string;
 *  barrier?: boolean;
 *  nodeModule?: boolean;
 * }} Layer
 */

/**
 * @typedef {string|Layer} RawLayer
 */

/**
 * @typedef {Layer[][]} Structure
 */

/**
 * @typedef {RawLayer[][]} RawStructure
 */

/**
 * @typedef {{alias: string, path: string}[]} Aliases
 */

/**
 * @param {RawStructure} rawStructure
 * @param {string} fileDir
 * @return {Structure}
 */
const toStructure = (rawStructure, fileDir) => {
  return rawStructure.map((rawLayers) => {
    return rawLayers.map((rawLayer) => {
      const layer =
        typeof rawLayer === "string" ? { name: rawLayer } : rawLayer;
      return layer.nodeModule
        ? layer
        : { ...layer, name: joinPath(fileDir, layer.name) };
    });
  });
};

/**
 * @param {Record<string, string>} rawAliases
 * @returns {Aliases}
 */
const createAliases = (rawAliases) => {
  return Object.keys(rawAliases)
    .sort((a, b) => b.length - a.length)
    .map((alias) => ({ alias, path: rawAliases[alias] }));
};

/**
 * Replace an alias into the corresponding path
 * @param {string} cwd
 * @param {string} fileDir
 * @param {Aliases} aliases
 */
const replaceAlias = (cwd, fileDir, aliases) => {
  /**
   * @param {string} moduleSource
   */
  return (moduleSource) => {
    const { alias, path } =
      aliases.find(({ alias }) => moduleSource.startsWith(alias)) || {};
    if (!alias) return moduleSource;
    const modulePath = resolvePath(cwd, moduleSource.replace(alias, path));
    return toRelative(fileDir, modulePath);
  };
};

/**
 * Find the layer level for a module
 * @param {Structure} structure
 * @returns the level of the module with `path`
 */
const findLevel = (structure) => {
  /**
   * @param {string} path
   */
  return (path) => {
    const segments = toSegments(path);
    const level = segments.reduce((level, _, index) => {
      if (level >= 0) return level;
      const path = toPath(segments.slice(0, segments.length - index));
      return structure.findIndex((layers) =>
        Boolean(layers.find((layer) => layer.name === path))
      );
    }, -1);
    return level >= 0 ? level : null;
  };
};

module.exports = { toStructure, createAliases, replaceAlias, findLevel };
