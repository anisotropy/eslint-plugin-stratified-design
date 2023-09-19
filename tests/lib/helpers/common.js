/**
 * @fileoverview test for helpers/common.js
 * @author Hodoug Joung
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert");
const { createAliases, replaceAlias } = require("../../../lib/helpers/common");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("helpers/common", () => {
  describe("createAliases()", () => {
    const testCases = [
      {
        rawAliases: { "@/": "./src/" },
        aliases: [{ alias: "@/", path: "./src/" }],
      },
      {
        rawAliases: { "@/": "./src/", "@layer/": "./src/layer/" },
        aliases: [
          { alias: "@layer/", path: "./src/layer/" },
          { alias: "@/", path: "./src/" },
        ],
      },
    ];
    testCases.forEach(({ rawAliases, aliases }) => {
      it(`${JSON.stringify(rawAliases)} -> ${JSON.stringify(aliases)}`, () => {
        assert.deepEqual(createAliases(rawAliases), aliases);
      });
    });
  });

  describe("replaceAlias()", () => {
    const cwd = "/proj";
    const fileDir = "/proj/src/layerA";
    const aliases = [{ alias: "@/", path: "./src/" }];
    const testCases = [
      { moduleSource: "@/layerA/layerAA", relPath: "./layerAA" },
      { moduleSource: "nodeModule", relPath: "nodeModule" },
    ];
    testCases.forEach(({ moduleSource, relPath }) => {
      it(`${moduleSource} -> ${relPath}`, () => {
        assert.equal(
          replaceAlias(cwd, fileDir, aliases)(moduleSource),
          relPath
        );
      });
    });
  });
});
