import { Effect } from "effect";

/**
 * Subsystem tag for a framework debug log. The `stax.` prefix is enforced
 * at the type level so consumers filtering by annotation can rely on the
 * naming convention.
 */
export type Subsystem = `stax.${string}`;

/**
 * Emit a debug log annotated with an Stax subsystem tag.
 *
 * Zero cost when the runtime log level is above Debug (the default) — the
 * formatter never runs, so message construction is skipped. Use freely at
 * low-volume framework boundaries; high-volume paths (e.g. `Signal.set`)
 * should use structured Context.Tag hooks instead.
 *
 * @example
 * ```ts
 * yield* logDebug("pushPath", "stax.nav", { from, to });
 * ```
 */
export const logDebug = (
  message: string,
  subsystem: Subsystem,
  data?: unknown,
): Effect.Effect<void> => {
  const log =
    data === undefined
      ? Effect.logDebug(message)
      : Effect.logDebug(message, data);
  return log.pipe(Effect.annotateLogs("subsystem", subsystem));
};

/**
 * Wrap an Effect-returning method on a Signal collection so every call is
 * logged under `stax.signal` at Debug level, with the method name, its
 * arguments, and the caller's stack trace.
 *
 * Preserves the wrapped method's exact type (parameters + return type). The
 * `new Error()` capture is inside the returned function, so it runs on the
 * caller's synchronous frame — the stack top is user code, not the wrapper.
 *
 * Internal to `Signal.<Kind>.trace` implementations; not exported publicly.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const traceSignalMethod = <
  F extends (...args: any[]) => Effect.Effect<any, any, any>,
>(
  method: string,
  id: string,
  fn: F,
): F =>
  ((...args: Parameters<F>) => {
    const err = new Error();
    return Effect.gen(function* () {
      yield* logDebug(method, "stax.signal", {
        id,
        args,
        callSite: err.stack,
      });
      return yield* fn(...args);
    });
  }) as F;

/**
 * Emit an error log annotated with an Stax subsystem tag.
 *
 * Unlike {@link logDebug}, this always emits at Error level — users see
 * it without opting into debug logging, which matches how framework
 * error paths (a reconcile handler throwing, a data provider dying) need
 * to surface. Users can route these through custom `Logger` sinks
 * (Sentry, structured logs, etc.) via the standard Effect pattern.
 *
 * @example
 * ```ts
 * yield* logError("reconcile handler failed", "stax.reconcile", {
 *   value,
 *   cause: Cause.pretty(cause),
 * });
 * ```
 */
export const logError = (
  message: string,
  subsystem: Subsystem,
  data?: unknown,
): Effect.Effect<void> => {
  const log =
    data === undefined
      ? Effect.logError(message)
      : Effect.logError(message, data);
  return log.pipe(Effect.annotateLogs("subsystem", subsystem));
};
