---
"@stax-ui/platform": patch
"@stax-ui/vite-plugin": patch
---

fix: reclassify internal `@stax-ui/*` deps as regular deps (not peers)

`@stax-ui/platform` previously declared `@stax-ui/dom` and
`@stax-ui/router` as peer dependencies; `@stax-ui/vite-plugin`
declared `@stax-ui/platform` as an optional peer. This tripped the
changesets "peer dep out of range → major bump" rule every time
`dom` (or anything downstream) got a minor bump, silently inflating
`platform` and `vite-plugin` past 1.0 before Stax is genuinely ready
to signal API stability.

Reclassified both to regular `dependencies`. Consequences:

* `platform` now installs `dom` and `router` alongside itself.
  Users who also install those directly get the same version deduped
  by pnpm/npm.
* `vite-plugin` installs `platform` unconditionally instead of the
  optional-peer arrangement. The SSG-only dynamic import in
  `plugin.ts` still keeps platform out of the runtime graph for SPA
  builds, so the cost is a devDep install, not a bundle inflation.

Also dropped the redundant `@stax-ui/core` direct dep from
`platform`. Since `@stax-ui/dom` re-exports everything from core
(`export * from "@stax-ui/core"`), platform can source the couple of
core-native symbols it uses (`AsyncCache`, `RendererContext`, etc.)
through dom's barrel. One fewer dep edge to maintain.

Long-term, once we're planning a coordinated 1.0 across every
`@stax-ui/*` package, the peer-dep model may make sense again — but
by then we can also opt into a wider peer range that doesn't collide
with pre-1.0 minor bumps.
