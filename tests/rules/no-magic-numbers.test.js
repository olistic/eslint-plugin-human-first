import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import rule from "../../rules/no-magic-numbers.js";

const tester = new RuleTester();

describe("no-magic-numbers", () => {
  it("allows ignored numbers (-1, 0, 1, 2) by default", () => {
    tester.run("no-magic-numbers", rule, {
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
    tester.run("no-magic-numbers", rule, {
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
    tester.run("no-magic-numbers", rule, {
      valid: [
        "const TIMEOUT = 3000;",
        "const MAX_RETRIES = 3;",
        "const STATUS_OK = 200;",
      ],
      invalid: [],
    });
  });

  it("allows array indexes when ignoreArrayIndexes is true", () => {
    tester.run("no-magic-numbers", rule, {
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
    tester.run("no-magic-numbers", rule, {
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
    tester.run("no-magic-numbers", rule, {
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
    tester.run("no-magic-numbers", rule, {
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
