/**
 * DOM-specific control flow components with SSR, hydration, and animation support.
 *
 * This module composes different implementations based on the current mode:
 * - SSR: Render once with hydration markers, no subscriptions
 * - Hydration: Find existing DOM, attach handlers, then subscribe
 * - Client: Full client rendering with optional enter/exit animations
 */

import { Effect, Either, Option } from "effect";

import { Readable } from "@effex/core";

import { Element } from "../Element";
import { HydrationContext } from "../HydrationContext";
import { SSRContext } from "../SSRContext";
// Client implementations (with optional animation support)
import { clientEach, clientMatch, clientWhen } from "./client";
// Hydration implementations
import { hydrationEach, hydrationMatch, hydrationWhen } from "./hydration";
// SSR implementations
import { ssrEach, ssrMatch, ssrWhen } from "./ssr";
// Types
import type {
  EachConfig,
  MatchConfig,
  MatchEitherConfig,
  MatchOptionConfig,
  WhenConfig,
} from "./types";

/**
 * Log hydration mismatch warning and fall back to client rendering.
 */
const warnHydrationMismatch = (error: unknown): void => {
  if (typeof console !== "undefined") {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Hydration mismatch detected";
    console.warn(
      `[Effex Hydration] ${message}. Falling back to client rendering.`,
    );
  }
};

// Re-export types
export {
  type WhenConfig,
  type MatchConfig,
  type MatchCase,
  type EachConfig,
  type MatchOptionConfig,
  type MatchEitherConfig,
} from "./types";

// Re-export errors
export { HydrationMismatchError } from "./errors";

/**
 * Conditionally render one of two elements based on a reactive boolean.
 *
 * Automatically handles SSR (renders once with markers), hydration (attaches
 * to existing DOM), and client-side rendering (with optional animations).
 *
 * @example
 * ```ts
 * when(isLoggedIn, {
 *   onTrue: () => $.div("Welcome back!"),
 *   onFalse: () => $.div("Please log in")
 * })
 * ```
 *
 * @example
 * ```ts
 * // With animations
 * when(isVisible, {
 *   onTrue: () => Modal(),
 *   onFalse: () => $.div(),
 *   animate: { enter: "fade-in", exit: "fade-out" }
 * })
 * ```
 */
export const when = <E1 = never, R1 = never, E2 = never, R2 = never>(
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Element.Element<HTMLElement | SVGElement, E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    // Check SSR mode
    const ssrContext = yield* Effect.serviceOption(SSRContext);
    if (Option.isSome(ssrContext)) {
      return yield* ssrWhen(ssrContext.value, condition, config);
    }

    // Check hydration mode
    const hydrationContext = yield* Effect.serviceOption(HydrationContext);
    if (Option.isSome(hydrationContext)) {
      const hydrationResult = yield* hydrationWhen(
        hydrationContext.value,
        condition,
        config,
      ).pipe(
        Effect.catchTag("HydrationMismatchError", (error) =>
          Effect.sync(() => {
            warnHydrationMismatch(error);
            return null as HTMLElement | null;
          }),
        ),
      );
      if (hydrationResult !== null) return hydrationResult;
      // Fall through to client mode on hydration mismatch
    }

    // Client mode (with optional animation support)
    return yield* clientWhen(condition, config);
  });

/**
 * Pattern match on a reactive value and render the corresponding element.
 *
 * Automatically handles SSR, hydration, and client-side rendering.
 *
 * @example
 * ```ts
 * match(status, {
 *   cases: [
 *     { pattern: "loading", render: () => $.div("Loading...") },
 *     { pattern: "success", render: () => $.div("Done!") },
 *     { pattern: "error", render: () => $.div("Failed") },
 *   ]
 * })
 * ```
 *
 * @example
 * ```ts
 * // With fallback and animations
 * match(status, {
 *   cases: [
 *     { pattern: "loading", render: () => Spinner() },
 *   ],
 *   fallback: () => $.div("Unknown"),
 *   animate: { enter: "fade-in", exit: "fade-out" }
 * })
 * ```
 */
export const match = <A, E = never, R = never, E2 = never, R2 = never>(
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Element.Element<HTMLElement | SVGElement, E | E2, R | R2> =>
  Effect.gen(function* () {
    // Check SSR mode
    const ssrContext = yield* Effect.serviceOption(SSRContext);
    if (Option.isSome(ssrContext)) {
      return yield* ssrMatch(ssrContext.value, value, config);
    }

    // Check hydration mode
    const hydrationContext = yield* Effect.serviceOption(HydrationContext);
    if (Option.isSome(hydrationContext)) {
      const hydrationResult = yield* hydrationMatch(
        hydrationContext.value,
        value,
        config,
      ).pipe(
        Effect.catchTag("HydrationMismatchError", (error) =>
          Effect.sync(() => {
            warnHydrationMismatch(error);
            return null as HTMLElement | null;
          }),
        ),
      );
      if (hydrationResult !== null) return hydrationResult;
      // Fall through to client mode on hydration mismatch
    }

    // Client mode (with optional animation support)
    return yield* clientMatch(value, config);
  });

/**
 * Render a list of items with efficient updates using keys.
 *
 * Automatically handles SSR, hydration, and client-side rendering.
 *
 * @example
 * ```ts
 * each(todos, {
 *   container: () => $.ul({ class: "todo-list" }),
 *   key: (todo) => todo.id,
 *   render: (todo, index) => $.li(todo.map(t => t.text))
 * })
 * ```
 *
 * @example
 * ```ts
 * // With staggered animations
 * each(items, {
 *   key: (item) => item.id,
 *   render: (item) => ListItem(item),
 *   animate: { enter: "slide-in", exit: "slide-out", stagger: 50 }
 * })
 * ```
 */
export const each = <A, E = never, R = never>(
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Element.Element<HTMLElement | SVGElement, E, R> =>
  Effect.gen(function* () {
    // Check SSR mode
    const ssrContext = yield* Effect.serviceOption(SSRContext);
    if (Option.isSome(ssrContext)) {
      return yield* ssrEach(ssrContext.value, items, config);
    }

    // Check hydration mode
    const hydrationContext = yield* Effect.serviceOption(HydrationContext);
    if (Option.isSome(hydrationContext)) {
      const hydrationResult = yield* hydrationEach(
        hydrationContext.value,
        items,
        config,
      ).pipe(
        Effect.catchTag("HydrationMismatchError", (error) =>
          Effect.sync(() => {
            warnHydrationMismatch(error);
            return null as HTMLElement | null;
          }),
        ),
      );
      if (hydrationResult !== null) return hydrationResult;
      // Fall through to client mode on hydration mismatch
    }

    // Client mode (with optional animation support)
    return yield* clientEach(items, config);
  });

/**
 * Match on an Option and render different elements for Some/None cases.
 * The `onSome` callback receives an unwrapped `Readable<A>` for convenient access.
 *
 * @example
 * ```ts
 * const userData = yield* Derived.async([userId], ([id]) => fetchUser(id));
 *
 * matchOption(userData.value, {
 *   onSome: (user) => $.div(user.map(u => u.name)),
 *   onNone: () => $.div("No user loaded"),
 * })
 * ```
 *
 * @example
 * ```ts
 * // With animations
 * matchOption(selectedItem, {
 *   onSome: (item) => ItemDetails({ item }),
 *   onNone: () => $.div("Select an item"),
 *   animate: { enter: "fade-in", exit: "fade-out" },
 * })
 * ```
 */
export const matchOption = <A, E1 = never, R1 = never, E2 = never, R2 = never>(
  option: Readable<Option.Option<A>>,
  config: MatchOptionConfig<A, E1, R1, E2, R2>,
): Element.Element<HTMLElement | SVGElement, E1 | E2, R1 | R2> => {
  // Create condition Readable
  const isSome = option.map(Option.isSome);

  // Create unwrapped value Readable (safe because only used when isSome)
  const unwrapped = option.map((opt) =>
    Option.isSome(opt) ? opt.value : (undefined as never),
  );

  return when(isSome, {
    container: config.container,
    onTrue: () => config.onSome(unwrapped),
    onFalse: config.onNone,
    animate: config.animate,
  });
};

/**
 * Match on an Either and render different elements for Right/Left cases.
 * Both callbacks receive unwrapped `Readable` values for convenient access.
 *
 * @example
 * ```ts
 * const result = yield* Derived.async([input], ([val]) => validateInput(val));
 *
 * matchEither(result, {
 *   onRight: (validated) => $.div(validated.map(v => v.formatted)),
 *   onLeft: (error) => $.span({ class: "error" }, $.of(error.map(e => e.message))),
 * })
 * ```
 */
export const matchEither = <
  A,
  E,
  E1 = never,
  R1 = never,
  E2 = never,
  R2 = never,
>(
  either: Readable<Either.Either<A, E>>,
  config: MatchEitherConfig<A, E, E1, R1, E2, R2>,
): Element.Element<HTMLElement | SVGElement, E1 | E2, R1 | R2> => {
  // Create condition Readable
  const isRight = either.map(Either.isRight);

  // Create unwrapped value Readables (safe because only used in respective branches)
  const rightValue = either.map((e) =>
    Either.isRight(e) ? e.right : (undefined as never),
  );
  const leftValue = either.map((e) =>
    Either.isLeft(e) ? e.left : (undefined as never),
  );

  return when(isRight, {
    container: config.container,
    onTrue: () => config.onRight(rightValue),
    onFalse: () => config.onLeft(leftValue),
    animate: config.animate,
  });
};
