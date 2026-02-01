// Route
export {
  Route,
  make as makeRoute,
  params as routeParams,
  searchParams as routeSearchParams,
  rawParams as routeRawParams,
  withGuard as routeWithGuard,
  withAnimation as routeWithAnimation,
  lazy as lazyRoute,
  isRoute,
  routeSpecificity,
  parsePath,
  matchSegments,
  TypeId as RouteTypeId,
  type Route as RouteType,
  type RouteContext,
  type PathSegment,
  type AnimationOptions,
  type GuardOptions,
  type RouteParams,
  type RouteSearchParams,
} from "./Route.js";

// Router
export {
  Router,
  empty as emptyRouter,
  concat as concatRouter,
  prefixAll,
  guard as routerGuard,
  layout as routerLayout,
  findMatch,
  type Router as RouterType,
} from "./Router.js";

// Navigation
export {
  Navigation,
  NavigationContext,
  buildPath,
  make as makeNavigation,
  makeLayer as makeNavigationLayer,
  pathname as navPathname,
  searchParams as navSearchParams,
  currentMatch as navCurrentMatch,
  pushPath as navPushPath,
  replacePath as navReplacePath,
  back as navBack,
  forward as navForward,
  type Navigation as NavigationType,
  type NavigationOptions,
  type RouteNavigateOptions,
  type CurrentMatch,
} from "./Navigation.js";

// Link
export { Link, type LinkProps } from "./Link.js";
