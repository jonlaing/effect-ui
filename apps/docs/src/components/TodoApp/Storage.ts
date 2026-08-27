import { Context, Effect, Layer, Scope, Stream } from "effect";

import { Readable, Signal, type SignalArray } from "@stax-ui/dom";

/**
 * Populated by the pre-paint snapshot script in `entry.ts`. Every
 * `stax-*` key in `localStorage` is parsed once and stashed here
 * before the client bundle executes, so `StorageLive` can source
 * hydration values synchronously without a second read.
 */
declare global {
  interface Window {
    __STAX_STORAGE__?: Record<string, unknown>;
  }
}

const readSnapshot = (key: string): unknown =>
  typeof window === "undefined" ? undefined : window.__STAX_STORAGE__?.[key];

/**
 * A storage service that hands back a persisted Signal — hydrated
 * from wherever "storage" happens to live, and auto-writing back
 * on every change.
 *
 * ```ts
 * const todos = yield* storage.persistArray("todos", DEFAULT_TODOS);
 * yield* todos.push(newTodo);
 * yield* todos.modifyAt(index, (t) => ({ ...t, done: !t.done }));
 * ```
 *
 * ...and it doesn't care whether persistence actually happens.
 * That decision is the Layer's — `StorageLive` reads and writes
 * real localStorage; `StorageNoOp` seeds the signal from the
 * defaults and drops writes on the floor (fine for SSG and tests).
 *
 * This is the shape most demos of Effect Context want to be:
 * services aren't just wrappers around a primitive, they're a
 * place to embed a convention. The component asks for the
 * behavior; the environment decides how (or whether) it happens.
 */
export class Storage extends Context.Tag("stax-docs/TodoApp/Storage")<
  Storage,
  {
    readonly isLoading: Readable.Readable<boolean>;
    readonly persistArray: <T>(
      key: string,
      defaults: readonly T[],
    ) => Effect.Effect<SignalArray<T>, never, Scope.Scope>;
  }
>() {}

/**
 * Live implementation — reads/writes `window.localStorage`.
 *
 * `persistArray` seeds empty and defers the real hydration onto a
 * forked fiber so it lands on the microtask after mount. That
 * matches the SSR-empty pass and turns "populate the list" into a
 * reactive append rather than a keyed-list reconciliation. The
 * pre-paint snapshot in `entry.ts` (see `window.__STAX_STORAGE__`)
 * makes the deferred read free — the JSON is already parsed.
 *
 * Persist-on-change is forked into the enclosing scope so it
 * unmounts cleanly.
 */
export const StorageLive = Layer.effect(
  Storage,
  Effect.gen(function* () {
    const isLoading = yield* Signal.make(true);
    return {
      isLoading,
      persistArray: <T>(key: string, defaults: readonly T[]) =>
        Effect.gen(function* () {
          // Seed empty to match what the SSR pass rendered — see the
          // note on `StorageNoOp.persistArray` below. The real data
          // is set on a forked fiber a microtask after hydration
          // finishes, so `each` sees an empty-to-populated reactive
          // update instead of a keyed-list reconciliation.
          const arr = yield* Signal.Array.make<T>([]);

          yield* Effect.fork(
            Effect.gen(function* () {
              yield* Effect.sleep("0 millis");
              const cached = readSnapshot(key);
              let initial: readonly T[];
              if (Array.isArray(cached)) {
                initial = cached as readonly T[];
              } else {
                const raw = localStorage.getItem(key);
                if (raw) {
                  initial = JSON.parse(raw) as T[];
                } else {
                  initial = defaults;
                  localStorage.setItem(key, JSON.stringify(defaults));
                }
              }
              yield* arr.set(initial);
              yield* isLoading.set(false);
            }),
          );

          yield* Stream.runForEach(arr.changes, (value) =>
            Effect.sync(() => {
              localStorage.setItem(key, JSON.stringify(value));
            }),
          ).pipe(Effect.forkScoped);
          return arr;
        }),
    };
  }),
);

/**
 * No-op implementation — returns a plain signal / array with no
 * hydration data. Use for SSG (there's no `localStorage` on the
 * server anyway) or in tests where persistence isn't the behavior
 * under test.
 *
 * **Why `persistArray` returns EMPTY here, ignoring `defaults`:**
 * on SSR, we have no idea what the client's actual `localStorage`
 * contains — it could be the defaults, or user-modified state
 * from a prior session, or empty (private window). If we seeded
 * the SSR render with `defaults` and the client's real state
 * differed, `each`'s keyed reconciliation would tear down and
 * rebuild the list on hydration. Rendering empty on SSR is the
 * honest signal: "I don't know your state yet; the client will
 * fill this in." The trade-off is a brief empty-list flash before
 * hydration — acceptable for a demo.
 */
export const StorageNoOp = Layer.succeed(
  Storage,
  Storage.of({
    isLoading: Readable.of(true),
    persistArray: <T>(_key: string, _defaults: readonly T[]) =>
      Signal.Array.make<T>([]),
  }),
);
