import { Effect } from "effect";

import { $, Readable, type Element } from "@effex/dom";

import { buildPath, NavigationContext } from "./Navigation.js";
import type { Route } from "./Route.js";

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the Link component.
 * Use either `href` for path strings or `to` + `params` for type-safe route navigation.
 */
export interface LinkProps {
  /** Path string to navigate to */
  readonly href?: string;

  /** Route to navigate to (type-safe alternative to href) */
  readonly to?: Route<string, unknown, unknown, unknown, unknown, unknown>;

  /** Params for route-based navigation */
  readonly params?: Record<string, unknown>;

  /** Search params for navigation */
  readonly searchParams?: Record<string, unknown>;

  /** Use replace instead of push for navigation */
  readonly replace?: boolean;

  // Standard anchor attributes
  readonly class?: string | Readable.Readable<string>;
  readonly target?: string;
  readonly rel?: string;
  readonly id?: string;
  readonly title?: string;

  // Allow data-* and aria-* attributes
  readonly [key: `data-${string}`]: string | boolean | number | undefined;
  readonly [key: `aria-${string}`]: string | boolean | number | undefined;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Check if a URL is external (different origin or has protocol).
 */
const isExternalUrl = (url: string): boolean => {
  // URLs with protocols are external
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    // Allow same-origin URLs
    if (typeof window !== "undefined") {
      try {
        const parsed = new URL(url, window.location.origin);
        return parsed.origin !== window.location.origin;
      } catch {
        return true;
      }
    }
    return true;
  }
  return false;
};

/**
 * Check if pathname matches href exactly.
 */
const isExactMatch = (pathname: string, href: string): boolean => {
  // Strip query string from href for comparison
  const hrefPath = href.split("?")[0];
  return pathname === hrefPath;
};

/**
 * Check if pathname starts with href (prefix match).
 */
const isPrefixMatch = (pathname: string, href: string): boolean => {
  // Strip query string from href for comparison
  const hrefPath = href.split("?")[0];

  if (pathname === hrefPath) {
    return true;
  }

  // Prefix match: /users matches /users/123 but not /users-list
  return pathname.startsWith(hrefPath + "/") || hrefPath === "/";
};

// =============================================================================
// Link Component
// =============================================================================

/**
 * Link component for client-side navigation.
 *
 * Renders an `<a>` element that uses the Navigation service for SPA navigation.
 * External links work normally (open in new tab or navigate away).
 *
 * Active state is indicated via data attributes:
 * - `data-active-exact="true"` - when href matches current path exactly
 * - `data-active-prefix="true"` - when current path starts with href
 *
 * @example
 * ```ts
 * // Path-based navigation
 * Link({ href: "/users" }, "Users")
 *
 * // Type-safe route navigation
 * Link({ to: UserRoute, params: { id: 123 } }, "User Profile")
 *
 * // With search params
 * Link({ href: "/search", searchParams: { q: "test" } }, "Search")
 *
 * // External link (works normally)
 * Link({ href: "https://example.com", target: "_blank" }, "External")
 *
 * // Style active state with CSS
 * // a[data-active-exact] { font-weight: bold; }
 * // a[data-active-prefix] { color: blue; }
 * ```
 */
export const Link = <E, R>(
  props: LinkProps,
  children: Effect.Effect<unknown, E, R>,
): Element.Element<HTMLAnchorElement, E, R | NavigationContext> =>
  Effect.gen(function* () {
    const nav = yield* NavigationContext;

    // Compute href from props
    let computedHref = props.to
      ? buildPath(props.to, props.params ?? {}, props.searchParams)
      : (props.href ?? "/");

    // Append search params if using href directly
    if (!props.to && props.searchParams) {
      const entries = Object.entries(props.searchParams).filter(
        ([, v]) => v !== undefined && v !== null,
      );
      if (entries.length > 0) {
        const queryString = entries
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
          )
          .join("&");
        computedHref = `${computedHref}?${queryString}`;
      }
    }

    // Check if external
    const external = isExternalUrl(computedHref) || props.target === "_blank";

    // Compute active state from current pathname (reactive)
    const dataActiveExact = Readable.map(nav.pathname, (pathname) =>
      isExactMatch(pathname, computedHref) ? "true" : undefined,
    );

    const dataActivePrefix = Readable.map(nav.pathname, (pathname) =>
      isPrefixMatch(pathname, computedHref) ? "true" : undefined,
    );

    // Extract standard attributes, filtering out our custom props
    const {
      href: _href,
      to: _to,
      params: _params,
      searchParams: _searchParams,
      replace,
      ...anchorProps
    } = props;

    // Handle click for internal navigation
    const onClick = external
      ? undefined
      : (event: MouseEvent) =>
          Effect.gen(function* () {
            // Let browser handle modified clicks (ctrl+click, etc.)
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0
            ) {
              return;
            }

            event.preventDefault();

            if (replace) {
              yield* nav.replacePath(computedHref);
            } else {
              yield* nav.pushPath(computedHref);
            }
          });

    return yield* $.a(
      {
        ...anchorProps,
        href: computedHref,
        onClick,
        "data-active-exact": dataActiveExact,
        "data-active-prefix": dataActivePrefix,
      },
      children as any,
    );
  });

// =============================================================================
// Module Export
// =============================================================================

export { Link as default };
