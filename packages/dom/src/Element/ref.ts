import { Data, Effect } from "effect";

/**
 * Error thrown when attempting to access an element ref that has no element bound.
 * This occurs when the element hasn't been mounted yet or the ref wasn't bound to any element.
 */
export class NoSuchElementException extends Data.TaggedError(
  "NoSuchElementException",
)<{
  readonly message?: string;
}> {}

/**
 * Error thrown when attempting to get an attribute that doesn't exist on an element.
 */
export class AttributeNotFound extends Data.TaggedError("AttributeNotFound")<{
  readonly attribute: string;
  readonly message?: string;
}> {}

/**
 * Error thrown when attempting to get a data attribute that doesn't exist on an element.
 */
export class DataAttributeNotFound extends Data.TaggedError(
  "DataAttributeNotFound",
)<{
  readonly key: string;
  readonly message?: string;
}> {}

/**
 * A reference to a DOM element represented as an Effect.
 * The Effect itself serves as the ref identity - pass it to the `ref` prop
 * of an element and use it to access the element in Effect pipelines.
 *
 * @template T - The element type (defaults to HTMLElement, also supports SVGElement)
 *
 * @example
 * ```ts
 * const buttonRef = yield* Element.ref<HTMLButtonElement>();
 *
 * // Pipeable in event handlers
 * const handleClick = () =>
 *   buttonRef.pipe(
 *     Element.setStyles({ color: "red" }),
 *     Element.focus,
 *     Effect.asVoid
 *   );
 *
 * // Pass to element
 * return yield* $.button({ ref: buttonRef, onClick: handleClick }, "Click");
 * ```
 */
export type ElementRef<T extends Element = HTMLElement> = Effect.Effect<
  T,
  NoSuchElementException
>;

/**
 * Internal WeakMap that binds ref Effects to their DOM elements.
 * Uses WeakMap so refs can be garbage collected when no longer referenced.
 * @internal
 */
const elementRefMap = new WeakMap<
  Effect.Effect<Element, NoSuchElementException>,
  Element
>();

/**
 * Bind an element to a ref. Called internally during element creation.
 * @internal
 */
export const bindElementToRef = <T extends Element>(
  ref: ElementRef<T>,
  element: T,
): void => {
  elementRefMap.set(ref, element);
};

/**
 * Unbind an element from a ref. Can be called on element unmount.
 * @internal
 */
export const unbindElementFromRef = <T extends Element>(
  ref: ElementRef<T>,
): void => {
  elementRefMap.delete(ref);
};

/**
 * Get element from ref synchronously.
 * @internal
 */
export const getElementFromRef = <T extends Element>(
  ref: ElementRef<T>,
): T | null => {
  return (elementRefMap.get(ref) as T) ?? null;
};

/**
 * Check if the given value is an ElementRef (Effect-based ref).
 * @internal
 */
export const isElementRef = (value: unknown): value is ElementRef<Element> => {
  // ElementRefs are Effects that are stored in our WeakMap
  // or are Effects created by Element.ref() (have specific structure)
  // During creation, we mark them with a symbol
  return (
    value !== null &&
    typeof value === "object" &&
    elementRefSymbol in (value as object)
  );
};

/**
 * Symbol used to mark ElementRef Effects.
 * @internal
 */
export const elementRefSymbol = Symbol.for("@effex/dom/ElementRef");

/**
 * Create a new element ref that can be passed to the `ref` prop
 * and used to access the element in Effects.
 *
 * @returns An Effect that when yielded returns an ElementRef
 *
 * @example
 * ```ts
 * const buttonRef = yield* Element.ref<HTMLButtonElement>();
 *
 * const handleClick = () =>
 *   buttonRef.pipe(
 *     Element.setStyles({ color: "red" }),
 *     Element.focus,
 *     Effect.asVoid
 *   );
 *
 * return yield* $.button({ ref: buttonRef, onClick: handleClick }, "Click");
 * ```
 */
export const makeElementRef = <
  T extends Element = HTMLElement,
>(): Effect.Effect<ElementRef<T>> =>
  Effect.sync(() => {
    // Create a suspended Effect that reads from the WeakMap
    const refEffect = Effect.suspend(() => {
      const element = elementRefMap.get(refEffect) as T | undefined;
      if (element) {
        return Effect.succeed(element);
      }
      return Effect.fail(
        new NoSuchElementException({
          message: "Element not mounted or ref not bound to any element",
        }),
      );
    });

    // Mark this Effect as an ElementRef so we can identify it later
    (refEffect as unknown as Record<symbol, boolean>)[elementRefSymbol] = true;

    return refEffect as ElementRef<T>;
  });

/**
 * Synchronously get the element from a ref, returning null if not mounted.
 * Use this for imperative code paths where you need synchronous access.
 *
 * @param ref - The element ref created by Element.ref()
 * @returns The element or null if not mounted
 *
 * @example
 * ```ts
 * const el = Element.getUnsafe(buttonRef);
 * if (el) {
 *   el.style.transform = `translateX(${x}px)`;
 * }
 * ```
 */
export const getUnsafe = <T extends Element>(ref: ElementRef<T>): T | null =>
  getElementFromRef(ref);
