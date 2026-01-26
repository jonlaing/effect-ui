import { Effect, Exit, Scope } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { collect } from "./Collect";
import { DOMRendererLive } from "./DOMRenderer";
import { $ } from "./Element";
import { Portal } from "./Portal";

describe("Portal", () => {
  let portalRoot: HTMLDivElement;

  beforeEach(() => {
    // Create a portal target
    portalRoot = document.createElement("div");
    portalRoot.id = "portal-root";
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = "";
  });

  it("renders children to document.body by default", async () => {
    const scope = Effect.runSync(Scope.make());

    const program = Effect.gen(function* () {
      const placeholder = yield* Portal(() =>
        $.div({ id: "portal-content" }, $.of("Hello from portal")),
      );
      return placeholder;
    });

    const placeholder = await Effect.runPromise(
      program.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.provide(DOMRendererLive),
      ),
    );

    // Placeholder should be a hidden span
    expect(placeholder.tagName).toBe("SPAN");
    expect(placeholder.style.display).toBe("none");
    expect(placeholder.getAttribute("data-portal-placeholder")).toBe("true");

    // Content should be in document.body
    const content = document.getElementById("portal-content");
    expect(content).not.toBeNull();
    expect(content?.textContent).toBe("Hello from portal");
    expect(content?.parentElement).toBe(document.body);

    // Cleanup
    await Effect.runPromise(Scope.close(scope, Exit.void));
  });

  it("renders children to specified target element", async () => {
    const scope = Effect.runSync(Scope.make());

    const program = Effect.gen(function* () {
      const placeholder = yield* Portal({ target: portalRoot }, () =>
        $.div({ id: "portal-content" }, $.of("Hello from portal")),
      );
      return placeholder;
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.provide(DOMRendererLive),
      ),
    );

    // Content should be in portal root, not document.body directly
    const content = document.getElementById("portal-content");
    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(portalRoot);

    // Cleanup
    await Effect.runPromise(Scope.close(scope, Exit.void));
  });

  it("renders children to target specified by selector", async () => {
    const scope = Effect.runSync(Scope.make());

    const program = Effect.gen(function* () {
      const placeholder = yield* Portal({ target: "#portal-root" }, () =>
        $.div({ id: "portal-content" }, $.of("Hello from portal")),
      );
      return placeholder;
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.provide(DOMRendererLive),
      ),
    );

    // Content should be in portal root
    const content = document.getElementById("portal-content");
    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(portalRoot);

    // Cleanup
    await Effect.runPromise(Scope.close(scope, Exit.void));
  });

  it("cleans up content when scope closes", async () => {
    const scope = Effect.runSync(Scope.make());

    const program = Effect.gen(function* () {
      yield* Portal({ target: portalRoot }, () =>
        $.div({ id: "portal-content" }, $.of("Hello from portal")),
      );
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.provide(DOMRendererLive),
      ),
    );

    // Content should exist
    expect(document.getElementById("portal-content")).not.toBeNull();

    // Close the scope
    await Effect.runPromise(Scope.close(scope, Exit.void));

    // Content should be removed
    expect(document.getElementById("portal-content")).toBeNull();
  });

  it("handles missing target selector gracefully", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const program = Effect.gen(function* () {
      const placeholder = yield* Portal({ target: "#non-existent" }, () =>
        $.div({ id: "portal-content" }, $.of("Hello")),
      );
      return placeholder;
    });

    const result = await Effect.runPromise(
      Effect.scoped(program).pipe(Effect.provide(DOMRendererLive)),
    );

    // Should return a hidden fallback element
    expect(result.tagName).toBe("SPAN");
    expect(result.style.display).toBe("none");

    // Should warn about missing target
    expect(consoleWarn).toHaveBeenCalledWith(
      "Portal target not found: #non-existent",
    );

    // Content should NOT be rendered
    expect(document.getElementById("portal-content")).toBeNull();

    consoleWarn.mockRestore();
  });

  it("works with nested elements", async () => {
    const scope = Effect.runSync(Scope.make());

    const program = Effect.gen(function* () {
      yield* Portal({ target: portalRoot }, () =>
        $.div(
          { id: "modal" },
          collect(
            $.div({ class: "modal-header" }, $.of("Title")),
            $.div({ class: "modal-body" }, $.of("Content")),
            $.div(
              { class: "modal-footer" },
              collect($.button({}, $.of("Cancel")), $.button({}, $.of("OK"))),
            ),
          ),
        ),
      );
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.provide(DOMRendererLive),
      ),
    );

    const modal = document.getElementById("modal");
    expect(modal).not.toBeNull();
    expect(modal?.querySelector(".modal-header")?.textContent).toBe("Title");
    expect(modal?.querySelector(".modal-body")?.textContent).toBe("Content");
    expect(modal?.querySelectorAll("button")).toHaveLength(2);

    // Cleanup
    await Effect.runPromise(Scope.close(scope, Exit.void));
  });
});
