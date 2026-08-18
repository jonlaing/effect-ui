import { Effect } from "effect";

import type { ChildNode } from "./Element/types.js";

/**
 * Combine multiple child effects into a single Child.
 * Use this when an element needs multiple children.
 *
 * Error and context types are properly propagated through the union,
 * so effects with different error/context types combine correctly.
 *
 * @example
 * ```ts
 * import { $, collect } from "@stax-ui/dom"
 *
 * // Multiple static children
 * div({}, collect(
 *   $.of("Hello"),
 *   span({}, $.of("World"))
 * ))
 *
 * // Mixing static and effectful children
 * const Card = <E, R>(children: Child<E, R>) =>
 *   div({ class: "card" }, collect(
 *     h1({}, $.of("Title")),
 *     children  // E and R propagate up
 *   ))
 *
 * // Multiple children with different error types
 * collect(
 *   componentThatMayFail,     // Effect<ChildNode, ErrorA, never>
 *   anotherComponent,         // Effect<ChildNode, ErrorB, CtxB>
 *   $.of("static text")       // Effect<ChildNode, never, never>
 * )
 * // Result: Effect<ChildNode[], ErrorA | ErrorB, CtxB>
 * ```
 */
export const collect = <
  T extends readonly Effect.Effect<ChildNode, unknown, unknown>[],
>(
  ...elements: T
): Effect.Effect<
  ChildNode[],
  Effect.Effect.Error<T[number]>,
  Effect.Effect.Context<T[number]>
> =>
  Effect.all(elements) as Effect.Effect<
    ChildNode[],
    Effect.Effect.Error<T[number]>,
    Effect.Effect.Context<T[number]>
  >;
