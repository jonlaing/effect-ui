import { describe, it, expect } from "vitest";
import { generateRoutes } from "./generator";
import type { ScannedRoute } from "./types";

describe("generateRoutes", () => {
  it("should generate routes file for a single route", () => {
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
          hasParams: false,
          hasLoader: false,
          hasAction: false,
          hasDefaultExport: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain('import { Route } from "@effex/router"');
    expect(code).toContain('import * as IndexRoute from "../routes/_index"');
    expect(code).toContain('import IndexComponent from "../routes/_index"');
    expect(code).toContain('index: Route.make("/")');
    expect(code).toContain("index: IndexComponent");
    expect(code).toContain("export type Routes = typeof routes");
  });

  it("should generate routes with loader and params", () => {
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
          hasParams: true,
          hasLoader: true,
          hasAction: false,
          hasDefaultExport: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain('users_$id: Route.make("/users/:id", {');
    expect(code).toContain("params: UsersIdRoute.params");
    expect(code).toContain("loader: UsersIdRoute.loader");
    expect(code).not.toContain("action: UsersIdRoute.action");
  });

  it("should generate routes with all exports", () => {
    const routes: ScannedRoute[] = [
      {
        filePath: "contacts.$id.tsx",
        routePath: "/contacts/:id",
        routeName: "contacts_$id",
        importName: "ContactsIdRoute",
        componentImportName: "ContactsIdComponent",
        isLayout: false,
        isIndex: false,
        exports: {
          hasParams: true,
          hasLoader: true,
          hasAction: true,
          hasDefaultExport: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain("params: ContactsIdRoute.params");
    expect(code).toContain("loader: ContactsIdRoute.loader");
    expect(code).toContain("action: ContactsIdRoute.action");
  });

  it("should generate multiple routes", () => {
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
          hasParams: false,
          hasLoader: false,
          hasAction: false,
          hasDefaultExport: true,
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
          hasParams: false,
          hasLoader: false,
          hasAction: false,
          hasDefaultExport: true,
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
          hasParams: true,
          hasLoader: true,
          hasAction: true,
          hasDefaultExport: true,
        },
      },
    ];

    const code = generateRoutes(routes, {
      routesDir: "/app/src/routes",
      outputPath: "/app/src/generated/routes.ts",
    });

    expect(code).toContain("index: Route.make");
    expect(code).toContain("about: Route.make");
    expect(code).toContain("users_$id: Route.make");
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
      'export type AppRouter = import("@effex/router").RouterInfer<Routes>',
    );
  });
});
