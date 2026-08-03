---
"@effex/dom": patch
---

Fix enter animations firing against a detached element on nested
client-mode re-mounts (e.g. router nav-back on pages with animations
deep inside the route's tree).

`forkSlotEnter` forks the animation fiber via `Effect.forkIn(slotScope)`
from inside `addSlot`. Effect's scheduler can hand that fiber control
on the next microtask, before the outer synchronous render flow has
finished appending the wrapper's ancestor chain into the document.
When that happens, `onBeforeEnter` fires against a node whose ancestors
aren't yet in the DOM — `getComputedStyle` returns empty strings on
disconnected nodes, and browsers won't compute or transition styles
against them, so the enter transition never fires and the animation
stalls to the timeout.

On first render this didn't surface because hydration walks pre-existing
DOM: every element was already connected when the fiber ran. It only
broke on subsequent client-mode mounts, and only when the animated
block sat inside another wrapper element (its own ancestor had to be
appended AFTER the fork).

The animation fiber now yields microtasks until the element is
connected, up to a small bound. In practice the outer flow completes
within one or two microtasks; the bound ensures callers that never
insert their result (e.g. tests that yield an animated element without
appending it to the document) still make progress instead of hanging.

Regression test in `Control.test.ts` asserts `element.isConnected` is
true at `onBeforeEnter` on both the initial mount AND the toggle-back
of a `when`-nested animated block that lives two wrappers deep.
