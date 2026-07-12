import { Context, Effect, Scope } from "effect";

import type { Element } from "./Element.js";
import type { Readable } from "./Readable.js";
import type { Signal } from "./Signal.js";

// -----------------------------------------------------------------------------
// SlotEntry
// -----------------------------------------------------------------------------

/**
 * Represents a rendered slot in a control flow structure.
 * @template A - The element type (e.g., HTMLElement | SVGElement for DOM)
 */
export interface SlotEntry<A> {
  /** Unique key identifying this slot */
  readonly key: string;
  /** The rendered element */
  readonly element: A;
  /** Scope for cleanup when slot is removed */
  readonly scope: Scope.CloseableScope;
  /** Signal for the item value (used by `each`) */
  readonly item?: Signal.Signal<unknown>;
  /** Signal for the item index (used by `each`) */
  readonly index?: Signal.Signal<number>;
}

// -----------------------------------------------------------------------------
// IControlCtx
// -----------------------------------------------------------------------------

/**
 * Context interface for control flow operations.
 * Abstracts SSR/Hydration/Client differences behind a unified API.
 *
 * @template A - The element type (e.g., HTMLElement | SVGElement for DOM)
 *
 * **Package split:**
 * - `packages/core`: Interface definition, reconcile function, thin wrappers
 * - `packages/dom`: Live implementations (Client, Hydration, SSR)
 */
export interface IControlCtx<A> {
  /**
   * Create a child context with isolated state.
   * Each control function (when, match, each) calls this to get its own
   * container and slots, preventing conflicts when nested or used with collect.
   */
  readonly fork: () => Effect.Effect<IControlCtx<A>>;

  /**
   * Default container element.
   * Each environment provides its own implementation.
   * e.g., DOM uses `$.div({ style: "display: contents" })`
   */
  readonly defaultContainer: Element<A, never, never>;

  /**
   * Get or create the container element.
   * - SSR: calls create(), adds hydration markers
   * - Hydration: finds existing container, falls back to create()
   * - Client: calls create()
   *
   * Uses defaultContainer if create is not provided.
   */
  readonly getContainer: <E, R>(
    create?: () => Element<A, E, R>,
  ) => Element<A, E, R>;

  /**
   * Add a new slot to the container.
   * Creates item/index signals internally and passes them to render callback.
   * Handles enter animations in client mode.
   */
  readonly addSlot: <E, R>(
    key: string,
    render: (ctx: {
      item: Signal.Signal<unknown>;
      index: Signal.Signal<number>;
    }) => Element<A, E, R>,
    options?: {
      atIndex?: number;
      initialItem?: unknown;
      initialIndex?: number;
      /**
       * Total number of slots in this reconcile batch, used by animation
       * helpers to compute per-item stagger delay. Passed by `reconcile`;
       * external callers can omit it.
       */
      totalItems?: number;
      /**
       * `Date.now()` timestamp captured when the current reconcile batch
       * started. Animation helpers use it as a shared reference so every
       * slot's stagger delay is measured from the same wall-clock moment
       * rather than accumulating reconcile overhead. Passed by `reconcile`.
       */
      staggerStartAt?: number;
    },
  ) => Effect.Effect<SlotEntry<A>, E, R>;

  /**
   * Remove a slot from the container.
   * Noop in SSR, handles exit animations in client mode.
   */
  readonly removeSlot: (key: string) => Effect.Effect<void>;

  /**
   * Get a slot by its key.
   */
  readonly getSlot: (key: string) => Effect.Effect<SlotEntry<A> | undefined>;

  /**
   * Get all current slot keys.
   * Reads from DOM in hydration mode.
   */
  readonly getSlotKeys: () => Effect.Effect<readonly string[]>;

  /**
   * Move a slot to a new index position.
   * Noop in SSR mode.
   */
  readonly moveSlot: (key: string, toIndex: number) => Effect.Effect<void>;

  /**
   * Signal that the container's initial children have been processed.
   * In hydration mode, this pops the container from the traversal stack
   * so sibling elements are found correctly.
   * No-op in client/SSR mode.
   */
  readonly finalizeContainer: () => Effect.Effect<void>;

  /**
   * Subscribe to a Readable and run handler on each change.
   * Noop in SSR, forks stream subscription in client/hydration.
   */
  readonly subscribe: <V, E, R>(
    readable: Readable.Readable<V>,
    handler: (value: V) => Effect.Effect<void, E, R>,
  ) => Effect.Effect<void, E, R>;
}

// -----------------------------------------------------------------------------
// ControlCtx Tag
// -----------------------------------------------------------------------------

/**
 * Context tag for control flow operations.
 * Uses `unknown` as the base element type - live implementations narrow this.
 */
export class ControlCtx extends Context.Tag("@effex/core/ControlCtx")<
  ControlCtx,
  IControlCtx<unknown>
>() {}
