import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import {
  serialize,
  deserialize,
  serializeSync,
  deserializeSync,
  serializeForHtml,
  serializeForHtmlSync,
} from "./Serialization";

describe("Serialization", () => {
  describe("basic types", () => {
    it("should serialize and deserialize strings", async () => {
      const original = "hello world";
      const json = await Effect.runPromise(serialize(original));
      const restored = await Effect.runPromise(deserialize<string>(json));
      expect(restored).toBe(original);
    });

    it("should serialize and deserialize numbers", async () => {
      const original = 42.5;
      const json = await Effect.runPromise(serialize(original));
      const restored = await Effect.runPromise(deserialize<number>(json));
      expect(restored).toBe(original);
    });

    it("should serialize and deserialize booleans", async () => {
      const json = await Effect.runPromise(serialize(true));
      const restored = await Effect.runPromise(deserialize<boolean>(json));
      expect(restored).toBe(true);
    });

    it("should serialize and deserialize null", async () => {
      const json = await Effect.runPromise(serialize(null));
      const restored = await Effect.runPromise(deserialize<null>(json));
      expect(restored).toBeNull();
    });

    it("should serialize and deserialize arrays", async () => {
      const original = [1, 2, 3, "four"];
      const json = await Effect.runPromise(serialize(original));
      const restored = await Effect.runPromise(
        deserialize<typeof original>(json),
      );
      expect(restored).toEqual(original);
    });

    it("should serialize and deserialize objects", async () => {
      const original = { name: "Alice", age: 30 };
      const json = await Effect.runPromise(serialize(original));
      const restored = await Effect.runPromise(
        deserialize<typeof original>(json),
      );
      expect(restored).toEqual(original);
    });
  });

  describe("special types", () => {
    it("should serialize and deserialize undefined", () => {
      const original = { value: undefined };
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);
      expect(restored.value).toBeUndefined();
    });

    it("should serialize and deserialize Date", () => {
      // Dates must be wrapped in an object for custom serialization
      // (JSON.stringify calls toJSON on root values before the replacer)
      const original = { date: new Date("2024-01-15T10:30:00Z") };
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);
      expect(restored.date).toBeInstanceOf(Date);
      expect(restored.date.toISOString()).toBe(original.date.toISOString());
    });

    it("should serialize and deserialize BigInt", () => {
      const original = BigInt("9007199254740993");
      const json = serializeSync(original);
      const restored = deserializeSync<bigint>(json);
      expect(restored).toBe(original);
    });

    it("should serialize and deserialize Map", () => {
      const original = new Map([
        ["a", 1],
        ["b", 2],
      ]);
      const json = serializeSync(original);
      const restored = deserializeSync<Map<string, number>>(json);
      expect(restored).toBeInstanceOf(Map);
      expect(restored.get("a")).toBe(1);
      expect(restored.get("b")).toBe(2);
    });

    it("should serialize and deserialize Set", () => {
      const original = new Set([1, 2, 3]);
      const json = serializeSync(original);
      const restored = deserializeSync<Set<number>>(json);
      expect(restored).toBeInstanceOf(Set);
      expect(restored.has(1)).toBe(true);
      expect(restored.has(2)).toBe(true);
      expect(restored.has(3)).toBe(true);
    });

    it("should serialize and deserialize RegExp", () => {
      const original = /test\d+/gi;
      const json = serializeSync(original);
      const restored = deserializeSync<RegExp>(json);
      expect(restored).toBeInstanceOf(RegExp);
      expect(restored.source).toBe(original.source);
      expect(restored.flags).toBe(original.flags);
    });

    it("should serialize and deserialize URL", () => {
      // URLs must be wrapped in an object for custom serialization
      // (JSON.stringify calls toString on root values before the replacer)
      const original = { url: new URL("https://example.com/path?query=1") };
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);
      expect(restored.url).toBeInstanceOf(URL);
      expect(restored.url.href).toBe(original.url.href);
    });

    it("should serialize and deserialize NaN", () => {
      const original = { value: NaN };
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);
      expect(Number.isNaN(restored.value)).toBe(true);
    });

    it("should serialize and deserialize Infinity", () => {
      const original = { pos: Infinity, neg: -Infinity };
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);
      expect(restored.pos).toBe(Infinity);
      expect(restored.neg).toBe(-Infinity);
    });
  });

  describe("nested special types", () => {
    it("should handle Map with Date values", () => {
      const date = new Date("2024-01-15");
      const original = new Map([["created", date]]);
      const json = serializeSync(original);
      const restored = deserializeSync<Map<string, Date>>(json);
      expect(restored.get("created")).toBeInstanceOf(Date);
      expect(restored.get("created")?.toISOString()).toBe(date.toISOString());
    });

    it("should handle objects with mixed special types", () => {
      const original = {
        date: new Date("2024-01-15"),
        items: new Set([1, 2, 3]),
        metadata: new Map([["key", "value"]]),
        pattern: /test/i,
        large: BigInt("12345678901234567890"),
      };
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);

      expect(restored.date).toBeInstanceOf(Date);
      expect(restored.items).toBeInstanceOf(Set);
      expect(restored.metadata).toBeInstanceOf(Map);
      expect(restored.pattern).toBeInstanceOf(RegExp);
      expect(restored.large).toBe(original.large);
    });

    it("should handle arrays with special types", () => {
      const original = [
        new Date("2024-01-15"),
        new Set([1, 2]),
        { nested: new Map([["a", 1]]) },
      ];
      const json = serializeSync(original);
      const restored = deserializeSync<typeof original>(json);

      expect(restored[0]).toBeInstanceOf(Date);
      expect(restored[1]).toBeInstanceOf(Set);
      expect(
        (restored[2] as { nested: Map<string, number> }).nested,
      ).toBeInstanceOf(Map);
    });
  });

  describe("serializeForHtml", () => {
    it("should escape < and > for HTML safety", async () => {
      const original = { html: "<script>alert('xss')</script>" };
      const json = await Effect.runPromise(serializeForHtml(original));
      expect(json).not.toContain("<script>");
      expect(json).toContain("\\u003c");
      expect(json).toContain("\\u003e");
    });

    it("should escape & for HTML safety", () => {
      const original = { text: "foo & bar" };
      const json = serializeForHtmlSync(original);
      expect(json).not.toContain(" & ");
      expect(json).toContain("\\u0026");
    });

    it("should produce valid JSON after escaping", () => {
      const original = { value: "<test>&</test>" };
      const escaped = serializeForHtmlSync(original);
      // The escaped string should still be parseable as JSON
      const parsed = JSON.parse(escaped);
      expect(parsed.value).toBe("<test>&</test>");
    });
  });

  describe("error handling", () => {
    it("should handle circular references gracefully", async () => {
      const circular: Record<string, unknown> = { name: "test" };
      circular.self = circular;

      const result = await Effect.runPromise(
        Effect.either(serialize(circular)),
      );
      expect(result._tag).toBe("Left");
    });

    it("should handle invalid JSON during deserialization", async () => {
      const result = await Effect.runPromise(
        Effect.either(deserialize("not valid json")),
      );
      expect(result._tag).toBe("Left");
    });
  });

  describe("sync API", () => {
    it("should work synchronously for serialize", () => {
      const json = serializeSync({ a: 1, b: "two" });
      expect(JSON.parse(json)).toEqual({ a: 1, b: "two" });
    });

    it("should work synchronously for deserialize", () => {
      const result = deserializeSync<{ a: number; b: string }>(
        '{"a":1,"b":"two"}',
      );
      expect(result).toEqual({ a: 1, b: "two" });
    });
  });
});
