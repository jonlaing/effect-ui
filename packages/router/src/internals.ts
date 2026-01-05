import { Context, Option } from "effect";
import type { Signal } from "@effex/core";
import type { Readable } from "@effex/core";
import type { AnyRoute, LoaderState, ActionState } from "./types";

/**
 * Check if we're running in a browser environment.
 * Returns false during SSR (Node.js).
 */
export const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Internal state shared across router helper functions.
 * This avoids passing the same parameters to every function.
 */
export interface RouterInternals<Routes extends Record<string, AnyRoute>> {
  readonly routes: Routes;
  readonly currentRoute: Readable<Option.Option<keyof Routes & string>>;
  readonly pathnameSignal: Signal.Signal<string>;
  readonly searchParamsSignal: Signal.Signal<URLSearchParams>;
  readonly loaderStateSignal: Signal.Signal<LoaderState>;
  readonly actionStateSignal: Signal.Signal<ActionState>;
}

/**
 * Context tag for router internals.
 * Used internally to share state between helper functions.
 */
export class RouterInternalsContext extends Context.Tag("RouterInternals")<
  RouterInternalsContext,
  RouterInternals<Record<string, AnyRoute>>
>() {}
