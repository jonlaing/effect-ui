import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { renderToString } from "./index";
import { Signal } from "@effex/core";
import { div, span, ul, li } from "../Element";
import { when, match, each } from "../Control";

describe("SSR", () => {
  describe("renderToString", () => {
    it("should render a simple element to HTML", async () => {
      const html = await Effect.runPromise(
        renderToString(div({ class: "container" }, "Hello World")),
      );

      expect(html).toContain("<div");
      expect(html).toContain('class="container"');
      expect(html).toContain("Hello World");
      expect(html).toContain("</div>");
    });

    it("should render nested elements", async () => {
      const html = await Effect.runPromise(
        renderToString(
          div({ class: "parent" }, [
            span({ class: "child" }, "First"),
            span({ class: "child" }, "Second"),
          ]),
        ),
      );

      expect(html).toContain('<div class="parent">');
      expect(html).toContain('<span class="child">First</span>');
      expect(html).toContain('<span class="child">Second</span>');
    });

    it("should escape HTML in text content", async () => {
      const html = await Effect.runPromise(
        renderToString(div("<script>alert('xss')</script>")),
      );

      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });

    it("should escape HTML in attributes", async () => {
      const html = await Effect.runPromise(
        renderToString(div({ class: 'foo" onclick="alert(1)' })),
      );

      expect(html).toContain("&quot;");
      expect(html).not.toContain('onclick="alert(1)"');
    });
  });

  describe("when with hydration markers", () => {
    it("should add hydration markers to when container", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const condition = yield* Signal.make(true);
          return yield* renderToString(
            when(condition, {
              onTrue: () => div("Visible"),
              onFalse: () => div("Hidden"),
            }),
          );
        }),
      );

      expect(html).toContain("data-effex-id=");
      expect(html).toContain('data-effex-type="when"');
      expect(html).toContain('data-effex-condition="true"');
      expect(html).toContain("Visible");
      expect(html).not.toContain("Hidden");
    });

    it("should render false condition", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const condition = yield* Signal.make(false);
          return yield* renderToString(
            when(condition, {
              onTrue: () => div("Visible"),
              onFalse: () => div("Hidden"),
            }),
          );
        }),
      );

      expect(html).toContain('data-effex-condition="false"');
      expect(html).toContain("Hidden");
      expect(html).not.toContain("Visible");
    });
  });

  describe("match with hydration markers", () => {
    it("should add hydration markers to match container", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const status = yield* Signal.make<"loading" | "success" | "error">(
            "loading",
          );
          return yield* renderToString(
            match(status, {
              cases: [
                { pattern: "loading", render: () => div("Loading...") },
                { pattern: "success", render: () => div("Done!") },
                { pattern: "error", render: () => div("Failed") },
              ],
            }),
          );
        }),
      );

      expect(html).toContain("data-effex-id=");
      expect(html).toContain('data-effex-type="match"');
      expect(html).toContain('data-effex-pattern="');
      expect(html).toContain("Loading...");
    });

    it("should render fallback when no pattern matches", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const value = yield* Signal.make(999);
          return yield* renderToString(
            match(value, {
              cases: [
                { pattern: 1, render: () => div("One") },
                { pattern: 2, render: () => div("Two") },
              ],
              fallback: () => div("Unknown"),
            }),
          );
        }),
      );

      expect(html).toContain("Unknown");
    });
  });

  describe("each with hydration markers", () => {
    it("should add hydration markers to each container and items", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const items = yield* Signal.make([
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
          ]);
          return yield* renderToString(
            each(items, {
              container: () => ul({ class: "list" }),
              key: (item) => item.id,
              render: (item) => li(item.map((i) => i.name)),
            }),
          );
        }),
      );

      expect(html).toContain("data-effex-id=");
      expect(html).toContain('data-effex-type="each"');
      expect(html).toContain('data-effex-key="1"');
      expect(html).toContain('data-effex-key="2"');
      expect(html).toContain("<ul");
      expect(html).toContain("<li");
      expect(html).toContain("Alice");
      expect(html).toContain("Bob");
    });

    it("should render empty list", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const items = yield* Signal.make<{ id: string; name: string }[]>([]);
          return yield* renderToString(
            each(items, {
              key: (item) => item.id,
              render: (item) => li(item.map((i) => i.name)),
            }),
          );
        }),
      );

      expect(html).toContain("data-effex-id=");
      expect(html).toContain('data-effex-type="each"');
      expect(html).not.toContain("<li");
    });
  });

  describe("reactive values in SSR", () => {
    it("should render initial value of Signal in text", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const count = yield* Signal.make(42);
          return yield* renderToString(div(["Count: ", count]));
        }),
      );

      expect(html).toContain("Count: ");
      expect(html).toContain("42");
    });

    it("should render initial value of Signal in attribute", async () => {
      const html = await Effect.runPromise(
        Effect.gen(function* () {
          const isActive = yield* Signal.make(true);
          return yield* renderToString(
            div({ class: isActive.map((a) => (a ? "active" : "inactive")) }),
          );
        }),
      );

      expect(html).toContain('class="active"');
    });
  });
});
