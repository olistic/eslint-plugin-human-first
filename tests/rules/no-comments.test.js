import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import rule from "../../rules/no-comments.js";

const tester = new RuleTester();

describe("no-comments", () => {
  it("reports regular comments", () => {
    tester.run("no-comments", rule, {
      valid: [],
      invalid: [
        {
          code: "// This is a regular comment\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
        {
          code: "/* block comment */\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
      ],
    });
  });

  it("reports eslint directives", () => {
    tester.run("no-comments", rule, {
      valid: [],
      invalid: [
        {
          code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
        {
          code: "/* eslint-disable no-unused-vars */\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
        {
          code: "/* global jQuery */\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
      ],
    });
  });

  it("reports TypeScript directives", () => {
    tester.run("no-comments", rule, {
      valid: [],
      invalid: [
        {
          code: "// @ts-ignore\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
        {
          code: "// @ts-expect-error\nconst x = 1;",
          output: "\nconst x = 1;",
          errors: [{ messageId: "unexpected" }],
        },
      ],
    });
  });

  it("allows comments matching allowed prefixes", () => {
    tester.run("no-comments", rule, {
      valid: [
        {
          code: "// TODO: fix this later\nconst x = 1;",
          options: [{ allow: ["TODO", "FIXME"] }],
        },
        {
          code: "// FIXME: broken\nconst x = 1;",
          options: [{ allow: ["TODO", "FIXME"] }],
        },
      ],
      invalid: [
        {
          code: "// some other comment\nconst x = 1;",
          output: "\nconst x = 1;",
          options: [{ allow: ["TODO"] }],
          errors: [{ messageId: "unexpected" }],
        },
      ],
    });
  });

  it("reports multiple comments", () => {
    tester.run("no-comments", rule, {
      valid: [],
      invalid: [
        {
          code: "// first\n// second\nconst x = 1;",
          output: "\n\nconst x = 1;",
          errors: [
            { messageId: "unexpected" },
            { messageId: "unexpected" },
          ],
        },
      ],
    });
  });

  it("works with no options (disallows everything)", () => {
    tester.run("no-comments", rule, {
      valid: ["const x = 1;"],
      invalid: [],
    });
  });
});
