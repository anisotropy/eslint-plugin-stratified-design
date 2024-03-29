const { report: reportError } = require("./2 layer");
const {
  isNodeModule,
  findLevel: findLayerLevel,
  hasBarrier: hasBarrierBetween,
  removeAlias: removeAliasFromModuleSource,
} = require("./3 layer");
const {
  toRelative,
  toSegments,
  toPath,
  resolvePath,
  parsePath,
  fromCwd,
  match,
} = require("../common");

const FINISHED = "finished";

/**
 *
 * @param {string} cwd
 * @param {import("./3 layer").Options} options
 * @returns
 */
const createRootDir = (cwd, options) => {
  return resolvePath(cwd, options.root);
};

/**
 * @param {import("./3 layer").Options} options
 * @param {string} cwd
 * @param {string} contextFileSource
 */
const parseFileSource = (options, cwd, contextFileSource) => {
  const fileSource = resolvePath(contextFileSource);
  const parsedFileSource = parsePath(fileSource);
  const fileDir = resolvePath(parsedFileSource.dir);
  const filePath = resolvePath(fileDir, parsedFileSource.name);
  const fileSourceFromCwd = fromCwd(cwd, fileSource);
  const isIncludedFile = options.include.find(match(fileSourceFromCwd));
  const isExcludedFile = options.exclude.find(match(fileSourceFromCwd));
  return {
    fileDir,
    filePath,
    isExcludedFile: !isIncludedFile || isExcludedFile,
  };
};

/**
 * @param {string} cwd
 * @param {string[]} excludeImports
 * @param {string} fileDir
 * @param {{alias: string, path: string}[]} aliases
 */
const createModulePath = (cwd, excludeImports, fileDir, aliases) => {
  const removeAlias = removeAliasFromModuleSource(cwd, fileDir, aliases);
  /**
   * @param {string} moduleSourceWithAlias
   */
  return (moduleSourceWithAlias) => {
    const moduleSource = removeAlias(moduleSourceWithAlias);

    const isNodeModule = moduleSource.startsWith(".") === false;

    const modulePath = isNodeModule
      ? moduleSource
      : resolvePath(fileDir, moduleSource);

    const modulePathFromCwd = isNodeModule
      ? modulePath
      : fromCwd(cwd, modulePath);

    const isModuleExcluded = Boolean(
      excludeImports.find(match(modulePathFromCwd))
    );

    return { modulePath, isModuleExcluded };
  };
};

/**
 * @param {import("./3 layer").Options} options
 * @param {string} fileDor
 * @param {string} modulePath
 */
const isFileIndexOfModule = (options, fileDir, filePath) => (modulePath) => {
  if (!options.isIndexHighest || parsePath(filePath).name !== "index") {
    return false;
  }
  const segments = toSegments(toRelative(fileDir, modulePath));
  if (segments.length === 2 && segments[0] === ".") return true;
  return false;
};

/**
 * Report error about using `options.useLevelNumber`
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import("./3 layer").Options} options
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
    if (isNodeModule(rootDir)(modulePath)) return;

    const report = (messageId) =>
      reportError(context, rootDir, filePath)(node, messageId, modulePath);

    const extractLevel = (segment) => {
      const level = segment.split(" ")[0];
      return /^[\d]+$/.test(level) ? Number(level) : null;
    };

    const parentPath = (() => {
      const moduleSegment = toSegments(modulePath);
      const fileSegment = toSegments(filePath);
      const parent = moduleSegment.reduce((parent, seg, index) => {
        if (fileSegment[index] === seg) parent.push(seg);
        return parent;
      }, []);
      return toPath(parent);
    })();

    const { moduleLevel, isBarrierError } = (() => {
      const segments = toSegments(toRelative(parentPath, modulePath));
      const moduleLevel = extractLevel(segments[1]);
      const isBarrierError =
        segments.length === 2
          ? false
          : segments.some((seg) => extractLevel(seg) !== null);
      return {
        moduleLevel,
        isBarrierError,
      };
    })();

    if (isBarrierError) {
      report("barrier");
      return FINISHED;
    }

    if (moduleLevel === null) return;

    const fileLevel = (() => {
      const segments = toSegments(toRelative(parentPath, filePath));
      const level = extractLevel(segments[1]);
      if (level === null && segments.length === 2 && segments[0] == ".")
        return -1;
      return level;
    })();

    if (fileLevel === null) {
      report("barrier");
      return FINISHED;
    }

    if (fileLevel >= moduleLevel) {
      report("not-lower-level");
      return FINISHED;
    }

    return FINISHED;
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
 * @param {{[string]: {name: string; nodeModule: boolean; nodeModule: boolean; isNodeModule: boolean; interface: boolean}}} structure
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
  const hasBarrier = hasBarrierBetween(structure, fileLevel);

  /**
   * @param {import('../type').Node} node
   * @param {string} modulePath
   */
  return (node, modulePath) => {
    const report = (messageId) =>
      reportError(context, rootDir, filePath)(node, messageId, modulePath);

    const isNodeModulePath = isNodeModule(rootDir)(modulePath);

    const moduleLevel = findLevel(modulePath);

    if (fileLevel === null) {
      if (moduleLevel !== null || !isNodeModulePath) {
        report("not-registered:file");
      }
      return FINISHED;
    }

    if (moduleLevel === null) {
      if (!isNodeModulePath) report("not-registered:module");
      return FINISHED;
    }

    if (fileLevel >= moduleLevel) {
      report("not-lower-level");
      return FINISHED;
    }

    if (hasBarrier(modulePath, moduleLevel)) {
      report("barrier");
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
  isFileIndexOfModule,
  reportHasProperLevelNumber,
  reportInSubDirOfFileDir,
  reportHasProperLevel,
};
