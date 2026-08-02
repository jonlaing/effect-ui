---
"@effex/dom": patch
---

Short-circuit enter/exit animations when the element has no CSS
transition or animation that will ever fire an `animationend` /
`transitionend` event. Previously stalled for the full timeout (default
5s) — surfacing as a "missing transition property" warning in dev and
a visible FOUC on re-mount in production.

The gate in `waitForAnimationEvent` used to check:

- `animationName !== "none"`
- `transitionDuration !== "0s"` (exact string comparison)

That treated three common cases as "animation is running":

1. `transition-property: none` with a non-zero `transition-duration`
   (e.g., a base class sets duration, an override kills the property).
   No transition fires.
2. Comma-separated `transition-duration` where every entry is zero
   (`"0s, 0s"`). The `!== "0s"` check evaluates truthy but nothing fires.
3. Element carrying an infinite CSS animation (e.g., Tailwind's
   `animate-pulse`) at intro time. `animationName` is a real keyframe
   name and `animationDuration` is positive, but `animation-iteration-
   count: infinite` means `animationend` never fires.

New helpers `maxDurationSeconds` (parses comma lists),
`hasCompletingAnimation` (name + positive duration + finite iterations),
and `hasTransitionThatWillFire` (property !== "none" + positive
duration) replace the ad-hoc string checks. Regression tests cover all
three cases and lock in that finite animations/transitions still wait
correctly.

Also fixes a listener leak in the same function: interruption (e.g.,
navigating away mid-animation) used to only cancel the pending
`requestAnimationFrame` — if the RAF had already fired and set up
`animationend`/`transitionend` listeners plus a timeout, the interrupt
left them dangling on the unmounted element. Cancellation now runs the
same cleanup path a successful resolution would.
