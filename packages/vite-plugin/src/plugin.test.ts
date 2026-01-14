import { describe, expect, it } from "vitest";

import { generateScaffold, injectRouteDefinePath } from "./plugin";

describe("injectRouteDefinePath", () => {
  it("should inject __path into Route.define()", () => {
    const code = `export const route = Route.define();`;
    const result = injectRouteDefinePath(code, "/users");

    expect(result).toBe(
      `export const route = Route.define({ __path: "/users" });`,
    );
  });

  it("should inject __path into Route.define({})", () => {
    const code = `export const route = Route.define({});`;
    const result = injectRouteDefinePath(code, "/users/:id");

    expect(result).toBe(
      `export const route = Route.define({ __path: "/users/:id", });`,
    );
  });

  it("should inject __path into Route.define with params", () => {
    const code = `export const route = Route.define({
  params: Schema.Struct({ id: Schema.String }),
});`;
    const result = injectRouteDefinePath(code, "/users/:id");

    expect(result).toContain(`__path: "/users/:id"`);
    expect(result).toContain(`params: Schema.Struct({ id: Schema.String })`);
  });

  it("should inject __path into Route.define with multiple options", () => {
    const code = `export const route = Route.define({
  params: Schema.Struct({ id: Schema.String }),
  loader: (params) => Effect.succeed({ name: "test" }),
});`;
    const result = injectRouteDefinePath(code, "/users/:id");

    expect(result).toContain(`__path: "/users/:id"`);
    expect(result).toContain(`params: Schema.Struct`);
    expect(result).toContain(`loader: (params)`);
  });

  it("should handle whitespace variations", () => {
    const code = `export const route = Route.define(   {   });`;
    const result = injectRouteDefinePath(code, "/about");

    expect(result).toContain(`__path: "/about"`);
  });

  it("should not modify code without Route.define", () => {
    const code = `export const route = Route.make("/users");`;
    const result = injectRouteDefinePath(code, "/users");

    expect(result).toBe(code);
  });

  it("should handle multiple Route.define calls", () => {
    const code = `
const route1 = Route.define({ params: Schema.Struct({ a: Schema.String }) });
const route2 = Route.define({ params: Schema.Struct({ b: Schema.String }) });
`;
    const result = injectRouteDefinePath(code, "/test");

    const matches = result.match(/__path: "\/test"/g);
    expect(matches).toHaveLength(2);
  });

  it("should escape special characters in path", () => {
    const code = `export const route = Route.define({});`;
    const result = injectRouteDefinePath(code, '/users/"special"');

    expect(result).toContain(`__path: "/users/\\"special\\""`);
  });

  it("should handle catch-all route", () => {
    const code = `export const route = Route.define({});`;
    const result = injectRouteDefinePath(code, "/*");

    expect(result).toContain(`__path: "/*"`);
  });

  it("should handle root route", () => {
    const code = `export const route = Route.define({});`;
    const result = injectRouteDefinePath(code, "/");

    expect(result).toContain(`__path: "/"`);
  });
});

describe("generateScaffold", () => {
  it("should generate scaffold for index route", () => {
    const scaffold = generateScaffold("_index.tsx");

    expect(scaffold).toContain('import { Effect } from "effect"');
    expect(scaffold).toContain('import { Route } from "@effex/router"');
    expect(scaffold).toContain('import { component, $ } from "@effex/dom"');
    expect(scaffold).toContain("export const route = Route.define()");
    expect(scaffold).toContain('export default component("IndexPage"');
    expect(scaffold).toContain("$.div([");
    expect(scaffold).toContain("$.h1([");
    expect(scaffold).not.toContain("Schema");
  });

  it("should generate scaffold for simple route", () => {
    const scaffold = generateScaffold("about.tsx");

    expect(scaffold).toContain("export const route = Route.define()");
    expect(scaffold).toContain('export default component("AboutPage"');
    expect(scaffold).not.toContain("Schema");
    expect(scaffold).not.toContain("route.params()");
  });

  it("should generate scaffold with params for dynamic route", () => {
    const scaffold = generateScaffold("users.$id.tsx");

    expect(scaffold).toContain('import { Schema } from "effect"');
    expect(scaffold).toContain("Schema.Struct({");
    expect(scaffold).toContain("id: Schema.String");
    expect(scaffold).toContain('export default component("UsersIdPage"');
    expect(scaffold).toContain("yield* route.params()");
  });

  it("should generate scaffold with multiple params", () => {
    const scaffold = generateScaffold("users.$userId.posts.$postId.tsx");

    expect(scaffold).toContain("userId: Schema.String");
    expect(scaffold).toContain("postId: Schema.String");
    expect(scaffold).toContain(
      'export default component("UsersUserIdPostsPostIdPage"',
    );
  });

  it("should generate scaffold for nested route", () => {
    const scaffold = generateScaffold("settings.profile.tsx");

    expect(scaffold).toContain("export const route = Route.define()");
    expect(scaffold).toContain(
      'export default component("SettingsProfilePage"',
    );
  });

  it("should handle catch-all route", () => {
    const scaffold = generateScaffold("$.tsx");

    expect(scaffold).toContain("export const route = Route.define()");
    expect(scaffold).toContain('export default component("Page"');
  });
});
