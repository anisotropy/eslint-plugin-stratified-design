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

function parsePath(rel, abs) {
  const dirname = path.dirname(abs);
  const relDirs = path.dirname(path.resolve(dirname, rel)).split(path.sep);
  const absDirs = dirname.split(path.sep);
  return parse(relDirs, absDirs);
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
 * @param {string} layer
 * @param {string[][]} subStructure
 * @returns {number}
 */
function getLevel(layer, subStructure) {
  return subStructure.findIndex((l) => {
    if (typeof l === "string") return l === layer;
    return l.name === layer;
  });
}

/**
 * @param {string[][]} subStructure
 * @returns {number}
 */
function getInterfaceLevel(subStructure) {
  return subStructure.findIndex((l) => typeof l !== "string" && l.interface);
}

/**
 * @param {string} layer1
 * @param {string} layer2
 * @param {string[][]} subStructure
 * @returns {boolean}
 */
function isLowerThan(layer1, layer2, subStructure) {
  const interfaceLevel = getInterfaceLevel(subStructure);
  const level1 = getLevel(layer1, subStructure);
  const level2 = getLevel(layer2, subStructure);
  if (
    interfaceLevel >= 0 &&
    level1 > interfaceLevel &&
    interfaceLevel > level2
  ) {
    return false;
  }
  return level1 > level2;
}

/**
 * @param {string} layer
 * @param {string[][]} subStructure
 * @returns {boolean}
 */
function isLowerThanInterface(layer, subStructure) {
  const interfaceLevel = getInterfaceLevel(subStructure);
  if (interfaceLevel < 0) return false;
  const level = getLevel(layer, subStructure);
  return level > interfaceLevel;
}

module.exports = {
  parse,
  parsePath,
  findSubStructure,
  isLowerThan,
  isLowerThanInterface,
};
