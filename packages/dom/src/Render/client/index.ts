/**
 * Client-side mounting for Stax applications.
 *
 * @example
 * ```ts
 * import { mount, runApp } from "@stax-ui/dom/client";
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
