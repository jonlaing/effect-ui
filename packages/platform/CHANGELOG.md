# @effex/platform

## 1.2.4

### Patch Changes

- Updated dependencies [ca78ae9]
- Updated dependencies [aa1dd5e]
- Updated dependencies [edd707f]
- Updated dependencies [4c0c3c4]
  - @effex/dom@1.5.0
  - @effex/router@1.4.0
  - @effex/core@1.2.0

## 1.2.3

### Patch Changes

- Updated dependencies [e3e8157]
  - @effex/core@1.1.2
  - @effex/dom@1.4.1
  - @effex/router@1.3.1

## 1.2.2

### Patch Changes

- bed39a9: Pin `@effex/core` exactly instead of via a caret range. `@effex/platform`'s source used `"@effex/core": "workspace:^"`, which publishes as `^X.Y.Z` — a range. `@effex/dom`, `@effex/router`, and `@effex/form` all use `"workspace:*"` which publishes as the exact current version. The mismatch meant projects installing both `@effex/dom` and `@effex/platform` could end up with two different `@effex/core` copies in `node_modules` when pnpm couldn't hoist to a single satisfying version — and two copies means Effect Context tags (Signal, Readable, ControlCtx, etc.) declared in one copy don't unify with the other, so cross-package interactions break silently.

  Switched to `"workspace:*"`. Now every core bump forces a platform patch bump, which was already the effective behaviour for the other packages, and every published `@effex/platform` will pin the exact `@effex/core` version it was published against — no ambiguity for pnpm to resolve.

  Peer deps on `@effex/dom` and `@effex/router` stay on `workspace:^` — those are peers that the user installs and semver ranges are appropriate.

- 9ba649c: Fix client-side navigation on SSG (static-file-hosted) sites. `makeClientLayer`'s data provider used to unconditionally `fetch(<path>?_data=1)` then `response.json()`, which works with the SSR HTTP handler (that URL returns JSON) but breaks on any static host — static file servers ignore the query string and return the target page's HTML shell. `response.json()` then threw, `Effect.orDie` killed the fiber silently, and the Outlet went blank while the URL updated (no error surfaced in the console).

  Now the provider inspects the response's Content-Type. On `application/json` it parses as before. On anything else it treats the response as HTML, extracts the `window.__EFFEX_DATA__` blob that `generateDocument` embeds in every SSG'd page, and returns that. The escapes emitted by `serializeForHtml` (`<`, `>`, `&`) are JSON-safe, so `JSON.parse` on the extracted string round-trips cleanly.

  No config change required — SSG projects using `Platform.makeClientLayer(router)` should just start navigating correctly after upgrading.

  Also: added `console.error` logging before the provider's `Effect.orDie` guard so a genuinely failed fetch (network error, malformed response, etc.) surfaces in the browser console instead of dying silently. If the HTML fallback runs but no `__EFFEX_DATA__` blob is present, that's logged as a `console.warn` — non-fatal but useful for catching broken builds.

- Updated dependencies [8b07d3d]
  - @effex/dom@1.3.1
  - @effex/router@1.2.6

## 1.2.1

### Patch Changes

- d153d3a: Surface SSG support in package documentation: add a Rendering Modes overview and a dedicated Static Site Generation section to the top-level README, give SSG equal billing with SSR in `@effex/platform`'s README (including a full Quick Start, `buildStaticSite` API reference, and `BuildStaticSiteOptions` shape), and document the SSG template, `--ssg` flag, project structure, and build commands in `create-effex`'s README. No code changes.
- Updated dependencies [2e2670e]
  - @effex/dom@1.1.1
  - @effex/router@1.2.1

## 1.2.0

### Minor Changes

- 9c3fb19: added meta combinator to be able to change title and description of routes

### Patch Changes

- Updated dependencies [9c3fb19]
  - @effex/router@1.2.0

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

### Patch Changes

- Updated dependencies [5023cff]
  - @effex/router@1.1.0
  - @effex/core@1.1.0
  - @effex/dom@1.1.0

## 1.0.0

### Patch Changes

- 17d0b29: Major refactor to improve DX and code cleanliness
- Updated dependencies [8c68479]
- Updated dependencies [17d0b29]
  - @effex/core@1.0.0
  - @effex/dom@1.0.0
  - @effex/router@1.0.0
