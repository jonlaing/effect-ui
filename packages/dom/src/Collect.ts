import { Effect } from "effect";

import type { ChildNode } from "./Element/types";

/**
 * Combine multiple child effects into a single ChildEffect.
 * Use this when an element needs multiple children.
 *
 * Error and context types are properly propagated through the union,
 * so effects with different error/context types combine correctly.
 *
 * @example
 * ```ts
 * import { $, collect } from "@effex/dom"
 *
 * // Multiple static children
 * div({}, collect(
 *   $.of("Hello"),
 *   span({}, $.of("World"))
 * ))
 *
 * // Mixing static and effectful children
 * const Card = <E, R>(children: ChildEffect<E, R>) =>
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
export const collect = <E, R>(
  ...elements: Effect.Effect<ChildNode, E, R>[]
): Effect.Effect<ChildNode[], E, R> => Effect.all(elements);
