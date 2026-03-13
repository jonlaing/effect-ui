import { Context, type Effect, type Scope } from "effect";

import type { RendererContext } from "./Renderer.js";

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
 * // DOM element (using @effex/dom)
 * const myButton: Element<HTMLButtonElement> = button({ class: "primary" }, $.of("Click me"))
 *
 * // Function that can fail
 * const UserProfile = () =>
 *   Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* div({}, $.of(user.name))
 *   })
 *
 * // Function with context requirements
 * const NavLink = () =>
 *   Effect.gen(function* () {
 *     const router = yield* RouterContext
 *     return yield* button({ onClick: () => router.push("/") }, $.of("Home"))
 *   })
 * ```
 */
export type Element<N = unknown, E = never, R = never> = Effect.Effect<
  N,
  E,
  Scope.Scope | RendererContext | R
>;

/**
 * Context for injecting props into child elements.
 * Used by primitives implementing the `asChild` pattern and by Form.provide
 * to inject handlers like onSubmit.
 *
 * The first element created within this context will receive the merged props,
 * with its own explicit props taking precedence over the injected ones.
 *
 * @example
 * ```ts
 * // Inject onSubmit into the first child element
 * Effect.provideService(children, MergePropsCtx, {
 *   onSubmit: (e) => { e.preventDefault(); return handleSubmit(); }
 * })
 * ```
 */
export class MergePropsCtx extends Context.Tag("MergePropsCtx")<
  MergePropsCtx,
  Record<string, unknown>
>() {}
