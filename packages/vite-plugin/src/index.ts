/**
 * @effex/vite-plugin
 *
 * Vite plugin for file-based routing in Effex applications.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { effexRoutes } from "@effex/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     effexRoutes({
 *       routesDir: "src/routes",
 *       outputPath: "src/generated/routes.ts",
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/routes/users.$id.tsx
 * import { Effect, Schema } from "effect";
 * import { component, div, h1 } from "@effex/dom";
 *
 * export const params = Schema.Struct({ id: Schema.String });
 *
 * export const loader = (params) =>
 *   Effect.gen(function* () {
 *     return yield* UserService.getById(params.id);
 *   });
 *
 * const UserPage = component("UserPage", () =>
 *   Effect.gen(function* () {
 *     const user = yield* RouteLoader.loaderData();
 *     return yield* div([h1([user.name])]);
 *   })
 * );
 *
 * export default UserPage;
 * ```
 *
 * @packageDocumentation
 */

export { effexRoutes } from "./plugin.js";
export { effexSSR } from "./ssr.js";
export type {
  EffexPluginOptions,
  ScannedRoute,
  RouteExports,
} from "./types.js";
export type { EffexSSROptions } from "./ssr.js";
