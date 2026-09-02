import {
  Effect,
  Fiber,
  HashMap,
  Logger,
  LogLevel,
  Option,
  Scope,
  Stream,
} from "effect";
import { describe, expect, it } from "vitest";

import { combine } from "./Readable.js";
import { Signal } from "./Signal.js";

interface CapturedLog {
  readonly message: unknown;
  readonly subsystem: string | undefined;
}

const captureLogger = () => {
  const sink: CapturedLog[] = [];
  const layer = Logger.replace(
    Logger.defaultLogger,
    Logger.make((opts) => {
      const sub = HashMap.get(opts.annotations, "subsystem");
      sink.push({
        message: opts.message,
        subsystem: Option.isSome(sub) ? String(sub.value) : undefined,
      });
    }),
  );
  return { sink, layer };
};

const runTest = <A>(effect: Effect.Effect<A, never, Scope.Scope>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("Signal.Struct", () => {
  describe("make", () => {
    it("should create a struct with initial values", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });
          const value = yield* struct.get;
          expect(value).toEqual({ name: "John", age: 30 });
        }),
      ));

    it("should expose keys", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            street: "123 Main St",
            city: "Austin",
            zip: "78701",
          });
          expect(struct.keys).toEqual(["street", "city", "zip"]);
        }),
      ));
  });

  describe("field access", () => {
    it("should access individual fields as Signals", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          const name = yield* struct.name.get;
          const age = yield* struct.age.get;

          expect(name).toBe("John");
          expect(age).toBe(30);
        }),
      ));

    it("should set individual fields", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          yield* struct.name.set("Jane");
          yield* struct.age.set(25);

          const name = yield* struct.name.get;
          const age = yield* struct.age.get;

          expect(name).toBe("Jane");
          expect(age).toBe(25);
        }),
      ));

    it("should update individual fields", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            count: 10,
          });

          yield* struct.count.update((n) => n + 5);

          const count = yield* struct.count.get;
          expect(count).toBe(15);
        }),
      ));

    it("should not notify when setting same value", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
          });

          // First set
          yield* struct.name.set("Jane");
          const v1 = yield* struct.name.get;
          expect(v1).toBe("Jane");

          // Same value - should not cause unnecessary update
          yield* struct.name.set("Jane");
          const v2 = yield* struct.name.get;
          expect(v2).toBe("Jane");

          // Different value
          yield* struct.name.set("Bob");
          const v3 = yield* struct.name.get;
          expect(v3).toBe("Bob");
        }),
      ));
  });

  describe("update (batch)", () => {
    it("should update multiple fields at once", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            street: "123 Main St",
            city: "Austin",
            zip: "78701",
          });

          yield* struct.update({ street: "456 Oak Ave", city: "Dallas" });

          const value = yield* struct.get;
          expect(value).toEqual({
            street: "456 Oak Ave",
            city: "Dallas",
            zip: "78701",
          });
        }),
      ));

    it("should not notify when updating with same values", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          const changes: Array<{ name: string; age: number }> = [];

          const fiber = yield* struct.changes.pipe(
            Stream.take(1),
            Stream.runForEach((v) => Effect.sync(() => changes.push(v))),
            Effect.fork,
          );

          // Update with same values - should not notify
          yield* struct.update({ name: "John", age: 30 });
          yield* Effect.yieldNow();

          // Update with different value - should notify
          yield* struct.update({ name: "Jane" });
          yield* Effect.yieldNow();

          expect(changes).toEqual([{ name: "Jane", age: 30 }]);
          yield* Fiber.interrupt(fiber);
        }),
      ));
  });

  describe("replace", () => {
    it("should replace the entire struct", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          yield* struct.replace({ name: "Jane", age: 25 });

          const value = yield* struct.get;
          expect(value).toEqual({ name: "Jane", age: 25 });
        }),
      ));

    it("should trigger change notification", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          const changes: Array<{ name: string; age: number }> = [];

          const fiber = yield* struct.changes.pipe(
            Stream.take(1),
            Stream.runForEach((v) => Effect.sync(() => changes.push(v))),
            Effect.fork,
          );

          // Yield to let the fiber subscribe before mutating
          yield* Effect.yieldNow();

          yield* struct.replace({ name: "Jane", age: 25 });
          yield* Effect.yieldNow();

          expect(changes).toEqual([{ name: "Jane", age: 25 }]);
          yield* Fiber.interrupt(fiber);
        }),
      ));
  });

  describe("reactivity", () => {
    it("should reflect field changes in whole struct", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          yield* struct.name.set("Jane");

          const whole = yield* struct.get;
          expect(whole).toEqual({ name: "Jane", age: 30 });
        }),
      ));

    it("should reflect whole struct changes in fields", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({
            name: "John",
            age: 30,
          });

          yield* struct.replace({ name: "Jane", age: 25 });

          const name = yield* struct.name.get;
          const age = yield* struct.age.get;

          expect(name).toBe("Jane");
          expect(age).toBe(25);
        }),
      ));
  });

  describe("type guard", () => {
    it("should identify SignalStruct instances", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({ x: 1 });
          expect(Signal.Struct.isSignalStruct(struct)).toBe(true);
        }),
      ));

    it("should return false for non-SignalStruct values", () =>
      runTest(
        Effect.gen(function* () {
          const signal = yield* Signal.make(42);
          expect(Signal.Struct.isSignalStruct(signal)).toBe(false);
          expect(Signal.Struct.isSignalStruct(null)).toBe(false);
          expect(Signal.Struct.isSignalStruct({})).toBe(false);
        }),
      ));
  });

  describe("Readable interface", () => {
    it("should be usable with Readable.combine", () =>
      runTest(
        Effect.gen(function* () {
          const struct = yield* Signal.Struct.make({ name: "John", age: 30 });
          const count = yield* Signal.make(10);

          const combined = combine([struct, count] as const);

          const [s, c] = yield* combined.get;
          expect(s).toEqual({ name: "John", age: 30 });
          expect(c).toBe(10);
        }),
      ));
  });

  describe("trace", () => {
    it("logs update and replace under stax.signal at Debug level", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const user = yield* Signal.Struct.make({
              name: "Ada",
              email: "a@b.co",
            }).pipe(Signal.Struct.trace("user"));
            yield* user.update({ name: "Ada L." });
            yield* user.replace({ name: "Grace", email: "g@h.co" });
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      const methods = sink
        .filter(
          (l) => l.subsystem === "stax.signal" && Array.isArray(l.message),
        )
        .map((l) => (l.message as [string, unknown])[0]);
      expect(methods).toEqual(["update", "replace"]);
    });

    it("payload contains id, args, and callSite", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const user = yield* Signal.Struct.make({
              name: "Ada",
              email: "a@b.co",
            }).pipe(Signal.Struct.trace("user"));
            yield* user.update({ name: "Ada L." });
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      const write = sink.find(
        (l) =>
          l.subsystem === "stax.signal" &&
          Array.isArray(l.message) &&
          l.message[0] === "update",
      );
      const payload = (write?.message as [string, Record<string, unknown>])[1];
      expect(payload.id).toBe("user");
      expect(payload.args).toEqual([{ name: "Ada L." }]);
      expect(String(payload.callSite)).toContain("SignalStruct.test.ts");
    });

    it("emits nothing when the log level is above Debug", async () => {
      const { sink, layer } = captureLogger();
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const user = yield* Signal.Struct.make({ name: "Ada" }).pipe(
              Signal.Struct.trace("user"),
            );
            yield* user.update({ name: "Grace" });
          }),
        ).pipe(Effect.provide(layer)),
      );
      expect(sink.filter((l) => l.subsystem === "stax.signal")).toEqual([]);
    });

    it("still applies mutations — the wrapper is transparent", async () => {
      const { layer } = captureLogger();
      const finalName = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const user = yield* Signal.Struct.make({
              name: "Ada",
              email: "a@b.co",
            }).pipe(Signal.Struct.trace("user"));
            yield* user.update({ name: "Ada L." });
            const value = yield* user.get;
            return value.name;
          }),
        ).pipe(
          Logger.withMinimumLogLevel(LogLevel.Debug),
          Effect.provide(layer),
        ),
      );
      expect(finalName).toBe("Ada L.");
    });
  });
});
