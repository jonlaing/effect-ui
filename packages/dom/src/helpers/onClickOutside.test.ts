import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import { bindElementToRef, makeElementRef } from "../Element/ref";
import { onClickOutside } from "./onClickOutside";

const runTest = <A>(effect: Effect.Effect<A, never, never>) =>
  Effect.runPromise(effect);

describe("onClickOutside", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should call callback when clicking outside the element", async () => {
    let callbackCalled = false;

    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* makeElementRef<HTMLDivElement>();

          // Create and attach element
          const element = document.createElement("div");
          element.id = "inside";
          document.body.appendChild(element);
          bindElementToRef(ref, element);

          // Create outside element
          const outside = document.createElement("div");
          outside.id = "outside";
          document.body.appendChild(outside);

          yield* onClickOutside([ref], () =>
            Effect.sync(() => {
              callbackCalled = true;
            }),
          );

          // Click outside
          outside.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );

          expect(callbackCalled).toBe(true);
        }),
      ),
    );
  });

  it("should not call callback when clicking inside the element", async () => {
    let callbackCalled = false;

    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* makeElementRef<HTMLDivElement>();

          // Create and attach element
          const element = document.createElement("div");
          element.id = "inside";
          document.body.appendChild(element);
          bindElementToRef(ref, element);

          yield* onClickOutside([ref], () =>
            Effect.sync(() => {
              callbackCalled = true;
            }),
          );

          // Click inside
          element.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );

          expect(callbackCalled).toBe(false);
        }),
      ),
    );
  });

  it("should not call callback when clicking inside a nested child", async () => {
    let callbackCalled = false;

    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* makeElementRef<HTMLDivElement>();

          // Create parent and child
          const parent = document.createElement("div");
          const child = document.createElement("button");
          parent.appendChild(child);
          document.body.appendChild(parent);
          bindElementToRef(ref, parent);

          yield* onClickOutside([ref], () =>
            Effect.sync(() => {
              callbackCalled = true;
            }),
          );

          // Click on nested child
          child.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );

          expect(callbackCalled).toBe(false);
        }),
      ),
    );
  });

  it("should consider multiple refs as inside", async () => {
    let callbackCalled = false;

    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          const ref1 = yield* makeElementRef<HTMLDivElement>();
          const ref2 = yield* makeElementRef<HTMLDivElement>();

          // Create both elements
          const element1 = document.createElement("div");
          const element2 = document.createElement("div");
          const outside = document.createElement("div");
          document.body.appendChild(element1);
          document.body.appendChild(element2);
          document.body.appendChild(outside);
          bindElementToRef(ref1, element1);
          bindElementToRef(ref2, element2);

          yield* onClickOutside([ref1, ref2], () =>
            Effect.sync(() => {
              callbackCalled = true;
            }),
          );

          // Click on first element - should not trigger
          element1.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(false);

          // Click on second element - should not trigger
          element2.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(false);

          // Click outside both - should trigger
          outside.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(true);
        }),
      ),
    );
  });

  it("should work with raw HTMLElements (not just Refs)", async () => {
    let callbackCalled = false;

    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          // Create elements directly (not via Ref)
          const element = document.createElement("div");
          element.id = "inside";
          document.body.appendChild(element);

          const outside = document.createElement("div");
          outside.id = "outside";
          document.body.appendChild(outside);

          // Pass raw element, not a Ref
          yield* onClickOutside([element], () =>
            Effect.sync(() => {
              callbackCalled = true;
            }),
          );

          // Click inside raw element - should not trigger
          element.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(false);

          // Click outside - should trigger
          outside.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(true);
        }),
      ),
    );
  });

  it("should work with mixed ElementRefs and raw elements", async () => {
    let callbackCalled = false;

    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* makeElementRef<HTMLDivElement>();
          const refElement = document.createElement("div");
          document.body.appendChild(refElement);
          bindElementToRef(ref, refElement);

          // Raw element
          const rawElement = document.createElement("div");
          document.body.appendChild(rawElement);

          const outside = document.createElement("div");
          document.body.appendChild(outside);

          // Mix ElementRef and raw element
          yield* onClickOutside([ref, rawElement], () =>
            Effect.sync(() => {
              callbackCalled = true;
            }),
          );

          // Click on ref element - should not trigger
          refElement.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(false);

          // Click on raw element - should not trigger
          rawElement.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(false);

          // Click outside both - should trigger
          outside.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCalled).toBe(true);
        }),
      ),
    );
  });

  it("should clean up listener when scope closes", async () => {
    let callbackCount = 0;
    const outside = document.createElement("div");
    document.body.appendChild(outside);

    // Run in scope and let it close
    await runTest(
      Effect.scoped(
        Effect.gen(function* () {
          const ref = yield* makeElementRef<HTMLDivElement>();

          const element = document.createElement("div");
          document.body.appendChild(element);
          bindElementToRef(ref, element);

          yield* onClickOutside([ref], () =>
            Effect.sync(() => {
              callbackCount++;
            }),
          );

          // Click while scope is open
          outside.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true }),
          );
          expect(callbackCount).toBe(1);
        }),
      ),
    );

    // Click after scope closed - listener should be removed
    outside.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(callbackCount).toBe(1); // Still 1, not 2
  });
});
