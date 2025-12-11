import { bench, describe } from "vitest";
import { Effect } from "effect";
import { Signal } from "@core/Signal";
import { $ } from "@dom/Element/Element";
import { when, match } from "@dom/Control";
import { component } from "@dom/Component";

describe("DOM updates", () => {
  describe("element creation", () => {
    bench("create div with static text", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* $.div("Hello World");
          }),
        ),
      );
    });

    bench("create div with signal text", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const text = yield* Signal.make("Hello");
            yield* $.div(text);
          }),
        ),
      );
    });

    bench("create div with static attributes", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* $.div({
              class: "container",
              id: "main",
              "data-value": "test",
            });
          }),
        ),
      );
    });

    bench("create div with reactive class", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isActive = yield* Signal.make(false);
            yield* $.div({
              class: isActive.map((a) => (a ? "active" : "inactive")),
            });
          }),
        ),
      );
    });

    bench("create 100 divs", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 100; i++) {
              yield* $.div(`Item ${i}`);
            }
          }),
        ),
      );
    });
  });

  describe("conditional rendering (when)", () => {
    bench("create when", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const show = yield* Signal.make(true);
            yield* when(
              show,
              () => $.div("Visible"),
              () => $.span(),
            );
          }),
        ),
      );
    });
  });

  describe("pattern matching (match)", () => {
    type Status = "loading" | "success" | "error";

    bench("create match with 3 cases", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const status = yield* Signal.make<Status>("loading");
            yield* match(status, [
              { pattern: "loading", render: () => $.div("Loading...") },
              { pattern: "success", render: () => $.div("Done!") },
              { pattern: "error", render: () => $.div("Error!") },
            ]);
          }),
        ),
      );
    });
  });

  describe("component creation", () => {
    const SimpleComponent = component("Simple", () => $.div("Simple"));

    const StatefulComponent = component("Stateful", () =>
      Effect.gen(function* () {
        const count = yield* Signal.make(0);
        return yield* $.div([
          $.span(count.map(String)),
          $.button({ onClick: () => count.update((n) => n + 1) }, "+"),
        ]);
      }),
    );

    bench("create simple component", async () => {
      await Effect.runPromise(Effect.scoped(SimpleComponent()));
    });

    bench("create stateful component", async () => {
      await Effect.runPromise(Effect.scoped(StatefulComponent()));
    });

    bench("create 100 simple components", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 100; i++) {
              yield* SimpleComponent();
            }
          }),
        ),
      );
    });

    bench("create 100 stateful components", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            for (let i = 0; i < 100; i++) {
              yield* StatefulComponent();
            }
          }),
        ),
      );
    });
  });

  describe("nested structures", () => {
    bench("create 3-level nested structure", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* $.div({ class: "level-1" }, [
              $.div({ class: "level-2" }, [
                $.div({ class: "level-3" }, "Content"),
                $.div({ class: "level-3" }, "Content"),
              ]),
              $.div({ class: "level-2" }, [
                $.div({ class: "level-3" }, "Content"),
                $.div({ class: "level-3" }, "Content"),
              ]),
            ]);
          }),
        ),
      );
    });

    bench("create 5-level nested structure", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* $.div([
              $.div([
                $.div([$.div([$.div("Deep content"), $.div("Deep content")])]),
              ]),
            ]);
          }),
        ),
      );
    });
  });
});
