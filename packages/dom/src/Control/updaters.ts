/**
 * Shared update logic for control flow components.
 * Used by both client and hydration implementations.
 */

import { Effect, Exit, Scope, Stream } from "effect";

import {
  mapReadable,
  RendererContext,
  type Readable,
  type RendererInterface,
} from "@effex/core";

import {
  calculateStaggerDelay,
  runEnterAnimation,
  runExitAnimation,
} from "../Animation/index.js";
import { DOMRenderer } from "../DOMRenderer";
import type { EachConfig, MatchConfig, WhenConfig } from "./types";

/**
 * Sentinel value to represent "not yet rendered" state.
 */
const NOT_RENDERED = Symbol("NOT_RENDERED");

/**
 * Create an updatable readable for list items.
 */
export const createItemReadable = <A>(initialValue: A) => {
  let currentValue = initialValue;
  const subscribers = new Set<(value: A) => void>();

  let cachedChanges: Stream.Stream<A> | null = null;
  const getChanges = (): Stream.Stream<A> => {
    if (!cachedChanges) {
      cachedChanges = Stream.async<A>((emit) => {
        const handler = (value: A) => emit.single(value);
        subscribers.add(handler);
        return Effect.sync(() => {
          subscribers.delete(handler);
        });
      });
    }
    return cachedChanges;
  };

  const readable: Readable<A> & { _update: (value: A) => void } = {
    get: Effect.sync(() => currentValue),
    get changes(): Stream.Stream<A> {
      return getChanges();
    },
    get values(): Stream.Stream<A> {
      return Stream.concat(Stream.make(currentValue), this.changes);
    },
    map<B>(f: (a: A) => B): Readable<B> {
      return mapReadable(this as Readable<A>, f);
    },
    _update: (value: A) => {
      currentValue = value;
      for (const handler of subscribers) {
        handler(value);
      }
    },
  };

  return readable;
};

/**
 * Create an updatable readable for list item indices.
 */
export const createIndexReadable = (initialIndex: number) => {
  let currentIndex = initialIndex;
  const subscribers = new Set<(value: number) => void>();

  let cachedChanges: Stream.Stream<number> | null = null;
  const getChanges = (): Stream.Stream<number> => {
    if (!cachedChanges) {
      cachedChanges = Stream.async<number>((emit) => {
        const handler = (value: number) => emit.single(value);
        subscribers.add(handler);
        return Effect.sync(() => {
          subscribers.delete(handler);
        });
      });
    }
    return cachedChanges;
  };

  const readable: Readable<number> & { _update: (value: number) => void } = {
    get: Effect.sync(() => currentIndex),
    get changes(): Stream.Stream<number> {
      return getChanges();
    },
    get values(): Stream.Stream<number> {
      return Stream.concat(Stream.make(currentIndex), this.changes);
    },
    map<B>(f: (a: number) => B): Readable<B> {
      return mapReadable(this as Readable<number>, f);
    },
    _update: (value: number) => {
      if (value !== currentIndex) {
        currentIndex = value;
        for (const handler of subscribers) {
          handler(value);
        }
      }
    },
  };

  return readable;
};

/**
 * Provide DOMRenderer for creating new content.
 */
const withDOMRenderer = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, Exclude<R, RendererContext>> =>
  Effect.provideService(
    effect,
    RendererContext,
    DOMRenderer as RendererInterface<unknown>,
  );

/**
 * Create a when updater that handles state and animations.
 */
export const createWhenUpdater = <E1, R1, E2, R2>(
  container: HTMLElement | SVGElement,
  config: WhenConfig<E1, R1, E2, R2>,
) => {
  let currentElement: HTMLElement | SVGElement | null = null;
  let currentValue: boolean | null = null;
  let currentElementScope: Scope.CloseableScope | null = null;
  const animate = config.animate;

  return {
    /** Set initial state (for hydration) */
    initialize: (
      element: HTMLElement | SVGElement,
      value: boolean,
      scope: Scope.CloseableScope,
    ) => {
      currentElement = element;
      currentValue = value;
      currentElementScope = scope;
    },

    /** Handle value change */
    update: (
      newValue: boolean,
    ): Effect.Effect<void, E1 | E2, Scope.Scope | R1 | R2> =>
      Effect.gen(function* () {
        if (newValue === currentValue) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentValue = newValue;

        currentElementScope = yield* Scope.make();

        const newElement: HTMLElement | SVGElement = newValue
          ? yield* withDOMRenderer(config.onTrue()).pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            )
          : yield* withDOMRenderer(config.onFalse()).pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            );

        // Run exit animation only when CLOSING (true → false)
        // This animates the visible content out before removal
        if (previousElement && animate && !newValue) {
          yield* runExitAnimation(previousElement, animate);
        }

        // Close the previous scope after exit animation
        if (previousScope) {
          yield* Scope.close(previousScope, Exit.void);
        }

        // DOM mutation
        if (previousElement) {
          container.replaceChild(newElement, previousElement);
        } else {
          container.appendChild(newElement);
        }
        currentElement = newElement;

        // Run enter animation only when OPENING (false → true)
        // This animates the visible content in after insertion
        if (animate && newValue) {
          yield* runEnterAnimation(newElement, animate);
        }
      }),

    /** Cleanup resources */
    cleanup: () =>
      Scope.close(currentElementScope!, Exit.void).pipe(
        Effect.when(() => currentElementScope !== null),
      ),
  };
};

/**
 * Create a match updater that handles state and animations.
 */
export const createMatchUpdater = <A, E, R, E2, R2>(
  container: HTMLElement | SVGElement,
  config: MatchConfig<A, E, R, E2, R2>,
) => {
  let currentElement: HTMLElement | SVGElement | null = null;
  let currentPattern: A | typeof NOT_RENDERED = NOT_RENDERED;
  let currentElementScope: Scope.CloseableScope | null = null;
  const animate = config.animate;

  return {
    /** Set initial state (for hydration) */
    initialize: (
      element: HTMLElement | SVGElement | null,
      pattern: A,
      scope: Scope.CloseableScope | null,
    ) => {
      currentElement = element;
      currentPattern = pattern;
      currentElementScope = scope;
    },

    /** Handle value change */
    update: (newValue: A): Effect.Effect<void, E | E2, Scope.Scope | R | R2> =>
      Effect.gen(function* () {
        if (currentPattern !== NOT_RENDERED && newValue === currentPattern)
          return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentPattern = newValue;

        // Use extractPattern if provided
        const patternValue = config.extractPattern
          ? config.extractPattern(newValue)
          : newValue;
        const matchedCase = config.cases.find(
          (c) => c.pattern === patternValue,
        );

        if (!matchedCase && !config.fallback) {
          return;
        }

        currentElementScope = yield* Scope.make();

        const newElement = matchedCase
          ? yield* withDOMRenderer(matchedCase.render()).pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            )
          : yield* withDOMRenderer(config.fallback!()).pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            );

        // Run exit animation on previous element
        if (previousElement && animate) {
          yield* runExitAnimation(previousElement, animate);
        }

        // Close the previous scope after exit animation
        if (previousScope) {
          yield* Scope.close(previousScope, Exit.void);
        }

        // DOM mutation
        if (previousElement) {
          container.replaceChild(newElement, previousElement);
        } else {
          container.appendChild(newElement);
        }
        currentElement = newElement;

        // Run enter animation on new element
        if (animate) {
          yield* runEnterAnimation(newElement, animate);
        }
      }),

    /** Cleanup resources */
    cleanup: () =>
      Scope.close(currentElementScope!, Exit.void).pipe(
        Effect.when(() => currentElementScope !== null),
      ),
  };
};

/**
 * Create an each updater that handles state and animations.
 */
export const createEachUpdater = <A, E, R>(
  container: HTMLElement | SVGElement,
  config: EachConfig<A, E, R>,
) => {
  const itemMap = new Map<
    string,
    {
      element: HTMLElement | SVGElement;
      scope: Scope.CloseableScope;
      readable: Readable<A> & { _update: (value: A) => void };
      indexReadable: Readable<number> & { _update: (value: number) => void };
    }
  >();
  const animate = config.animate;

  return {
    /** Add a hydrated item to tracking */
    addHydratedItem: (
      key: string,
      element: HTMLElement | SVGElement,
      scope: Scope.CloseableScope,
      readable: Readable<A> & { _update: (value: A) => void },
      indexReadable: Readable<number> & { _update: (value: number) => void },
    ) => {
      itemMap.set(key, { element, scope, readable, indexReadable });
    },

    /** Handle list update */
    update: (newItems: readonly A[]): Effect.Effect<void, E, Scope.Scope | R> =>
      Effect.gen(function* () {
        const newKeys = new Set(newItems.map(config.key));

        // Collect items to remove
        const removals: {
          key: string;
          element: HTMLElement | SVGElement;
          scope: Scope.CloseableScope;
        }[] = [];
        for (const [key, entry] of itemMap) {
          if (!newKeys.has(key)) {
            removals.push({ key, element: entry.element, scope: entry.scope });
          }
        }

        // Run exit animations with stagger
        if (removals.length > 0 && animate) {
          const stagger = animate.stagger;
          yield* Effect.all(
            removals.map(({ element }, index) =>
              Effect.gen(function* () {
                const delayMs = calculateStaggerDelay(
                  stagger,
                  index,
                  removals.length,
                );
                if (delayMs > 0) {
                  yield* Effect.sleep(delayMs);
                }
                yield* runExitAnimation(element, animate);
              }),
            ),
            { concurrency: "unbounded" },
          );
        }

        // Remove elements from DOM and close their scopes
        for (const { key, element, scope } of removals) {
          container.removeChild(element);
          yield* Scope.close(scope, Exit.void);
          itemMap.delete(key);
        }

        // Track new items for enter animation
        const newEntries: {
          element: HTMLElement | SVGElement;
          index: number;
        }[] = [];

        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i];
          const key = config.key(item);
          const existing = itemMap.get(key);

          if (!existing) {
            const itemScope = yield* Scope.make();
            const itemReadable = createItemReadable(item);
            const indexReadable = createIndexReadable(i);

            const element = yield* withDOMRenderer(
              config.render(itemReadable, indexReadable),
            ).pipe(Effect.provideService(Scope.Scope, itemScope));

            const currentChildren = Array.from(container.children);
            const refChild = currentChildren[i] ?? null;
            container.insertBefore(element, refChild);

            itemMap.set(key, {
              element,
              scope: itemScope,
              readable: itemReadable,
              indexReadable,
            });

            if (animate) {
              newEntries.push({ element, index: newEntries.length });
            }
            continue;
          }

          existing.readable._update(item);
          existing.indexReadable._update(i);

          const currentChildren = Array.from(container.children);
          const currentPosition = currentChildren.indexOf(existing.element);
          if (currentPosition === i) continue;

          const refChild = currentChildren[i] ?? null;
          container.insertBefore(existing.element, refChild);
        }

        // Run enter animations with stagger on new items
        if (newEntries.length > 0 && animate) {
          const stagger = animate.stagger;
          yield* Effect.all(
            newEntries.map(({ element, index }) =>
              Effect.gen(function* () {
                const delayMs = calculateStaggerDelay(
                  stagger,
                  index,
                  newEntries.length,
                );
                if (delayMs > 0) {
                  yield* Effect.sleep(delayMs);
                }
                yield* runEnterAnimation(element, animate);
              }),
            ),
            { concurrency: "unbounded" },
          );
        }
      }),

    /** Cleanup all item scopes */
    cleanup: () =>
      Effect.gen(function* () {
        for (const [, entry] of itemMap) {
          yield* Scope.close(entry.scope, Exit.void);
        }
      }),
  };
};
