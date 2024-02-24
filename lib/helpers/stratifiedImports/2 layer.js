"use strict";

const { readFileSync } = require("fs");
const {
  resolvePath,
  toRelative,
  joinPath,
  reducedPaths,
  toSegments,
} = require("../common");

/**
 * @typedef {{
 *  name: string;
 *  barrier?: boolean;
 *  nodeModule?: boolean;
 *  language?: boolean;
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

// @level 3
/**
 * @param {Structure} structure
 * @returns
 */
const isLanguage = (structure) => {
  /**
   * @param {string} path
   */
  return (path) => {
    return Boolean(
      structure.find((layers) =>
        layers.find((layer) => layer.name === path && layer.language === true)
      )
    );
  };
};

// @level 2
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
 */
const validateRawStructure = (rawStructure) => {
  if (rawStructure.length === 0) return false;
  if (!Array.isArray(rawStructure)) return false;

  const isRawLayerValid = (rawLayer) => {
    if (Array.isArray(rawLayer)) return false;
    if (typeof rawLayer === "function") return false;
    if (rawLayer === null || rawLayer === undefined) return false;
    if (typeof rawLayer === "string") return true;

    for (const [key, value] of Object.entries(rawLayer)) {
      if (key === "name") {
        if (typeof value !== "string") return false;
      } else if (key === "nodeModule") {
        if (typeof value !== "boolean") return false;
      } else if (key === "barrier") {
        if (typeof value !== "boolean") return false;
      } else if (key === "language") {
        if (typeof value !== "boolean") return false;
      } else {
        return false;
      }
    }
    if ("name" in rawLayer) return true;
    return false;
  };

  for (const rawLayers of rawStructure) {
    if (!Array.isArray(rawLayers)) return false;
    for (const rawLayer of rawLayers) {
      if (!isRawLayerValid(rawLayer)) return false;
      const layerName = typeof rawLayer === "string" ? rawLayer : rawLayer.name;
      if (toSegments(layerName).length > 1) return false;
    }
  }
  return true;
};

// @level 2
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

// @level 2
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

// @level 2
/**
 * @param {import('./2 layer').Structure} structure
 */
const findLayerWithReducedPath = (structure) => {
  /**
   * @param {string} path
   * @return {Layer | null}
   */
  return (path) => {
    return (
      reducedPaths(path).reduce((theLayer, similarPath) => {
        if (theLayer) return theLayer;
        return structure.reduce((foundLayer, layers) => {
          if (foundLayer) return foundLayer;
          return layers.find((layer) => layer.name === similarPath);
        }, undefined);
      }, undefined) || null
    );
  };
};

// @level 2
/**
 * @param {import('./2 layer').Structure} structure
 * @param {number} fileLevel
 */
const hasBarrier = (structure, fileLevel) => {
  /**
   * @param {string} modulePath
   * @param {number} moduleLevel
   */
  return (modulePath, moduleLevel) => {
    if (isLanguage(structure)(modulePath)) return false;
    const layerBarrier = structure
      .slice(fileLevel + 1, moduleLevel)
      .find((layers) => layers.find((layer) => layer.barrier));
    return Boolean(layerBarrier);
  };
};

// @level 2
/**
 * @param {string} cwd
 */
const isNotRegisteredNodeModule = (cwd) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => modulePath.startsWith(cwd) === false;
};

// @level 2
/**
 * @param {string} fileDir
 */
const isInParent = (fileDir) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) =>
    toSegments(toRelative(fileDir, modulePath))[0] === "..";
};

// @level 2
/**
 * @param {string} fileDir
 */
const isInChildren = (fileDir) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => toSegments(toRelative(fileDir, modulePath))[0] === ".";
};

// @level 1
/**
 * @param {string} dir
 */
const readStructure = (dir) => {
  return toStructure(readRawStructure(dir), dir);
};

module.exports = {
  readRawStructure,
  toStructure,
  findLevel,
  findLayerWithReducedPath,
  isNotRegisteredNodeModule,
  readStructure,
  hasBarrier,
  isInParent,
  isInChildren,
  validateRawStructure,
};
