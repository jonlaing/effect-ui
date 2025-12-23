// Re-export everything from @effex/dom (which includes @effex/core)
export * from "@effex/dom";

// Re-export everything from @effex/router
export * from "@effex/router";

// Re-export everything from @effex/form
export * from "@effex/form";

// Re-export everything from @effex/primitives
export * from "@effex/primitives";

// Platform-specific exports
export {
  Platform,
  PlatformContext,
  type PlatformEnvironment,
  type CookieOptions,
  type Cookies,
} from "./Platform.js";

export {
  RouteLoader,
  type LoaderContext,
  type LoaderData,
  type ActionContext,
} from "./RouteLoader.js";

export { serialize, deserialize } from "./Serialization.js";

export { render, type RenderOptions, type RenderResult } from "./render.js";

export { hydrateApp, type HydrateOptions } from "./hydrate.js";
