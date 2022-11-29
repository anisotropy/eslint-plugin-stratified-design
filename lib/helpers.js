function getLayerLevel(layer, option) {
  return Object.entries(option)
    .map(([parent, children]) => {
      const level = children.findIndex((l) => l.includes(layer));
      if (level < 0) return null;
      const parentLevel = parent === "/" ? [] : getLayerLevel(parent, option);
      return [...parentLevel, level];
    })
    .filter((l) => l)[0];
}

function compareLevel(level1, level2) {
  if (level1.length !== level2.length) {
    return level1.length < level2.length ? -1 : 1;
  }
  const levelDiff = level1.map((l, i) => l - level2[i]).filter((l) => l !== 0);
  return levelDiff.length === 0 ? 0 : levelDiff[0] < 0 ? -1 : 1;
}

function getLayer(path) {
  const pathParts = path.split("/");
  if (pathParts.length === 1) return "";
  return pathParts[pathParts.length - 2];
}

function isLowerLevel(moduleSource, filename, option) {
  const moduleLayer = getLayer(moduleSource);
  if (!moduleLayer) return true;
  if (moduleLayer === ".") return false;
  if (moduleSource.startsWith("./")) return true;

  const moduleLevel = getLayerLevel(moduleLayer, option);
  const fileLayer = getLayer(filename);
  const fileLevel = getLayerLevel(fileLayer, option);
  return compareLevel(fileLevel, moduleLevel) < 0;
}

module.exports = {
  getLayerLevel,
  compareLevel,
  getLayer,
  isLowerLevel,
};
