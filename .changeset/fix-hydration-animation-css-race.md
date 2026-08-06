---
"@effex/dom": patch
---

fix(animation): wait one paint before hydration enter animations

On cold first-load (new tab, no cache), the browser can schedule the
hydration fiber before it finishes parsing/applying stylesheets — either
`<link>` sheets that are still being fetched or Vite dev's JS-injected
styles that haven't been evaluated yet.

When that happened, `runEnterAnimation`'s `forceReflow` captured a
"before" state with no `transition-property` set, then the class swap
happened instantly — the transition-triggering moment passed without
transition-* in effect, `transitionend` never fired, and the animation
system logged the "Animation timeout reached" warning after 5 seconds.
The affected element ended up at its enterTo state with no animation.
Refresh made the problem go away because stylesheets were already cached
and applied synchronously.

`forkSlotEnter` now waits for a single `requestAnimationFrame` on the
hydration path before starting the enter lifecycle. rAF runs just before
the browser's next paint, at which point all pending stylesheet parsing
is complete, so `forceReflow` captures the correct pre-transition state
and the class swap fires a proper transition.

The wait is scoped to hydration only; post-hydration animations (route
changes, list reconciles) don't pay the rAF cost.
