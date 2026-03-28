import { Context, Effect } from "effect";

import type { Child } from "./Element/types.js";

/**
 * Provide a context value to children elements.
 * Similar to React's Context.Provider pattern.
 *
 * Supports partial context provision - if children require multiple contexts,
 * providing one will satisfy that requirement and leave the rest.
 *
 * @param tag - The Effect Context tag
 * @param value - The value to provide
 * @param children - Child effects that require this context (and possibly others)
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
 *   provide(ThemeCtx, { color: "blue" }, collect(
 *     ThemedButton({}),
 *     ThemedText({}, $.of("Hello")),
 *   ))
 * )
 * ```
 *
 * @example
 * ```ts
 * // Nested contexts - children require AccordionCtx | AccordionItemCtx
 * // After providing AccordionItemCtx, they only require AccordionCtx
 * provide(AccordionItemCtx, itemCtx, ThemedButton({}))
 * ```
 */
export const provide = <I, S, E, R>(
  tag: Context.Tag<I, S>,
  value: S,
  children: Child<E, R>,
): Child<E, Exclude<R, I>> => children.pipe(Effect.provideService(tag, value));
