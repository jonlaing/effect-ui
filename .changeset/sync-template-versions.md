---
"create-effex": patch
---

Sync `@effex/*` dependency versions in scaffolded templates with the current workspace versions. Previously templates pinned `@effex/dom`, `@effex/router`, `@effex/platform`, and `@effex/vite-plugin` to `^0.0.1`, which (under semver's strict caret behavior for `0.x.x`) resolved to long-obsolete pre-1.0 versions. Generated projects now reference the current major (e.g. `^1.1.0` / `^1.2.0`).

Adds `scripts/sync-template-versions.mjs` and wires it into the Changesets `version` script so template versions track workspace versions automatically on every release.
