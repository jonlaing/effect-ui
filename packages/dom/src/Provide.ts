import { Context, Effect } from "effect";

import type { Child } from "./Element";
import { flattenChildren, isElement } from "./Element/helpers.js";

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
export const provide = <
  I,
  S,
  C extends Child<any, any> | readonly Child<any, any>[],
>(
  tag: Context.Tag<I, S>,
  value: S,
  children?: C,
) => {
  type ChildType = C extends Child<any, any>[]
    ? readonly Child<
        C[number] extends Child<infer E, infer _R> ? E : never,
        C[number] extends Child<infer _E, infer R> ? Exclude<R, I> : never
      >[]
    : C extends Child<infer E, infer R>
      ? readonly Child<E, Exclude<R, I>>[]
      : readonly Child<never, never>[];

  if (!children) {
    return [] as unknown as ChildType;
  }

  const childArray = Array.isArray(children)
    ? flattenChildren(children)
    : [children];
  return childArray.map((child) => {
    if (isElement(child)) {
      return child.pipe(Effect.provideService(tag, value));
    }
    // Strings, numbers, and Readables don't need context - pass through unchanged
    return child;
  }) as unknown as ChildType;
};
