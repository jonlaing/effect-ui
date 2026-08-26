import { Context, Effect, Layer, Scope, Stream } from "effect";

import { Signal } from "@stax-ui/dom";

/**
 * A storage service that hands back a persisted Signal — hydrated
 * from wherever "storage" happens to live, and auto-writing back
 * on every change.
 *
 * The consumer just asks for a signal:
 *
 * ```ts
 * const todos = yield* storage.persist("todos", DEFAULT_TODOS);
 * ```
 *
 * ...and doesn't care whether persistence actually happens. That
 * decision is the Layer's — `StorageLive` reads and writes real
 * localStorage; `StorageNoOp` seeds the signal from the defaults
 * and drops writes on the floor (fine for SSG and tests).
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
  }),
);

/**
 * No-op implementation — returns a plain signal seeded with the
 * defaults, and drops writes. Use for SSG (there's no `localStorage`
 * on the server anyway) or in tests where persistence isn't the
 * behavior under test.
 */
export const StorageNoOp = Layer.succeed(
  Storage,
  Storage.of({
    persist: <T>(_key: string, defaults: T) => Signal.make<T>(defaults),
  }),
);
