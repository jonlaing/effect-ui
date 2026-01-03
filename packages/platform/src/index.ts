/**
 * @effex/platform - Full-stack meta-framework for Effex applications
 *
 * This main entry exports only cross-compatible modules that work in both
 * server and client environments. For environment-specific imports:
 *
 * - Server (SSR, HTTP handlers): import from "@effex/platform/server"
 * - Client (hydration): import from "@effex/platform/client"
 *
 * @example
 * ```ts
 * // Shared code (works everywhere)
 * import { Routes, Form, Platform } from "@effex/platform";
 *
 * // Server-only code
 * import { render, EffexServer } from "@effex/platform/server";
 *
 * // Client-only code
 * import { hydrateApp } from "@effex/platform/client";
 * ```
 */

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

// === Cross-compatible platform exports ===

// Platform context (environment detection, cookies abstraction)
export {
  Platform,
  PlatformContext,
  type PlatformEnvironment,
  type PlatformContextType,
  type CookieOptions,
  type Cookies,
} from "./Platform.js";

// Route data loading
export {
  RouteLoader,
  LoaderContextTag,
  RedirectError,
  type LoaderContext,
  type LoaderData,
  type ActionContext,
} from "./routing/RouteLoader.js";

// Serialization utilities
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

// Platform-integrated Form (wraps @effex/form with router action support)
export {
  Form,
  type PlatformForm,
  type PlatformFormOptions,
} from "./actions/PlatformForm.js";

// Routes component for rendering the active route
export {
  Routes,
  type RoutesProps,
  type RouteComponent,
  type ComponentsMap,
  type ComponentsError,
  type ComponentsRequirements,
} from "./routing/Routes.js";
