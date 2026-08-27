---
"@stax-ui/dom": minor
---

BREAKING: unify `runApp` + `mount` into a single `mount` for SPA startup

(Marked `minor` — Stax is still pre-1.0, so we're using minor bumps
for breaking changes. Once we hit `1.0.0` this would be `major`.)

`runApp` is removed. Its responsibilities — providing `SignalRegistry`,
merging caller layers, keeping the fiber alive via `Effect.never`, and
pumping into a Promise — fold into `mount`. The new signature mirrors
`hydrate`, so the two SPA entry points read as parallel intents rather
than two different plumbing shapes:

```ts
// SPA
mount(App(), root, { layers: Navigation.makeLayer(router) });

// SSR + hydration
hydrate(App(), root, { layers: Navigation.makeLayer(router) });
```

## Migration

Before:

```ts
import { mount, runApp } from "@stax-ui/dom";

runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!);
  }),
);
```

After:

```ts
import { mount } from "@stax-ui/dom";

mount(App(), document.getElementById("root")!);
```

With a layer:

```ts
// Before
runApp(mount(App(), root), { layer: Navigation.makeLayer(router) });

// After
mount(App(), root, { layers: Navigation.makeLayer(router) });
```

Note that `options.layer` (singular) becomes `options.layers` (plural),
matching `hydrate`. Compose multiple layers with `Layer.merge` or
`Layer.mergeAll` as before.

## Why

Every SPA in-tree did the same `runApp(Effect.gen(function* () { yield*
mount(App(), root) }))` dance — an `Effect.gen` wrapper that did one
thing. The two-function form pushed a plumbing decision on every user
of `mount` (they always chose the same one) and made SPA startup read
differently than SSR hydration for no gained expressive power.

The returned Promise from `mount` never resolves — this is intentional
and matches the previous behavior of `runApp`. Mount is a terminal
operation; it stakes out the fiber that owns the page's reactive
lifetime.
