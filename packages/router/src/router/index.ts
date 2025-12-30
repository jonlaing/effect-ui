// Route
export { Route, make as makeRoute, routeSpecificity } from "./Route";

// Router
export {
  Router,
  make as makeRouter,
  type Infer as RouterInfer,
} from "./Router";

// RouterContext and Link
export {
  RouterContext,
  Link,
  getActionState,
  makeRouterLayer,
  makeTypedRouterLayer,
  setRouter,
  clearRouter,
  getRouter,
  type LinkProps,
} from "./RouterContext";

// Types
export type {
  PathSegment,
  RouteOptions,
  Route as RouteType,
  RouteMatchError as RouteMatchErrorType,
  MatchedRoute,
  RouteState,
  NavigateOptions,
  Router as RouterType,
  RouterOptions,
  BaseRouter,
  AnyRoute,
  LoaderFn,
  LoaderResult,
  LoaderState,
  ActionFn,
  ActionResult,
  ActionState,
  // Utility types for extracting requirements
  ExtractActionRequirements,
  ExtractLoaderRequirements,
  ExtractActionError,
  ExtractLoaderError,
  AllActionRequirements,
  AllLoaderRequirements,
  AllActionErrors,
  AllLoaderErrors,
  AllRequirements,
} from "./types";
export { RouteMatchError } from "./types";
