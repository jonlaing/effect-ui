import { Effect, Scope } from "effect";

import { getUnsafe, type ElementRef } from "../Element/ref.js";

/**
 * An element reference - can be:
 * - ElementRef (Effect-based ref)
 * - Raw HTMLElement
 * - null/undefined
 */
export type ElementRefLike =
  | ElementRef<HTMLElement>
  | HTMLElement
  | null
  | undefined;

/**
 * Get the element from an ElementRefLike.
 */
const getElement = (ref: ElementRefLike): HTMLElement | null => {
  if (!ref) return null;
  // Check if it's a raw HTMLElement
  if (ref instanceof HTMLElement) return ref;
  // It's an ElementRef (Effect-based)
  return getUnsafe(ref);
};

/**
 * Set up a click-outside handler that calls the callback when a click occurs
 * outside all of the specified elements.
 *
 * The handler is automatically cleaned up when the scope is closed.
 *
 * @param refs - Array of element references (Refs or raw elements) that should be considered "inside"
 * @param callback - Effect to run when a click occurs outside all elements
 *
 * @example
 * ```ts
 * // With ElementRefs (recommended)
 * const triggerRef = yield* Element.ref<HTMLButtonElement>();
 * const contentRef = yield* Element.ref<HTMLDivElement>();
 * yield* onClickOutside([triggerRef, contentRef], () => ctx.close());
 *
 * // With raw elements
 * const contentEl = yield* $.div({}, children);
 * yield* onClickOutside([triggerRef, contentEl], () => ctx.close());
 * ```
 */
export const onClickOutside = (
  refs: ElementRefLike[],
  callback: () => Effect.Effect<void>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInside = refs.some((ref) => {
        const el = getElement(ref);
        return el?.contains(target);
      });
      if (!isInside) {
        Effect.runSync(callback());
      }
    };

    // Use capture phase to handle click before it bubbles
    document.addEventListener("click", handleClick, true);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        document.removeEventListener("click", handleClick, true);
      }),
    );
  });
