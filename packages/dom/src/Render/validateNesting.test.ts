import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkNesting, warnIfInvalidNesting } from "./validateNesting.js";

describe("checkNesting", () => {
  it("flags a paragraph nested inside a paragraph", () => {
    expect(checkNesting("p", "p")).toMatch(/<p> inside <p>/);
  });

  it("flags block-level content inside a paragraph", () => {
    for (const child of ["div", "section", "ul", "form", "h1", "table"]) {
      expect(checkNesting("p", child)).toMatch(
        new RegExp(`<${child}> inside <p>`),
      );
    }
  });

  it("flags nested anchors", () => {
    expect(checkNesting("a", "a")).toMatch(/<a> inside <a>/);
  });

  it("flags interactive content inside a button", () => {
    for (const child of ["a", "button", "input", "select"]) {
      expect(checkNesting("button", child)).toMatch(
        new RegExp(`<${child}> inside <button>`),
      );
    }
  });

  it("flags nested forms", () => {
    expect(checkNesting("form", "form")).toMatch(/<form> inside <form>/);
  });

  it("does not flag valid nesting", () => {
    expect(checkNesting("div", "p")).toBeNull();
    expect(checkNesting("div", "div")).toBeNull();
    expect(checkNesting("p", "span")).toBeNull();
    expect(checkNesting("p", "a")).toBeNull();
    expect(checkNesting("p", "strong")).toBeNull();
    expect(checkNesting("a", "span")).toBeNull();
    expect(checkNesting("button", "span")).toBeNull();
    expect(checkNesting("button", "img")).toBeNull();
    expect(checkNesting("ul", "li")).toBeNull();
  });
});

describe("warnIfInvalidNesting", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("emits a console.warn on invalid nesting", () => {
    warnIfInvalidNesting("p", "div");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/\[@effex\/dom\]/);
    expect(warnSpy.mock.calls[0][0]).toMatch(/<div> inside <p>/);
  });

  it("is silent on valid nesting", () => {
    warnIfInvalidNesting("div", "p");
    warnIfInvalidNesting("ul", "li");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("is silent when either arg is missing (text nodes, comments, etc.)", () => {
    warnIfInvalidNesting(undefined, "div");
    warnIfInvalidNesting("p", undefined);
    warnIfInvalidNesting(undefined, undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("only warns once per parent-child pair (across calls)", () => {
    // The module-level Set caches across tests, so use a distinct pair that
    // no other test in this file exercises for warning-count assertions.
    warnIfInvalidNesting("form", "form");
    warnIfInvalidNesting("form", "form");
    warnIfInvalidNesting("form", "form");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("normalizes tag case", () => {
    warnIfInvalidNesting("BUTTON", "INPUT");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/<input> inside <button>/);
  });
});
