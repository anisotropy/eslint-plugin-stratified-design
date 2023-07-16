const p = require("path");

/**
 * @param {string} from
 * @param {string} to
 * @returns the relative path from `from` to `to`
 */
const toRelative = (from, to) => {
  const rel = p.relative(from, to);
  return `${to}/`.startsWith(`${from}/`) ? `./${rel}` : rel;
};

/**
 * @param {string} path
 * @returns path to segments
 */
const toSegments = (path) => path.split("/");

/**
 * @param {string[]} segments
 * @returns segments to path
 */
const toPath = (segments) => segments.join("/");

const joinPath = p.join;

const resolvePath = p.resolve;

const parsePath = p.parse;

/**
 * @param {any[]} array
 * @param {(item: any) => boolean} callback
 * @returns {number}
 */
const findLastIndex = (array, callback) => {
  return array.reduce((lastIndex, _, index) => {
    if (lastIndex >= 0) return lastIndex;
    const trueIndex = array.length - 1 - index;
    return callback(array[trueIndex]) ? trueIndex : -1;
  }, -1);
};

/**
 * @param {any[]} array1
 * @param {any[]} array2
 */
const equal = (array1, array2) => {
  return array1.every((item, index) => item === array2[index]);
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
};
