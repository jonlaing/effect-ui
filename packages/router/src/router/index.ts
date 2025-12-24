// Route
export { Route, make as makeRoute, routeSpecificity } from "./Route";

// Router
export {
  Router,
  make as makeRouter,
  type Infer as RouterInfer,
} from "./Router";

// RouterContext, Link, and Form
export {
  RouterContext,
  Link,
  Form,
  useActionState,
  makeRouterLayer,
  makeTypedRouterLayer,
  setRouter,
  clearRouter,
  getRouter,
  type LinkProps,
  type FormProps,
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
} from "./types";
export { RouteMatchError } from "./types";
