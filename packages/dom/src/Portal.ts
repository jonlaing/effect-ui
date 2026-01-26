import { Effect } from "effect";

import { Element } from "./Element";

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
    // Resolve target element
    let target: HTMLElement;
    if (options.target === undefined) {
      target = document.body;
    } else if (typeof options.target === "string") {
      const found = document.querySelector(options.target);
      if (!found) {
        // Return a hidden element if target not found - fail gracefully
        console.warn(`Portal target not found: ${options.target}`);
        const fallback = document.createElement("span");
        fallback.style.display = "none";
        return fallback;
      }
      target = found as HTMLElement;
    } else {
      target = options.target;
    }

    // Render children
    const content = yield* children();

    // Append to portal target
    target.appendChild(content);

    // Clean up when scope closes (component unmounts)
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (target.contains(content)) {
          target.removeChild(content);
        }
      }),
    );

    // Return a placeholder in the original DOM position
    // This maintains the component's place in the tree while
    // the actual content lives in the portal target
    const placeholder = document.createElement("span");
    placeholder.style.display = "none";
    placeholder.setAttribute("data-portal-placeholder", "true");

    return placeholder;
  });
}
