import { Effect } from "effect";
import { bench, describe } from "vitest";

import { Signal } from "../src/core/Signal";

describe("Signal", () => {
  describe("creation", () => {
    bench("create signal", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* Signal.make(0);
          }),
        ),
      );
    });

    bench("create 100 signals", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 100; i++) {
              yield* Signal.make(i);
            }
          }),
        ),
      );
    });

    bench("create 1000 signals", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 1000; i++) {
              yield* Signal.make(i);
            }
          }),
        ),
      );
    });
  });

  describe("updates", () => {
    bench("set value", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            yield* signal.set(1);
          }),
        ),
      );
    });

    bench("update value", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            yield* signal.update((n) => n + 1);
          }),
        ),
      );
    });

    bench("100 sequential updates", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            for (let i = 0; i < 100; i++) {
              yield* signal.set(i);
            }
          }),
        ),
      );
    });

    bench("1000 sequential updates", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(0);
            for (let i = 0; i < 1000; i++) {
              yield* signal.set(i);
            }
          }),
        ),
      );
    });
  });

  describe("reads", () => {
    bench("get value", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(42);
            yield* signal.get;
          }),
        ),
      );
    });

    bench("100 sequential reads", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const signal = yield* Signal.make(42);
            for (let i = 0; i < 100; i++) {
              yield* signal.get;
            }
          }),
        ),
      );
    });
  });
});
