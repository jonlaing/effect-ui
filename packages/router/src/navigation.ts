import { Effect } from "effect";
import type { NavigateOptions } from "./types";
import { isBrowser, RouterInternalsContext } from "./internals";

export interface NavigationMethods {
  push: (path: string, opts?: NavigateOptions) => Effect.Effect<void>;
  replace: (path: string) => Effect.Effect<void>;
  back: () => Effect.Effect<void>;
  forward: () => Effect.Effect<void>;
}

/**
 * Create navigation methods for the router.
 */
export const createNavigationMethods = (): Effect.Effect<
  NavigationMethods,
  never,
  RouterInternalsContext
> =>
  Effect.gen(function* () {
    const { pathnameSignal, searchParamsSignal } =
      yield* RouterInternalsContext;

    const push = (path: string, opts?: NavigateOptions): Effect.Effect<void> =>
      Effect.gen(function* () {
        if (!isBrowser()) return;

        const url = new URL(path, window.location.origin);

        if (opts?.replace) {
          window.history.replaceState(null, "", url.pathname + url.search);
        } else {
          window.history.pushState(null, "", url.pathname + url.search);
        }

        yield* pathnameSignal.set(url.pathname);
        yield* searchParamsSignal.set(url.searchParams);
      });

    const replace = (path: string): Effect.Effect<void> =>
      push(path, { replace: true });

    const back = (): Effect.Effect<void> =>
      Effect.sync(() => {
        if (isBrowser()) {
          window.history.back();
        }
      });

    const forward = (): Effect.Effect<void> =>
      Effect.sync(() => {
        if (isBrowser()) {
          window.history.forward();
        }
      });

    return { push, replace, back, forward };
  });
