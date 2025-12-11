import { bench, describe } from "vitest";
import { Effect } from "effect";
import { Signal } from "@core/Signal";
import { each } from "@dom/Control";
import { $ } from "@dom/Element/Element";

interface Item {
  id: number;
  text: string;
}

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({ id: i, text: `Item ${i}` }));

describe("each (list rendering)", () => {
  describe("initial render", () => {
    bench("render 100 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(100));
            yield* each(
              items,
              (item) => item.id,
              (item) => $.li(item.map((i) => i.text)),
            );
          }),
        ),
      );
    });

    bench("render 500 items", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(500));
            yield* each(
              items,
              (item) => item.id,
              (item) => $.li(item.map((i) => i.text)),
            );
          }),
        ),
      );
    });

    bench("render 1000 items", async () => {
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
  });

  describe("complex items", () => {
    bench("render 100 items with nested elements", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(100));
            yield* each(
              items,
              (item) => item.id,
              (item) =>
                $.li({ class: "item" }, [
                  $.span(
                    { class: "id" },
                    item.map((i) => String(i.id)),
                  ),
                  $.span(
                    { class: "text" },
                    item.map((i) => i.text),
                  ),
                  $.button({ class: "action" }, "Click"),
                ]),
            );
          }),
        ),
      );
    });

    bench("render 500 items with nested elements", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const items = yield* Signal.make(makeItems(500));
            yield* each(
              items,
              (item) => item.id,
              (item) =>
                $.li({ class: "item" }, [
                  $.span(
                    { class: "id" },
                    item.map((i) => String(i.id)),
                  ),
                  $.span(
                    { class: "text" },
                    item.map((i) => i.text),
                  ),
                  $.button({ class: "action" }, "Click"),
                ]),
            );
          }),
        ),
      );
    });
  });
});
