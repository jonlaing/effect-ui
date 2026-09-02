import { Effect, HashMap, Logger, LogLevel, Option } from "effect";
import { describe, expect, it } from "vitest";

import { logDebug, logError, parseCallSite } from "./Debug.js";

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
      logDebug("hello", "stax.test", { a: 1 }).pipe(
        Logger.withMinimumLogLevel(LogLevel.Debug),
        Effect.provide(layer),
      ),
    );
    expect(sink).toHaveLength(1);
    expect(sink[0].level).toBe("DEBUG");
    expect(sink[0].subsystem).toBe("stax.test");
  });

  it("emits nothing when the runtime log level is above Debug", async () => {
    const { sink, layer } = capture();
    // No withMinimumLogLevel — default is Info; Debug is filtered.
    await Effect.runPromise(
      logDebug("hello", "stax.test").pipe(Effect.provide(layer)),
    );
    expect(sink).toEqual([]);
  });

  it("works without a data argument", async () => {
    const { sink, layer } = capture();
    await Effect.runPromise(
      logDebug("bare message", "stax.test").pipe(
        Logger.withMinimumLogLevel(LogLevel.Debug),
        Effect.provide(layer),
      ),
    );
    expect(sink).toHaveLength(1);
    expect(sink[0].subsystem).toBe("stax.test");
  });

  it("logError emits at Error level with the subsystem — visible without opting into Debug", async () => {
    // Unlike logDebug, logError should be visible at the default log level
    // so users see framework error paths without any Logger configuration.
    const { sink, layer } = capture();
    await Effect.runPromise(
      logError("kaboom", "stax.test", { key: "value" }).pipe(
        Effect.provide(layer),
      ),
    );
    expect(sink).toHaveLength(1);
    expect(sink[0].level).toBe("ERROR");
    expect(sink[0].subsystem).toBe("stax.test");
  });
});

describe("parseCallSite", () => {
  it("returns undefined for missing stack", () => {
    expect(parseCallSite(undefined)).toBeUndefined();
  });

  it('drops the "Error" header line', () => {
    const stack = [
      "Error",
      "    at userFn (/home/me/app/src/Home.ts:10:5)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toBeDefined();
    expect(result).not.toMatch(/^Error/);
    expect(result).toContain("Home.ts");
  });

  it("strips leading @stax-ui/core frames (installed dep)", () => {
    const stack = [
      "Error",
      "    at set (/user/proj/node_modules/@stax-ui/core/dist/index.js:100:5)",
      "    at Home (/user/proj/src/Home.ts:20:9)",
      "    at main (/user/proj/src/main.ts:5:3)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toContain("Home.ts");
    expect(result).toContain("main.ts");
    expect(result).not.toContain("@stax-ui/core");
  });

  it("strips leading packages/core frames (workspace source)", () => {
    const stack = [
      "Error",
      "    at set (/repo/packages/core/src/Signal.ts:145:12)",
      "    at Home (/repo/apps/web/src/Home.ts:20:9)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toContain("apps/web/src/Home.ts");
    expect(result).not.toContain("packages/core/src/Signal.ts");
  });

  it("keeps a user file named Signal.ts", () => {
    // User's app has its own Signal.ts — must not be treated as stax internal.
    const stack = [
      "Error",
      "    at set (/repo/packages/core/src/Signal.ts:145:12)",
      "    at userSet (/user/proj/src/models/Signal.ts:32:5)",
      "    at Home (/user/proj/src/Home.ts:20:9)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toContain("/user/proj/src/models/Signal.ts");
    expect(result).toContain("Home.ts");
  });

  it("keeps a user file whose path contains a similar segment", () => {
    // A user directory literally named "packages" or "core.ts" shouldn't
    // trip the heuristic — we anchor on /packages/core/ and /@stax-ui/core/.
    const stack = [
      "Error",
      "    at set (/repo/packages/core/src/Signal.ts:145:12)",
      "    at userFn (/user/proj/src/packages/utils.ts:12:3)",
      "    at other (/user/proj/src/core.ts:5:1)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toContain("/user/proj/src/packages/utils.ts");
    expect(result).toContain("/user/proj/src/core.ts");
  });

  it("stops stripping at the first non-stax frame — interleaved stax lines below are kept", () => {
    // If the user calls back into stax internally partway down, we still
    // keep those frames — only the LEADING contiguous run is stripped.
    const stack = [
      "Error",
      "    at set (/repo/packages/core/src/Signal.ts:145:12)",
      "    at Home (/user/proj/src/Home.ts:20:9)",
      "    at innerHelper (/repo/packages/core/src/Readable.ts:50:3)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toContain("Home.ts");
    expect(result).toContain("Readable.ts");
  });

  it("returns undefined when only stax frames remain", () => {
    // Nothing left to log — return undefined rather than an empty string
    // so consumers can treat it as "no useful call site."
    const stack = [
      "Error",
      "    at set (/repo/packages/core/src/Signal.ts:145:12)",
    ].join("\n");
    expect(parseCallSite(stack)).toBeUndefined();
  });

  it("handles Windows-style backslash paths", () => {
    const stack = [
      "Error",
      "    at set (C:\\repo\\packages\\core\\src\\Signal.ts:145:12)",
      "    at Home (C:\\user\\proj\\src\\Home.ts:20:9)",
    ].join("\n");
    const result = parseCallSite(stack);
    expect(result).toContain("Home.ts");
    expect(result).not.toContain("packages\\core");
  });
});
