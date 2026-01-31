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

import {
  RendererContext,
  type ControlCtx,
  type Renderer,
  type SuspenseBoundaryCtx,
} from "@effex/core";

import { SSRControlCtx } from "../Control/SSRControlCtx.js";
import * as Element from "../Element";
import { SSRSuspenseBoundaryCtx } from "../SuspenseBoundary/SSRSuspenseBoundaryCtx.js";
import { vnodeToString } from "./renderToString";
import { SSRContext, withSSRContext } from "./SSRContext";
import { StringRenderer } from "./StringRenderer";
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
export const renderToString = <A extends HTMLElement | SVGElement>(
  element: Element.Element<
    A,
    never,
    RendererContext | ControlCtx | SuspenseBoundaryCtx
  >,
  _options: RenderToStringOptions = {},
) => {
  const StringRendererLayer = Layer.succeed(
    RendererContext,
    StringRenderer as Renderer<unknown>,
  );

  const program = Effect.gen(function* () {
    // Get SSRContext to provide to SSRSuspenseBoundaryCtx
    const ssrContext = yield* SSRContext;
    const ssrContextLayer = Layer.succeed(SSRContext, ssrContext);

    // Build the suspense layer with its dependencies
    const suspenseLayer = Layer.provide(
      Layer.provide(SSRSuspenseBoundaryCtx, StringRendererLayer),
      ssrContextLayer,
    );

    const vnode = yield* element.pipe(Effect.provide(suspenseLayer));
    const result = vnodeToString(vnode as unknown as VNode);
    return result;
  });

  return Effect.scoped(program).pipe(
    Effect.provide(StringRendererLayer),
    Effect.provide(SSRControlCtx),
    withSSRContext,
  );
};

// Re-export types and utilities
export { SSRContext } from "./SSRContext";
export type { VNode, VElement, VText } from "./VNode";
export { StringRenderer } from "./StringRenderer";
