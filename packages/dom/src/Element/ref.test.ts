import { Effect, Fiber, Scope, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Readable } from "@effex/core";

import { bindElementToRef, make } from "./ref";

const runTest = <A>(effect: Effect.Effect<A, never, Scope.Scope>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect));

describe("ElementRef", () => {
  describe("isConnected", () => {
    it("should return false when element is not bound", () =>
      runTest(
        Effect.gen(function* () {
          const ref = yield* make<HTMLDivElement>();
          const connected = yield* ref.isConnected.get;
          expect(connected).toBe(false);
        }),
      ));

    it("should return false when element is bound but not connected", () =>
      runTest(
        Effect.gen(function* () {
          const ref = yield* make<HTMLDivElement>();

          const mockElement = {
            isConnected: false,
          } as unknown as HTMLDivElement;
          bindElementToRef(ref, mockElement);

          const connected = yield* ref.isConnected.get;
          expect(connected).toBe(false);
        }),
      ));

    it("should return true when element is connected", () =>
      runTest(
        Effect.gen(function* () {
          const ref = yield* make<HTMLDivElement>();

          const mockElement = {
            isConnected: true,
          } as unknown as HTMLDivElement;
          bindElementToRef(ref, mockElement);

          const connected = yield* ref.isConnected.get;
          expect(connected).toBe(true);
        }),
      ));

    it("should emit changes when connection state changes", () =>
      runTest(
        Effect.gen(function* () {
          const ref = yield* make<HTMLDivElement>();
          const mockElement = {
            isConnected: false,
          } as unknown as HTMLDivElement;
          bindElementToRef(ref, mockElement);

          const emissions: boolean[] = [];

          // Subscribe to values stream
          const fiber = yield* ref.isConnected.values.pipe(
            Stream.take(2), // Take initial false + one change to true
            Stream.runForEach((v) =>
              Effect.sync(() => {
                emissions.push(v);
              }),
            ),
            Effect.fork,
          );

          // Wait a tick for subscription to be set up
          yield* Effect.sleep(10);

          // Simulate element becoming connected
          (mockElement as { isConnected: boolean }).isConnected = true;

          // Wait for RAF-based polling to detect the change
          yield* Effect.sleep(50);

          // The fiber should complete after taking 2 values
          yield* Fiber.join(fiber);

          expect(emissions).toEqual([false, true]);
        }),
      ));

    it("should work with Readable.tap", () =>
      runTest(
        Effect.gen(function* () {
          const ref = yield* make<HTMLDivElement>();
          const mockElement = {
            isConnected: false,
          } as unknown as HTMLDivElement;
          bindElementToRef(ref, mockElement);

          const emissions: boolean[] = [];

          // Use Readable.tap like user would
          yield* ref.isConnected.pipe(
            Readable.tap((connected) => {
              emissions.push(connected);
              return Effect.void;
            }),
            Effect.fork,
          );

          // Initial value should have been emitted
          yield* Effect.sleep(10);
          expect(emissions).toContain(false);

          // Simulate element becoming connected
          (mockElement as { isConnected: boolean }).isConnected = true;

          // Wait for RAF-based polling to detect the change
          yield* Effect.sleep(50);

          expect(emissions).toContain(true);
        }),
      ));

    it("should work when tap is set up before element is bound", () =>
      runTest(
        Effect.gen(function* () {
          const ref = yield* make<HTMLDivElement>();

          const emissions: boolean[] = [];

          // Set up tap BEFORE element is bound (like in real component)
          yield* ref.isConnected.pipe(
            Readable.tap((connected) => {
              emissions.push(connected);
              return Effect.void;
            }),
            Effect.fork,
          );

          // Initial value (false - no element) should have been emitted
          yield* Effect.sleep(10);
          expect(emissions).toEqual([false]);

          // Now bind element (simulates element being created)
          const mockElement = {
            isConnected: false,
          } as unknown as HTMLDivElement;
          bindElementToRef(ref, mockElement);

          // Still not connected, so no new emission expected
          yield* Effect.sleep(50);
          expect(emissions).toEqual([false]);

          // Now connect the element
          (mockElement as { isConnected: boolean }).isConnected = true;

          // Wait for RAF-based polling to detect the change
          yield* Effect.sleep(50);

          expect(emissions).toEqual([false, true]);
        }),
      ));
  });
});
