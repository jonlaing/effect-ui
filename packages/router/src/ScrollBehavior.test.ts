import { Effect } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runScrollBehavior } from "./ScrollBehavior.js";

// jsdom stubs `window.scrollTo` as a no-op — swap it for a spy each
// test so we can distinguish "walker fell through to window" from
// "walker found a nested container."
describe("runScrollBehavior", () => {
  let windowScrollSpy: ReturnType<typeof vi.fn>;
  const originalWindowScrollTo = window.scrollTo;

  beforeEach(() => {
    windowScrollSpy = vi.fn();
    Object.defineProperty(window, "scrollTo", {
      value: windowScrollSpy,
      writable: true,
      configurable: true,
    });
    document.body.innerHTML = "";
  });

  afterEach(() => {
    Object.defineProperty(window, "scrollTo", {
      value: originalWindowScrollTo,
      writable: true,
      configurable: true,
    });
  });

  describe("preserve", () => {
    it("is a no-op regardless of outletNode", async () => {
      const outlet = document.createElement("div");
      document.body.appendChild(outlet);

      await Effect.runPromise(
        runScrollBehavior("preserve", "/", "/about", outlet),
      );

      expect(windowScrollSpy).not.toHaveBeenCalled();
    });
  });

  describe("custom function", () => {
    it("is invoked with (from, to) and awaited", async () => {
      const fn = vi.fn(() => Effect.void);
      await Effect.runPromise(runScrollBehavior(fn, "/from", "/to", null));
      expect(fn).toHaveBeenCalledWith("/from", "/to");
    });
  });

  describe("top", () => {
    it("falls back to window.scrollTo when no outletNode is provided", async () => {
      await Effect.runPromise(runScrollBehavior("top", "/", "/about", null));
      expect(windowScrollSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    });

    it("falls back to window.scrollTo when the outlet has no scrollable ancestor", async () => {
      // A plain outlet in a plain document — walker finds no
      // overflow-scrolling ancestor, so we scroll the document.
      const outlet = document.createElement("div");
      document.body.appendChild(outlet);

      await Effect.runPromise(runScrollBehavior("top", "/", "/about", outlet));

      expect(windowScrollSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    });

    it("scrolls the nearest scrollable ancestor when one exists (nested overflow: auto layout)", async () => {
      // The realistic app-shell case: a `100vh + overflow-y: auto`
      // container wrapping the outlet. `window.scrollTo` would be a
      // no-op here — we need to reset the SHELL's scroll position.
      const shell = document.createElement("div");
      shell.style.overflowY = "auto";
      // jsdom doesn't lay out — fake the metrics the walker checks.
      Object.defineProperty(shell, "scrollHeight", {
        configurable: true,
        value: 2000,
      });
      Object.defineProperty(shell, "clientHeight", {
        configurable: true,
        value: 800,
      });
      const shellScrollSpy = vi.fn();
      shell.scrollTo = shellScrollSpy;

      const outlet = document.createElement("div");
      shell.appendChild(outlet);
      document.body.appendChild(shell);

      await Effect.runPromise(runScrollBehavior("top", "/", "/about", outlet));

      expect(shellScrollSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "instant",
      });
      expect(windowScrollSpy).not.toHaveBeenCalled();
    });

    it("skips a scrollable-in-theory ancestor whose content doesn't overflow", async () => {
      // A wrapper with `overflow: auto` but no actual overflow shouldn't
      // shadow the real page scroller further up. The walker should
      // pass through it and find nothing scrollable — so we hit window.
      const wrapper = document.createElement("div");
      wrapper.style.overflowY = "auto";
      Object.defineProperty(wrapper, "scrollHeight", {
        configurable: true,
        value: 500,
      });
      Object.defineProperty(wrapper, "clientHeight", {
        configurable: true,
        value: 800, // client >= scrollHeight → not actually scrollable
      });
      const wrapperScrollSpy = vi.fn();
      wrapper.scrollTo = wrapperScrollSpy;

      const outlet = document.createElement("div");
      wrapper.appendChild(outlet);
      document.body.appendChild(wrapper);

      await Effect.runPromise(runScrollBehavior("top", "/", "/about", outlet));

      expect(wrapperScrollSpy).not.toHaveBeenCalled();
      expect(windowScrollSpy).toHaveBeenCalled();
    });

    it("returns the outlet itself when the outlet's own element scrolls", async () => {
      // Someone gave the outlet slot container `overflow-y: auto`
      // directly. The walker should check the outlet first, not
      // skip past it.
      const outlet = document.createElement("div");
      outlet.style.overflowY = "auto";
      Object.defineProperty(outlet, "scrollHeight", {
        configurable: true,
        value: 1200,
      });
      Object.defineProperty(outlet, "clientHeight", {
        configurable: true,
        value: 600,
      });
      const outletScrollSpy = vi.fn();
      outlet.scrollTo = outletScrollSpy;
      document.body.appendChild(outlet);

      await Effect.runPromise(runScrollBehavior("top", "/", "/about", outlet));

      expect(outletScrollSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "instant",
      });
      expect(windowScrollSpy).not.toHaveBeenCalled();
    });

    it("picks the INNERMOST scrollable ancestor when the tree has several", async () => {
      // Both an outer app shell AND an inner panel are scrollable;
      // navigation should reset the innermost — that's the one the
      // route content lives in visually.
      const outer = document.createElement("div");
      outer.style.overflowY = "auto";
      Object.defineProperty(outer, "scrollHeight", {
        configurable: true,
        value: 3000,
      });
      Object.defineProperty(outer, "clientHeight", {
        configurable: true,
        value: 800,
      });
      const outerScrollSpy = vi.fn();
      outer.scrollTo = outerScrollSpy;

      const inner = document.createElement("div");
      inner.style.overflowY = "auto";
      Object.defineProperty(inner, "scrollHeight", {
        configurable: true,
        value: 1500,
      });
      Object.defineProperty(inner, "clientHeight", {
        configurable: true,
        value: 600,
      });
      const innerScrollSpy = vi.fn();
      inner.scrollTo = innerScrollSpy;

      const outlet = document.createElement("div");
      inner.appendChild(outlet);
      outer.appendChild(inner);
      document.body.appendChild(outer);

      await Effect.runPromise(runScrollBehavior("top", "/", "/about", outlet));

      expect(innerScrollSpy).toHaveBeenCalled();
      expect(outerScrollSpy).not.toHaveBeenCalled();
      expect(windowScrollSpy).not.toHaveBeenCalled();
    });
  });
});
