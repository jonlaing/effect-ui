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
