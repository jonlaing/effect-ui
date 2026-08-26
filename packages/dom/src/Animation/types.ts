import type { Effect, Scope } from "effect";

import type { RendererContext } from "@stax-ui/core";

import type { AnimationGroup } from "./groups.js";

/**
 * @module Animation
 *
 * Animation system for enter/exit transitions on elements.
 *
 * ## How It Works
 *
 * The animation system listens for `transitionend` or `animationend` events
 * to know when animations complete. If no event fires within the timeout
 * (default 5 seconds), it assumes the animation is done.
 *
 * ## Tailwind CSS Setup
 *
 * For animations to work correctly with Tailwind, you need BOTH:
 * 1. A `transition-*` property (e.g., `transition-opacity`)
 * 2. A `duration-*` property (e.g., `duration-150`)
 *
 * ### Common Gotcha: No Transition Event
 *
 * If your animation seems to hang for several seconds, the `transitionend`
 * event isn't firing. This usually means:
 * - Missing `transition-*` class (you have duration but no transition property)
 * - CSS specificity issues (use `!` prefix in Tailwind for important)
 * - The property isn't actually changing
 *
 * ### Example: Fade Animation
 *
 * ```typescript
 * match(currentRoute, {
 *   cases: [...],
 *   animate: {
 *     // enterFrom: initial state + transition setup
 *     enterFrom: "opacity-0 transition-opacity duration-150",
 *     // enter: target state (use ! for specificity)
 *     enter: "!opacity-100",
 *     // exit: starting state + transition setup
 *     exit: "transition-opacity duration-150",
 *     // exitTo: final state (use ! for specificity)
 *     exitTo: "!opacity-0",
 *   }
 * })
 * ```
 *
 * ### Why `!important`?
 *
 * Tailwind's `!` prefix ensures your animation classes override any existing
 * opacity utilities on the element. Without it, `opacity-100` might not
 * actually change the value if the element already has an opacity class.
 */

/**
 * Result of waiting for an animation to complete
 */
export type AnimationEndResult =
  | { endedBy: "animation" }
  | { endedBy: "transition" }
  | { endedBy: "timeout" }
  | { endedBy: "skip" };

/**
 * Lifecycle hook that receives an Effect-wrapped HTMLElement for piping.
 * The element is wrapped in Effect.succeed() so Element helpers can be piped.
 *
 * The hook can return an Effect that requires Scope and RendererContext,
 * which are available during component lifecycle.
 *
 * @example
 * ```ts
 * // Pipe Element helpers
 * onEnter: (el) => el.pipe(
 *   Element.setStyles({ animation: "none" }),
 *   Element.focus,
 * )
 *
 * // Or use Effect.gen for complex logic
 * onEnter: (el) => Effect.gen(function* () {
 *   yield* el.pipe(Element.focus);
 *   yield* doSomethingElse();
 * })
 * ```
 */
export type AnimationHook = (
  element: Effect.Effect<HTMLElement>,
) => Effect.Effect<unknown, unknown, Scope.Scope | RendererContext>;

/**
 * Options for enter/exit animations on a single element.
 *
 * See module docs above for Tailwind setup guide and common gotchas.
 */
export interface AnimationOptions {
  /**
   * CSS class(es) for the enter animation target state.
   * Applied after enterFrom is removed to trigger the transition.
   *
   * Use `!` prefix (Tailwind important) if needed for specificity:
   * @example "!opacity-100"
   */
  enter?: string;

  /**
   * CSS class(es) to apply at the start of exit animation.
   * Should include `transition-*` and `duration-*` for CSS transitions.
   *
   * @example "transition-opacity duration-150"
   */
  exit?: string;

  /**
   * CSS class(es) for the initial state before enter animation starts.
   * Should include `transition-*` and `duration-*` for CSS transitions.
   * These are removed after the first frame to trigger the transition.
   *
   * @example "opacity-0 transition-opacity duration-150"
   */
  enterFrom?: string;

  /**
   * CSS class(es) for the final state after enter animation completes.
   * These persist on the element after animation ends.
   */
  enterTo?: string;

  /**
   * CSS class(es) for the target state of exit animation.
   * Applied after exit to trigger the transition.
   *
   * Use `!` prefix (Tailwind important) if needed for specificity:
   * @example "!opacity-0"
   */
  exitTo?: string;

  /**
   * Maximum time in milliseconds to wait for animation/transition to complete.
   * If exceeded, animation is considered complete.
   *
   * **Troubleshooting:** If animations consistently hit this timeout,
   * the `transitionend` event isn't firing. Check that your CSS classes
   * include both `transition-*` AND `duration-*` properties.
   *
   * @default 5000
   */
  timeout?: number;

  /**
   * Whether to skip animations when user prefers reduced motion.
   * When true and reduced motion is preferred, animations complete instantly.
   * @default true
   */
  respectReducedMotion?: boolean;

  /**
   * Called before enter animation starts, after element is in DOM
   */
  onBeforeEnter?: AnimationHook;

  /**
   * Called after enter animation completes
   */
  onEnter?: AnimationHook;

  /**
   * Called before exit animation starts
   */
  onBeforeExit?: AnimationHook;

  /**
   * Called after exit animation completes, before element is removed from DOM
   */
  onExit?: AnimationHook;

  /**
   * Attach this animation to a shared {@link AnimationGroup} — the animation
   * waits for the group's gate before starting, and signals completion when
   * it finishes. Combined with `Animation.sequence()`, this lets you
   * choreograph animations across multiple blocks (e.g. one `each` per word
   * in a headline).
   *
   * @see {@link ./groups.ts}
   */
  group?: AnimationGroup;
}

/**
 * Subset of {@link AnimationOptions} covering only the enter lifecycle.
 * Used by control functions (like `animated`) that mount their content
 * once and never remove it, so any exit-related fields would be dead code.
 *
 * Includes `group` so callers can wire the element into an
 * {@link AnimationGroup} the same way they would with `each`/`when`/`match`:
 * `{ animate: { group: g0, ... } }`.
 */
export type EnterOnlyAnimationOptions = Pick<
  AnimationOptions,
  | "enter"
  | "enterFrom"
  | "enterTo"
  | "onBeforeEnter"
  | "onEnter"
  | "timeout"
  | "respectReducedMotion"
  | "group"
>;

/**
 * Stagger function that calculates delay for each item in a list
 * @param index - Zero-based index of the item
 * @param total - Total number of items being animated
 * @returns Delay in milliseconds
 */
export type StaggerFunction = (index: number, total: number) => number;

/**
 * Options for list animations (used with `each`)
 */
export interface ListAnimationOptions extends AnimationOptions {
  /**
   * Stagger timing for list items.
   * - number: Fixed delay between items in milliseconds
   * - StaggerFunction: Custom function to calculate delay per item
   */
  stagger?: number | StaggerFunction;

  /**
   * Reorder (FLIP) animation config. When set, `each` animates items
   * that change position within a reactive update — the classic
   * "toggle-and-sort" case where a row slides to its new slot instead
   * of teleporting.
   *
   * Two fields, mirroring the enter/exit split of `enterFrom`/`enter`:
   *
   * - `transform`: given the delta between the element's old and new
   *   positions, return the CSS `transform` value that puts the element
   *   *back* at its old spot. Applied inline, prepended to any
   *   existing computed transform so class-based transforms are preserved.
   *   Use one of the built-in helpers (`Animation.moveTranslate3d`, etc.)
   *   or supply your own function for exotic effects (rotation-on-move,
   *   overshoot, etc.).
   * - `transition`: CSS class(es) that carry the `transition-*` /
   *   `duration-*` / `easing` for the release. Matches the enter/exit
   *   convention — a class rather than an inline transition string so
   *   Tailwind / your design system stays in charge of timings.
   *
   * @example
   * ```ts
   * move: {
   *   transform: Animation.moveTranslate3d,
   *   transition: "transition-transform duration-300 ease-out",
   * }
   * ```
   *
   * For clean composition with `enter` / `exit` in the same batch, keep
   * the move `duration` / `easing` matched to the enter/exit ones — the
   * two animations sum layout-wise, and mismatched timings drift out of
   * phase mid-play.
   */
  move?: MoveAnimation;
}

/**
 * FLIP reorder animation config. See {@link ListAnimationOptions.move}.
 */
export interface MoveAnimation {
  /**
   * Return the CSS `transform` value that inverts an element from its
   * new position back to its old one. Called once per moved element
   * per batch, with the delta the reconciler measured.
   */
  readonly transform: (delta: MoveDelta) => string;

  /**
   * CSS class(es) applied for the release. Must include the
   * `transition-*` / `duration-*` / `easing` setup — same convention
   * as the `enter` / `exit` classes.
   */
  readonly transition: string;
}

/**
 * Delta between an element's old and new positions within its container,
 * measured in pixels. Positive `y` means the element moved *down*, so
 * the inverting transform should translate upward by the same amount.
 */
export interface MoveDelta {
  readonly x: number;
  readonly y: number;
}
