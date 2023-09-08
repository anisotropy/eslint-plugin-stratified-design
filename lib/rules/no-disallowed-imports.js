/**
 * @fileoverview ...
 * @author Hodoug Joung
 */
"use strict";

const { minimatch } = require("minimatch");
const helpers = require("../helpers/noDisallowedImports");
const { createAliases } = require("../helpers/common");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @typedef {import('eslint').Rule.Node} Node
 * @typedef {import('eslint').AST.Token} Token
 * @typedef {import('eslint').SourceCode} SourceCode
 * @typedef {{
 *  import: { specifiers: string[], path: string },
 *  allow: string[],
 *  disallow: string[],
 * }} ImportPath
 * @typedef {{
 *  importPaths: ImportPath[],
 *  aliases: Record<string, string>
 * }} Options
 */

const DEFAULT = "default";

const importSchema = {
  type: "object",
  properties: {
    import: {
      type: "object",
      properties: {
        specifiers: {
          type: "array",
          items: [{ type: "string" }], // 'default' means default specifier
        },
        path: { type: "string" },
      },
      required: ["specifiers", "path"],
      additionalProperties: false,
    },
    allow: {
      type: "array",
      items: [{ type: "string" }],
    },
    disallow: {
      type: "array",
      items: [{ type: "string" }],
    },
  },
  required: ["import"],
  additionalProperties: false,
};

const aliasesSchema = {
  type: "object",
  patternProperties: {
    ["^.+$"]: {
      type: "string",
      pattern: "^\\.{1,2}(/[^/]+)*/?$",
    },
  },
  additionalProperties: false,
};

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: {
      type: "array",
      items: [
        {
          type: "object",
          properties: {
            importPaths: {
              type: "array",
              items: [importSchema],
            },
            aliases: aliasesSchema,
          },
          required: ["importPaths"],
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
    messages: {
      "no-disallowed-imports": "'{{specifier}}' should NOT be imported",
    },
  },
  create(context) {
    /**
     * @type {Options}
     */
    const options = {
      importPaths: [],
      aliases: {},
      ...(context.options[0] || {}),
    };
    const { fileDir, fileSource } = helpers.parseFileSource(context.filename);
    const createModulePath = helpers.createModulePath(
      context.cwd,
      fileDir,
      createAliases(options.aliases)
    );
    return {
      ImportDeclaration(node) {
        const modulePath = createModulePath(node.source.value);
        /**
         * @param {[string | undefined, ImportPath | undefined]} param0
         * @param {ImportPath} importPath
         */
        const searchTheImportPath = (
          [theSpecifier, theImportPath],
          importPath
        ) => {
          if (theSpecifier && theImportPath) {
            return [theSpecifier, theImportPath];
          }

          const { specifiers, path } = importPath.import;

          const importedSpecifiers = node.specifiers.map((specifier) => {
            if (specifier.type === "ImportSpecifier")
              return specifier.imported.name;
            if (specifier.type === "ImportDefaultSpecifier") return DEFAULT;
            return "";
          });

          const specifier = specifiers.find((specifier) =>
            importedSpecifiers.some((sp) => sp === specifier)
          );

          if (specifier && minimatch(modulePath, path)) {
            if (specifier === DEFAULT) {
              return [
                node.specifiers.find(
                  ({ type }) => type === "ImportDefaultSpecifier"
                ).local.name,
                importPath,
              ];
            }
            return [specifier, importPath];
          }

          return [undefined, undefined];
        };

        const [theSpecifier, theImportPath] = options.importPaths.reduce(
          searchTheImportPath,
          [undefined, undefined]
        );
        if (!theSpecifier || !theImportPath) return;

        const { allow, disallow } = theImportPath;
        const isAllowed =
          (allow
            ? Boolean(allow.find((pattern) => minimatch(fileSource, pattern)))
            : true) &&
          (disallow
            ? !disallow.find((pattern) => minimatch(fileSource, pattern))
            : true);
        if (isAllowed) return;

        context.report({
          node,
          messageId: "no-disallowed-imports",
          data: { specifier: theSpecifier },
        });
      },
    };
  },
};
