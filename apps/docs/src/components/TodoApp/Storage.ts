import { Context, Effect, Layer, Scope, Stream } from "effect";

import { Signal, type SignalArray } from "@stax-ui/dom";

/**
 * A storage service that hands back a persisted Signal — hydrated
 * from wherever "storage" happens to live, and auto-writing back
 * on every change.
 *
 * Two variants: `persist` for scalar state, `persistArray` for
 * collection state. The array variant returns a `Signal.Array`, so
 * downstream code can reach for `.push` / `.modifyAt` / `.removeAt`
 * instead of full-list `.update` closures:
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
    readonly persist: <T>(
      key: string,
      defaults: T,
    ) => Effect.Effect<Signal.Signal<T>, never, Scope.Scope>;

    readonly persistArray: <T>(
      key: string,
      defaults: readonly T[],
    ) => Effect.Effect<SignalArray<T>, never, Scope.Scope>;
  }
>() {}

/**
 * Live implementation — reads/writes `window.localStorage`. First
 * read hydrates from the stored value if any; if nothing is
 * stored, seeds the defaults into localStorage so subsequent loads
 * see the same data. Persist-on-change is forked into the enclosing
 * scope so it unmounts cleanly.
 */
export const StorageLive = Layer.succeed(
  Storage,
  Storage.of({
    persist: <T>(key: string, defaults: T) =>
      Effect.gen(function* () {
        const raw = localStorage.getItem(key);
        const initial: T = raw ? (JSON.parse(raw) as T) : defaults;
        if (!raw) {
          localStorage.setItem(key, JSON.stringify(defaults));
        }
        const signal = yield* Signal.make<T>(initial);
        yield* Stream.runForEach(signal.changes, (value) =>
          Effect.sync(() => {
            localStorage.setItem(key, JSON.stringify(value));
          }),
        ).pipe(Effect.forkScoped);
        return signal;
      }),

    persistArray: <T>(key: string, defaults: readonly T[]) =>
      Effect.gen(function* () {
        const raw = localStorage.getItem(key);
        const initial: readonly T[] = raw ? (JSON.parse(raw) as T[]) : defaults;
        if (!raw) {
          localStorage.setItem(key, JSON.stringify(defaults));
        }
        const arr = yield* Signal.Array.make<T>(initial);
        yield* Stream.runForEach(arr.changes, (value) =>
          Effect.sync(() => {
            localStorage.setItem(key, JSON.stringify(value));
          }),
        ).pipe(Effect.forkScoped);
        return arr;
      }),
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
 *
 * (The scalar `persist` still seeds with `defaults` because
 * scalars have no equivalent "empty" that a component can
 * meaningfully render.)
 */
export const StorageNoOp = Layer.succeed(
  Storage,
  Storage.of({
    persist: <T>(_key: string, defaults: T) => Signal.make<T>(defaults),
    persistArray: <T>(_key: string, _defaults: readonly T[]) =>
      Signal.Array.make<T>([]),
  }),
);
