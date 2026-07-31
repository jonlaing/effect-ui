---
"@effex/dom": patch
---

Fix client-mount FOUC for animated elements. On any fresh client-side mount (a new `addSlot` outside the hydration path — e.g. navigating away from a page and back), the element was inserted into the DOM *before* its `enterFrom` classes were applied. The browser painted the resolved final state for one frame, then `forkSlotEnter`'s forked fiber applied `enterFrom` and ran the transition — producing a "already present, then animation runs" flash.

SSR-then-hydration didn't have this problem because the SSG'd HTML bakes `enterFrom` classes into the initial paint. Client mounts didn't get the same guarantee.

Now every client-mode `addSlot` (in `ClientControlCtx`, `createClientLikeControlCtx`'s post-hydration branch, and `createHydrationControlCtx`'s client-fallback branch) calls a new synchronous helper `applyPreInsertEnterFrom` that applies the configured `enterFrom` classes *before* `insertBefore`. First paint of the element is now in the hidden pre-animation state; `runEnterAnimation` inside `forkSlotEnter` still re-applies them (no-op via `classList.add`), reflows, and swaps to `enter`/`enterTo` as before.
