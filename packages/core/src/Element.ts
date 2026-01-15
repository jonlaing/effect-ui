import type { Effect, Scope } from "effect";

import type { Readable } from "./Readable";
import type { RendererContext } from "./Renderer";

/**
 * A rendered element wrapped in an Effect with scope management.
 * This is the generic version that works with any renderer.
 *
 * @template N - The node type (e.g., HTMLElement for DOM, string for SSR)
 * @template E - The error type (defaults to never for infallible elements)
 * @template R - Additional requirements/context type beyond RendererContext
 *
 * @example
 * ```ts
 * // DOM element
 * const myButton: Element<HTMLElement> = button({ className: "primary" }, ["Click me"])
 *
 * // Component that can fail
 * const UserProfile: Element<HTMLElement, UserNotFoundError> = Effect.gen(function* () {
 *   const user = yield* fetchUser(userId)
 *   return yield* div([user.name])
 * })
 *
 * // Component with additional requirements
 * const NavLink: Element<HTMLElement, never, RouterContext> = Effect.gen(function* () {
 *   const router = yield* RouterContext
 *   return yield* button({ onClick: () => router.push("/") }, "Home")
 * })
 * ```
 */
export type Element<N = unknown, E = never, R = never> = Effect.Effect<
  N,
  E,
  Scope.Scope | RendererContext | R
>;

/**
 * Valid child types for an element: strings, numbers, elements, reactive values, or arrays thereof.
 * This is the generic version for use with any renderer.
 *
 * @template N - The node type
 * @template E - The error type for child elements
 * @template R - The requirements/context type for child elements
 */
export type Child<N = unknown, E = never, R = never> =
  | string
  | number
  | Element<N, E, R>
  | Readable<string>
  | Readable<number>
  | readonly Child<N, E, R>[];
