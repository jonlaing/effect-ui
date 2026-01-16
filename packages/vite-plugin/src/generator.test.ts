import { describe, expect, it } from "vitest";

import { generateRoutes } from "./generator";
import type { ScannedLayout, ScannedRoute } from "./types";

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
        layouts: [],
      },
    ];

    const code = generateRoutes(
      { routes, layouts: [] },
      {
        routesDir: "/app/src/routes",
        outputPath: "/app/src/generated/routes.ts",
      },
    );

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
        layouts: [],
      },
    ];

    const code = generateRoutes(
      { routes, layouts: [] },
      {
        routesDir: "/app/src/routes",
        outputPath: "/app/src/generated/routes.ts",
      },
    );

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
        layouts: [],
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
        layouts: [],
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
        layouts: [],
      },
    ];

    const code = generateRoutes(
      { routes, layouts: [] },
      {
        routesDir: "/app/src/routes",
        outputPath: "/app/src/generated/routes.ts",
      },
    );

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
    const code = generateRoutes(
      { routes: [], layouts: [] },
      {
        routesDir: "/app/src/routes",
        outputPath: "/app/src/generated/routes.ts",
      },
    );

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
        layouts: [],
      },
    ];

    const code = generateRoutes(
      { routes, layouts: [] },
      {
        routesDir: "/app/src/routes",
        outputPath: "/app/src/generated/routes.ts",
      },
    );

    expect(code).toContain(
      'import * as UsersIndexRoute from "../routes/users/_index"',
    );
    expect(code).toContain(
      "users_index: Route.make(UsersIndexRoute.route._path, {",
    );
  });

  it("should generate layouts and layout hierarchy", () => {
    const layouts: ScannedLayout[] = [
      {
        filePath: "_layout.tsx",
        layoutName: "root_layout",
        importName: "RootLayoutRoute",
        componentImportName: "RootLayoutComponent",
        pathPrefix: "/",
        parentLayout: null,
        exports: {
          hasDefaultExport: true,
          hasRoute: false,
        },
      },
      {
        filePath: "users._layout.tsx",
        layoutName: "users_layout",
        importName: "UsersLayoutRoute",
        componentImportName: "UsersLayoutComponent",
        pathPrefix: "/users",
        parentLayout: "root_layout",
        exports: {
          hasDefaultExport: true,
          hasRoute: true,
        },
      },
    ];

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
        layouts: ["root_layout"],
      },
      {
        filePath: "users._index.tsx",
        routePath: "/users",
        routeName: "users",
        importName: "UsersRoute",
        componentImportName: "UsersComponent",
        isLayout: false,
        isIndex: true,
        exports: {
          hasDefaultExport: true,
          hasRoute: false,
        },
        layouts: ["root_layout", "users_layout"],
      },
    ];

    const code = generateRoutes(
      { routes, layouts },
      {
        routesDir: "/app/src/routes",
        outputPath: "/app/src/generated/routes.ts",
      },
    );

    // Layout imports
    expect(code).toContain(
      'import * as RootLayoutRoute from "../routes/_layout"',
    );
    expect(code).toContain(
      'import RootLayoutComponent from "../routes/_layout"',
    );
    expect(code).toContain(
      'import * as UsersLayoutRoute from "../routes/users._layout"',
    );
    expect(code).toContain(
      'import UsersLayoutComponent from "../routes/users._layout"',
    );

    // Layout definitions
    expect(code).toContain("export const layouts = {");
    expect(code).toContain('root_layout: Route.make("/"),');
    expect(code).toContain(
      "users_layout: Route.make(UsersLayoutRoute.route._path, {",
    );

    // Layout components map
    expect(code).toContain("export const layoutComponents = {");
    expect(code).toContain("root_layout: RootLayoutComponent,");
    expect(code).toContain("users_layout: UsersLayoutComponent,");

    // Route layouts mapping
    expect(code).toContain("export const routeLayouts = {");
    expect(code).toContain('index: ["root_layout"] as const,');
    expect(code).toContain('users: ["root_layout", "users_layout"] as const,');

    // Layout parent relationships
    expect(code).toContain("export const layoutParents = {");
    expect(code).toContain("root_layout: null,");
    expect(code).toContain('users_layout: "root_layout" as const,');

    // Type exports
    expect(code).toContain("export type Layouts = typeof layouts");
    expect(code).toContain("export type LayoutNames = keyof Layouts");
  });
});
