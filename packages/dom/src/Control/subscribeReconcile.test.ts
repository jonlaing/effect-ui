import { Effect } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Signal } from "@effex/core";

import { subscribeReconcile } from "./subscribeReconcile.js";

describe("subscribeReconcile", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("logs a failing handler's cause to console.error", async () => {
    const boom = new Error("route render exploded");
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make("initial");
          yield* subscribeReconcile(sig, () => Effect.fail(boom));
          yield* Effect.sleep("5 millis");
          yield* sig.set("next"); // triggers the failing handler
          yield* Effect.sleep("20 millis");
        }),
      ),
    );

    expect(errorSpy).toHaveBeenCalled();
    const message = errorSpy.mock.calls[0]?.[0] as string | undefined;
    expect(message).toMatch(/\[@effex\/dom\] Reconcile handler failed/);
  });

  it("keeps processing subsequent updates after a handler failure", async () => {
    // The subscription must survive one failure; otherwise a single broken
    // route would freeze all future navigations.
    const observed: string[] = [];
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make("initial");
          yield* subscribeReconcile(sig, (value) => {
            if (value === "bad") return Effect.fail(new Error("nope"));
            return Effect.sync(() => {
              observed.push(value);
            });
          });
          yield* Effect.sleep("5 millis");
          yield* sig.set("first");
          yield* Effect.sleep("5 millis");
          yield* sig.set("bad"); // fails
          yield* Effect.sleep("5 millis");
          yield* sig.set("second"); // must still be observed
          yield* Effect.sleep("20 millis");
        }),
      ),
    );

    expect(observed).toEqual(["first", "second"]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it("is silent when the handler succeeds", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const sig = yield* Signal.make(0);
          yield* subscribeReconcile(sig, () => Effect.void);
          yield* Effect.sleep("5 millis");
          yield* sig.set(1);
          yield* Effect.sleep("10 millis");
        }),
      ),
    );

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
