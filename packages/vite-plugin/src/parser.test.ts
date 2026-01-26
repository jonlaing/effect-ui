import { describe, expect, it } from "vitest";

import { parseRouteExportsFromContent } from "./parser";

describe("parseRouteExportsFromContent", () => {
  it("should detect route export from Route.define", () => {
    const content = `
      import { Route } from "@effex/router";
      import { Schema } from "effect";

      export const route = Route.define({
        params: Schema.Struct({ id: Schema.String }),
        loader: (params) => Effect.succeed({ name: "test" }),
      });

      const UserPage = (): Element.Element<HTMLDivElement> =>
        Effect.gen(function* () {
          return yield* div([]);
        });
      export default UserPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect default export", () => {
    const content = `
      const MyComponent = (): Element.Element<HTMLDivElement> =>
        Effect.gen(function* () {
          return yield* div([]);
        });
      export default MyComponent;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
    expect(exports.hasRoute).toBe(false);
  });

  it("should detect inline default export", () => {
    const content = `
      const MyComponent = (): Element.Element<HTMLDivElement> =>
        Effect.gen(function* () {
          return yield* div([]);
        });
      export default MyComponent;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect re-exports with as default", () => {
    const content = `
      const MyPage = (): Element.Element<HTMLDivElement> =>
        Effect.gen(function* () {
          return yield* div([]);
        });
      export { MyPage as default };
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should handle file with only component (no Route.define)", () => {
    const content = `
      import { Effect } from "effect";
      import { Element, div } from "@effex/dom";

      const AboutPage = (): Element.Element<HTMLDivElement> =>
        Effect.gen(function* () {
          return yield* div(["About us"]);
        });

      export default AboutPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(false);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect route export with re-export syntax", () => {
    const content = `
      const route = Route.define({});
      export { route };
      export default MyPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should handle complete route file with Route.define", () => {
    const content = `
      import { Effect, Schema } from "effect";
      import { Element, div, h1 } from "@effex/dom";
      import { Route } from "@effex/router";

      export const route = Route.define({
        params: Schema.Struct({ id: Schema.String }),
        loader: (params) => Effect.succeed({ id: params.id, name: "Test" }),
        action: ({ formData }) => Effect.succeed({ success: true }),
      });

      const UserPage = (): Element.Element<HTMLDivElement> =>
        Effect.gen(function* () {
          return yield* div([h1(["User"])]);
        });

      export default UserPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect staticPaths export as const", () => {
    const content = `
      export const staticPaths = async () => [
        { slug: "hello-world" },
        { slug: "getting-started" },
      ];

      export const route = Route.define({ static: true });
      export default MyPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasStaticPaths).toBe(true);
  });

  it("should detect staticPaths export as function", () => {
    const content = `
      export async function staticPaths() {
        return [{ slug: "hello-world" }];
      }

      export const route = Route.define({ static: true });
      export default MyPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasStaticPaths).toBe(true);
  });

  it("should detect staticPaths export with re-export syntax", () => {
    const content = `
      const staticPaths = async () => [{ slug: "hello" }];
      export { staticPaths };
      export default MyPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasStaticPaths).toBe(true);
  });

  it("should not detect staticPaths when not exported", () => {
    const content = `
      const staticPaths = async () => [{ slug: "hello" }];
      export default MyPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasStaticPaths).toBe(false);
  });

  it("should detect all exports in a complete SSG route file", () => {
    const content = `
      import { Effect, Schema } from "effect";
      import { Route } from "@effex/router";

      export const route = Route.define({
        static: true,
        params: Schema.Struct({ slug: Schema.String }),
        loader: (params) => Effect.succeed({ title: params.slug }),
      });

      export const staticPaths = async () => {
        const posts = await fetchPosts();
        return posts.map(p => ({ slug: p.slug }));
      };

      export default BlogPostPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasStaticPaths).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });
});
