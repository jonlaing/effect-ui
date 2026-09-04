import { Effect, Fiber, Scope, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Signal } from "./Signal.js";

const runScoped = <A, E>(
  program: Effect.Effect<A, E, Scope.Scope>,
): Promise<A> => Effect.runPromise(Effect.scoped(program));

describe("Signal.Optic", () => {
  interface Nested {
    readonly a: {
      readonly b: { readonly c: number };
      readonly d: number;
    };
    readonly e: number;
  }
  const initial: Nested = { a: { b: { c: 0 }, d: 1 }, e: 2 };

  describe("make", () => {
    it("is a Readable of the whole tree", async () => {
      const value = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          return yield* state.get;
        }),
      );
      expect(value).toEqual(initial);
    });

    it("is recognized by the OpticTypeId brand", async () => {
      await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          expect(Signal.Optic.isOptic(state)).toBe(true);
        }),
      );
    });

    it("does NOT expose a `.set` on the root handle", async () => {
      await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          // A regular Signal would expose `.set`; the optic root only
          // exposes the Readable surface. Writes flow through
          // Signal.Optic.set(state, path, value).
          expect((state as unknown as { set?: unknown }).set).toBeUndefined();
        }),
      );
    });
  });

  describe("get + set", () => {
    it("reads and writes a single leaf path", async () => {
      const value = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");

          expect(yield* c.get).toBe(0);

          yield* Signal.Optic.set(state, "a.b.c", 3);
          return yield* c.get;
        }),
      );
      expect(value).toBe(3);
    });

    it("a write to a leaf propagates up to ancestor readables", async () => {
      const bAfter = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const b = yield* Signal.Optic.get(state, "a.b");
          yield* Signal.Optic.set(state, "a.b.c", 42);
          return yield* b.get;
        }),
      );
      expect(bAfter).toEqual({ c: 42 });
    });

    it("a write to an ancestor propagates down to leaf readables", async () => {
      const cAfter = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");
          yield* Signal.Optic.set(state, "a.b", { c: 99 });
          return yield* c.get;
        }),
      );
      expect(cAfter).toBe(99);
    });

    it("the whole-tree readable reflects every write", async () => {
      const tree = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          yield* Signal.Optic.set(state, "a.b.c", 7);
          yield* Signal.Optic.set(state, "e", 8);
          return yield* state.get;
        }),
      );
      expect(tree).toEqual({ a: { b: { c: 7 }, d: 1 }, e: 8 });
    });

    it("preserves structural sharing on unaffected branches", async () => {
      // A write inside `a.b` should NOT rebuild `e`.
      const { originalE, sameE } = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make({
            a: { b: { c: 0 } },
            e: { greeting: "hi" },
          });
          const originalE = (yield* state.get).e;
          yield* Signal.Optic.set(state, "a.b.c", 42);
          const nextE = (yield* state.get).e;
          return { originalE, sameE: originalE === nextE };
        }),
      );
      expect(sameE).toBe(true);
      expect(originalE).toEqual({ greeting: "hi" });
    });
  });

  describe("change notifications", () => {
    // Collect the first `n` emissions from `changes` and return them
    // as a plain array; standard Readable test pattern.
    const collectChanges = <A>(
      readable: { changes: Stream.Stream<A> },
      n: number,
    ) =>
      readable.changes.pipe(
        Stream.take(n),
        Stream.runCollect,
        Effect.map((chunk) => Array.from(chunk)),
      );

    it("a leaf write fires the leaf's `.changes`", async () => {
      const events = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");

          const collector = yield* Effect.fork(collectChanges(c, 2));
          yield* Effect.sleep("5 millis");

          yield* Signal.Optic.set(state, "a.b.c", 1);
          yield* Signal.Optic.set(state, "a.b.c", 2);

          return yield* Fiber.join(collector);
        }),
      );
      expect(events).toEqual([1, 2]);
    });

    it("a leaf write fires ancestor `.changes` with the rebuilt subtree", async () => {
      const events = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const b = yield* Signal.Optic.get(state, "a.b");

          const collector = yield* Effect.fork(collectChanges(b, 1));
          yield* Effect.sleep("5 millis");

          yield* Signal.Optic.set(state, "a.b.c", 42);

          return yield* Fiber.join(collector);
        }),
      );
      expect(events).toEqual([{ c: 42 }]);
    });

    it("sibling writes do NOT fire a leaf's `.changes`", async () => {
      // `a.b.c` should not emit when `a.d` is written — they don't overlap.
      const events = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");

          const seen: number[] = [];
          const collector = yield* Effect.fork(
            c.changes.pipe(
              Stream.runForEach((v) => Effect.sync(() => seen.push(v))),
            ),
          );
          yield* Effect.sleep("5 millis");

          yield* Signal.Optic.set(state, "a.d", 99);
          yield* Signal.Optic.set(state, "e", 100);
          yield* Effect.sleep("20 millis");

          yield* Fiber.interrupt(collector);
          return seen;
        }),
      );
      expect(events).toEqual([]);
    });

    it("writing the same value doesn't fire `.changes`", async () => {
      const events = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");

          const seen: number[] = [];
          const collector = yield* Effect.fork(
            c.changes.pipe(
              Stream.runForEach((v) => Effect.sync(() => seen.push(v))),
            ),
          );
          yield* Effect.sleep("5 millis");

          // c is already 0 in the initial state.
          yield* Signal.Optic.set(state, "a.b.c", 0);
          yield* Effect.sleep("10 millis");

          yield* Fiber.interrupt(collector);
          return seen;
        }),
      );
      expect(events).toEqual([]);
    });
  });

  describe("update", () => {
    it("applies a reducer against the current value at path", async () => {
      const value = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          yield* Signal.Optic.update(state, "a.b.c", (n) => n + 10);
          const c = yield* Signal.Optic.get(state, "a.b.c");
          return yield* c.get;
        }),
      );
      expect(value).toBe(10);
    });

    it("skips when the reducer returns the same value", async () => {
      const value = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");

          const seen: number[] = [];
          const collector = yield* Effect.fork(
            c.changes.pipe(
              Stream.runForEach((v) => Effect.sync(() => seen.push(v))),
            ),
          );
          yield* Effect.sleep("5 millis");

          yield* Signal.Optic.update(state, "a.b.c", (n) => n);
          yield* Effect.sleep("10 millis");

          yield* Fiber.interrupt(collector);
          return seen;
        }),
      );
      expect(value).toEqual([]);
    });
  });

  describe("scope cleanup", () => {
    it("unsubscribes when the enclosing scope of `get`'s stream closes", async () => {
      const info = await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);
          const c = yield* Signal.Optic.get(state, "a.b.c");

          const fiber = yield* c.changes.pipe(
            Stream.runDrain,
            Effect.forkScoped,
          );
          yield* Effect.sleep("5 millis");
          const during =
            (
              state as unknown as {
                _subs: Map<string, Set<unknown>>;
              }
            )._subs.get("a.b.c")?.size ?? 0;

          yield* Fiber.interrupt(fiber);
          yield* Effect.sleep("5 millis");

          const after =
            (
              state as unknown as {
                _subs: Map<string, Set<unknown>>;
              }
            )._subs.get("a.b.c")?.size ?? 0;

          return { during, after };
        }),
      );
      expect(info.during).toBe(1);
      expect(info.after).toBe(0);
    });
  });

  describe("path types", () => {
    // Compile-time smoke test — this doesn't run any assertions but
    // the `expect(true).toBe(true)` keeps vitest happy; the value of
    // this block is that TS rejects the file if the path types drift.
    it("infers ValueAtPath for known keys (compile-time)", async () => {
      await runScoped(
        Effect.gen(function* () {
          const state = yield* Signal.Optic.make(initial);

          // These lines should type-check with the correct inner type.
          const c = yield* Signal.Optic.get(state, "a.b.c");
          const b = yield* Signal.Optic.get(state, "a.b");
          const e = yield* Signal.Optic.get(state, "e");

          const cValue: number = yield* c.get;
          const bValue: { readonly c: number } = yield* b.get;
          const eValue: number = yield* e.get;

          expect(cValue).toBe(0);
          expect(bValue.c).toBe(0);
          expect(eValue).toBe(2);
        }),
      );
    });
  });
});
