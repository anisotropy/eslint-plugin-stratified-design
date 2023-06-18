const { minimatch } = require("minimatch");
const { report: reportError } = require("./2 layer");
const {
  isNodeModule,
  findLevel: findLayerLevel,
  hasInterface: hasInterfaceBetween,
  removeAlias: removeAliasFromModuleSource,
} = require("./3 layer");
const {
  toRelative,
  toSegments,
  toPath,
  resolvePath,
  parsePath,
} = require("./4 layer");

const FINISHED = "finished";

/**
 *
 * @param {string} cwd
 * @param {*} options
 * @returns
 */
const createRootDir = (cwd, options) => {
  return resolvePath(cwd, options.root);
};

/**
 * @param {*} options
 * @param {string} contextFileSource
 */
const parseFileSource = (options, contextFileSource) => {
  const fileSource = resolvePath(contextFileSource);
  const parsedFileSource = parsePath(fileSource);
  const fileDir = resolvePath(parsedFileSource.dir);
  const filePath = resolvePath(fileDir, parsedFileSource.name);
  const isExcludedFile = options.exclude.find((pattern) =>
    minimatch(fileSource, pattern)
  );
  return { fileDir, filePath, isExcludedFile };
};

/**
 * @param {string} cwd
 * @param {string} fileDir
 * @param {{alias: string, path: string}[]} aliases
 */
const createModulePath = (cwd, fileDir, aliases) => {
  const removeAlias = removeAliasFromModuleSource(cwd, fileDir, aliases);
  /**
   * @param {string} moduleSourceWithAlias
   */
  return (moduleSourceWithAlias) => {
    const moduleSource = removeAlias(moduleSourceWithAlias);
    const isNodeModule = moduleSource.startsWith(".") === false;
    return isNodeModule ? moduleSource : resolvePath(fileDir, moduleSource);
  };
};

/**
 * Report error about using `options.useLevelNumber`
 * @param {import('eslint').Rule.RuleContext} context
 * @param {*} options
 * @param {string} rootDir
 * @param {string} filePath
 */
const reportHasProperLevelNumber = (context, options, rootDir, filePath) => {
  /**
   * @param {import('eslint').Rule.NodeParentExtension} node
   * @param {string} modulePath
   */
  return (node, modulePath) => {
    if (!options.useLevelNumber) return;

    const report = (messageId) =>
      reportError(context, rootDir, filePath)(node, messageId, modulePath);

    const findParent = (segments) => toPath(segments.slice(0, -1));

    const findLevel = (segments) => {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment === "index") return -1;
      const level = lastSegment.split(" ")[0];
      return /^[\d]+$/.test(level) ? Number(level) : null;
    };

    const fileSegments = toSegments(filePath);
    const moduleSegments = toSegments(modulePath);
    const fileLevel = findLevel(fileSegments);
    const moduleLevel = findLevel(moduleSegments);

    if (
      findParent(fileSegments) !== findParent(moduleSegments) &&
      moduleLevel !== null
    ) {
      report("interface");
      return FINISHED;
    }

    if (
      findParent(fileSegments) === findParent(moduleSegments) &&
      fileLevel !== null &&
      moduleLevel !== null &&
      fileLevel < moduleLevel
    ) {
      return FINISHED;
    }
  };
};

/**
 * @param {string} fileDir
 * @return return `FINISHED` if the imported module(`modulePath`) is in a sub directory of the file directory(`fileDir`)
 */
const reportInSubDirOfFileDir = (fileDir) => {
  /**
   * @param {import('eslint').Rule.NodeParentExtension} node
   * @param {string} modulePath
   */
  return (node, modulePath) => {
    const relModulePath = toRelative(fileDir, modulePath);
    if (
      relModulePath.startsWith("..") === false &&
      toSegments(relModulePath).length >= 3
    ) {
      return FINISHED;
    }
  };
};

/**
 * Report error about using `options.structure`
 * @param {import('eslint').Rule.RuleContext} context
 * @param {{[string]: string | {name: string, isNodeModule: boolean, interface: boolean}}} structure
 * @param {string} rootDir
 * @param {number | null} fileLevel
 * @param {string} filePath
 */
const reportHasProperLevel = (
  context,
  structure,
  rootDir,
  fileLevel,
  filePath
) => {
  const findLevel = findLayerLevel(structure);
  const hasInterface = hasInterfaceBetween(structure, fileLevel);

  /**
   * @param {import('eslint').Rule.NodeParentExtension} node
   * @param {string} modulePath
   */
  return (node, modulePath) => {
    const report = (messageId) =>
      reportError(context, rootDir, filePath)(node, messageId, modulePath);

    const isNodeModulePath = isNodeModule(rootDir)(modulePath);

    if (fileLevel === null) {
      if (!isNodeModulePath) report("not-registered:file");
      return FINISHED;
    }

    const moduleLevel = findLevel(modulePath);
    if (moduleLevel === null) {
      if (!isNodeModulePath) report("not-registered:module");
      return FINISHED;
    }

    if (fileLevel >= moduleLevel) {
      report("not-lower-level");
      return FINISHED;
    }

    if (hasInterface(moduleLevel)) {
      report("interface");
      return FINISHED;
    }

    return FINISHED;
  };
};

module.exports = {
  FINISHED,
  createRootDir,
  parseFileSource,
  createModulePath,
  reportHasProperLevelNumber,
  reportInSubDirOfFileDir,
  reportHasProperLevel,
};
