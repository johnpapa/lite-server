# lite-server — Agent Guide

lite-server is a lightweight development-only Node.js server that wraps [BrowserSync](https://www.browsersync.io/) with HTML5 history API fallback for serving single-page applications. It is published to npm as `lite-server` and exposes a CLI binary.

## Repository Structure

```
lite-server/
├── bin/lite-server           # CLI entry point (#!/usr/bin/env node)
├── lib/
│   ├── config-defaults.js    # Default BrowserSync config (middleware, file globs, watchOptions)
│   └── lite-server.js        # Core logic: load config, merge overrides, launch BrowserSync
├── index.js                  # Public API — exports { server, defaults }
├── test/
│   ├── lite-server.spec.js   # Tests for config merging, missing config, function config
│   └── config-defaults.spec.js # Tests for default middleware and options
├── .eslintrc.json            # ESLint config (eslint:recommended + strict rules)
├── package.json              # npm metadata, scripts, dependencies
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT
└── README.md                 # Usage, custom configuration, contributing
```

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js (CommonJS modules, `'use strict'`) |
| Core dependency | `browser-sync` — static server, live reload, CSS injection |
| Middleware | `connect-history-api-fallback` (SPA route fallback), `connect-logger` |
| Config merge | `lodash.merge` — deep-merges user `bs-config.{js,json}` over defaults |
| CLI args | `minimist` — parses `-c`/`--config` and `--baseDir` flags |
| Linting | ESLint with strict rule set (`.eslintrc.json`) |
| Testing | Mocha + Sinon + Mockery + Istanbul |

## How It Works

1. **`bin/lite-server`** — Sets `process.title` and calls `require('../lib/lite-server')()`.
2. **`lib/config-defaults.js`** — Exports a BrowserSync options object with sensible SPA defaults: file watching globs, `connect-logger` and `connect-history-api-fallback` middleware, `injectChanges: false` (Angular 2 workaround).
3. **`lib/lite-server.js`** — The core `start(opts, cb)` function:
   - Parses CLI args with `minimist` to find the config file name (`-c` / `--config`, default `bs-config`).
   - Attempts to `require()` the user's `bs-config.{js,json}`. Logs info if not found; throws on other errors.
   - If the user config is a function, calls it with the BrowserSync instance and uses the return value.
   - Deep-merges user overrides into defaults via `_.merge(config, overrides)`.
   - Compacts `server.middleware` with `_.compact()` to handle `null` entries (middleware removal pattern).
   - Calls `browserSync.init(config, cb)`.

## Build & Run

```bash
npm install          # Install dependencies
npm test             # Run ESLint + Mocha tests with Istanbul coverage
```

There is no build step — this is plain CommonJS JavaScript.

**To test the CLI locally:**

```bash
node bin/lite-server                           # Serve current directory
node bin/lite-server -c path/to/bs-config.js   # Custom config
node bin/lite-server --baseDir=dist             # Custom base directory
```

## Testing

Tests use **Mocha** with **Mockery** for module mocking and **Sinon** for stubs/spies.

```bash
npm test   # eslint *.js lib/*.js && istanbul cover _mocha -- -R spec
```

Key test patterns:
- `mockery.enable({ useCleanCache: true })` isolates each test from module cache
- `mockery.registerMock(...)` replaces `browser-sync`, `connect-history-api-fallback`, etc.
- `mockery.registerAllowables([...])` whitelists real modules that should not be mocked
- `afterEach` calls `mockery.deregisterAll()` and `mockery.disable()` for cleanup
- Assertions use Node's built-in `assert` module (not Chai)

## Adding a New Feature

### Understanding the Config Merge Logic

The config merge in `lib/lite-server.js` is the core extension point:

1. **Defaults** are defined in `lib/config-defaults.js` — this is the base object.
2. **User overrides** come from `bs-config.{js,json}` in the user's project root (or a custom path via `-c`).
3. `_.merge(config, overrides)` performs a deep merge — nested objects are merged recursively, arrays are merged by index.
4. **Middleware removal**: Users can set a middleware index to `null` in their override, and `_.compact()` strips those out. This lets users remove default middleware (e.g., `{ server: { middleware: { 0: null } } }` removes `connect-logger`).

### Steps to Add a Feature

1. **Modify the appropriate file:**
   - New CLI flag → `lib/lite-server.js` (add to `minimist` parsing, apply before merge)
   - New default behavior → `lib/config-defaults.js` (add to the exported options object)
   - New public API → `index.js` (exports `{ server, defaults }`)

2. **Write tests** in `test/` following existing patterns:
   - Use Mockery to isolate module dependencies
   - Stub BrowserSync with `sinon.stub()`
   - Assert merged config with `browserSyncMethodStubs.init.calledWithMatch({...})`

3. **Run checks:**
   ```bash
   npm test   # ESLint + Mocha + Istanbul
   ```

4. **Update documentation:**
   - `README.md` — usage examples, configuration options
   - `CHANGELOG.md` — version history entry

### Common Pitfalls

- **`config-defaults.js` exports a mutable singleton** — the defaults object is `require()`'d once and mutated in place by `_.merge()`. Tests must use `mockery` with `useCleanCache: true` to avoid cross-test contamination.
- **Middleware is merged by index, not appended** — `_.merge` treats the middleware array as an object with numeric keys. Setting index `0` to `null` removes the first middleware; `_.compact()` cleans up.
- **`--baseDir` is applied before the merge** — `config.server.baseDir = argv.baseDir || config.server.baseDir` runs before `_.merge(config, overrides)`, so user config file values for `baseDir` will override the CLI flag.
