---
"@effex/dom": patch
---

Fix the FOUC on `intro: true`. When a control (`each`, `when`, `match`, ...) opts into re-animating SSR/SSG-rendered content on hydration, the SSR renderer now emits the `enterFrom` classes on each rendered slot's element. That way the browser paints the pre-animation state (e.g. `opacity-0`) before hydration runs, and the enter animation transitions from there to the final state — instead of showing a flash of the final state, then jumping back to the pre-animation state, then animating in.

Only applies when `intro: true` is set. Ordinary (non-intro) SSR output continues to render the final state directly, since those controls don't re-animate on hydration.
