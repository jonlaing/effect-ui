/**
 * Server-side rendering for Effex.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { renderToString } from "@effex/dom/server";
 * import { App } from "./App";
 *
 * const handler = Effect.gen(function* () {
 *   const html = yield* renderToString(App());
 *   return new Response(`
 *     <!DOCTYPE html>
 *     <html>
 *       <body>
 *         <div id="root">${html}</div>
 *         <script src="/app.js"></script>
 *       </body>
 *     </html>
 *   `);
 * });
 * ```
 *
 * @module
 */

import { Effect, Layer } from "effect";
import { RendererContext, type Renderer } from "@effex/core";
import type { Element } from "../Element";
import { StringRenderer } from "./StringRenderer";
import { vnodeToString } from "./renderToString";
import { withSSRContext } from "./SSRContext";
import type { VNode } from "./VNode";

export interface RenderToStringOptions {
  /**
   * Whether to include hydration markers in the output.
   * Set to false for static rendering without client-side hydration.
   * @default true
   */
  readonly hydrate?: boolean;
}

/**
 * Render an Element to an HTML string for SSR.
 *
 * Returns an Effect that produces the HTML string. This fits naturally
 * into Effect.ts server handlers.
 *
 * @param element - The Element to render (must have all requirements satisfied except RendererContext)
 * @param options - Rendering options
 * @returns Effect producing the HTML string
 *
 * @example
 * ```ts
 * const handler = Effect.gen(function* () {
 *   const html = yield* renderToString(App());
 *   return new Response(`<div id="root">${html}</div>`);
 * });
 * ```
 */
export const renderToString = (
  element: Element<never, RendererContext>,
  _options: RenderToStringOptions = {},
) => {
  const StringRendererLayer = Layer.succeed(
    RendererContext,
    StringRenderer as Renderer<unknown>,
  );

  const program = Effect.gen(function* () {
    console.log("[renderToString] program starting, about to yield element...");
    const vnode = yield* element;
    console.log("[renderToString] element yielded, got vnode");
    const result = vnodeToString(vnode as unknown as VNode);
    console.log(
      "[renderToString] vnodeToString complete, length:",
      result?.length,
    );
    return result;
  });

  console.log("[renderToString] creating scoped effect with SSRContext...");
  return Effect.scoped(program).pipe(
    Effect.provide(StringRendererLayer),
    withSSRContext,
  );
};

// Re-export types and utilities
export { SSRContext } from "./SSRContext";
export type { VNode, VElement, VText } from "./VNode";
export { StringRenderer } from "./StringRenderer";
