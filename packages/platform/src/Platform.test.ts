import { describe, expect, it } from "vitest";

import { generateDocument, serializeForHtml } from "./Platform.js";

/**
 * The extractEmbeddedRouteData helper lives inline in Platform.ts. We
 * duplicate the same regex here to keep the test coupled to the emitted
 * script shape rather than to the private helper.
 */
const extractEmbeddedRouteData = (html: string): unknown => {
  const match = html.match(
    /<script[^>]*>\s*window\.__STAX_DATA__\s*=\s*(.+?)\s*<\/script>/s,
  );
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]);
  } catch {
    return undefined;
  }
};

describe("static-host data fallback (makeClientLayer)", () => {
  it("extracts the embedded __STAX_DATA__ blob from generateDocument output", () => {
    const payload = { data: { name: "Jon" }, actions: {} };
    const html = generateDocument("<div>hi</div>", payload);

    const extracted = extractEmbeddedRouteData(html);
    expect(extracted).toEqual(payload);
  });

  it("survives payloads with script-breaking characters", () => {
    // These are exactly the characters serializeForHtml escapes — the round
    // trip has to preserve them.
    const payload = {
      data: {
        html: "<script>alert('xss')</script>",
        ampersand: "a && b",
        closing: "</script>",
      },
      actions: {},
    };
    const html = generateDocument("<div>hi</div>", payload);

    const extracted = extractEmbeddedRouteData(html);
    expect(extracted).toEqual(payload);
  });

  it("returns undefined when no __STAX_DATA__ script is present", () => {
    const html = "<html><body><div>no data here</div></body></html>";
    expect(extractEmbeddedRouteData(html)).toBeUndefined();
  });

  it("returns undefined when the script content is malformed JSON", () => {
    const html = "<script>window.__STAX_DATA__=not-json</script>";
    expect(extractEmbeddedRouteData(html)).toBeUndefined();
  });

  it("handles the exact serializeForHtml output format", () => {
    // Sanity check on the escaping contract itself so the regex above
    // isn't operating on assumed-shape data.
    const payload = { data: { s: "<>&" }, actions: {} };
    const serialized = serializeForHtml(payload);
    expect(serialized).toContain("\\u003c");
    expect(serialized).toContain("\\u003e");
    expect(serialized).toContain("\\u0026");
    expect(JSON.parse(serialized)).toEqual(payload);
  });
});
