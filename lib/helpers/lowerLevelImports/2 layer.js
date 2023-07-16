const { isNodeModule } = require("./3 layer");
const { toRelative } = require("./4 layer");

/**
 * Report eslint error
 * @param {import('eslint').Rule.RuleContext} context
 * @param {string} rootDir
 * * @param {string} filePath
 */
const report = (context, rootDir, filePath) => {
  /**
   * @param {import('eslint').Rule.NodeParentExtension} node
   * @param {string} messageId
   * @param {string} modulePath
   */
  return (node, messageId, modulePath) => {
    const module = isNodeModule(rootDir)(modulePath)
      ? modulePath
      : toRelative(rootDir, modulePath);
    const file = toRelative(rootDir, filePath);
    context.report({ node, messageId, data: { module, file } });
  };
};

module.exports = { report };
