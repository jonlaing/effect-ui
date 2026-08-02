---
"@effex/dom": patch
---

Fix `enterFrom` classes being stripped during hydration for controls
with `intro: true`, causing every intro animation on an SSR-rendered
page to stall until the 5s timeout.

`HydrationRenderer.setAttribute` overwrote whatever was on the DOM node
with the value from the element factory. That's fine for most
attributes — SSR and hydration emit the same value — but SSR augments
the `class` attribute for intro-flagged controls: `SSRControlCtx.addSlot`
appends `enterFrom` classes on top of the developer's `class` value
(`toggleClass(element, cls, true)`) so the browser paints the pre-
animation state on first render. When hydration ran, the element
factory's `setAttribute("class", <developer value>)` erased those extras
— by the time `onBeforeEnter` fired the class was back to just the
developer's value, `enterTo` set the property to a value it already had,
no `transitionend` fired, and the animation stalled for 5s.

Fix: HydrationRenderer's `setAttribute` for `class` now **merges** the
developer's classes into what's already there instead of overwriting.
SSR/hydration render the same tree, so the developer's classes should
be a subset of what SSR emitted anyway; the only difference is the SSR
extras we want to preserve. Other attributes still write through as
before.

Regression test in `hydrate.test.ts` covers the exact reported shape:
`animated({ intro: true, animate: { enterFrom: "opacity-0", ... }, ... })`
inside a `when` toggle, hydrate, snapshot `onBeforeEnter`'s class list,
then toggle away and back and snapshot again. Both snapshots must
contain `opacity-0`. Additional cover in `Control.test.ts` locks in the
pure client-mode re-mount path.
