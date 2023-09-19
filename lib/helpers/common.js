const p = require("path");

/**
 * @typedef {{alias: string, path: string}[]} Aliases
 */

// @level 2
/**
 * @param {string} from
 * @param {string} to
 * @returns the relative path from `from` to `to`
 */
const toRelative = (from, to) => {
  const rel = p.relative(from, to);
  return `${to}/`.startsWith(`${from}/`) ? `./${rel}` : rel;
};

// @level 2
/**
 * @param {string} path
 * @returns path to segments
 */
const toSegments = (path) => path.split("/");

// @level 2
/**
 * @param {string[]} segments
 * @returns segments to path
 */
const toPath = (segments) => segments.join("/");

// @level 2
const joinPath = p.join;

// @level 2
const resolvePath = p.resolve;

// @level 2
const parsePath = p.parse;

// @level 2
/**
 * @template T
 * @param {T[]} array
 * @param {(item: T) => boolean} callback
 * @returns {number}
 */
const findLastIndex = (array, callback) => {
  return array.reduce((lastIndex, _, index) => {
    if (lastIndex >= 0) return lastIndex;
    const trueIndex = array.length - 1 - index;
    return callback(array[trueIndex]) ? trueIndex : -1;
  }, -1);
};

// @level 2
/**
 * @param {any[]} array1
 * @param {any[]} array2
 */
const equal = (array1, array2) => {
  return array1.every((item, index) => item === array2[index]);
};

// @level 2
/**
 * @template T
 * @param {T[]} array
 * @param {number} index
 * @returns {T}
 */
const readArray = (array, index) => {
  return index >= 0 ? array[index] : array[array.length + index];
};

// @level 1
/**
 * @param {string} path
 * @return {string[]}
 */
const reducedPaths = (path) => {
  return toSegments(path).reduce((paths, _, index, segments) => {
    paths.push(toPath(segments.slice(0, segments.length - index)));
    return paths;
  }, []);
};

// @level 1
/**
 * @param {Record<string, string>} rawAliases
 * @returns {Aliases}
 */
const createAliases = (rawAliases) => {
  return Object.keys(rawAliases)
    .sort((a, b) => b.length - a.length)
    .map((alias) => ({ alias, path: rawAliases[alias] }));
};

// @level 1
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

module.exports = {
  toRelative,
  toSegments,
  toPath,
  joinPath,
  resolvePath,
  parsePath,
  findLastIndex,
  equal,
  readArray,
  reducedPaths,
  createAliases,
  replaceAlias,
};
