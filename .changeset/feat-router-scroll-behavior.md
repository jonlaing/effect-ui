---
"@effex/router": minor
---

feat(router): configurable scroll behavior with per-route overrides

Adds a `ScrollBehavior` config that mirrors the existing "config at Router, override at Route" pattern (like `Router.fallback` / `Route.meta`). Client-side navigation via `pushPath` / `replacePath` now scrolls to the top by default; individual routes can opt out with `Route.scrollBehavior("preserve")` or take full control with a custom `(from, to) => Effect` function.

```ts
type ScrollBehavior =
  | "top"       // window.scrollTo(0, 0)
  | "preserve"  // no-op
  | ((from: string, to: string) => Effect.Effect<void>);

// Router-level default
Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(BlogRoute),
  Router.scrollBehavior("top"),
);

// Per-route override
Route.make("/photos/:id/detail").pipe(
  Route.render(PhotoDetail),
  Route.scrollBehavior("preserve"),
);
```

Priority: Route override → Router default → framework default (`"top"`).

Popstate is left to the browser's native `history.scrollRestoration = "auto"` — per-history-entry positions are restored correctly on back/forward without fighting the framework. `Navigation` now exposes a `lastSource: Readable<"push" | "replace" | "pop" | null>` for consumers that need to distinguish nav mechanisms.

Removes the unused `Router.MatchOptions.scrollRestoration` field.

Closes #89.
