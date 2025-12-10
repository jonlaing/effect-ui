import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import * as Readable from "./Readable";

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
});
