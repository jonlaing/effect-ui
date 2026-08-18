import { Effect, HashMap, Logger, LogLevel, Option } from "effect";
import { describe, expect, it } from "vitest";

import { logDebug, logError } from "./Debug.js";

interface Captured {
  readonly level: string;
  readonly message: unknown;
  readonly subsystem: string | undefined;
}

const capture = () => {
  const sink: Captured[] = [];
  const layer = Logger.replace(
    Logger.defaultLogger,
    Logger.make((opts) => {
      const sub = HashMap.get(opts.annotations, "subsystem");
      sink.push({
        level: opts.logLevel.label,
        message: opts.message,
        subsystem: Option.isSome(sub) ? String(sub.value) : undefined,
      });
    }),
  );
  return { sink, layer };
};

describe("Debug.logDebug", () => {
  it("emits at Debug level with the subsystem annotation", async () => {
    const { sink, layer } = capture();
    await Effect.runPromise(
      logDebug("hello", "effex.test", { a: 1 }).pipe(
        Logger.withMinimumLogLevel(LogLevel.Debug),
        Effect.provide(layer),
      ),
    );
    expect(sink).toHaveLength(1);
    expect(sink[0].level).toBe("DEBUG");
    expect(sink[0].subsystem).toBe("effex.test");
  });

  it("emits nothing when the runtime log level is above Debug", async () => {
    const { sink, layer } = capture();
    // No withMinimumLogLevel — default is Info; Debug is filtered.
    await Effect.runPromise(
      logDebug("hello", "effex.test").pipe(Effect.provide(layer)),
    );
    expect(sink).toEqual([]);
  });

  it("works without a data argument", async () => {
    const { sink, layer } = capture();
    await Effect.runPromise(
      logDebug("bare message", "effex.test").pipe(
        Logger.withMinimumLogLevel(LogLevel.Debug),
        Effect.provide(layer),
      ),
    );
    expect(sink).toHaveLength(1);
    expect(sink[0].subsystem).toBe("effex.test");
  });

  it("logError emits at Error level with the subsystem — visible without opting into Debug", async () => {
    // Unlike logDebug, logError should be visible at the default log level
    // so users see framework error paths without any Logger configuration.
    const { sink, layer } = capture();
    await Effect.runPromise(
      logError("kaboom", "effex.test", { key: "value" }).pipe(
        Effect.provide(layer),
      ),
    );
    expect(sink).toHaveLength(1);
    expect(sink[0].level).toBe("ERROR");
    expect(sink[0].subsystem).toBe("effex.test");
  });
});
