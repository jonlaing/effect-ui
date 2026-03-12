import { describe, expect, it } from "vitest";

import { stripServerCode } from "./plugin.js";

describe("stripServerCode", () => {
  describe("Route.get loader stripping", () => {
    it("strips inline loader function", () => {
      const input = `
Route.get(
  ({ params }) => Effect.gen(function* () {
    const svc = yield* PostService;
    return yield* svc.getPosts();
  }),
  (data) => FeedPage(data),
)`;
      const result = stripServerCode(input);
      expect(result).toContain("Route.get(null,");
      expect(result).toContain("(data) => FeedPage(data)");
      expect(result).not.toContain("PostService");
    });

    it("strips loader with destructured params", () => {
      const input = `Route.get(({ params: { id } }) => Effect.gen(function* () {
    const svc = yield* PostService;
    return yield* svc.getUser(id);
  }), (data) => UserPage(data))`;
      const result = stripServerCode(input);
      expect(result).toContain("Route.get(null,");
      expect(result).toContain("(data) => UserPage(data)");
      expect(result).not.toContain("PostService");
    });

    it("handles multiple Route.get calls", () => {
      const input = `
const A = Route.make("/a").pipe(
  Route.get(
    () => Effect.succeed("a"),
    (d) => PageA(d),
  ),
);
const B = Route.make("/b").pipe(
  Route.get(
    () => Effect.succeed("b"),
    (d) => PageB(d),
  ),
);`;
      const result = stripServerCode(input);
      expect(result).not.toContain('Effect.succeed("a")');
      expect(result).not.toContain('Effect.succeed("b")');
      expect(result).toContain("(d) => PageA(d)");
      expect(result).toContain("(d) => PageB(d)");
    });

    it("preserves code outside Route.get", () => {
      const input = `
import { Route } from "@effex/router";
const FeedRoute = Route.make("/").pipe(
  Route.get(() => loadData(), (d) => Page(d)),
);
export { FeedRoute };`;
      const result = stripServerCode(input);
      expect(result).toContain('import { Route } from "@effex/router"');
      expect(result).toContain('Route.make("/")');
      expect(result).toContain("export { FeedRoute }");
    });
  });

  describe("Route.post/put/del handler stripping", () => {
    it("strips handler but keeps key", () => {
      const input = `Route.post("create", (body) => Effect.gen(function* () {
    const svc = yield* PostService;
    return yield* svc.createPost(body);
  }))`;
      const result = stripServerCode(input);
      expect(result).toContain('Route.post("create",');
      expect(result).toContain("server only");
      expect(result).not.toContain("PostService");
    });

    it("strips Route.put handler", () => {
      const input = `Route.put("update", (body) => Effect.gen(function* () {
    return yield* db.update(body);
  }))`;
      const result = stripServerCode(input);
      expect(result).toContain('Route.put("update",');
      expect(result).toContain("server only");
      expect(result).not.toContain("db.update");
    });

    it("strips Route.del handler", () => {
      const input = `Route.del("remove", (body) => Effect.gen(function* () {
    return yield* db.delete(body);
  }))`;
      const result = stripServerCode(input);
      expect(result).toContain('Route.del("remove",');
      expect(result).toContain("server only");
      expect(result).not.toContain("db.delete");
    });

    it("handles string key with special characters", () => {
      const input = `Route.post("update-profile", handler)`;
      const result = stripServerCode(input);
      expect(result).toContain('"update-profile"');
      expect(result).toContain("server only");
    });
  });

  describe("combined Route.get + Route.post", () => {
    it("strips both loader and handler in a pipe chain", () => {
      const input = `
export const FeedRoute = Route.make("/").pipe(
  Route.get(
    ({}) => Effect.gen(function* () {
      const svc = yield* PostService;
      const posts = yield* svc.getPosts();
      return { posts };
    }),
    (data) => FeedPage(data),
  ),
  Route.post("create", (body) => Effect.gen(function* () {
    const { content } = body as { content: string };
    const svc = yield* PostService;
    return yield* svc.createPost("alice", content);
  })),
);`;
      const result = stripServerCode(input);
      // Loader stripped
      expect(result).toContain("Route.get(null,");
      expect(result).toContain("(data) => FeedPage(data)");
      // Handler stripped but key kept
      expect(result).toContain('Route.post("create",');
      expect(result).toContain("server only");
      // Server code removed
      expect(result).not.toContain("PostService");
      expect(result).not.toContain("svc.getPosts");
      expect(result).not.toContain("svc.createPost");
    });
  });

  describe("edge cases", () => {
    it("handles nested parentheses in loader", () => {
      const input = `Route.get(({ params }) => Effect.gen(function* () {
    const data = yield* Effect.tryPromise(() =>
      fetch("/api").then((r) => r.json())
    );
    return data;
  }), (d) => Page(d))`;
      const result = stripServerCode(input);
      expect(result).toContain("Route.get(null,");
      expect(result).not.toContain("fetch");
    });

    it("returns unchanged code when no Route calls present", () => {
      const input = `const x = 1;\nconst y = 2;`;
      const result = stripServerCode(input);
      expect(result).toBe(input);
    });

    it("handles loader with template literal strings", () => {
      const input =
        "Route.get(({ params }) => Effect.gen(function* () {\n    const url = `/api/users/${params.id}`;\n    return yield* fetchData(url);\n  }), (d) => Page(d))";
      const result = stripServerCode(input);
      expect(result).toContain("Route.get(null,");
      expect(result).not.toContain("fetchData");
    });
  });
});
