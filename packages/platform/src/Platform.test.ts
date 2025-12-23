import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Effect, Layer } from "effect";
import {
  Platform,
  PlatformContext,
  makeServerPlatformContext,
  makeClientPlatformContext,
  makeServerCookies,
  makeClientCookies,
} from "./Platform";

describe("Platform", () => {
  describe("makeServerPlatformContext", () => {
    it("should create a server platform context", () => {
      const request = new Request("https://example.com/");
      const ctx = makeServerPlatformContext(request);

      expect(ctx.environment).toBe("server");
      expect(ctx.request).toBe(request);
      expect(ctx.responseHeaders).toBeInstanceOf(Headers);
    });

    it("should have empty response headers initially", () => {
      const request = new Request("https://example.com/");
      const ctx = makeServerPlatformContext(request);

      expect([...ctx.responseHeaders.entries()]).toHaveLength(0);
    });
  });

  describe("makeClientPlatformContext", () => {
    it("should create a client platform context", () => {
      const ctx = makeClientPlatformContext();

      expect(ctx.environment).toBe("client");
      expect(ctx.request).toBeUndefined();
      expect(ctx.responseHeaders).toBeInstanceOf(Headers);
    });
  });

  describe("makeServerCookies", () => {
    it("should parse cookies from request header", async () => {
      const request = new Request("https://example.com/", {
        headers: { cookie: "session=abc123; theme=dark" },
      });
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      const session = await Effect.runPromise(cookies.get("session"));
      const theme = await Effect.runPromise(cookies.get("theme"));

      expect(session).toBe("abc123");
      expect(theme).toBe("dark");
    });

    it("should return undefined for non-existent cookies", async () => {
      const request = new Request("https://example.com/", {
        headers: { cookie: "existing=value" },
      });
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      const result = await Effect.runPromise(cookies.get("nonexistent"));
      expect(result).toBeUndefined();
    });

    it("should return all cookies with getAll", async () => {
      const request = new Request("https://example.com/", {
        headers: { cookie: "a=1; b=2; c=3" },
      });
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      const all = await Effect.runPromise(cookies.getAll());
      expect(all).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should set cookies via Set-Cookie header", async () => {
      const request = new Request("https://example.com/");
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      await Effect.runPromise(cookies.set("token", "xyz789"));

      const setCookie = responseHeaders.get("Set-Cookie");
      expect(setCookie).toContain("token=xyz789");
    });

    it("should set cookies with options", async () => {
      const request = new Request("https://example.com/");
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      await Effect.runPromise(
        cookies.set("session", "abc", {
          maxAge: 3600,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "strict",
        }),
      );

      const setCookie = responseHeaders.get("Set-Cookie");
      expect(setCookie).toContain("session=abc");
      expect(setCookie).toContain("Max-Age=3600");
      expect(setCookie).toContain("Path=/");
      expect(setCookie).toContain("Secure");
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("SameSite=strict");
    });

    it("should delete cookies by setting Max-Age=0", async () => {
      const request = new Request("https://example.com/");
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      await Effect.runPromise(cookies.delete("session"));

      const setCookie = responseHeaders.get("Set-Cookie");
      expect(setCookie).toContain("session=");
      expect(setCookie).toContain("Max-Age=0");
    });

    it("should handle empty cookie header", async () => {
      const request = new Request("https://example.com/");
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      const all = await Effect.runPromise(cookies.getAll());
      expect(all).toEqual({});
    });

    it("should handle cookies with = in value", async () => {
      const request = new Request("https://example.com/", {
        headers: { cookie: "data=base64==" },
      });
      const responseHeaders = new Headers();
      const cookies = makeServerCookies(request, responseHeaders);

      const data = await Effect.runPromise(cookies.get("data"));
      expect(data).toBe("base64==");
    });
  });

  describe("Platform service", () => {
    it("should return server environment on server", async () => {
      const request = new Request("https://example.com/");
      const ctx = makeServerPlatformContext(request);
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.environment, layer),
      );
      expect(result).toBe("server");
    });

    it("should return client environment on client", async () => {
      const ctx = makeClientPlatformContext();
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.environment, layer),
      );
      expect(result).toBe("client");
    });

    it("should return true for isServer on server", async () => {
      const request = new Request("https://example.com/");
      const ctx = makeServerPlatformContext(request);
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.isServer, layer),
      );
      expect(result).toBe(true);
    });

    it("should return false for isServer on client", async () => {
      const ctx = makeClientPlatformContext();
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.isServer, layer),
      );
      expect(result).toBe(false);
    });

    it("should return false for isClient on server", async () => {
      const request = new Request("https://example.com/");
      const ctx = makeServerPlatformContext(request);
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.isClient, layer),
      );
      expect(result).toBe(false);
    });

    it("should return true for isClient on client", async () => {
      const ctx = makeClientPlatformContext();
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.isClient, layer),
      );
      expect(result).toBe(true);
    });

    it("should provide cookies access", async () => {
      const request = new Request("https://example.com/", {
        headers: { cookie: "test=value" },
      });
      const ctx = makeServerPlatformContext(request);
      const layer = Layer.succeed(PlatformContext, ctx);

      const cookies = await Effect.runPromise(
        Effect.provide(Platform.cookies, layer),
      );
      const value = await Effect.runPromise(cookies.get("test"));
      expect(value).toBe("value");
    });

    it("should provide request access on server", async () => {
      const request = new Request("https://example.com/path");
      const ctx = makeServerPlatformContext(request);
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.request, layer),
      );
      expect(result).toBe(request);
      expect(result?.url).toBe("https://example.com/path");
    });

    it("should return undefined for request on client", async () => {
      const ctx = makeClientPlatformContext();
      const layer = Layer.succeed(PlatformContext, ctx);

      const result = await Effect.runPromise(
        Effect.provide(Platform.request, layer),
      );
      expect(result).toBeUndefined();
    });

    it("should set response headers", async () => {
      const request = new Request("https://example.com/");
      const ctx = makeServerPlatformContext(request);
      const layer = Layer.succeed(PlatformContext, ctx);

      await Effect.runPromise(
        Effect.provide(Platform.setHeader("X-Custom", "value"), layer),
      );

      expect(ctx.responseHeaders.get("X-Custom")).toBe("value");
    });
  });

  describe("makeClientCookies", () => {
    let originalDocument: typeof document;

    beforeEach(() => {
      originalDocument = globalThis.document;
      // Mock document.cookie
      let cookieStore = "";
      Object.defineProperty(globalThis, "document", {
        value: {
          get cookie() {
            return cookieStore;
          },
          set cookie(val: string) {
            // Simple mock that just stores the last set value
            // In reality, browsers parse and manage cookies
            const [nameValue] = val.split(";");
            const [name, value] = nameValue.split("=");
            if (value === "" || val.includes("max-age=0")) {
              // Delete cookie
              const cookies = cookieStore
                .split("; ")
                .filter((c) => !c.startsWith(name + "="));
              cookieStore = cookies.join("; ");
            } else {
              // Add/update cookie
              const cookies = cookieStore
                .split("; ")
                .filter((c) => c && !c.startsWith(name + "="));
              cookies.push(nameValue);
              cookieStore = cookies.join("; ");
            }
          },
        },
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, "document", {
        value: originalDocument,
        configurable: true,
      });
    });

    it("should get cookies from document.cookie", async () => {
      document.cookie = "user=alice";
      const cookies = makeClientCookies();

      const user = await Effect.runPromise(cookies.get("user"));
      expect(user).toBe("alice");
    });

    it("should get all cookies", async () => {
      document.cookie = "a=1";
      document.cookie = "b=2";
      const cookies = makeClientCookies();

      const all = await Effect.runPromise(cookies.getAll());
      expect(all).toEqual({ a: "1", b: "2" });
    });

    it("should set cookies via document.cookie", async () => {
      const cookies = makeClientCookies();

      await Effect.runPromise(cookies.set("session", "xyz"));

      expect(document.cookie).toContain("session=xyz");
    });

    it("should delete cookies", async () => {
      document.cookie = "toDelete=value";
      const cookies = makeClientCookies();

      await Effect.runPromise(cookies.delete("toDelete"));

      expect(document.cookie).not.toContain("toDelete");
    });
  });
});
