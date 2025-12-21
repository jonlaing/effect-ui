import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import * as Readable from "./Readable";
import * as Signal from "./Signal";

describe("Readable", () => {
  describe("make", () => {
    it("should create a readable with get", async () => {
      const readable = Readable.make(Effect.succeed(42), () => Stream.empty);

      const result = await Effect.runPromise(readable.get);
      expect(result).toBe(42);
    });

    it("should provide changes stream", async () => {
      let emitValue: (value: number) => void = () => {};
      const changesStream = Stream.async<number>((emit) => {
        emitValue = (value) => emit.single(value);
        return Effect.void;
      });

      const readable = Readable.make(Effect.succeed(0), () => changesStream);

      const collectFiber = Effect.runFork(
        readable.changes.pipe(Stream.take(2), Stream.runCollect),
      );

      // Give the stream time to start
      await new Promise((r) => setTimeout(r, 10));

      emitValue(1);
      emitValue(2);

      const result = await Effect.runPromise(Effect.fromFiber(collectFiber));
      expect(Chunk.toArray(result)).toEqual([1, 2]);
    });

    it("should provide values stream (current + changes)", async () => {
      let emitValue: (value: number) => void = () => {};
      const changesStream = Stream.async<number>((emit) => {
        emitValue = (value) => emit.single(value);
        return Effect.void;
      });

      const readable = Readable.make(Effect.succeed(0), () => changesStream);

      const collectFiber = Effect.runFork(
        readable.values.pipe(Stream.take(3), Stream.runCollect),
      );

      // Give the stream time to start
      await new Promise((r) => setTimeout(r, 10));

      emitValue(1);
      emitValue(2);

      const result = await Effect.runPromise(Effect.fromFiber(collectFiber));
      expect(Chunk.toArray(result)).toEqual([0, 1, 2]);
    });
  });

  describe("map", () => {
    it("should transform get value", async () => {
      const readable = Readable.make(Effect.succeed(5), () => Stream.empty);

      const mapped = Readable.map(readable, (n) => n * 2);
      const result = await Effect.runPromise(mapped.get);
      expect(result).toBe(10);
    });

    it("should transform changes stream", async () => {
      let emitValue: (value: number) => void = () => {};
      const changesStream = Stream.async<number>((emit) => {
        emitValue = (value) => emit.single(value);
        return Effect.void;
      });

      const readable = Readable.make(Effect.succeed(0), () => changesStream);

      const mapped = Readable.map(readable, (n) => n * 2);

      const collectFiber = Effect.runFork(
        mapped.changes.pipe(Stream.take(2), Stream.runCollect),
      );

      await new Promise((r) => setTimeout(r, 10));

      emitValue(5);
      emitValue(10);

      const result = await Effect.runPromise(Effect.fromFiber(collectFiber));
      expect(Chunk.toArray(result)).toEqual([10, 20]);
    });

    it("should chain multiple maps", async () => {
      const readable = Readable.make(Effect.succeed(2), () => Stream.empty);

      const mapped = readable
        .map((n) => n * 2)
        .map((n) => n + 1)
        .map((n) => `Value: ${n}`);

      const result = await Effect.runPromise(mapped.get);
      expect(result).toBe("Value: 5");
    });
  });

  describe("fromStream", () => {
    it("should create readable with initial value", async () => {
      const readable = Readable.fromStream(42, Stream.empty);
      const result = await Effect.runPromise(readable.get);
      expect(result).toBe(42);
    });

    it("should update current value from stream", async () => {
      let emitValue: (value: number) => void = () => {};
      const stream = Stream.async<number>((emit) => {
        emitValue = (value) => emit.single(value);
        return Effect.void;
      });

      const readable = Readable.fromStream(0, stream);

      // Start listening to track values
      const collectFiber = Effect.runFork(
        readable.changes.pipe(Stream.take(1), Stream.runCollect),
      );

      await new Promise((r) => setTimeout(r, 10));
      emitValue(99);

      await Effect.runPromise(Effect.fromFiber(collectFiber));

      // Now get should return the updated value
      const result = await Effect.runPromise(readable.get);
      expect(result).toBe(99);
    });
  });

  describe("combine", () => {
    it("should combine empty array into empty tuple", async () => {
      const combined = Readable.combine([]);
      const result = await Effect.runPromise(combined.get);
      expect(result).toEqual([]);
    });

    it("should combine single readable", async () => {
      const r1 = Readable.of(42);
      const combined = Readable.combine([r1]);
      const result = await Effect.runPromise(combined.get);
      expect(result).toEqual([42]);
    });

    it("should combine multiple readables", async () => {
      const r1 = Readable.of("hello");
      const r2 = Readable.of(42);
      const r3 = Readable.of(true);

      const combined = Readable.combine([r1, r2, r3]);
      const result = await Effect.runPromise(combined.get);
      expect(result).toEqual(["hello", 42, true]);
    });

    it("should emit changes when any readable changes", async () => {
      const program = Effect.gen(function* () {
        const sig1 = yield* Signal.make("a");
        const sig2 = yield* Signal.make(1);

        const combined = Readable.combine([sig1, sig2]);

        // Initial value
        const initial = yield* combined.get;
        expect(initial).toEqual(["a", 1]);

        // Collect emissions using values stream (like Derived tests do)
        const emissions: [string, number][] = [];
        yield* Stream.runForEach(combined.values, (val) =>
          Effect.sync(() => {
            emissions.push(val as [string, number]);
          }),
        ).pipe(Effect.fork);

        yield* Effect.sleep("20 millis");

        // Change first signal
        yield* sig1.set("b");
        yield* Effect.sleep("20 millis");

        // Change second signal
        yield* sig2.set(2);
        yield* Effect.sleep("20 millis");

        // Should have initial + 2 changes
        expect(emissions.length).toBeGreaterThanOrEqual(3);
        expect(emissions[0]).toEqual(["a", 1]); // initial
        expect(emissions[1]).toEqual(["b", 1]); // after sig1 change
        expect(emissions[2]).toEqual(["b", 2]); // after sig2 change
      });

      await Effect.runPromise(Effect.scoped(program));
    });

    it("should always fetch fresh values on change (no stale values)", async () => {
      const program = Effect.gen(function* () {
        const sig1 = yield* Signal.make(1);
        const sig2 = yield* Signal.make(10);

        const combined = Readable.combine([sig1, sig2]);

        // Collect emissions
        const emissions: [number, number][] = [];
        yield* Stream.runForEach(combined.values, (val) =>
          Effect.sync(() => {
            emissions.push(val as [number, number]);
          }),
        ).pipe(Effect.fork);

        yield* Effect.sleep("20 millis");

        // Update sig1 first
        yield* sig1.set(2);
        yield* Effect.sleep("20 millis");

        // Update sig2
        yield* sig2.set(20);
        yield* Effect.sleep("20 millis");

        // First emission is initial, second should have fresh values for sig1
        // Third should have fresh values for both
        expect(emissions[0]).toEqual([1, 10]); // initial
        expect(emissions[1]).toEqual([2, 10]); // sig1 changed
        expect(emissions[2]).toEqual([2, 20]); // sig2 changed
      });

      await Effect.runPromise(Effect.scoped(program));
    });
  });

  describe("lift", () => {
    it("should lift a function with all static props", async () => {
      const fn = (props: { a: number; b: string }) => `${props.b}-${props.a}`;
      const lifted = Readable.lift(fn);

      const result = lifted({ a: 42, b: "hello" });
      const value = await Effect.runPromise(result.get);
      expect(value).toBe("hello-42");
    });

    it("should lift a function with all reactive props", async () => {
      const fn = (props: { a: number; b: string }) => `${props.b}-${props.a}`;
      const lifted = Readable.lift(fn);

      const r1 = Readable.of(42);
      const r2 = Readable.of("hello");

      const result = lifted({ a: r1, b: r2 });
      const value = await Effect.runPromise(result.get);
      expect(value).toBe("hello-42");
    });

    it("should lift a function with mixed static and reactive props", async () => {
      const fn = (props: { a: number; b: string }) => `${props.b}-${props.a}`;
      const lifted = Readable.lift(fn);

      const r1 = Readable.of(42);

      const result = lifted({ a: r1, b: "hello" });
      const value = await Effect.runPromise(result.get);
      expect(value).toBe("hello-42");
    });

    it("should update when reactive props change", async () => {
      const program = Effect.gen(function* () {
        const fn = (props: { variant: string; size: string }) =>
          `btn-${props.variant}-${props.size}`;
        const lifted = Readable.lift(fn);

        const variant = yield* Signal.make("primary");
        const result = lifted({ variant, size: "md" });

        // Initial value
        const initial = yield* result.get;
        expect(initial).toBe("btn-primary-md");

        // Collect emissions
        const emissions: string[] = [];
        yield* Stream.runForEach(result.values, (val) =>
          Effect.sync(() => {
            emissions.push(val);
          }),
        ).pipe(Effect.fork);

        yield* Effect.sleep("20 millis");

        yield* variant.set("secondary");
        yield* Effect.sleep("20 millis");

        yield* variant.set("danger");
        yield* Effect.sleep("20 millis");

        expect(emissions[0]).toBe("btn-primary-md");
        expect(emissions[1]).toBe("btn-secondary-md");
        expect(emissions[2]).toBe("btn-danger-md");
      });

      await Effect.runPromise(Effect.scoped(program));
    });

    it("should work with CVA-like functions", async () => {
      // Simulate CVA function
      const cvaFn = (props?: {
        variant?: "primary" | "secondary";
        size?: "sm" | "md" | "lg";
      }) => {
        const base = "btn font-medium rounded";
        const variants = {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800",
        };
        const sizes = {
          sm: "px-2 py-1 text-sm",
          md: "px-4 py-2",
          lg: "px-6 py-3 text-lg",
        };
        const variant = props?.variant ?? "primary";
        const size = props?.size ?? "md";
        return `${base} ${variants[variant]} ${sizes[size]}`;
      };

      const program = Effect.gen(function* () {
        const buttonStyles = Readable.lift(cvaFn);
        const variant = yield* Signal.make<"primary" | "secondary">("primary");

        const className = buttonStyles({ variant, size: "md" });

        const initial = yield* className.get;
        expect(initial).toContain("bg-blue-500");

        // Collect emissions
        const emissions: string[] = [];
        yield* Stream.runForEach(className.values, (val) =>
          Effect.sync(() => {
            emissions.push(val);
          }),
        ).pipe(Effect.fork);

        yield* Effect.sleep("20 millis");

        yield* variant.set("secondary");
        yield* Effect.sleep("20 millis");

        expect(emissions[0]).toContain("bg-blue-500");
        expect(emissions[1]).toContain("bg-gray-200");
      });

      await Effect.runPromise(Effect.scoped(program));
    });

    it("should return constant readable for all static props", async () => {
      const fn = (props: { a: number }) => props.a * 2;
      const lifted = Readable.lift(fn);

      const result = lifted({ a: 21 });

      // Check that changes stream is empty (constant)
      const changes = await Effect.runPromise(
        result.changes.pipe(Stream.runCollect),
      );
      expect(Chunk.toArray(changes)).toEqual([]);

      const value = await Effect.runPromise(result.get);
      expect(value).toBe(42);
    });
  });
});
