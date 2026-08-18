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
