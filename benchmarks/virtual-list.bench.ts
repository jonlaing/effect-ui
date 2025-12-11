import { bench, describe } from "vitest";
import { Effect } from "effect";
import { Signal } from "@core/Signal";
import { virtualEach } from "@dom/VirtualList";
import { each } from "@dom/Control";
import { $ } from "@dom/Element/Element";

interface Item {
  id: string;
  text: string;
}

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    text: `Item ${i}`,
  }));

describe("Virtual List vs Regular List", () => {
  describe("initial render comparison", () => {
    bench("virtualEach: 1000 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(1000));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });

    bench("each: 1000 items (for comparison)", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(1000));
            yield* each(
              items,
              (item) => item.id,
              (item) => $.li(item.map((i) => i.text)),
            );
          }),
        ),
      );
    });

    bench("virtualEach: 10000 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(10000));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });
  });

  describe("virtualEach only", () => {
    bench("100 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(100));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });

    bench("500 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(500));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });

    bench("1000 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(1000));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });

    bench("5000 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(5000));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });

    bench("10000 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(10000));
            yield* virtualEach(items, {
              key: (item) => item.id,
              itemHeight: 50,
              height: 400,
              render: (item) => $.li(item.map((i) => i.text)),
            });
          }),
        ),
      );
    });
  });
});
