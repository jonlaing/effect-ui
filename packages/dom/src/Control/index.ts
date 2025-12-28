/**
 * DOM-specific control flow components with SSR, hydration, and animation support.
 *
 * This module composes different implementations based on the current mode:
 * - SSR: Render once with hydration markers, no subscriptions
 * - Hydration: Find existing DOM, attach handlers, then subscribe
 * - Client (animated): Full client rendering with enter/exit animations
 * - Client (plain): Reactive DOM updates without animations
 */

import { Effect, Option } from "effect";
import type { Readable } from "@effex/core";
import type { Element } from "../Element";
import { SSRContext } from "../SSRContext";
import { HydrationContext } from "../HydrationContext";

// SSR implementations
import { ssrWhen, ssrMatch, ssrEach } from "./ssr";

// Hydration implementations
import { hydrationWhen, hydrationMatch, hydrationEach } from "./hydration";

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

// Animated implementations
import { animatedWhen, animatedMatch, animatedEach } from "./animated";

// Plain client implementations
import { clientWhen, clientMatch, clientEach } from "./client";

// Types
import type { WhenConfig, MatchConfig, EachConfig } from "./types";

// Re-export types
export {
  type WhenConfig,
  type MatchConfig,
  type MatchCase,
  type EachConfig,
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
): Element<E1 | E2, R1 | R2> =>
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

    // Client mode - animated or plain
    if (config.animate) {
      return yield* animatedWhen(condition, config);
    }

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
): Element<E | E2, R | R2> =>
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

    // Client mode - animated or plain
    if (config.animate) {
      return yield* animatedMatch(value, config);
    }

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
 *   render: (todo) => $.li(todo.map(t => t.text))
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
): Element<E, R> =>
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

    // Client mode - animated or plain
    if (config.animate) {
      return yield* animatedEach(items, config);
    }

    return yield* clientEach(items, config);
  });
