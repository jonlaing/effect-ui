import { Effect, Scope } from "effect";
import type { Element } from "./Element.js";

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
