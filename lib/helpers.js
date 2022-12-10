const path = require("path");

function splitPath(path) {
  return path.split("/");
}

function resolvePath(...paths) {
  return path.resolve(...paths.flat(Infinity).filter((p) => p));
}

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
    if (dirs1[i] === dirs2[i]) {
      common.push(dirs1[i]);
    } else {
      diff1 = dirs1.slice(i);
      diff2 = dirs2.slice(i);
      break;
    }
  }
  return [common, diff1, diff2];
}

function parsePath(moduleDir, fileDir) {
  const [common, relModule, relFile] = parse(
    splitPath(moduleDir),
    splitPath(fileDir)
  );
  return { commonDir: resolvePath("/", common), relModule, relFile };
}

function properNodeModuleName(name) {
  return splitPath(name)[0];
}

function isNodeModule(layer) {
  return (
    typeof layer !== "string" &&
    layer.isNodeModule === true &&
    Boolean(layer.name)
  );
}

/**
 * @param {string} cwd
 * @param {string} root
 * @param {{[dir: string]: string[][]}} structure
 * @returns
 */
function makeStructure(cwd, root, structure) {
  const theRoot = resolvePath(cwd, root);
  return Object.entries(structure).reduce(
    (structure, [layerPath, subLayers]) => {
      const properSubLayers = subLayers.map((l) => {
        if (isNodeModule(l))
          return { ...l, name: properNodeModuleName(l.name) };
        return l;
      });
      structure[resolvePath(theRoot, `.${layerPath}`)] = properSubLayers;
      return structure;
    },
    {}
  );
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
 * @param {(string | {name: string, interface?: boolean, isNodeModule?: boolean})[]} subLayers
 * @returns {number}
 */
function getInterfaceLevel(subLayers) {
  return subLayers.findIndex((l) => typeof l !== "string" && l.interface);
}

/**
 * @param {string | null | undefined} layer1
 * @param {string | null | undefined} layer2
 * @param {(string | {name: string, interface?: boolean, isNodeModule?: boolean})[] | null | undefined} subLayers
 * @returns {boolean}
 */
function isLowerThan(layer1, layer2, subLayers) {
  if (!layer1 || !layer2 || !subLayers) return true;
  const level1 = getLevel(layer1, subLayers);
  const level2 = getLevel(layer2, subLayers);
  return level1 > level2;
}

/**
 * @param {string | null | undefined} layer
 * @param {(string | {name: string, interface?: boolean, isNodeModule?: boolean})[] | null | undefined} subLayers
 * @returns {'lower' | 'higher' | 'same' | ''}
 */
function compareWithInterface(layer, subLayers) {
  if (!layer || !subLayers) return "";
  const interfaceLevel = getInterfaceLevel(subLayers);
  if (interfaceLevel < 0) return "";
  const level = getLevel(layer, subLayers);
  const diff = level - interfaceLevel;
  if (diff > 0) return "lower";
  if (diff === 0) return "same";
  return "higher";
}

/**
 * @param {string} module
 * @param {{[alias: string]: string} | null | undefined} aliasMap
 * @returns {string}
 */
function replaceAlias(module, aliasMap) {
  if (!aliasMap) return module;
  const aliases = Object.keys(aliasMap);
  aliases.sort((a, b) => b.length - a.length);
  const theAlias = aliases.find((alias) => module.startsWith(alias));
  return theAlias ? module.replace(theAlias, aliasMap[theAlias]) : module;
}

module.exports = {
  parse,
  parsePath,
  makeStructure,
  isLowerThan,
  compareWithInterface,
  replaceAlias,
  splitPath,
  resolvePath,
  properNodeModuleName,
  isNodeModule,
};
