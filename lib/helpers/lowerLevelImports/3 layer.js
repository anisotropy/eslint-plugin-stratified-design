const {
  toSegments,
  toPath,
  joinPath,
  resolvePath,
  toRelative,
} = require("./4 layer");

/**
 * @param {*} options
 * @param {string} rootDir
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
 * @param {*} options
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
 * @param {{[string]: {name: string; nodeModule: boolean; barrier: boolean; isNodeModule: boolean, interface: boolean}}} structure
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
 * Check if there is an interface between file layer and module layer
 * @param {{[string]: {name: string; nodeModule: boolean; barrier: boolean; isNodeModule: boolean, interface: boolean}}} structure
 * @param {number} fileLevel
 */
const hasInterface = (structure, fileLevel) => {
  /**
   * @param {number} moduleLevel
   */
  return (moduleLevel) => {
    const layerInterface = structure
      .slice(fileLevel + 1, moduleLevel)
      .find((layer) => layer.barrier || layer.interface);
    return Boolean(layerInterface);
  };
};

module.exports = {
  isNodeModule,
  findLevel,
  hasInterface,
  createStructure,
  createAliases,
  removeAlias,
};
