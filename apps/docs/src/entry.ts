/**
 * SSG entry point for the docs site.
 *
 * Exports router, app, and document config for buildStaticSite().
 * Also exports a render() function for the dev server.
 */

import { HttpApp, HttpRouter } from "@effect/platform";

import { Platform } from "@stax-ui/platform";

import { StorageNoOp } from "./components/TodoApp/index.js";
import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

const documentOptions = {
  title: "Stax Docs",
  scripts: ["/src/client.ts"],
  styles: ["/src/styles.css"],
  htmlAttrs: { lang: "en" },
  head: [
    '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
    '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    // Pre-paint theme resolution: read stored preference (if any),
    // else fall back to system `prefers-color-scheme`. Runs inline
    // during head parsing so `data-theme` is settled before the CSS
    // paints — no theme flash on first load.
    `<script>(function(){try{var s=localStorage.getItem('stax-theme');var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}})();</script>`,
  ].join("\n    "),
};

// Used by buildStaticSite() at build time
export { router };
export const app = DocLayout;
export const document = documentOptions;
// SSG-time layer stack. `StorageNoOp` seeds every `Storage.persist`
// call with its defaults and drops writes on the floor — there's no
// real `localStorage` on the server, and pre-hydration renders
// wouldn't be persisting anyway.
export const layers = StorageNoOp;

// Used by the dev server during development
const staxRoutes = Platform.toHttpRoutes(router, {
  app: DocLayout,
  document: documentOptions,
});

const httpApp = HttpRouter.empty.pipe(HttpRouter.concat(staxRoutes));

// Dev-server SSR runs the same routes as SSG, so it needs the same
// service layers — Storage on the server is a no-op, since there's
// no real `localStorage` and pre-hydration renders don't persist.
// `toWebHandlerLayer` peels those requirements off the HttpApp so
// the resulting handler only needs `Scope`, which the runtime
// supplies.
const { handler } = HttpApp.toWebHandlerLayer(httpApp, layers);

export async function render(request: Request): Promise<Response> {
  return handler(request);
}
