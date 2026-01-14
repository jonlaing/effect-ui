import { Context, Effect } from "effect";
import { Element } from "./Element";
import type { Child } from "./Element";
import { isElement, flattenChildren } from "./Element/helpers.js";

/**
 * Provide a context value to children elements.
 * Similar to React's Context.Provider pattern.
 *
 * Supports partial context provision - if children require multiple contexts,
 * providing one will satisfy that requirement and leave the rest.
 *
 * @param tag - The Effect Context tag
 * @param value - The value to provide
 * @param children - Elements that require this context (and possibly others)
 * @returns The children with context provided, requiring only remaining contexts
 *
 * @example
 * ```ts
 * // Define a context
 * class ThemeCtx extends Context.Tag("Theme")<ThemeCtx, { color: string }>() {}
 *
 * // Provide it to children
 * $.div(
 *   { class: "app" },
 *   provide(ThemeCtx, { color: "blue" }, [
 *     ThemedButton({}),
 *     ThemedText({}, "Hello"),
 *   ])
 * )
 * ```
 *
 * @example
 * ```ts
 * // Nested contexts - children require AccordionCtx | AccordionItemCtx
 * // After providing AccordionItemCtx, they only require AccordionCtx
 * provide(AccordionItemCtx, itemCtx, children)
 * ```
 */
export const provide = <I, S, E = never, R = I>(
  tag: Context.Tag<I, S>,
  value: S,
  children?: Child<E, R> | readonly Child<E, R>[],
): Child<E, Exclude<R, I>>[] => {
  if (!children) {
    return [];
  }

  const childArray = Array.isArray(children)
    ? flattenChildren(children)
    : [children];
  return childArray.map((child) => {
    if (isElement(child)) {
      return child.pipe(Effect.provideService(tag, value)) as Element.Element<
        E,
        Exclude<R, I>
      >;
    }
    // Strings, numbers, and Readables don't need context - pass through unchanged
    return child as Child<E, Exclude<R, I>>;
  });
};
