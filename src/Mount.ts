import { Effect, Scope } from "effect";
import type { Element } from "./Element";

/**
 * Mount an Element into a DOM container. Automatically cleans up when the scope closes.
 * @param element - The Element to mount
 * @param container - The DOM container to mount into
 *
 * @example
 * ```ts
 * const app = div([
 *   h1(["Hello, Effect UI!"])
 * ])
 *
 * // Mount the app and run it
 * Effect.runPromise(
 *   Effect.scoped(
 *     mount(app, document.getElementById("root")!)
 *   )
 * )
 * ```
 */
export const mount = (
  element: Element,
  container: HTMLElement,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const el = yield* element;
    container.appendChild(el);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (el.parentNode === container) {
          container.removeChild(el);
        }
      }),
    );
  });
