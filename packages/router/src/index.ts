// Route
export {
  Route,
  make as makeRoute,
  render as routeRender,
  get as routeGet,
  post as routePost,
  put as routePut,
  del as routeDelete,
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
  type RouteHandler,
  type PathSegment,
  type AnimationOptions,
  type GuardOptions,
  NoRenderError,
  type RouteParams,
  type RouteSearchParams,
  type RouteData,
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

// RouteData
export {
  RouteDataContext,
  RouteDataProvider,
  type RouteDataService,
  type RouteDataProviderService,
} from "./RouteData.js";

// Link
export { Link, type LinkProps } from "./Link.js";

// Outlet
export { Outlet, type OutletConfig } from "./Outlet.js";
