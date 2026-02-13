import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import rule from "../../rules/no-magic-values.js";

const tester = new RuleTester();

describe("no-magic-values", () => {
  describe("numbers", () => {
    it("allows ignored numbers (-1, 0, 1, 2) by default", () => {
      tester.run("no-magic-values", rule, {
        valid: [
          "const i = arr.indexOf(x); if (i === -1) {}",
          "let count = 0;",
          "count += 1;",
          "const half = x / 2;",
        ],
        invalid: [],
      });
    });

    it("reports magic numbers", () => {
      tester.run("no-magic-values", rule, {
        valid: [],
        invalid: [
          {
            code: "const timeout = setTimeout(fn, 3000);",
            errors: [{ messageId: "noMagicNumber" }],
          },
          {
            code: "if (status === 200) {}",
            errors: [{ messageId: "noMagicNumber" }],
          },
          {
            code: "let retries = 3;",
            errors: [{ messageId: "noMagicNumber" }],
          },
        ],
      });
    });

    it("allows numbers in const declarations", () => {
      tester.run("no-magic-values", rule, {
        valid: [
          "const TIMEOUT = 3000;",
          "const MAX_RETRIES = 3;",
          "const STATUS_OK = 200;",
        ],
        invalid: [],
      });
    });

    it("allows array indexes when ignoreArrayIndexes is true", () => {
      tester.run("no-magic-values", rule, {
        valid: ["const first = arr[0]; const second = arr[2];"],
        invalid: [
          {
            code: "const x = arr[5];",
            options: [{ ignoreArrayIndexes: false }],
            errors: [{ messageId: "noMagicNumber" }],
          },
        ],
      });
    });

    it("allows default parameter values when ignoreDefaultValues is true", () => {
      tester.run("no-magic-values", rule, {
        valid: ["function foo(x = 10) {}"],
        invalid: [
          {
            code: "function foo(x = 10) {}",
            options: [{ ignoreDefaultValues: false }],
            errors: [{ messageId: "noMagicNumber" }],
          },
        ],
      });
    });

    it("allows radix arguments in parseInt, Number.parseInt, and .toString", () => {
      tester.run("no-magic-values", rule, {
        valid: [
          "const num = parseInt(str, 10);",
          "const hex = parseInt(str, 16);",
          "const num = Number.parseInt(str, 10);",
          "const hex = Number.parseInt(str, 16);",
          "const str = num.toString(16);",
          "const str = num.toString(10);",
        ],
        invalid: [
          {
            code: "const num = parseInt(10, str);",
            errors: [{ messageId: "noMagicNumber" }],
          },
        ],
      });
    });

    it("respects custom ignoreNumbers list", () => {
      tester.run("no-magic-values", rule, {
        valid: [
          {
            code: "if (status === 200) {}",
            options: [{ ignoreNumbers: [200] }],
          },
        ],
        invalid: [
          {
            code: "if (status === 200) {}",
            options: [{ ignoreNumbers: [] }],
            errors: [{ messageId: "noMagicNumber" }],
          },
        ],
      });
    });
  });

  describe("strings", () => {
    it("reports magic strings", () => {
      tester.run("no-magic-values", rule, {
        valid: [],
        invalid: [
          {
            code: "if (role === \"admin\") {}",
            errors: [{ messageId: "noMagicString" }],
          },
          {
            code: "let status = \"pending\";",
            errors: [{ messageId: "noMagicString" }],
          },
        ],
      });
    });

    it("allows strings in const declarations", () => {
      tester.run("no-magic-values", rule, {
        valid: [
          "const ROLE_ADMIN = \"admin\";",
          'const API_URL = "https://api.example.com";',
        ],
        invalid: [],
      });
    });

    it("allows empty strings", () => {
      tester.run("no-magic-values", rule, {
        valid: ['if (name === "") {}', 'let x = "";'],
        invalid: [],
      });
    });

    it("allows strings in import/export/require", () => {
      tester.run("no-magic-values", rule, {
        valid: [
          { code: 'import foo from "bar";', languageOptions: { sourceType: "module" } },
          'const foo = require("bar");',
        ],
        invalid: [],
      });
    });

    it("allows strings as object keys", () => {
      tester.run("no-magic-values", rule, {
        valid: ['const obj = { "content-type": true };'],
        invalid: [],
      });
    });

    it("allows string default parameter values when ignoreDefaultValues is true", () => {
      tester.run("no-magic-values", rule, {
        valid: ['function foo(x = "bar") {}'],
        invalid: [
          {
            code: 'function foo(x = "bar") {}',
            options: [{ ignoreDefaultValues: false }],
            errors: [{ messageId: "noMagicString" }],
          },
        ],
      });
    });

    it("ignores directive-like expression statements", () => {
      tester.run("no-magic-values", rule, {
        valid: ['"use strict";'],
        invalid: [],
      });
    });

    it("reports string values in object literals (not keys)", () => {
      tester.run("no-magic-values", rule, {
        valid: [],
        invalid: [
          {
            code: 'const obj = { key: "magic" };',
            errors: [{ messageId: "noMagicString" }],
          },
        ],
      });
    });
  });
});
