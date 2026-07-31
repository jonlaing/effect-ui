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
 * A single child leaf — everything the factory accepts as one element in
 * its variadic tuple or as one entry inside a children array.
 *
 * - `string` / `number` → wrapped as a text node
 * - `null` / `undefined` / `boolean` → skipped (React-style)
 * - `Effect<ChildNode | ChildNode[]>` → passed through
 * - `Readable<string | number>` → reactive text
 */
export type ChildLeaf<E = never, R = never> =
  | string
  | number
  | boolean
  | null
  | undefined
  | Child<E, R>
  | Readable.Readable<string | number>;

/**
 * A child input accepted by element builders (`$.div`, `$.span`, ...) and
 * component authors who want to opt in to the same API.
 *
 * A ChildInput is either a leaf or a *single-level* array of leaves. Nested
 * arrays (`[[a, b], [c]]`) are intentionally not part of the type — the
 * runtime does not walk deeper than one level either. Use `.flat()` or the
 * variadic form if you're combining multiple lists.
 *
 * The single-level constraint is what makes `E`/`R` inference through
 * component wrappers tractable — a self-recursive array branch collides
 * with `ChildInputE`/`ChildInputR`'s array recursion and produces TS2589
 * ("excessively deep") whenever a wrapper forwards its own generic
 * children to a primitive.
 */
export type ChildInput<E = never, R = never> =
  | ChildLeaf<E, R>
  | ReadonlyArray<ChildLeaf<E, R>>;
