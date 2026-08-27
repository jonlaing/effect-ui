# Changelog

## 0.5.1

### Patch Changes

- 9142686: fix: reclassify internal `@stax-ui/*` deps as regular deps (not peers)

  `@stax-ui/platform` previously declared `@stax-ui/dom` and
  `@stax-ui/router` as peer dependencies; `@stax-ui/vite-plugin`
  declared `@stax-ui/platform` as an optional peer. This tripped the
  changesets "peer dep out of range → major bump" rule every time
  `dom` (or anything downstream) got a minor bump, silently inflating
  `platform` and `vite-plugin` past 1.0 before Stax is genuinely ready
  to signal API stability.

  Reclassified both to regular `dependencies`. Consequences:

  - `platform` now installs `dom` and `router` alongside itself.
    Users who also install those directly get the same version deduped
    by pnpm/npm.
  - `vite-plugin` installs `platform` unconditionally instead of the
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

- Updated dependencies [9142686]
  - @stax-ui/platform@0.5.1

## 0.5.0

### Patch Changes

- @stax-ui/platform@0.5.0

## 2.0.0

> **⚠ Published in error and deprecated on npm.** This version was
> released while the rest of the `@stax-ui/*` family was still at
> `0.x`, falsely implying API stability. Rewound to the `0.x` track
> starting with `0.4.0` — see the [version rewind PR][rewind] for
> the reasoning. Any consumer on `1.x` or `2.x` should downgrade to
> the latest `0.x`.
>
> [rewind]: https://github.com/stax-ui/stax/pull/125

### Patch Changes

- @stax-ui/platform@2.0.0

## 1.0.0

> **⚠ Published in error and deprecated on npm.** See the note on
> `2.0.0` above.

### Minor Changes

- 4bc4315: chore: relicense from MIT to Mozilla Public License 2.0

  Stax is now distributed under [MPL 2.0](../LICENSE). Nothing about how
  you _use_ Stax changes — commercial and proprietary projects can
  continue to depend on it freely, at any license. What changes is what
  happens when someone _modifies_ Stax's own source files: those
  modifications must be released under MPL 2.0. In short:

  - **Depend on Stax** — any license, including proprietary. No change.
  - **Fork or patch Stax itself** — those source files, and any files
    that contain Covered Software, must be released under MPL 2.0.

  MPL 2.0 is file-level copyleft. It does not "infect" downstream apps
  the way GPL / AGPL do; the boundary is at the file, not at the linked
  program. Adobe, Cisco, and Mozilla itself ship products using
  MPL 2.0-licensed components without opening the enclosing code.

  The intent: guarantee that Stax stays open source in perpetuity, and
  that no single party — including the current maintainer — can take
  the framework closed and start charging for it. Combined with the
  project's inbound = outbound contribution model (contributors retain
  copyright and license their work under the project's license), a
  future relicensing to a closed-source arrangement is effectively
  impossible once multiple contributors are involved.

  Every package version published at `0.1.x` was released under MIT and
  remains MIT forever — irrevocable per license terms. This changeset
  covers the switch to MPL 2.0 for `0.2.0` and onward. If you have
  downstream code that depends on the MIT permissive terms for a
  particular reason, you can pin to a `0.1.x` version indefinitely; the
  tags remain on npm.

### Patch Changes

- Updated dependencies [4bc4315]
  - @stax-ui/platform@1.0.0

## 0.1.0

Initial release. Renamed from the `@effex/*` scope.
