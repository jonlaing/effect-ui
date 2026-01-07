import { Effect, Scope } from "effect";

/**
 * A ref-like object with a current property.
 */
interface RefLike<T> {
  readonly current: T | null;
}

/**
 * An element reference - either a ref-like object or a raw HTMLElement.
 */
export type ElementRef = RefLike<HTMLElement> | HTMLElement | null | undefined;

/**
 * Get the element from an ElementRef.
 */
const getElement = (ref: ElementRef): HTMLElement | null => {
  if (!ref) return null;
  // Check if it's a Ref (has .current property) or a raw element
  if ("current" in ref) return ref.current;
  return ref;
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
 * // With Refs
 * const triggerRef = yield* Ref.make<HTMLButtonElement>();
 * const contentRef = yield* Ref.make<HTMLDivElement>();
 * yield* onClickOutside([triggerRef, contentRef], () => ctx.close());
 *
 * // With raw elements
 * const contentEl = yield* $.div({}, children);
 * yield* onClickOutside([ctx.triggerRef, contentEl], () => ctx.close());
 * ```
 */
export const onClickOutside = (
  refs: ElementRef[],
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
