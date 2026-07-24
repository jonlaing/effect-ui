---
"@effex/platform": patch
---

Fix client-side navigation on SSG (static-file-hosted) sites. `makeClientLayer`'s data provider used to unconditionally `fetch(<path>?_data=1)` then `response.json()`, which works with the SSR HTTP handler (that URL returns JSON) but breaks on any static host — static file servers ignore the query string and return the target page's HTML shell. `response.json()` then threw, `Effect.orDie` killed the fiber silently, and the Outlet went blank while the URL updated (no error surfaced in the console).

Now the provider inspects the response's Content-Type. On `application/json` it parses as before. On anything else it treats the response as HTML, extracts the `window.__EFFEX_DATA__` blob that `generateDocument` embeds in every SSG'd page, and returns that. The escapes emitted by `serializeForHtml` (`<`, `>`, `&`) are JSON-safe, so `JSON.parse` on the extracted string round-trips cleanly.

No config change required — SSG projects using `Platform.makeClientLayer(router)` should just start navigating correctly after upgrading.
