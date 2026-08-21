/**
 * SSG entry point for the docs site.
 *
 * Exports router, app, and document config for buildStaticSite().
 * Also exports a render() function for the dev server.
 */

import { HttpApp, HttpRouter } from "@effect/platform";

import { Platform } from "@stax-ui/platform";

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

// Used by the dev server during development
const staxRoutes = Platform.toHttpRoutes(router, {
  app: DocLayout,
  document: documentOptions,
});

const httpApp = HttpRouter.empty.pipe(HttpRouter.concat(staxRoutes));
const handler = HttpApp.toWebHandler(httpApp);

export async function render(request: Request): Promise<Response> {
  return handler(request);
}
