import { describe, it, expect } from "vitest";
import { toKebabCase, toCamelCase } from "./strings";

describe("toKebabCase", () => {
  it("should convert camelCase to kebab-case", () => {
    expect(toKebabCase("backgroundColor")).toBe("background-color");
    expect(toKebabCase("fontSize")).toBe("font-size");
    expect(toKebabCase("borderTopLeftRadius")).toBe("border-top-left-radius");
  });

  it("should leave kebab-case unchanged", () => {
    expect(toKebabCase("background-color")).toBe("background-color");
    expect(toKebabCase("font-size")).toBe("font-size");
  });

  it("should leave lowercase strings unchanged", () => {
    expect(toKebabCase("color")).toBe("color");
    expect(toKebabCase("margin")).toBe("margin");
  });
});

describe("toCamelCase", () => {
  it("should convert kebab-case to camelCase", () => {
    expect(toCamelCase("background-color")).toBe("backgroundColor");
    expect(toCamelCase("font-size")).toBe("fontSize");
    expect(toCamelCase("border-top-left-radius")).toBe("borderTopLeftRadius");
  });

  it("should leave camelCase unchanged", () => {
    expect(toCamelCase("backgroundColor")).toBe("backgroundColor");
    expect(toCamelCase("fontSize")).toBe("fontSize");
  });

  it("should leave lowercase strings unchanged", () => {
    expect(toCamelCase("color")).toBe("color");
    expect(toCamelCase("margin")).toBe("margin");
  });
});
