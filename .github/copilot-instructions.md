# Copilot Instructions — lite-server

## Project Overview

lite-server is a lightweight npm CLI tool that wraps BrowserSync with HTML5 history API fallback for serving SPAs during development. It has no build step — just plain CommonJS JavaScript.

## Code Conventions

### JavaScript

- All files start with `'use strict';`
- CommonJS modules (`require` / `module.exports`) — no ES modules
- Single quotes for strings
- 2-space indentation
- Semicolons required
- `const` preferred; `let` when reassignment is needed; avoid `var`
- camelCase for variables and functions
- Arrow callbacks preferred (`prefer-arrow-callback` enforced)
- No ternary operators (`no-ternary` enforced)
- 1TBS brace style
- Max line length: 100 characters (URLs excluded)
- Full ESLint config in `.eslintrc.json` — run `npm test` to check

### File Organization

| Directory | Purpose |
|---|---|
| `bin/` | CLI entry point — minimal, just sets `process.title` and calls `lib/lite-server` |
| `lib/` | Core logic — `config-defaults.js` (BrowserSync defaults) and `lite-server.js` (merge + launch) |
| `test/` | Mocha specs — one spec file per lib module |
| `index.js` | Public API for programmatic use: `{ server, defaults }` |

### Testing Patterns

- **Framework**: Mocha with Node's built-in `assert` (not Chai)
- **Mocking**: Mockery for module replacement, Sinon for stubs/spies
- **Coverage**: Istanbul (`istanbul cover _mocha -- -R spec`)
- **Isolation**: Every test uses `mockery.enable({ useCleanCache: true })` and cleans up in `afterEach`
- **Naming**: `test/<module-name>.spec.js`
- **Assertions**: Use `assert.ok()`, `assert.strictEqual()`, `assert.deepEqual()`, and Sinon matchers like `calledWithMatch()`

When writing new tests:
```js
/* global it, describe, beforeEach, afterEach */
'use strict';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');

describe('module-name', () => {
  beforeEach(() => {
    mockery.enable({ useCleanCache: true });
    // Register mocks
    mockery.registerAllowables(['../lib/module-name']);
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should do something', () => {
    const mod = require('../lib/module-name');
    // assertions
  });
});
```

## Build & Test Commands

```bash
npm install   # Install dependencies
npm test      # ESLint lint + Mocha tests with Istanbul coverage
```

There is no build step, compile step, or watch mode for development.

## Maintenance Matrix

| When this changes… | Also update… |
|---|---|
| `bin/lite-server` (CLI flags or behavior) | `README.md` (usage section), `CHANGELOG.md` |
| `lib/config-defaults.js` (default options) | `README.md` (configuration section), `test/config-defaults.spec.js`, `CHANGELOG.md` |
| `lib/lite-server.js` (merge logic, new flags) | `test/lite-server.spec.js`, `README.md`, `CHANGELOG.md` |
| `index.js` (public API exports) | `README.md` (if API usage is documented), `CHANGELOG.md` |
| `package.json` (dependencies, version) | `CHANGELOG.md`, verify `npm test` passes |
| `.eslintrc.json` (lint rules) | Verify `npm test` passes, consider updating this file |
| Any version bump | `package.json` (version), `CHANGELOG.md` (new entry) |

## Key Architecture Details

- **Config merging** uses `lodash.merge()` for deep merge of user `bs-config` over defaults
- **Middleware removal** works via `null` entries + `_.compact()` — users set an array index to `null` to remove a default middleware
- **`config-defaults.js` is a mutable singleton** — it is `require()`'d once and mutated in place. Tests must use Mockery's `useCleanCache` to avoid leaking state
- **`--baseDir` CLI flag** is applied _before_ the merge, so `bs-config` values will override it
