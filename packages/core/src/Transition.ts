import { Effect, Scope } from "effect";

import { Readable as ReadableNS, type Readable } from "./Readable.js";
import { make as makeSignal } from "./Signal.js";

/**
 * Error thrown when an invalid state transition is attempted.
 */
export class InvalidTransition extends Error {
  readonly _tag = "InvalidTransition";
  readonly from: string;
  readonly to: string;
  readonly allowed: string[];

  constructor(from: string, to: string, allowed: string[]) {
    super(
      `Invalid transition from "${from}" to "${to}". Allowed: [${allowed.join(", ")}]`,
    );
    this.from = from;
    this.to = to;
    this.allowed = allowed;
  }
}

/**
 * A guarded transition target with a reactive condition.
 */
export interface GuardedTarget<S extends string> {
  readonly to: S;
  readonly when: Readable<boolean>;
}

/**
 * A transition target - either a simple state string or a guarded transition.
 */
export type TransitionTarget<S extends string> = S | GuardedTarget<S>;

/**
 * Configuration for state transitions.
 * Maps each state to an array of allowed transition targets.
 */
export type TransitionConfig<S extends string> = Record<
  S,
  TransitionTarget<S>[]
>;

/**
 * Options for the guard method.
 */
export interface GuardOptions {
  /**
   * What to do when the callback is blocked (not in an enabled state).
   * - "fail": Return Effect.fail with InvalidTransition error
   * - "ignore": Return Effect.void (do nothing)
   * @default "fail"
   */
  readonly onBlocked?: "fail" | "ignore";
}

/**
 * A state machine with declarative transitions.
 * @template S - Union type of all possible states
 */
export interface Transition<S extends string> {
  /** Current state as a Readable (read-only) */
  readonly current: Readable<S>;

  /**
   * Transition to a new state.
   * Fails with InvalidTransition if the transition is not allowed from the current state,
   * or if a guard condition is not met.
   */
  readonly to: (state: S) => Effect.Effect<void, InvalidTransition>;

  /** Check if currently in a specific state (reactive) */
  readonly is: (state: S) => Readable<boolean>;

  /**
   * Check if transition to a state is currently allowed (reactive).
   * Takes guards into account - returns false if guard condition is not met.
   */
  readonly canTransitionTo: (state: S) => Readable<boolean>;

  /**
   * Create a guarded callback that only runs when in specified states.
   * @param enabledStates - States in which the callback is allowed to run
   * @param callback - The callback to guard
   * @param options - Configuration for blocked behavior
   */
  readonly guard: <A extends unknown[], R, E>(
    enabledStates: S[],
    callback: (...args: A) => Effect.Effect<R, E>,
    options?: GuardOptions,
  ) => (...args: A) => Effect.Effect<R | void, E | InvalidTransition>;
}

/**
 * Create a state machine with declarative transitions.
 *
 * @param config - Record mapping each state to its allowed transition targets
 * @param initial - Initial state
 *
 * @example Basic usage
 * ```ts
 * const status = yield* Transition.make(
 *   {
 *     idle: ["loading"],
 *     loading: ["success", "error"],
 *     success: ["idle"],
 *     error: ["idle", "loading"],
 *   },
 *   "idle"
 * );
 *
 * yield* status.to("loading"); // works
 * yield* status.to("success"); // fails - not allowed from idle
 *
 * // Reactive checks
 * status.is("idle");              // Readable<boolean>
 * status.canTransitionTo("error"); // Readable<boolean>
 * ```
 *
 * @example With guards
 * ```ts
 * const isOnline = yield* Signal.make(true);
 *
 * const status = yield* Transition.make(
 *   {
 *     idle: [{ to: "loading", when: isOnline }, "error"],
 *     loading: ["success", "error"],
 *     success: ["idle"],
 *     error: ["idle"],
 *   },
 *   "idle"
 * );
 *
 * // canTransitionTo respects guards
 * status.canTransitionTo("loading"); // true only when isOnline is true
 * ```
 *
 * @example Guarded callbacks
 * ```ts
 * const submit = status.guard(
 *   ["idle"],
 *   (data: FormData) => submitForm(data),
 *   { onBlocked: "ignore" }
 * );
 *
 * yield* submit(formData); // runs only if in "idle" state
 * ```
 */
export const make = <
  const C extends Record<string, readonly TransitionTarget<string & keyof C>[]>,
>(
  config: C,
  initial: string & keyof C,
): Effect.Effect<Transition<string & keyof C>, never, Scope.Scope> =>
  Effect.gen(function* () {
    type S = string & keyof C;
    const stateSignal = yield* makeSignal<S>(initial as S);

    // Current state as read-only Readable
    const current: Readable<S> = ReadableNS.make(
      stateSignal.get,
      () => stateSignal.changes,
    );

    // Helper to get allowed targets from config for a given state
    const getAllowedTargets = (from: S): readonly TransitionTarget<S>[] =>
      (config[from] as readonly TransitionTarget<S>[] | undefined) ?? [];

    // Helper to extract just the state names from targets (for error messages)
    const getTargetStateNames = (
      targets: readonly TransitionTarget<S>[],
    ): S[] => targets.map((t) => (typeof t === "string" ? t : t.to));

    // Check if a specific transition is allowed (considering guards)
    const isTransitionAllowed = (from: S, to: S): Effect.Effect<boolean> =>
      Effect.gen(function* () {
        const targets = getAllowedTargets(from);

        for (const target of targets) {
          if (typeof target === "string") {
            // Unguarded transition
            if (target === to) return true;
          } else {
            // Guarded transition - check the guard
            if (target.to === to) {
              const guardPasses = yield* target.when.get;
              if (guardPasses) return true;
            }
          }
        }

        return false;
      });

    // Transition to a new state
    const to = (target: S): Effect.Effect<void, InvalidTransition> =>
      Effect.gen(function* () {
        const from = yield* stateSignal.get;
        const allowed = yield* isTransitionAllowed(from, target);

        if (!allowed) {
          const allowedStates = getTargetStateNames(getAllowedTargets(from));
          return yield* Effect.fail(
            new InvalidTransition(from, target, allowedStates),
          );
        }

        yield* stateSignal.set(target);
      });

    // Check if in a specific state (reactive)
    const is = (state: S): Readable<boolean> => current.map((s) => s === state);

    // Check if can transition to a state (reactive, respects guards)
    const canTransitionTo = (target: S): Readable<boolean> => {
      // Collect all unique guards from the config that affect transition to target
      const guardsToTrack: Readable<boolean>[] = [];

      for (const fromState of Object.keys(config) as S[]) {
        const targets = getAllowedTargets(fromState);
        for (const t of targets) {
          if (typeof t !== "string" && t.to === target) {
            if (!guardsToTrack.includes(t.when)) {
              guardsToTrack.push(t.when);
            }
          }
        }
      }

      // No guards - just check if current state allows the transition
      if (guardsToTrack.length === 0) {
        return current.map((from) => {
          const targets = getAllowedTargets(from);
          return targets.some(
            (t) => (typeof t === "string" ? t : t.to) === target,
          );
        });
      }

      // Combine current state with all relevant guards for reactivity
      const combined = ReadableNS.combine([current, ...guardsToTrack]);

      return combined.map((values) => {
        const from = values[0] as S;
        const guardValues = values.slice(1) as boolean[];
        const targets = getAllowedTargets(from);

        for (const t of targets) {
          const targetState = typeof t === "string" ? t : t.to;
          if (targetState !== target) continue;

          if (typeof t === "string") {
            // Unguarded transition to target - allowed
            return true;
          } else {
            // Guarded - check if this specific guard passes
            const guardIndex = guardsToTrack.indexOf(t.when);
            if (guardIndex !== -1 && guardValues[guardIndex]) {
              return true;
            }
          }
        }

        return false;
      });
    };

    // Create a guarded callback
    const guard = <A extends unknown[], R, E>(
      enabledStates: S[],
      callback: (...args: A) => Effect.Effect<R, E>,
      options?: GuardOptions,
    ): ((...args: A) => Effect.Effect<R | void, E | InvalidTransition>) => {
      const onBlocked = options?.onBlocked ?? "fail";

      return (...args: A) =>
        Effect.gen(function* () {
          const from = yield* stateSignal.get;

          if (!enabledStates.includes(from)) {
            if (onBlocked === "ignore") {
              return;
            }
            return yield* Effect.fail(
              new InvalidTransition(from, "[guarded callback]", enabledStates),
            );
          }

          return yield* callback(...args);
        });
    };

    return {
      current,
      to,
      is,
      canTransitionTo,
      guard,
    };
  });

export const Transition = {
  make,
  InvalidTransition,
};
