/**
 * Information about exports detected in a route file.
 */
export interface RouteExports {
  /** Whether the file has a default export (the component) */
  readonly hasDefaultExport: boolean;
  /** Whether the file exports a `route` (DefinedRoute from Route.define) */
  readonly hasRoute: boolean;
  /** Whether the file exports a `staticPaths` function for SSG */
  readonly hasStaticPaths: boolean;
}

/**
 * A scanned route with all its metadata.
 */
export interface ScannedRoute {
  /** File path relative to routes directory (e.g., "users.$id.tsx") */
  readonly filePath: string;
  /** Computed route path (e.g., "/users/:id") */
  readonly routePath: string;
  /** Route name for the routes object (e.g., "users_$id") */
  readonly routeName: string;
  /** Import name for the route module (e.g., "UsersIdRoute") */
  readonly importName: string;
  /** Import name for the default export (e.g., "UsersIdComponent") */
  readonly componentImportName: string;
  /** Whether this is a layout route */
  readonly isLayout: boolean;
  /** Whether this is an index route */
  readonly isIndex: boolean;
  /** Detected exports from the file */
  readonly exports: RouteExports;
  /** Layout names that wrap this route (ordered from outermost to innermost) */
  readonly layouts: readonly string[];
}

/**
 * A scanned layout with its metadata.
 */
export interface ScannedLayout {
  /** File path relative to routes directory (e.g., "users._layout.tsx") */
  readonly filePath: string;
  /** Layout name (e.g., "root_layout", "users_layout") */
  readonly layoutName: string;
  /** Import name for the layout module (e.g., "UsersLayoutRoute") */
  readonly importName: string;
  /** Import name for the default export (e.g., "UsersLayoutComponent") */
  readonly componentImportName: string;
  /** Path prefix this layout applies to (e.g., "/users") */
  readonly pathPrefix: string;
  /** Parent layout name, if nested (e.g., "root_layout") */
  readonly parentLayout: string | null;
  /** Detected exports from the file */
  readonly exports: RouteExports;
}

/**
 * Result of scanning routes directory.
 */
export interface ScanResult {
  /** Scanned routes (excludes layouts) */
  readonly routes: readonly ScannedRoute[];
  /** Scanned layouts */
  readonly layouts: readonly ScannedLayout[];
}

/**
 * Options for the Effex routes Vite plugin.
 */
export interface EffexPluginOptions {
  /**
   * Directory containing route files.
   * @default "src/routes"
   */
  readonly routesDir?: string;

  /**
   * Output path for generated routes file.
   * @default "src/generated/routes.ts"
   */
  readonly outputPath?: string;

  /**
   * File extensions to scan for routes.
   * @default [".tsx", ".ts", ".jsx", ".js"]
   */
  readonly extensions?: readonly string[];

  /**
   * Automatically scaffold new route files with a base component and route definition.
   * When enabled, creating a new empty file in the routes directory will populate it
   * with a Route.define and default component.
   * @default false
   */
  readonly scaffold?: boolean;
}
