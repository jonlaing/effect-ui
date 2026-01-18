/**
 * Vite SSR entry point for development.
 */

import { Effect, Layer } from "effect";

import { Element, RendererContext, Router } from "@effex/platform";
import { EffexServer } from "@effex/platform/server";

import { App, baseDocumentConfig, routes } from "./app.js";

/**
 * Create the Vite dev server SSR handler.
 */
export const createHandler = () => {
  return async (url: string) => {
    return Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const router = yield* Router.make(routes);

          const html = yield* EffexServer.renderToDocument(
            App() as Element.Element<never, RendererContext>,
            {
              ...baseDocumentConfig,
              scripts: ["/@vite/client", "/src/client.ts"],
            },
          ).pipe(
            Effect.provide(router.layer as Layer.Layer<never, never, never>),
          );

          return html;
        }),
      ),
    );
  };
};
