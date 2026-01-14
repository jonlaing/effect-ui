import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { escapeHtml, generateDocument, type DocumentOptions } from "./Document";
import type { SSRResult } from "./SSR";

const createMockSSRResult = (
  overrides: Partial<SSRResult> = {},
): SSRResult => ({
  html: "<div>Hello</div>",
  loaderData: {},
  loaderDataScript: "{}",
  actionData: null,
  actionDataScript: "null",
  headers: new Headers(),
  platformContext: {
    environment: "server" as const,
    responseHeaders: new Headers(),
    cookies: {
      get: () => Effect.succeed(undefined),
      getAll: () => Effect.succeed({}),
      set: () => Effect.void,
      delete: () => Effect.void,
    },
    request: new Request("http://localhost/"),
  },
  ...overrides,
});

describe("document", () => {
  describe("escapeHtml", () => {
    it("should escape ampersands", () => {
      expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
    });

    it("should escape less than", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    });

    it("should escape greater than", () => {
      expect(escapeHtml("a > b")).toBe("a &gt; b");
    });

    it("should escape double quotes", () => {
      expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
    });

    it("should escape single quotes", () => {
      expect(escapeHtml("it's")).toBe("it&#39;s");
    });

    it("should escape multiple special characters", () => {
      expect(escapeHtml('<a href="test">click & go</a>')).toBe(
        "&lt;a href=&quot;test&quot;&gt;click &amp; go&lt;/a&gt;",
      );
    });

    it("should handle empty string", () => {
      expect(escapeHtml("")).toBe("");
    });

    it("should handle string with no special characters", () => {
      expect(escapeHtml("hello world")).toBe("hello world");
    });
  });

  describe("generateDocument", () => {
    it("should generate basic HTML document", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("</html>");
      expect(html).toContain("<head>");
      expect(html).toContain("</head>");
      expect(html).toContain("<body>");
      expect(html).toContain("</body>");
    });

    it("should include SSR html content", () => {
      const result = createMockSSRResult({ html: "<div>Test Content</div>" });
      const html = generateDocument(result);

      expect(html).toContain("<div>Test Content</div>");
    });

    it("should use default title when not provided", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result);

      expect(html).toContain("<title>Effex App</title>");
    });

    it("should use custom title", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, { title: "My Custom App" });

      expect(html).toContain("<title>My Custom App</title>");
    });

    it("should escape title for XSS prevention", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, {
        title: "<script>alert(1)</script>",
      });

      expect(html).toContain("&lt;script&gt;");
      expect(html).not.toContain("<script>alert(1)</script>");
    });

    it("should include script tags", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, {
        scripts: ["/app.js", "/vendor.js"],
      });

      expect(html).toContain('<script type="module" src="/app.js"></script>');
      expect(html).toContain(
        '<script type="module" src="/vendor.js"></script>',
      );
    });

    it("should include style links", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, {
        styles: ["/app.css", "/theme.css"],
      });

      expect(html).toContain('<link rel="stylesheet" href="/app.css">');
      expect(html).toContain('<link rel="stylesheet" href="/theme.css">');
    });

    it("should include custom head content", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, {
        head: '<meta name="description" content="Test app">',
      });

      expect(html).toContain('<meta name="description" content="Test app">');
    });

    it("should include body attributes", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, {
        bodyAttributes: 'class="dark-mode" data-theme="dark"',
      });

      expect(html).toContain('<body class="dark-mode" data-theme="dark">');
    });

    it("should use default root id", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result);

      expect(html).toContain('<div id="root">');
    });

    it("should use custom root id", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result, { rootId: "app" });

      expect(html).toContain('<div id="app">');
    });

    it("should include loader data script", () => {
      const result = createMockSSRResult({
        loaderDataScript: '{"route":{"data":"test"}}',
      });
      const html = generateDocument(result);

      expect(html).toContain(
        'window.__EFFEX_LOADER_DATA__ = {"route":{"data":"test"}}',
      );
    });

    it("should include action data script", () => {
      const result = createMockSSRResult({
        actionDataScript: '{"routeName":"test","data":null}',
      });
      const html = generateDocument(result);

      expect(html).toContain(
        'window.__EFFEX_ACTION_DATA__ = {"routeName":"test","data":null}',
      );
    });

    it("should include meta viewport", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result);

      expect(html).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
      );
    });

    it("should include charset meta", () => {
      const result = createMockSSRResult();
      const html = generateDocument(result);

      expect(html).toContain('<meta charset="utf-8">');
    });
  });

  describe("DocumentOptions", () => {
    it("should support all configuration options", () => {
      const options: DocumentOptions = {
        title: "My App",
        scripts: ["/app.js"],
        styles: ["/app.css"],
        head: "<meta>",
        bodyAttributes: 'class="test"',
        rootId: "app",
      };

      expect(options.title).toBe("My App");
      expect(options.scripts).toHaveLength(1);
      expect(options.styles).toHaveLength(1);
      expect(options.head).toBe("<meta>");
      expect(options.bodyAttributes).toBe('class="test"');
      expect(options.rootId).toBe("app");
    });

    it("should allow partial options", () => {
      const options: DocumentOptions = {
        title: "Just Title",
      };

      expect(options.title).toBe("Just Title");
      expect(options.scripts).toBeUndefined();
    });

    it("should allow empty options", () => {
      const options: DocumentOptions = {};

      expect(options.title).toBeUndefined();
    });
  });
});
