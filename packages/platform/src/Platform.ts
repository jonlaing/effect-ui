import { Context, Effect } from "effect";

/**
 * The current execution environment
 */
export type PlatformEnvironment = "server" | "client";

/**
 * Options for setting cookies
 */
export interface CookieOptions {
  readonly maxAge?: number;
  readonly expires?: Date;
  readonly path?: string;
  readonly domain?: string;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  readonly sameSite?: "strict" | "lax" | "none";
}

/**
 * Cookie access interface
 */
export interface Cookies {
  readonly get: (name: string) => Effect.Effect<string | undefined>;
  readonly getAll: () => Effect.Effect<Record<string, string>>;
  readonly set: (
    name: string,
    value: string,
    options?: CookieOptions,
  ) => Effect.Effect<void>;
  readonly delete: (
    name: string,
    options?: CookieOptions,
  ) => Effect.Effect<void>;
}

/**
 * Platform context providing environment-aware utilities
 */
export interface PlatformContextType {
  /**
   * Current execution environment
   */
  readonly environment: PlatformEnvironment;

  /**
   * Cookie access (works on both server and client)
   */
  readonly cookies: Cookies;

  /**
   * Current request (server-only, undefined on client)
   */
  readonly request: Request | undefined;

  /**
   * Response headers to be set (server-only)
   */
  readonly responseHeaders: Headers;
}

/**
 * Context tag for Platform services
 */
export class PlatformContext extends Context.Tag("@effex/PlatformContext")<
  PlatformContext,
  PlatformContextType
>() {}

/**
 * Platform utilities for loaders and actions
 */
export const Platform = {
  /**
   * Get the current execution environment
   */
  get environment(): Effect.Effect<
    PlatformEnvironment,
    never,
    PlatformContext
  > {
    return Effect.map(PlatformContext, (ctx) => ctx.environment);
  },

  /**
   * Get cookie access
   */
  get cookies(): Effect.Effect<Cookies, never, PlatformContext> {
    return Effect.map(PlatformContext, (ctx) => ctx.cookies);
  },

  /**
   * Get the current request (server-only)
   */
  get request(): Effect.Effect<Request | undefined, never, PlatformContext> {
    return Effect.map(PlatformContext, (ctx) => ctx.request);
  },

  /**
   * Set a response header (server-only)
   */
  setHeader: (
    name: string,
    value: string,
  ): Effect.Effect<void, never, PlatformContext> =>
    Effect.flatMap(PlatformContext, (ctx) =>
      Effect.sync(() => {
        ctx.responseHeaders.set(name, value);
      }),
    ),

  /**
   * Check if running on the server
   */
  get isServer(): Effect.Effect<boolean, never, PlatformContext> {
    return Effect.map(PlatformContext, (ctx) => ctx.environment === "server");
  },

  /**
   * Check if running on the client
   */
  get isClient(): Effect.Effect<boolean, never, PlatformContext> {
    return Effect.map(PlatformContext, (ctx) => ctx.environment === "client");
  },
};

/**
 * Create server-side cookies implementation from a Request
 */
export const makeServerCookies = (
  request: Request,
  responseHeaders: Headers,
): Cookies => {
  const parseCookies = (): Record<string, string> => {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return {};

    const cookies: Record<string, string> = {};
    for (const part of cookieHeader.split(";")) {
      const [key, ...rest] = part.trim().split("=");
      if (key) {
        cookies[key] = rest.join("=");
      }
    }
    return cookies;
  };

  const serializeCookie = (
    name: string,
    value: string,
    options: CookieOptions = {},
  ): string => {
    const parts = [`${name}=${encodeURIComponent(value)}`];

    if (options.maxAge !== undefined) {
      parts.push(`Max-Age=${options.maxAge}`);
    }
    if (options.expires) {
      parts.push(`Expires=${options.expires.toUTCString()}`);
    }
    if (options.path) {
      parts.push(`Path=${options.path}`);
    }
    if (options.domain) {
      parts.push(`Domain=${options.domain}`);
    }
    if (options.secure) {
      parts.push("Secure");
    }
    if (options.httpOnly) {
      parts.push("HttpOnly");
    }
    if (options.sameSite) {
      parts.push(`SameSite=${options.sameSite}`);
    }

    return parts.join("; ");
  };

  return {
    get: (name) => Effect.sync(() => parseCookies()[name]),
    getAll: () => Effect.sync(() => parseCookies()),
    set: (name, value, options) =>
      Effect.sync(() => {
        responseHeaders.append(
          "Set-Cookie",
          serializeCookie(name, value, options),
        );
      }),
    delete: (name, options) =>
      Effect.sync(() => {
        responseHeaders.append(
          "Set-Cookie",
          serializeCookie(name, "", { ...options, maxAge: 0 }),
        );
      }),
  };
};

/**
 * Create client-side cookies implementation
 */
export const makeClientCookies = (): Cookies => {
  const parseCookies = (): Record<string, string> => {
    if (typeof document === "undefined") return {};

    const cookies: Record<string, string> = {};
    for (const part of document.cookie.split(";")) {
      const [key, ...rest] = part.trim().split("=");
      if (key) {
        cookies[key] = decodeURIComponent(rest.join("="));
      }
    }
    return cookies;
  };

  return {
    get: (name) => Effect.sync(() => parseCookies()[name]),
    getAll: () => Effect.sync(() => parseCookies()),
    set: (name, value, options = {}) =>
      Effect.sync(() => {
        const parts = [`${name}=${encodeURIComponent(value)}`];

        if (options.maxAge !== undefined) {
          parts.push(`max-age=${options.maxAge}`);
        }
        if (options.expires) {
          parts.push(`expires=${options.expires.toUTCString()}`);
        }
        if (options.path) {
          parts.push(`path=${options.path}`);
        }
        if (options.domain) {
          parts.push(`domain=${options.domain}`);
        }
        if (options.secure) {
          parts.push("secure");
        }
        if (options.sameSite) {
          parts.push(`samesite=${options.sameSite}`);
        }
        // Note: httpOnly cannot be set from client-side JavaScript

        document.cookie = parts.join("; ");
      }),
    delete: (name, options = {}) =>
      Effect.sync(() => {
        document.cookie = `${name}=; max-age=0${options.path ? `; path=${options.path}` : ""}`;
      }),
  };
};

/**
 * Create a server-side PlatformContext
 */
export const makeServerPlatformContext = (
  request: Request,
): PlatformContextType => {
  const responseHeaders = new Headers();
  return {
    environment: "server",
    cookies: makeServerCookies(request, responseHeaders),
    request,
    responseHeaders,
  };
};

/**
 * Create a client-side PlatformContext
 */
export const makeClientPlatformContext = (): PlatformContextType => ({
  environment: "client",
  cookies: makeClientCookies(),
  request: undefined,
  responseHeaders: new Headers(),
});
