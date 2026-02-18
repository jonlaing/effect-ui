import { Effect } from "effect";

import * as Element from "./Element";

/**
 * Options for Portal rendering.
 */
export interface PortalOptions {
  /**
   * Target element or selector to render into.
   * Defaults to document.body if not specified.
   */
  readonly target?: HTMLElement | string;
}

/**
 * Render children into a different DOM node, outside the normal component hierarchy.
 * Useful for modals, dropdowns, tooltips that need to escape overflow/z-index issues.
 *
 * @example
 * ```ts
 * // Render to document.body (default)
 * Portal(() => Modal({ ... }))
 *
 * // Render to specific element
 * Portal({ target: "#modal-root" }, () => Dropdown({ ... }))
 *
 * // Render to element reference
 * Portal({ target: containerElement }, () => Tooltip({ ... }))
 * ```
 */
export function Portal<A extends HTMLElement | SVGElement, E, R>(
  children: () => Element.Element<A, E, R>,
): Element.Element<HTMLElement, E, R>;
export function Portal<A extends HTMLElement | SVGElement, E, R>(
  options: PortalOptions,
  children: () => Element.Element<A, E, R>,
): Element.Element<HTMLElement, E, R>;
export function Portal<A extends HTMLElement | SVGElement, E, R>(
  optionsOrChildren: PortalOptions | (() => Element.Element<A, E, R>),
  maybeChildren?: () => Element.Element<A, E, R>,
): Element.Element<HTMLElement, E, R> {
  const options: PortalOptions =
    typeof optionsOrChildren === "function" ? {} : optionsOrChildren;
  const children =
    typeof optionsOrChildren === "function"
      ? optionsOrChildren
      : maybeChildren!;

  return Effect.gen(function* () {
    // SSR safety - render children inline without portaling
    if (typeof document === "undefined") {
      return (yield* children()) as HTMLElement;
    }

    // Render children first
    const content = yield* children();

    // Create placeholder that will be returned
    const placeholder = document.createElement("span");
    placeholder.style.display = "none";
    placeholder.setAttribute("data-portal-placeholder", "true");

    // Helper to find and append to target
    const appendToTarget = () => {
      let target: HTMLElement;
      if (options.target === undefined) {
        target = document.body;
      } else if (typeof options.target === "string") {
        const found = document.querySelector(options.target);
        if (!found) return false;
        target = found as HTMLElement;
      } else {
        target = options.target;
      }
      target.appendChild(content);
      return true;
    };

    // Don't block! Fork the target lookup so the component tree can finish mounting.
    // This avoids deadlock when the portal target is a sibling element.
    yield* Effect.forkScoped(
      Effect.async<void>((resume) => {
        // Try immediately first
        if (appendToTarget()) {
          resume(Effect.void);
          return;
        }

        // If target is a string selector, wait for it to appear
        if (typeof options.target === "string") {
          let resolved = false;
          const observer = new MutationObserver(() => {
            if (!resolved && appendToTarget()) {
              resolved = true;
              observer.disconnect();
              resume(Effect.void);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // Also try on next frame in case it's already there
          requestAnimationFrame(() => {
            if (!resolved && appendToTarget()) {
              resolved = true;
              observer.disconnect();
              resume(Effect.void);
            }
          });
        } else {
          // Element reference - fall back to body
          document.body.appendChild(content);
          resume(Effect.void);
        }
      }),
    );

    // Clean up when scope closes (component unmounts)
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (content.parentNode) {
          content.parentNode.removeChild(content);
        }
      }),
    );

    return placeholder;
  });
}
