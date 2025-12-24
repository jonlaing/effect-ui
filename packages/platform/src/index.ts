// Re-export everything from @effex/dom (which includes @effex/core)
export * from "@effex/dom";

// Re-export everything from @effex/router
export * from "@effex/router";

// Re-export from @effex/form, but exclude Form (we provide our own)
export {
  // Form.make is re-exported from PlatformForm with router integration
  makeForm,
  // Field
  Field,
  makeField,
  makeFieldArray,
  // Types
  type ValidationTiming,
  type FieldType,
  type FieldArray,
  type AsyncValidator,
  type Validators,
  type FormOptions,
  type FormFields,
  type SubmitHandler,
  type FormType,
} from "@effex/form";

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

// Platform-integrated Form (wraps @effex/form with router action support)
export {
  Form,
  type PlatformForm,
  type PlatformFormOptions,
} from "./PlatformForm.js";

// Routes component for rendering the active route
export {
  Routes,
  type RoutesProps,
  type RouteComponent,
  type ComponentsMap,
} from "./Routes.js";

// Effect HTTP server integration
export {
  EffexServer,
  type SSRResult,
  type ActionData,
  type EffexAppOptions,
  type DocumentOptions,
} from "./server.js";
