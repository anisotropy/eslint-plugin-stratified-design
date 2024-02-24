const {
  toSegments,
  toPath,
  joinPath,
  resolvePath,
  toRelative,
} = require("../common");

/**
 * @typedef {{
 *  structure: Array<
 *    string | { name: string, barrier?: boolean, interface?: boolean, nodeModule?: boolean, isNodeModule?: boolean }
 *  >,
 *  root: string,
 *  aliases: Record<string, string>,
 *  exclude: string[],
 *  include: string[],
 *  useLevelNumber: boolean
 *  isIndexHighest: boolean
 * }} Options
 */

/**
 * @typedef {{
 *  name: string;
 *  barrier?: boolean | undefined;
 *  language?: boolean | undefined;
 *  interface?: boolean | undefined;
 *  nodeModule?: boolean | undefined;
 *  isNodeModule?: boolean | undefined;
 * }[]} Structure
 */

/**
 * @param {Options} options
 * @param {string} rootDir
 * @returns {Structure}
 */
const createStructure = (options, rootDir) => {
  return options.structure.map((layer) => {
    const theLayer = typeof layer === "string" ? { name: layer } : layer;
    return theLayer.nodeModule || theLayer.isNodeModule
      ? theLayer
      : { ...theLayer, name: joinPath(rootDir, theLayer.name) };
  });
};

/**
 * @param {Options} options
 */
const createAliases = (options) => {
  return Object.keys(options.aliases)
    .sort((a, b) => b.length - a.length)
    .map((alias) => ({ alias, path: options.aliases[alias] }));
};

/**
 * Replace an alias into the corresponding path
 * @param {string} cwd
 * @param {string} fileDir
 * @param {{alias: string, path: string}[]} aliases
 */
const removeAlias = (cwd, fileDir, aliases) => {
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
 * Check if a module is node module
 * @param {string} rootDir
 * @returns `true` if `modulePath` is node module path
 */
const isNodeModule = (rootDir) => {
  /**
   * @param {string} modulePath
   */
  return (modulePath) => {
    return modulePath.startsWith(rootDir) === false;
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
      return structure.findIndex((layer) => layer.name === path);
    }, -1);
    return level >= 0 ? level : null;
  };
};

/**
 * Check if a layer is language layer
 * @param {Structure} structure
 */
const isLanguage = (structure) => {
  /**
   * @param {string} path
   */
  return (path) => {
    return Boolean(
      structure.find((layer) => layer.name === path && layer.language === true)
    );
  };
};

/**
 * Check if there is an barrier between file layer and module layer
 * @param {Structure} structure
 * @param {number} fileLevel
 */
const hasBarrier = (structure, fileLevel) => {
  /**
   * @param {number} moduleLevel
   */
  return (modulePath, moduleLevel) => {
    if (isLanguage(structure)(modulePath)) return false;
    const layerBarrier = structure
      .slice(fileLevel + 1, moduleLevel)
      .find((layer) => layer.barrier || layer.interface);
    return Boolean(layerBarrier);
  };
};

module.exports = {
  isNodeModule,
  findLevel,
  hasBarrier,
  createStructure,
  createAliases,
  removeAlias,
};
