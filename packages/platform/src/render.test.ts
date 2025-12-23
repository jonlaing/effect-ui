import { describe, it, expect } from "vitest";
import { div, span } from "@effex/dom";
import { render, renderToDocument } from "./render";

describe("render", () => {
  describe("render function", () => {
    it("should render a simple element to HTML", async () => {
      const result = await render(div({ class: "container" }, "Hello World"), {
        request: new Request("https://example.com/"),
      });

      expect(result.html).toContain("<div");
      expect(result.html).toContain('class="container"');
      expect(result.html).toContain("Hello World");
      expect(result.html).toContain("</div>");
    });

    it("should render nested elements", async () => {
      const result = await render(
        div({ class: "parent" }, [
          span({ class: "child" }, "First"),
          span({ class: "child" }, "Second"),
        ]),
        { request: new Request("https://example.com/") },
      );

      expect(result.html).toContain('<div class="parent">');
      expect(result.html).toContain("First");
      expect(result.html).toContain("Second");
    });

    // Note: Reactive element rendering is tested in @effex/dom/server tests.
    // Cross-package Effect type resolution issues prevent testing here.

    it("should return empty loader data when no loaders run", async () => {
      const result = await render(div("Simple"), {
        request: new Request("https://example.com/"),
      });

      expect(result.loaderData).toEqual({});
    });

    it("should return HTML-safe loader data script", async () => {
      const result = await render(div("Test"), {
        request: new Request("https://example.com/"),
      });

      expect(result.loaderDataScript).toBe("{}");
      // Should be safe to embed in script tag
      expect(result.loaderDataScript).not.toContain("<");
      expect(result.loaderDataScript).not.toContain(">");
    });

    it("should return response headers", async () => {
      const result = await render(div("Test"), {
        request: new Request("https://example.com/"),
      });

      expect(result.headers).toBeInstanceOf(Headers);
    });

    it("should return platform context", async () => {
      const result = await render(div("Test"), {
        request: new Request("https://example.com/"),
      });

      expect(result.platformContext.environment).toBe("server");
      expect(result.platformContext.request?.url).toBe("https://example.com/");
    });

    it("should escape HTML in text content", async () => {
      const result = await render(div("<script>alert('xss')</script>"), {
        request: new Request("https://example.com/"),
      });

      expect(result.html).not.toContain("<script>alert");
      expect(result.html).toContain("&lt;script&gt;");
    });
  });

  describe("renderToDocument", () => {
    it("should generate a complete HTML document", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result);

      expect(doc).toContain("<!DOCTYPE html>");
      expect(doc).toContain("<html>");
      expect(doc).toContain("<head>");
      expect(doc).toContain("</head>");
      expect(doc).toContain("<body>");
      expect(doc).toContain("</body>");
      expect(doc).toContain("</html>");
    });

    it("should use default title", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result);

      expect(doc).toContain("<title>Effex App</title>");
    });

    it("should use custom title", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, { title: "My Custom App" });

      expect(doc).toContain("<title>My Custom App</title>");
    });

    it("should escape HTML in title", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, {
        title: "<script>alert()</script>",
      });

      expect(doc).not.toContain("<title><script>");
      expect(doc).toContain("&lt;script&gt;");
    });

    it("should include stylesheet links", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, {
        styles: ["/app.css", "/theme.css"],
      });

      expect(doc).toContain('<link rel="stylesheet" href="/app.css">');
      expect(doc).toContain('<link rel="stylesheet" href="/theme.css">');
    });

    it("should include script tags", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, {
        scripts: ["/app.js", "/vendor.js"],
      });

      expect(doc).toContain('<script type="module" src="/app.js"></script>');
      expect(doc).toContain('<script type="module" src="/vendor.js"></script>');
    });

    it("should include custom head content", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, {
        head: '<meta name="description" content="Test app">',
      });

      expect(doc).toContain('<meta name="description" content="Test app">');
    });

    it("should include body attributes", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, {
        bodyAttributes: 'class="dark-mode" data-theme="dark"',
      });

      expect(doc).toContain('<body class="dark-mode" data-theme="dark">');
    });

    it("should use default root ID", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result);

      expect(doc).toContain('<div id="root">');
    });

    it("should use custom root ID", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, { rootId: "app" });

      expect(doc).toContain('<div id="app">');
    });

    it("should include loader data script", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result);

      expect(doc).toContain("window.__EFFEX_LOADER_DATA__ =");
    });

    it("should include viewport meta tag", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result);

      expect(doc).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
      );
    });

    it("should include charset meta tag", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result);

      expect(doc).toContain('<meta charset="utf-8">');
    });

    it("should escape HTML in script and style paths", async () => {
      const result = await render(div("Content"), {
        request: new Request("https://example.com/"),
      });

      const doc = renderToDocument(result, {
        scripts: ['/app.js" onload="alert(1)'],
        styles: ['/app.css" onload="alert(1)'],
      });

      expect(doc).not.toContain('onload="alert(1)"');
      expect(doc).toContain("&quot;");
    });
  });
});
