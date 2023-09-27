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
 *  import: { member: string[], from: string },
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

const importSchema = {
  type: "object",
  properties: {
    import: {
      type: "object",
      properties: {
        member: {
          type: "array",
          items: [{ type: "string" }], // 'default' means default specifier
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
      "no-disallowed-imports": "'{{member}}' should NOT be imported",
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

          if (
            member &&
            match(fromCwd(context.cwd, modulePath))(importSpec.import.from)
          ) {
            if (member === DEFAULT || member === NAMESPACE) {
              return [
                node.specifiers.find(
                  ({ type }) =>
                    type === "ImportDefaultSpecifier" ||
                    type === "ImportNamespaceSpecifier"
                ).local.name,
                importSpec,
              ];
            }
            return [member, importSpec];
          }

          return [undefined, undefined];
        };

        const [theMember, theImportSpec] = options.imports.reduce(
          searchTheImportPath,
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
          data: { member: theMember },
        });
      },
    };
  },
};
