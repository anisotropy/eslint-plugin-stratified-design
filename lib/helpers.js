const path = require("path");

/**
 *
 * @param {string[]} dirs1
 * @param {string[]} dirs2
 * @returns {[string[], string[], string[]]}
 */
function parse(dirs1, dirs2) {
  const common = [];
  let diff1 = [];
  let diff2 = [];
  const maxLength = dirs1.length > dirs2.length ? dirs1.length : dirs2.length;
  for (let i = 0; i < maxLength; i++) {
    if (dirs1[i] === dirs2[i]) common.push(dirs1[i]);
    else {
      diff1 = dirs1.slice(i);
      diff2 = dirs2.slice(i);
      break;
    }
  }
  return [common, diff1, diff2];
}

/**
 *
 * @param {string[]} common
 * @param {{[dir: string]: string[][]}} structure
 * @returns {string[][]}
 */
function findSubStructure(common, structure) {
  const commonStr = `${path.sep}${common.join(path.sep)}`;
  const dirs = Object.keys(structure);
  const matchedDirs = dirs.filter((dir) => commonStr.endsWith(dir));
  const theDir = matchedDirs.reduce(
    (dirWithMaxLen, dir) =>
      dir.length > dirWithMaxLen.length ? dir : dirWithMaxLen,
    ""
  );
  if (theDir) {
    return structure[theDir];
  } else {
    const rootDir = dirs.reduce(
      (dirWithMinLen, dir) =>
        dir.length < dirWithMinLen.length ? dir : dirWithMinLen,
      dirs[0]
    );
    return structure[rootDir];
  }
}

/**
 * @param {string} layer1
 * @param {string} layer2
 * @param {string[][]} subStructure
 * @returns {number}
 */
function compareLevels(layer1, layer2, subStructure) {
  const lv1 = subStructure.findIndex((l) => l.includes(layer1));
  const lv2 = subStructure.findIndex((l) => l.includes(layer2));
  return lv1 - lv2;
}

module.exports = { parse, findSubStructure, compareLevels };
