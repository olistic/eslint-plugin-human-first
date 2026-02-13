import { readFileSync } from "node:fs";
import noComments from "./rules/no-comments.js";
import noMagicValues from "./rules/no-magic-values.js";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules: {
    "no-comments": noComments,
    "no-magic-values": noMagicValues,
  },
  configs: {},
};

Object.assign(plugin.configs, {
  recommended: {
    name: "human-first/recommended",
    plugins: {
      "human-first": plugin,
    },
    rules: {
      "human-first/no-comments": ["error"],
      "human-first/no-magic-values": [
        "error",
        {
          ignoreNumbers: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
      "max-lines-per-function": [
        "error",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "error",
        { max: 250, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["error", { max: 2 }],
    },
  },
});

export default plugin;
