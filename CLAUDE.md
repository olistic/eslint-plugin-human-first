# CLAUDE.md

## Project

ESLint plugin (flat config, v9+). Zero runtime dependencies. Plain JavaScript, ESM.

## Commands

- `npm test` — run all tests (`node --test tests/**/*.test.js`)

## Structure

```
index.js          — plugin entry, exports rules + recommended config
rules/            — one file per custom rule (no-comments, no-magic-values)
tests/rules/      — unit tests per rule using RuleTester
tests/integration.test.js — end-to-end test with Linter API
```

## Conventions

- ESM throughout (`import`/`export`, no `require`)
- Tests use `node:test` and `eslint`'s `RuleTester` — no test framework dependencies
- Every rule must have `meta.type`, `meta.docs` (with `description`, `url`, `recommended`), `meta.schema`, `meta.defaultOptions`, and `meta.messages`
- Rules use `messageId`-based reporting exclusively — no inline message strings
- Fixable rules must set `meta.fixable` and every invalid test case must include `output`
- Keep the plugin zero-dependency — configure built-in ESLint rules in the recommended config instead of adding npm packages
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
