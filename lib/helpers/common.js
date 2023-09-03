const p = require("path");

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
};
