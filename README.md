# eslint-plugin-human-first

ESLint rules that keep AI-generated code readable by humans.

AI coding agents produce code that works but is hard to read: over-commented, long functions, magic values, too many parameters. Documentation hints get ignored. Linter errors don't.

Inspired by [ESLint as AI Guardrails: The Rules That Make AI Code Readable](https://medium.com/@albro/eslint-as-ai-guardrails-the-rules-that-make-ai-code-readable-8899c71d3446).

## Install

```sh
npm install eslint-plugin-human-first --save-dev
```

## Usage

Add the recommended config to your `eslint.config.js`:

```js
import humanFirst from "eslint-plugin-human-first";

export default [
  humanFirst.configs.recommended,
];
```

That's it. One import, five rules, all at `error` severity.

## Rules

The recommended config enables:

| Rule | Source | Fixable | What it catches |
|------|--------|---------|-----------------|
| [`human-first/no-comments`](#no-comments) | custom | yes | AI over-explains with comments |
| [`human-first/no-magic-values`](#no-magic-values) | custom | | Hardcoded numbers and strings |
| [`max-params`](https://eslint.org/docs/latest/rules/max-params) | built-in | | Too many function parameters |
| [`max-lines-per-function`](https://eslint.org/docs/latest/rules/max-lines-per-function) | built-in | | Functions that are too long |
| [`max-lines`](https://eslint.org/docs/latest/rules/max-lines) | built-in | | Files that are too long |

### Recommended defaults

```js
{
  "human-first/no-comments": "error",
  "human-first/no-magic-values": ["error", {
    ignoreNumbers: [-1, 0, 1],
    ignoreArrayIndexes: true,
    ignoreDefaultValues: true
  }],
  "max-params": ["error", { max: 2 }],
  "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
  "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }]
}
```

---

### `no-comments`

Disallow all comments. Code should be self-documenting.

This rule is strict by design: it also catches ESLint directives (`eslint-disable`), TypeScript directives (`@ts-ignore`), and JSDoc. If the code needs a comment to be understood, it needs to be refactored.

**Fixable:** Yes, `--fix` removes the comment.

#### Options

```json
{ "allow": ["TODO", "FIXME"] }
```

`allow` is an array of prefixes. Any comment starting with a listed prefix is permitted.

#### Examples

```js
// bad
const x = 1; // increment counter

// bad
// eslint-disable-next-line no-unused-vars
const y = 2;

// good (with allow: ["TODO"])
// TODO: handle edge case
const z = 3;
```

---

### `no-magic-values`

Disallow magic numbers **and strings** that should be named constants. Extends the concept of ESLint's built-in `no-magic-numbers` to also catch string literals.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ignoreNumbers` | `number[]` | `[-1, 0, 1]` | Numbers that are always allowed |
| `ignoreArrayIndexes` | `boolean` | `true` | Allow numbers as array indexes (`arr[0]`) |
| `ignoreDefaultValues` | `boolean` | `true` | Allow literals in default parameter values |

#### Automatically ignored

The rule is smart about context. These are never reported:

- Values in `const` declarations (`const TIMEOUT = 3000`)
- Import/export paths (`import x from "foo"`)
- `require()` arguments
- Object literal keys (`{ "content-type": value }`)
- Empty strings
- TypeScript enum members and type annotations
- JSX attribute values
- Expression statements (`"use strict"`)

#### Examples

```js
// bad
if (status === 200) {}
let role = "admin";
setTimeout(fn, 3000);

// good
const STATUS_OK = 200;
const ROLE_ADMIN = "admin";
const TIMEOUT_MS = 3000;

if (status === STATUS_OK) {}
let role = ROLE_ADMIN;
setTimeout(fn, TIMEOUT_MS);
```

## Overriding rules

You can override any rule after the recommended config:

```js
import humanFirst from "eslint-plugin-human-first";

export default [
  humanFirst.configs.recommended,
  {
    rules: {
      "human-first/no-comments": ["error", { allow: ["TODO", "FIXME"] }],
      "max-params": ["error", { max: 3 }],
    },
  },
];
```

## Requirements

- ESLint >= 9 (flat config)
- Node.js ^18.18.0 || ^20.9.0 || >=21.1.0

## License

MIT
