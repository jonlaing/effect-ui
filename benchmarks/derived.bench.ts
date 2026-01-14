import { Effect } from "effect";
import { bench, describe } from "vitest";

import { Derived } from "../src/core/Derived/Derived";
import { Signal } from "../src/core/Signal";

describe("Derived", () => {
  describe("creation", () => {
    bench("create derived from 1 signal", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            yield* Derived.sync([signal], ([n]) => n * 2);
          }),
        ),
      );
    });

    bench("create derived from 3 signals", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const a = yield* Signal.make(1);
            const b = yield* Signal.make(2);
            const c = yield* Signal.make(3);
            yield* Derived.sync([a, b, c], ([x, y, z]) => x + y + z);
          }),
        ),
      );
    });

    bench("create 100 derived values", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            for (let i = 0; i < 100; i++) {
              yield* Derived.sync([signal], ([n]) => n + i);
            }
          }),
        ),
      );
    });
  });

  describe("chained derivations", () => {
    bench("chain of 5 derived values", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(1);
            const d1 = yield* Derived.sync([signal], ([n]) => n * 2);
            const d2 = yield* Derived.sync([d1], ([n]) => n + 1);
            const d3 = yield* Derived.sync([d2], ([n]) => n * 2);
            const d4 = yield* Derived.sync([d3], ([n]) => n + 1);
            yield* Derived.sync([d4], ([n]) => n * 2);
          }),
        ),
      );
    });

    bench("chain of 10 derived values", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(1);
            let current: Signal<number> | Derived<number> = signal;
            for (let i = 0; i < 10; i++) {
              current = yield* Derived.sync([current], ([n]) => n + 1);
            }
          }),
        ),
      );
    });
  });

  describe("propagation", () => {
    bench("update signal with 1 derived subscriber", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            yield* Derived.sync([signal], ([n]) => n * 2);
            yield* signal.set(1);
          }),
        ),
      );
    });

    bench("update signal with 10 derived subscribers", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            for (let i = 0; i < 10; i++) {
              yield* Derived.sync([signal], ([n]) => n + i);
            }
            yield* signal.set(1);
          }),
        ),
      );
    });

    bench("update signal with 100 derived subscribers", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            for (let i = 0; i < 100; i++) {
              yield* Derived.sync([signal], ([n]) => n + i);
            }
            yield* signal.set(1);
          }),
        ),
      );
    });

    bench("10 updates through chain of 5 derived", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(1);
            const d1 = yield* Derived.sync([signal], ([n]) => n * 2);
            const d2 = yield* Derived.sync([d1], ([n]) => n + 1);
            const d3 = yield* Derived.sync([d2], ([n]) => n * 2);
            const d4 = yield* Derived.sync([d3], ([n]) => n + 1);
            yield* Derived.sync([d4], ([n]) => n * 2);

            for (let i = 0; i < 10; i++) {
              yield* signal.set(i);
            }
          }),
        ),
      );
    });
  });

  describe("diamond dependency", () => {
    bench("diamond pattern (A -> B,C -> D)", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const a = yield* Signal.make(1);
            const b = yield* Derived.sync([a], ([n]) => n * 2);
            const c = yield* Derived.sync([a], ([n]) => n * 3);
            yield* Derived.sync([b, c], ([x, y]) => x + y);

            yield* a.set(2);
          }),
        ),
      );
    });

    bench("wide diamond (A -> 10 branches -> D)", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const a = yield* Signal.make(1);
            const branches: Derived<number>[] = [];
            for (let i = 0; i < 10; i++) {
              branches.push(yield* Derived.sync([a], ([n]) => n * (i + 1)));
            }
            yield* Derived.sync(branches, (values) =>
              values.reduce((sum, n) => sum + n, 0),
            );

            yield* a.set(2);
          }),
        ),
      );
    });
  });
});
