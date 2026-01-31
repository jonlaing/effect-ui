/**
 * Client-side mounting for Effex applications.
 *
 * @example
 * ```ts
 * import { mount, runApp } from "@effex/dom/client";
 * import { App } from "./App";
 *
 * runApp(
 *   Effect.gen(function* () {
 *     yield* mount(App(), document.getElementById("root")!)
 *   })
 * )
 * ```
 *
 * @module
 */

export { mount, runApp } from "./client.js";
