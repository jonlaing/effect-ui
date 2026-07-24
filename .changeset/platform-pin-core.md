---
"@effex/platform": patch
---

Pin `@effex/core` exactly instead of via a caret range. `@effex/platform`'s source used `"@effex/core": "workspace:^"`, which publishes as `^X.Y.Z` — a range. `@effex/dom`, `@effex/router`, and `@effex/form` all use `"workspace:*"` which publishes as the exact current version. The mismatch meant projects installing both `@effex/dom` and `@effex/platform` could end up with two different `@effex/core` copies in `node_modules` when pnpm couldn't hoist to a single satisfying version — and two copies means Effect Context tags (Signal, Readable, ControlCtx, etc.) declared in one copy don't unify with the other, so cross-package interactions break silently.

Switched to `"workspace:*"`. Now every core bump forces a platform patch bump, which was already the effective behaviour for the other packages, and every published `@effex/platform` will pin the exact `@effex/core` version it was published against — no ambiguity for pnpm to resolve.

Peer deps on `@effex/dom` and `@effex/router` stay on `workspace:^` — those are peers that the user installs and semver ranges are appropriate.
