import { Effect } from "effect";

/**
 * Subsystem tag for a framework debug log. The `effex.` prefix is enforced
 * at the type level so consumers filtering by annotation can rely on the
 * naming convention.
 */
export type Subsystem = `effex.${string}`;

/**
 * Emit a debug log annotated with an Effex subsystem tag.
 *
 * Zero cost when the runtime log level is above Debug (the default) — the
 * formatter never runs, so message construction is skipped. Use freely at
 * low-volume framework boundaries; high-volume paths (e.g. `Signal.set`)
 * should use structured Context.Tag hooks instead.
 *
 * @example
 * ```ts
 * yield* logDebug("pushPath", "effex.nav", { from, to });
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
 * Emit an error log annotated with an Effex subsystem tag.
 *
 * Unlike {@link logDebug}, this always emits at Error level — users see
 * it without opting into debug logging, which matches how framework
 * error paths (a reconcile handler throwing, a data provider dying) need
 * to surface. Users can route these through custom `Logger` sinks
 * (Sentry, structured logs, etc.) via the standard Effect pattern.
 *
 * @example
 * ```ts
 * yield* logError("reconcile handler failed", "effex.reconcile", {
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
