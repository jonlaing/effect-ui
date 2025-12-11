import { bench, describe } from "vitest";
import { Effect, ExecutionStrategy, Scope, Stream } from "effect";
import { Signal } from "@core/Signal";
import { $ } from "@dom/Element/Element";
import type { Readable } from "@core/Readable";
import { map as mapReadable } from "@core/Readable";

// Profile individual operations to find the bottleneck

describe("Profile bottlenecks", () => {
  describe("Scope operations", () => {
    bench("Scope.make only", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* Scope.make();
          }),
        ),
      );
    });

    bench("100x Scope.make", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 100; i++) {
              yield* Scope.make();
            }
          }),
        ),
      );
    });

    bench("1000x Scope.make", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 1000; i++) {
              yield* Scope.make();
            }
          }),
        ),
      );
    });

    bench("100x Scope.fork", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const parent = yield* Effect.scope;
            for (let i = 0; i < 100; i++) {
              yield* Scope.fork(parent, ExecutionStrategy.sequential);
            }
          }),
        ),
      );
    });

    bench("1000x Scope.fork", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const parent = yield* Effect.scope;
            for (let i = 0; i < 1000; i++) {
              yield* Scope.fork(parent, ExecutionStrategy.sequential);
            }
          }),
        ),
      );
    });
  });

  describe("Effect.provideService overhead", () => {
    bench("100x Effect.provideService", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const scope = yield* Scope.make();
            for (let i = 0; i < 100; i++) {
              yield* Effect.succeed(i).pipe(
                Effect.provideService(Scope.Scope, scope),
              );
            }
          }),
        ),
      );
    });
  });

  describe("Signal creation", () => {
    bench("100x Signal.make", async () => {
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
  });

  describe("DOM operations (no Effect)", () => {
    bench("100x createElement + appendChild", () => {
      const container = document.createElement("div");
      for (let i = 0; i < 100; i++) {
        const el = document.createElement("li");
        el.textContent = `Item ${i}`;
        container.appendChild(el);
      }
    });

    bench("1000x createElement + appendChild", () => {
      const container = document.createElement("div");
      for (let i = 0; i < 1000; i++) {
        const el = document.createElement("li");
        el.textContent = `Item ${i}`;
        container.appendChild(el);
      }
    });

    bench("100x createElement with fragment", () => {
      const container = document.createElement("div");
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 100; i++) {
        const el = document.createElement("li");
        el.textContent = `Item ${i}`;
        fragment.appendChild(el);
      }
      container.appendChild(fragment);
    });

    bench("1000x createElement with fragment", () => {
      const container = document.createElement("div");
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 1000; i++) {
        const el = document.createElement("li");
        el.textContent = `Item ${i}`;
        fragment.appendChild(el);
      }
      container.appendChild(fragment);
    });
  });

  describe("Effect.gen overhead", () => {
    bench("100x Effect.gen iterations", async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
          for (let i = 0; i < 100; i++) {
            yield* Effect.succeed(i);
          }
        }),
      );
    });

    bench("1000x Effect.gen iterations", async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
          for (let i = 0; i < 1000; i++) {
            yield* Effect.succeed(i);
          }
        }),
      );
    });
  });
});
