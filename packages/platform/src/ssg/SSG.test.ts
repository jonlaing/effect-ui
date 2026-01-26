import * as fs from "node:fs";
import * as path from "node:path";

import { Effect } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { $ } from "@effex/dom";

import {
  buildStaticPages,
  getStaticRoutes,
  type RouteDefinition,
  type StaticRouteConfigMap,
} from "./SSG.js";

// Mock fs module
vi.mock("node:fs", () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("SSG", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getStaticRoutes", () => {
    it("should return empty array when no routes are static", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: { path: "/" },
        about: { path: "/about" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: false, revalidate: undefined },
        about: { static: false, revalidate: undefined },
      };

      const result = await getStaticRoutes(routes, staticRouteConfig);
      expect(result).toEqual([]);
    });

    it("should return static routes with their paths", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: { path: "/" },
        about: { path: "/about" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: true, revalidate: undefined },
        about: { static: true, revalidate: 60 },
      };

      const result = await getStaticRoutes(routes, staticRouteConfig);
      expect(result).toEqual([
        { routeName: "index", path: "/", params: {} },
        { routeName: "about", path: "/about", params: {} },
      ]);
    });

    it("should expand dynamic routes using staticPaths", async () => {
      const routes: Record<string, RouteDefinition> = {
        blog_slug: { path: "/blog/:slug" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        blog_slug: {
          static: true,
          revalidate: undefined,
          staticPaths: async () => [
            { slug: "hello-world" },
            { slug: "getting-started" },
          ],
        },
      };

      const result = await getStaticRoutes(routes, staticRouteConfig);
      expect(result).toEqual([
        {
          routeName: "blog_slug",
          path: "/blog/hello-world",
          params: { slug: "hello-world" },
        },
        {
          routeName: "blog_slug",
          path: "/blog/getting-started",
          params: { slug: "getting-started" },
        },
      ]);
    });

    it("should skip dynamic routes without staticPaths", async () => {
      const routes: Record<string, RouteDefinition> = {
        users_id: { path: "/users/:id" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        users_id: {
          static: true,
          revalidate: undefined,
          // No staticPaths provided
        },
      };

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await getStaticRoutes(routes, staticRouteConfig);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("no staticPaths function"),
      );
    });
  });

  describe("buildStaticPages", () => {
    it("should build static pages and write them to disk", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: { path: "/" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: true, revalidate: undefined },
      };

      const components = {
        index: () => $.div($.of("Hello, World!")),
      };

      const result = await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
      });

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].path).toBe("/");
      expect(result.pages[0].routeName).toBe("index");
      expect(result.pages[0].html).toContain("Hello, World!");

      // Check fs.mkdir was called
      expect(fs.promises.mkdir).toHaveBeenCalledWith("/out", {
        recursive: true,
      });

      // Check fs.writeFile was called with correct path
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        "/out/index.html",
        expect.stringContaining("Hello, World!"),
        "utf-8",
      );
    });

    it("should create nested directories for nested routes", async () => {
      const routes: Record<string, RouteDefinition> = {
        about: { path: "/about" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        about: { static: true, revalidate: undefined },
      };

      const components = {
        about: () => $.div($.of("About page")),
      };

      await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
      });

      // Check fs.mkdir was called for nested directory
      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.dirname("/out/about/index.html"),
        { recursive: true },
      );

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        "/out/about/index.html",
        expect.any(String),
        "utf-8",
      );
    });

    it("should execute loaders and include data in output", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: {
          path: "/",
          loader: () => Effect.succeed({ message: "Data from loader" }),
        },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: true, revalidate: undefined },
      };

      const components = {
        index: () => $.div($.of("With loader")),
      };

      const result = await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
      });

      expect(result.pages[0].loaderData).toHaveProperty("index");
      expect(result.pages[0].loaderData.index.data).toEqual({
        message: "Data from loader",
      });
    });

    it("should use custom document generator when provided", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: { path: "/" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: true, revalidate: undefined },
      };

      const components = {
        index: () => $.div($.of("Content")),
      };

      const customGenerator = vi.fn((page) => `<custom>${page.html}</custom>`);

      await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
        generateDocument: customGenerator,
      });

      expect(customGenerator).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("<custom>"),
        "utf-8",
      );
    });

    it("should build multiple pages from dynamic routes", async () => {
      const routes: Record<string, RouteDefinition> = {
        blog_slug: { path: "/blog/:slug" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        blog_slug: {
          static: true,
          revalidate: undefined,
          staticPaths: async () => [{ slug: "post-1" }, { slug: "post-2" }],
        },
      };

      const components = {
        blog_slug: () => $.div($.of("Blog post")),
      };

      const result = await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
      });

      expect(result.pages).toHaveLength(2);
      expect(result.pages[0].path).toBe("/blog/post-1");
      expect(result.pages[1].path).toBe("/blog/post-2");

      expect(fs.promises.writeFile).toHaveBeenCalledTimes(2);
    });

    it("should include revalidate in page output", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: { path: "/" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: true, revalidate: 60 },
      };

      const components = {
        index: () => $.div($.of("ISR page")),
      };

      const result = await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
      });

      expect(result.pages[0].revalidate).toBe(60);
    });

    it("should skip routes not in staticRouteConfig", async () => {
      const routes: Record<string, RouteDefinition> = {
        index: { path: "/" },
        dynamic: { path: "/dynamic" },
      };

      const staticRouteConfig: StaticRouteConfigMap = {
        index: { static: true, revalidate: undefined },
        // dynamic is not in config
      };

      const components = {
        index: () => $.div($.of("Index")),
        dynamic: () => $.div($.of("Dynamic")),
      };

      const result = await buildStaticPages({
        routes,
        staticRouteConfig,
        components,
        createApp: (el) => el,
        outDir: "/out",
      });

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].routeName).toBe("index");
    });
  });
});
