/**
 * Information about exports detected in a route file.
 */
export interface RouteExports {
  /** Whether the file exports a `params` schema */
  readonly hasParams: boolean;
  /** Whether the file exports a `loader` function */
  readonly hasLoader: boolean;
  /** Whether the file exports an `action` function */
  readonly hasAction: boolean;
  /** Whether the file has a default export (the component) */
  readonly hasDefaultExport: boolean;
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
}
