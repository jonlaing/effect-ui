/**
 * Client-only exports for @effex/platform
 *
 * Import from "@effex/platform/client" to ensure you only use
 * client-safe modules. This prevents accidentally bundling server
 * code (and its dependencies like @effect/platform) into the client.
 *
 * @example
 * ```ts
 * import { hydrateApp } from "@effex/platform/client";
 * ```
 */

// Client-side hydration
export {
  hydrateApp,
  isHydrating,
  type HydrateOptions,
} from "./rendering/Hydrate.js";

// Shared modules (also available in client context)
export {
  Platform,
  PlatformContext,
  makeClientPlatformContext,
  makeClientCookies,
  type PlatformEnvironment,
  type PlatformContextType,
  type CookieOptions,
  type Cookies,
} from "./Platform.js";

export {
  deserialize,
  deserializeSync,
  reviveTypeMarker,
  DeserializationError,
} from "./Serialization.js";

export {
  RouteLoader,
  LoaderContextTag,
  makeLoaderContext,
  type LoaderContext,
  type LoaderData,
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
