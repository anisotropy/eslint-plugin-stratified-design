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

module.exports = {
  toRelative,
  toSegments,
  toPath,
  joinPath,
  resolvePath,
  parsePath,
};
