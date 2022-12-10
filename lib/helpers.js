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
 * @param {string} cwd 
 * @param {string | undefined} root 
 * @param {{[dir: string]: string[][]}} structure
 * @returns 
 */
function makeStructure(cwd, root, structure) {
  const theCwd = path.resolve(cwd).split(path.sep).join('/')
  const theRoot = path.resolve(theCwd, root || './') 

  return Object.entries(structure).reduce((structure, [layerPath, subLayers]) => {
    structure[path.resolve(theRoot, `.${layerPath}`)] = subLayers
    return structure
  }, {});
}

/**
 * @param {string} layer
 * @param {string[][]} subLayers
 * @returns {number}
 */
function getLevel(layer, subLayers) {
  return subLayers.findIndex((l) => {
    if (typeof l === "string") return l === layer;
    return l.name === layer;
  });
}

/**
 * @param {string[][]} subLayers
 * @returns {number}
 */
function getInterfaceLevel(subLayers) {
  return subLayers.findIndex((l) => typeof l !== "string" && l.interface);
}

/**
 * @param {string} layer1
 * @param {string} layer2
 * @param {string[][]} subLayers
 * @returns {boolean}
 */
function isLowerThan(layer1, layer2, subLayers) {
  const level1 = getLevel(layer1, subLayers);
  const level2 = getLevel(layer2, subLayers);
  return level1 > level2;
}

/**
 * @param {string} layer
 * @param {string[][]} subLayers
 * @returns {'lower' | 'higher' | 'same' | ''}
 */
function compareWithInterface(layer, subLayers) {
  const interfaceLevel = getInterfaceLevel(subLayers);
  if (interfaceLevel < 0) return "";
  const level = getLevel(layer, subLayers);
  const diff = level - interfaceLevel;
  if (diff > 0) return "lower";
  if (diff === 0) return "same";
  return "higher";
}

module.exports = {
  parse,
  makeStructure,
  isLowerThan,
  compareWithInterface,
};
