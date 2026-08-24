---
"@stax-ui/dom": minor
---

feat(dom): add `Screen` — reactive viewport, media queries, and display metrics

New primitive for reading viewport-level state as `Readable`s that
compose with the rest of the reactivity system (`when`, `Readable.map`,
`animated.group`, etc). Mirrors the shape of the browser's `Screen`
interface, with two pragmatic tweaks:

1. `Screen.width` / `Screen.height` return `window.innerWidth` /
   `innerHeight` — the VIEWPORT dimensions, which is what
   responsive-design code actually wants. The physical/logical
   display metrics from `window.screen` live under `Screen.display.*`.

2. Adds `Screen.match(query)` — a `Readable<boolean>` from any
   `matchMedia` query. Closes the gap between viewport-conditional
   JS branches and the rest of the reactivity system.

```ts
import { Screen } from "@stax-ui/dom";

// Reactive viewport (window.innerWidth, updates on resize)
const w = Screen.width;

// Media-query matching — the main API
const isMobile = Screen.match("(max-width: 767px)");
const reducedMotion = Screen.match("(prefers-reduced-motion: reduce)");
const prefersDark = Screen.match("(prefers-color-scheme: dark)");

// Physical display metrics under `.display`
const dpi = Screen.display.width;
const orientation = Screen.display.orientation;
```

**SSR-safe by construction.** On the server there's no `window`, so
every reactive value stays at a sensible default (`0` for dimensions,
`false` for match, `{ type: "landscape-primary", angle: 0 }` for
orientation). `Screen.match` accepts an `initial:` option to override
the boolean default per-query — useful when your SSR bias is known
(portfolio site → mobile-first, ops dashboard → desktop-first). More
sophisticated request-aware SSR defaults will land later via a
Layer-based mechanism (tracked in a separate design issue).

**Scope-clean.** Each Readable's change stream attaches its DOM
event listener when subscribed and removes it when the enclosing
scope closes. No lingering listeners, no leaks across route
navigations.

**Docs guidance to keep in mind.** For purely visual differences
(hide at mobile, different padding), CSS `@media` is strictly better
than `Screen.match` — both branches ship in the HTML for crawlers,
no flash, no JS. `Screen.match` is for cases where the JS branch is
fundamentally different code paths: skipping an animation sequence
branch, deciding whether to mount a heavy component, choosing between
two computed layouts.
