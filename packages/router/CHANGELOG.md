# Changelog

## 0.2.1

### Patch Changes

- 2b59417: fix(router): exact route beats catch-all when both match the same URL

  `/docs/*` was scoring higher in `routeSpecificity` than `/docs`, so
  for the URL `/docs` the router preferred the catch-all route and
  handed rendering code a match with an empty `*` capture. Callers
  who set up an exact route alongside a sibling catch-all (a common
  docs-shell pattern — `/docs` for the index, `/docs/*` for individual
  pages) got the wrong render.

  Catch-all segments now contribute `-1` to specificity instead of
  `+1`. A static-only route always beats a same-length catch-all one
  when both match; a longer catch-all route still beats a shorter
  one that doesn't match at all.

  Purely additive behavior change — routes that don't have a sibling
  catch-all match the same URLs as before.

- Updated dependencies [db36abb]
- Updated dependencies [5b11e9d]
  - @stax-ui/dom@0.3.0

## 0.2.0

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
  - @stax-ui/core@0.2.0
  - @stax-ui/dom@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [7bd0248]
  - @stax-ui/dom@0.1.1

## 0.1.0

Initial release. Renamed from the `@effex/*` scope.
