"use strict";

const { readFileSync } = require("fs");
const {
  resolvePath,
  toRelative,
  joinPath,
  toSegments,
  toPath,
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
 * @param {string} fileDir
 * @returns {RawStructure}
 */
const readRawStructure = (fileDir) => {
  try {
    return JSON.parse(
      readFileSync(resolvePath(fileDir, "./.stratified.json"), "utf-8")
    );
  } catch (err) {
    return [];
  }
};

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
    const level = structure.findIndex((layers) =>
      Boolean(layers.find((layer) => layer.name === path))
    );
    return level >= 0 ? level : null;
  };
};

/**
 * @param {import('./2 layer').Structure} structure
 */
const findLayerWithSimilarPath = (structure) => {
  /**
   * @param {string} path
   * @return {Layer | null}
   */
  return (path) => {
    return (
      toSegments(path).reduce((theLayer, _, index, segments) => {
        if (theLayer) return theLayer;
        const similarPath = toPath(segments.slice(0, segments.length - index));
        /**
         * @type {Layer}
         */
        return structure.reduce((foundLayer, layers) => {
          if (foundLayer) return foundLayer;
          return layers.find((layer) => layer.name === similarPath);
        }, undefined);
      }, undefined) || null
    );
  };
};

/**
 * @param {string} cwd
 */
const isNotRegisteredNodeModule = (cwd) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => modulePath.startsWith(cwd) === false;
};

module.exports = {
  readRawStructure,
  toStructure,
  createAliases,
  replaceAlias,
  findLevel,
  findLayerWithSimilarPath,
  isNotRegisteredNodeModule,
};
