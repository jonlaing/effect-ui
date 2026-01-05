import { Effect, Scope } from "effect";
import { isBrowser, RouterInternalsContext } from "./internals";

/**
 * Set up browser history listener to sync with router state.
 */
export const setupHistoryListener = (): Effect.Effect<
  void,
  never,
  Scope.Scope | RouterInternalsContext
> =>
  Effect.gen(function* () {
    if (!isBrowser()) {
      return;
    }

    const { pathnameSignal, searchParamsSignal } =
      yield* RouterInternalsContext;

    const handlePopState = () => {
      Effect.runSync(pathnameSignal.set(window.location.pathname));
      Effect.runSync(
        searchParamsSignal.set(new URLSearchParams(window.location.search)),
      );
    };

    window.addEventListener("popstate", handlePopState);

    // Clean up listener when scope is closed
    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        window.removeEventListener("popstate", handlePopState);
      }),
    );
  });
