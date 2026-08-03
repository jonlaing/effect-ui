---
"@effex/dom": patch
---

Fix intro animations still stalling on client-mode re-mount even after
the connection wait added in the previous release.

The previous fix used `Effect.yieldNow()` to defer the enter fiber past
the outer synchronous render flow. That only reschedules the fiber
inside Effect's own queue — if no other work is queued, the fiber can
run again immediately without the browser actually flushing microtasks
or committing DOM changes. On real client re-mounts, `element.isConnected`
stayed `false` when the animation fiber checked it, we hit the 3-attempt
bound, and proceeded against a disconnected element — same failure
mode as before.

Replace `Effect.yieldNow` with `queueMicrotask`-based yielding (via
`Effect.async`), bounded to 32 attempts. `queueMicrotask` is a real
browser primitive that guarantees the fiber won't resume until the
current task's synchronous work and other queued microtasks have run
— which is when the outer render flow finishes inserting the wrapper's
ancestor chain into the document. 32 microtasks is well under a
millisecond in modern engines and comfortably covers any realistic
outer-flow depth.

Also force a style/layout computation (`element.offsetHeight`) after
the element is connected. Some engines defer style computation for
freshly-inserted nodes until it's needed; without this, `forceReflow`
inside `runEnterAnimation` could record the enterFrom state as the
initial snapshot for an element that hasn't been styled yet, leaving
the browser without a valid "before" to interpolate the transition
from.
