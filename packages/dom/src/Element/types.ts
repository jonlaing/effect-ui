import { Effect, Scope } from "effect";

import { Readable, RendererContext } from "@effex/core";

// =============================================================================
// Types
// =============================================================================

/**
 * An Element is an Effect that produces an HTML or SVG element.
 * All Element operations are effectful and go through the Renderer.
 */
export type Element<
  A extends HTMLElement | SVGElement = HTMLElement | SVGElement,
  E = never,
  R = never,
> = Effect.Effect<A, E, Scope.Scope | RendererContext | R>;

/**
 * A child that can be appended to an element.
 */
export type ChildNode =
  | string
  | number
  | Readable.Readable<string | number>
  | HTMLElement
  | SVGElement;

/**
 * An effectful child producer.
 */
export type Child<E = never, R = never> = Effect.Effect<
  ChildNode | ChildNode[],
  E,
  R
>;

/**
 * A child input accepted by element builders (`$.div`, `$.span`, ...) and
 * component authors who want to opt in to the same variadic API.
 *
 * Broader than {@link Child}: element factories accept the raw types
 * users naturally write in markup — strings, numbers, nested elements,
 * reactive text, arrays for `.map()`-style output, and nullish/boolean
 * for conditional rendering. The factory normalizes these into `Child`
 * effects internally.
 *
 * - `string` / `number` → wrapped as text nodes
 * - `null` / `undefined` / `boolean` → skipped (React-style; `false && el`
 *    produces nothing, `true` also skipped for symmetry)
 * - `Element` / `Readable` → passed through as-is
 * - `ChildInput[]` → flattened recursively
 */
export type ChildInput<E = never, R = never> =
  | string
  | number
  | boolean
  | null
  | undefined
  // Any Effect that yields a ChildNode — covers Elements (`$.div(...)`),
  // text nodes (`$.of(...)`), and combined children (`collect(...)`).
  | Child<E, R>
  | Readable.Readable<string | number>
  | ReadonlyArray<ChildInput<E, R>>;
