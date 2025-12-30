/**
 * Server-only exports for @effex/platform
 *
 * Import from "@effex/platform/server" to ensure you only use
 * server-safe modules. These should never be imported in client bundles.
 *
 * @example
 * ```ts
 * import { render, EffexServer } from "@effex/platform/server";
 * ```
 */

// Server-side rendering
export {
  render,
  renderToDocument,
  type RenderOptions,
  type RenderResult,
} from "./rendering/Render.js";

export { performSSR, type SSRRouter, type SSRResult } from "./rendering/SSR.js";

export {
  generateDocument,
  escapeHtml,
  type DocumentOptions,
} from "./rendering/Document.js";

// Action execution (server-side)
export {
  makeActionData,
  type ActionData,
  type ActionRouter,
} from "./actions/Actions.js";

// HTTP server integration
export {
  EffexServer,
  makeHttpApp,
  makeRouter,
  makeFullApp,
  renderRequest,
  type EffexAppOptions,
  type RenderRequestOptions,
} from "./http/Server.js";

// Shared modules (also available in server context)
export {
  Platform,
  PlatformContext,
  makeServerPlatformContext,
  makeServerCookies,
  type PlatformEnvironment,
  type PlatformContextType,
  type CookieOptions,
  type Cookies,
} from "./Platform.js";

export {
  serialize,
  deserialize,
  serializeSync,
  deserializeSync,
  serializeForHtml,
  serializeForHtmlSync,
  reviveTypeMarker,
  SerializationError,
  DeserializationError,
} from "./Serialization.js";

export {
  RouteLoader,
  LoaderContextTag,
  ActionContextTag,
  makeLoaderContext,
  makeActionContext,
  RedirectError,
  type LoaderContext,
  type LoaderData,
  type ActionContext,
} from "./routing/RouteLoader.js";

export {
  Routes,
  type RoutesProps,
  type RouteComponent,
  type ComponentsMap,
} from "./routing/Routes.js";

export {
  Form,
  type PlatformForm,
  type PlatformFormOptions,
} from "./actions/PlatformForm.js";
