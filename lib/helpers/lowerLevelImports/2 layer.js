const { isNodeModule } = require("./3 layer");
const { toRelative } = require("../common");

/**
 * Report eslint error
 * @param {import('../type.js').Context} context
 * @param {string} rootDir
 * @param {string} filePath
 */
const report = (context, rootDir, filePath) => {
  /**
   * @param {import('../type').Node} node
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
