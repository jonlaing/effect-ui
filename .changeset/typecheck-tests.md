---
"@effex/dom": patch
---

Fix the `renderToString` return-type inference so provided dependencies (`RendererContext`, `ControlCtx`, `SuspenseBoundaryCtx`, `Scope`) are properly subtracted from the output `R`. Previously the signature used `Deps | R`, which TypeScript can't do set-subtraction from, so those tags leaked into the returned Effect's requirements — callers whose element required `Scope` (from `Signal.make`) or the other provided tags saw them appear in `Effect.runPromise` arguments even though `renderToString` itself provides them internally. Switched to `Exclude<R, Deps>`; the runtime behaviour is unchanged.
