---
"@stax-ui/router": patch
---

fix(router): `scrollBehavior: "top"` now targets the outlet's nearest scrollable ancestor

`"top"` used to call `window.scrollTo(0, 0)` unconditionally, which
only works when the document is the scroll root. Apps that scroll
inside a nested `overflow-y: auto` container — the common `100vh` app
shell shape — got no scroll reset on navigation, because
`window.scrollTo` is a no-op there.

The router now walks up from the Outlet's own container element and
scrolls the first ancestor whose vertical overflow can actually
scroll (`overflow-y: auto | scroll` AND `scrollHeight > clientHeight`).
If the walk finds nothing scrollable — the classic
document-is-the-scroller layout — it falls back to `window.scrollTo`,
so existing window-scrolled apps keep behaving identically.

The `scrollHeight > clientHeight` check matters: it skips wrappers
that *declare* scrolling but have no overflow at the moment. Without
it, an outer shell with `overflow: auto` and a currently-short child
would shadow the real page scroller further up the tree.

For layouts where the auto-detected container picks wrong — say,
multiple scroll roots and you want to reset a specific one — the
existing custom `(from, to) => Effect` variant is the escape hatch;
no new API surface added.
