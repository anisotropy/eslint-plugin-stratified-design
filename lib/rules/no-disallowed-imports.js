/**
 * @fileoverview ...
 * @author Hodoug Joung
 */
"use strict";

const helpers = require("../helpers/noDisallowedImports");
const { createAliases, fromCwd, match } = require("../helpers/common");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @typedef {import('eslint').Rule.Node} Node
 * @typedef {import('eslint').AST.Token} Token
 * @typedef {import('eslint').SourceCode} SourceCode
 * @typedef {{
 *  import: { member: '*' | string[], from: string },
 *  allow: string[],
 *  disallow: string[],
 * }} ImportPath
 * @typedef {{
 *  imports: ImportPath[],
 *  aliases: Record<string, string>
 * }} Options
 */

const DEFAULT = "default";

const NAMESPACE = "*";

const ANY_MEMBER = "*";

const importSchema = {
  type: "object",
  properties: {
    import: {
      type: "object",
      properties: {
        member: {
          oneOf: [
            {
              type: "array",
              items: [{ type: "string" }], // 'default' means default specifier
            },
            {
              type: "string",
              pattern: `^[${ANY_MEMBER}]$`
            }
          ]
        },
        from: { type: "string" },
      },
      required: ["member", "from"],
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
            imports: {
              type: "array",
              items: [importSchema],
            },
            aliases: aliasesSchema,
          },
          required: ["imports"],
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
    messages: {
      "no-disallowed-imports": "{{member}} should NOT be imported from '{{from}}'",
    },
  },
  create(context) {
    /**
     * @type {Options}
     */
    const options = {
      imports: [],
      aliases: {},
      ...(context.options[0] || {}),
    };
    const { fileDir, fileSource } = helpers.parseFileSource(context.filename);
    const createModulePath = helpers.createModulePath(
      context.cwd,
      fileDir,
      createAliases(options.aliases)
    );
    const report = (node, pathSearcher) => {
      const [theMember, theImportSpec] = options.imports.reduce(
        pathSearcher,
        [undefined, undefined]
      );
      if (!theMember || !theImportSpec) return;

      const { allow, disallow } = theImportSpec;
      const fileSourceFromCwd = fromCwd(context.cwd, fileSource);
      const isAllowed =
        (allow ? Boolean(allow.find(match(fileSourceFromCwd))) : true) &&
        (disallow ? !disallow.find(match(fileSourceFromCwd)) : true);
      if (isAllowed) return;

      context.report({
        node,
        messageId: "no-disallowed-imports",
        data: { member: theMember, from: theImportSpec.import.from },
      });
    }
    return {
      ImportDeclaration(node) {
        const modulePath = createModulePath(node.source.value);
        /**
         * @param {[string | undefined, ImportPath | undefined]} param0
         * @param {ImportPath} importSpec
         */
        const searchTheImportPath = (
          [theMember, theImportSpec],
          importSpec
        ) => {
          if (theMember && theImportSpec) {
            return [theMember, theImportSpec];
          }

          const isModulePathMatched = match(fromCwd(context.cwd, modulePath))(importSpec.import.from)

          if (importSpec.import.member === ANY_MEMBER) {
            return isModulePathMatched ? ['Any member', importSpec] : [undefined, undefined]
          }

          const importedSpecifiers = node.specifiers.map((specifier) => {
            if (specifier.type === "ImportSpecifier")
              return specifier.imported.name;
            if (specifier.type === "ImportDefaultSpecifier") return DEFAULT;
            if (specifier.type === "ImportNamespaceSpecifier") return NAMESPACE;
            return "";
          });

          const member = importSpec.import.member.find((specifier) =>
            importedSpecifiers.some((sp) => sp === specifier)
          );

          if (member && isModulePathMatched) {
            if (member === DEFAULT || member === NAMESPACE) {
              const theMember = node.specifiers.find(
                ({ type }) =>
                  type === "ImportDefaultSpecifier" ||
                  type === "ImportNamespaceSpecifier"
              ).local.name
              return [`'${theMember}'`, importSpec];
            }
            return [`'${member}'`, importSpec];
          }

          return [undefined, undefined];
        };
        report(node, searchTheImportPath)
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return
        const modulePath = createModulePath(node.source.value);
        /**
         * @param {[string | undefined, ImportPath | undefined]} param0
         * @param {ImportPath} importSpec
         */
        const searchTheImportPath = ([theMember, theImportSpec], importSpec) => {
          if (theMember && theImportSpec) return [theMember, theImportSpec];

          const isModulePathMatched = match(fromCwd(context.cwd, modulePath))(importSpec.import.from)

          if (importSpec.import.member === ANY_MEMBER) {
            return isModulePathMatched ? ['Any member', importSpec] : [undefined, undefined]
          }

          const exportedSpecifiers = node.specifiers.map((specifier) => {
            if (specifier.type === "ExportSpecifier") return specifier.exported.name;
            return "";
          });

          const member = importSpec.import.member.find((specifier) =>
            exportedSpecifiers.some((sp) => sp === specifier)
          );

          if (member && isModulePathMatched) return [`'${member}'`, importSpec];
          return [undefined, undefined];
        }
        report(node, searchTheImportPath)
      },
      ExportAllDeclaration(node) {
        if (!node.source) return
        const modulePath = createModulePath(node.source.value);
        /**
         * @param {[string | undefined, ImportPath | undefined]} param0
         * @param {ImportPath} importSpec
         */
        const searchTheImportPath = ([theMember, theImportSpec], importSpec) => {
          if (theMember && theImportSpec) return [theMember, theImportSpec];

          const isModulePathMatched = match(fromCwd(context.cwd, modulePath))(importSpec.import.from)

          if (importSpec.import.member === ANY_MEMBER) {
            return isModulePathMatched ? ['Any member', importSpec] : [undefined, undefined]
          }

          if (importSpec.import.member.includes(NAMESPACE) && isModulePathMatched) {
            if (!node.exported) return [`'${NAMESPACE}'`, importSpec]
            return [`'${node.exported.name}'`, importSpec]
            
          }
          return [undefined, undefined];
        }
        report(node, searchTheImportPath)
      }
    };
  },
};
