---
"@stax-ui/router": patch
---

fix(router): exact route beats catch-all when both match the same URL

`/docs/*` was scoring higher in `routeSpecificity` than `/docs`, so
for the URL `/docs` the router preferred the catch-all route and
handed rendering code a match with an empty `*` capture. Callers
who set up an exact route alongside a sibling catch-all (a common
docs-shell pattern — `/docs` for the index, `/docs/*` for individual
pages) got the wrong render.

Catch-all segments now contribute `-1` to specificity instead of
`+1`. A static-only route always beats a same-length catch-all one
when both match; a longer catch-all route still beats a shorter
one that doesn't match at all.

Purely additive behavior change — routes that don't have a sibling
catch-all match the same URLs as before.
