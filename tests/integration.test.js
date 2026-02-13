import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import plugin from "../index.js";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

describe("recommended config integration", () => {
  it("reports all rule violations on a bad sample file", () => {
    const linter = new Linter({ configType: "flat" });

    const code = [
      "// This function does stuff",
      "function processData(url, method, headers, body, timeout) {",
      '  if (status === 200) {}',
      '  let role = "admin";',
      "  return 42;",
      "}",
    ].join("\n");

    const messages = linter.verify(code, [plugin.configs.recommended]);

    const ruleIds = messages.map((m) => m.ruleId);

    assert.ok(
      ruleIds.includes("human-first/no-comments"),
      "should report no-comments",
    );
    assert.ok(
      ruleIds.includes("max-params"),
      "should report max-params",
    );
    assert.ok(
      ruleIds.includes("human-first/no-magic-values"),
      "should report no-magic-values",
    );
  });

  it("disallows eslint directive comments", () => {
    const linter = new Linter({ configType: "flat" });

    const code = [
      "// eslint-disable-next-line no-unused-vars",
      "const x = 1;",
    ].join("\n");

    const messages = linter.verify(code, [plugin.configs.recommended]);
    const ruleIds = messages.map((m) => m.ruleId);

    assert.ok(
      ruleIds.includes("human-first/no-comments"),
      "should report eslint directive comments",
    );
  });

  it("passes clean code without violations", () => {
    const linter = new Linter({ configType: "flat" });

    const code = [
      "const STATUS_OK = 200;",
      "const ROLE_ADMIN = \"admin\";",
      "",
      "function isOk(status) {",
      "  return status === STATUS_OK;",
      "}",
    ].join("\n");

    const messages = linter.verify(code, [plugin.configs.recommended]);
    const errors = messages.filter((m) => m.severity === 2);

    assert.equal(errors.length, 0, `Expected no errors but got: ${JSON.stringify(errors, null, 2)}`);
  });

  it("includes built-in rules with correct config", () => {
    const rules = plugin.configs.recommended.rules;

    assert.deepEqual(rules["max-params"], ["error", { max: 2 }]);
    assert.deepEqual(rules["max-lines-per-function"], [
      "error",
      { max: 50, skipBlankLines: true, skipComments: true },
    ]);
    assert.deepEqual(rules["max-lines"], [
      "error",
      { max: 250, skipBlankLines: true, skipComments: true },
    ]);
  });

  it("exposes plugin metadata", () => {
    assert.equal(plugin.meta.name, "eslint-plugin-human-first");
    assert.equal(plugin.meta.version, pkg.version);
  });

  it("exposes both custom rules", () => {
    assert.ok(plugin.rules["no-comments"]);
    assert.ok(plugin.rules["no-magic-values"]);
  });

  it("config has a name for debugging", () => {
    assert.equal(plugin.configs.recommended.name, "human-first/recommended");
  });
});
