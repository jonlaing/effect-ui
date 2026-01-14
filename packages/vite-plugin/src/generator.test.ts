import { describe, expect, it } from "vitest";

import { generateRoutes } from "./generator";
import type { ScannedRoute } from "./types";

describe("generateRoutes", () => {
  it("should generate routes file for a single route without Route.define", () => {
    const routes: ScannedRoute[] = [
      {
        filePath: "_index.tsx",
        routePath: "/",
        routeName: "index",
        importName: "IndexRoute",
        componentImportName: "IndexComponent",
        isLayout: false,
        isIndex: true,
        exports: {
          hasDefaultExport: true,
          hasRoute: false,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain('import { Route } from "@effex/platform"');
    expect(code).toContain('import * as IndexRoute from "../routes/_index"');
    expect(code).toContain('import IndexComponent from "../routes/_index"');
    expect(code).toContain('index: Route.make("/"),');
    expect(code).toContain("index: IndexComponent");
    expect(code).toContain("export type Routes = typeof routes");
  });

  it("should generate routes from DefinedRoute export", () => {
    const routes: ScannedRoute[] = [
      {
        filePath: "users.$id.tsx",
        routePath: "/users/:id",
        routeName: "users_$id",
        importName: "UsersIdRoute",
        componentImportName: "UsersIdComponent",
        isLayout: false,
        isIndex: false,
        exports: {
          hasDefaultExport: true,
          hasRoute: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain("users_$id: Route.make(UsersIdRoute.route._path, {");
    expect(code).toContain("params: UsersIdRoute.route._config.paramsSchema");
    expect(code).toContain("loader: UsersIdRoute.route._config.loader");
    expect(code).toContain("action: UsersIdRoute.route._config.action");
  });

  it("should generate multiple routes with mixed styles", () => {
    const routes: ScannedRoute[] = [
      {
        filePath: "_index.tsx",
        routePath: "/",
        routeName: "index",
        importName: "IndexRoute",
        componentImportName: "IndexComponent",
        isLayout: false,
        isIndex: true,
        exports: {
          hasDefaultExport: true,
          hasRoute: true,
        },
      },
      {
        filePath: "about.tsx",
        routePath: "/about",
        routeName: "about",
        importName: "AboutRoute",
        componentImportName: "AboutComponent",
        isLayout: false,
        isIndex: false,
        exports: {
          hasDefaultExport: true,
          hasRoute: false,
        },
      },
      {
        filePath: "users.$id.tsx",
        routePath: "/users/:id",
        routeName: "users_$id",
        importName: "UsersIdRoute",
        componentImportName: "UsersIdComponent",
        isLayout: false,
        isIndex: false,
        exports: {
          hasDefaultExport: true,
          hasRoute: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    // Route with Route.define uses _path and _config
    expect(code).toContain("index: Route.make(IndexRoute.route._path, {");
    // Route without Route.define uses hardcoded path
    expect(code).toContain('about: Route.make("/about"),');
    // Route with Route.define uses _path and _config
    expect(code).toContain("users_$id: Route.make(UsersIdRoute.route._path, {");

    expect(code).toContain("index: IndexComponent");
    expect(code).toContain("about: AboutComponent");
    expect(code).toContain("users_$id: UsersIdComponent");
  });

  it("should include type exports", () => {
    const routes: ScannedRoute[] = [];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain("export type Routes = typeof routes");
    expect(code).toContain("export type RouteNames = keyof Routes");
    expect(code).toContain(
      'export type AppRouter = import("@effex/platform").RouterInfer<Routes>',
    );
  });

  it("should handle nested route paths correctly", () => {
    const routes: ScannedRoute[] = [
      {
        filePath: "users/_index.tsx",
        routePath: "/users",
        routeName: "users_index",
        importName: "UsersIndexRoute",
        componentImportName: "UsersIndexComponent",
        isLayout: false,
        isIndex: true,
        exports: {
          hasDefaultExport: true,
          hasRoute: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain(
      'import * as UsersIndexRoute from "../routes/users/_index"',
    );
    expect(code).toContain(
      "users_index: Route.make(UsersIndexRoute.route._path, {",
    );
  });
});
