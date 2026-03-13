/**
 * @effex/vite-plugin
 *
 * Vite plugin for Effex Platform SSR applications.
 *
 * `effexPlatform()` provides:
 * - Server-code stripping from client builds (loaders + handlers)
 * - SSR dev server with HMR (when `entry` is provided)
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { effexPlatform } from "@effex/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     effexPlatform({ entry: "src/server-entry.ts" }),
 *   ],
 * });
 * ```
 *
 * @packageDocumentation
 */

export { effexPlatform, type EffexPlatformOptions } from "./plugin.js";
