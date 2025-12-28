/**
 * Plain client-side control flow implementations.
 * No SSR, no hydration, no animations - just reactive DOM updates.
 */

import { Effect, Exit, Scope, Stream } from "effect";
import type { Readable } from "@effex/core";
import {
  mapReadable,
  RendererContext,
  type RendererInterface,
} from "@effex/core";
import type { Element } from "../Element";
import type { WhenConfig, MatchConfig, EachConfig } from "./types";
import { createDefaultContainer } from "./helpers";

/**
 * Sentinel value to represent "not yet rendered" state.
 */
const NOT_RENDERED = Symbol("NOT_RENDERED");

/**
 * Plain client implementation of `when`.
 * Reactive DOM updates without animations.
 */
export const clientWhen = <E1, R1, E2, R2>(
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Element<E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    let currentElement: HTMLElement | null = null;
    let currentValue: boolean | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;

    const render = (
      value: boolean,
    ): Effect.Effect<void, E1 | E2, Scope.Scope | RendererContext | R1 | R2> =>
      Effect.gen(function* () {
        if (value === currentValue) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentValue = value;

        currentElementScope = yield* Scope.make();

        const newElement = value
          ? yield* config
              .onTrue()
              .pipe(Effect.provideService(Scope.Scope, currentElementScope))
          : yield* config
              .onFalse()
              .pipe(Effect.provideService(Scope.Scope, currentElementScope));

        // Close the previous scope
        if (previousScope) {
          yield* Scope.close(previousScope, Exit.void);
        }

        // DOM mutation
        if (previousElement) {
          yield* renderer.replaceChild(container, newElement, previousElement);
        } else {
          yield* renderer.appendChild(container, newElement);
        }
        currentElement = newElement;
      });

    // Render initial value
    const initialValue = yield* condition.get;
    yield* render(initialValue);

    // Subscribe to future changes
    yield* condition.changes.pipe(
      Stream.runForEach((value) => render(value)),
      Effect.forkIn(scope),
    );

    // Cleanup when unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        if (currentElementScope) {
          yield* Scope.close(currentElementScope, Exit.void);
        }
      }),
    );

    return container;
  });

/**
 * Plain client implementation of `match`.
 * Reactive DOM updates without animations.
 */
export const clientMatch = <A, E, R, E2, R2>(
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Element<E | E2, R | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    let currentElement: HTMLElement | null = null;
    let currentPattern: A | typeof NOT_RENDERED = NOT_RENDERED;
    let currentElementScope: Scope.CloseableScope | null = null;

    const render = (val: A) =>
      Effect.gen(function* () {
        if (currentPattern !== NOT_RENDERED && val === currentPattern) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentPattern = val;

        currentElementScope = yield* Scope.make();

        const matchedCase = config.cases.find((c) => c.pattern === val);

        let newElement: HTMLElement;
        if (matchedCase) {
          newElement = yield* matchedCase
            .render()
            .pipe(Effect.provideService(Scope.Scope, currentElementScope));
        } else if (config.fallback) {
          newElement = yield* config
            .fallback()
            .pipe(Effect.provideService(Scope.Scope, currentElementScope));
        } else {
          // No match and no fallback - close the scope we just created
          yield* Scope.close(currentElementScope, Exit.void);
          currentElementScope = previousScope;
          return;
        }

        // Close the previous scope
        if (previousScope) {
          yield* Scope.close(previousScope, Exit.void);
        }

        // DOM mutation
        if (previousElement) {
          yield* renderer.replaceChild(container, newElement, previousElement);
        } else {
          yield* renderer.appendChild(container, newElement);
        }
        currentElement = newElement;
      });

    // Render initial value
    const initialValue = yield* value.get;
    yield* render(initialValue);

    // Subscribe to future changes
    yield* value.changes.pipe(
      Stream.runForEach((val) => render(val)),
      Effect.forkIn(scope),
    );

    // Cleanup when unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        if (currentElementScope) {
          yield* Scope.close(currentElementScope, Exit.void);
        }
      }),
    );

    return container;
  });

/**
 * Create an updatable readable for list items.
 */
const createItemReadable = <A>(initialValue: A) => {
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
 * Plain client implementation of `each`.
 * Reactive DOM updates without animations.
 */
export const clientEach = <A, E, R>(
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Element<E, R> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    const itemMap = new Map<
      string,
      {
        element: HTMLElement;
        scope: Scope.CloseableScope;
        readable: Readable<A> & { _update: (value: A) => void };
      }
    >();

    const updateList = (
      newItems: readonly A[],
      isInitial: boolean = false,
    ): Effect.Effect<void, E, Scope.Scope | RendererContext | R> =>
      Effect.gen(function* () {
        const newKeys = new Set(newItems.map(config.key));

        // Collect items to remove
        const removals: {
          key: string;
          element: HTMLElement;
          scope: Scope.CloseableScope;
        }[] = [];
        for (const [key, entry] of itemMap) {
          if (!newKeys.has(key)) {
            removals.push({ key, element: entry.element, scope: entry.scope });
          }
        }

        // Remove elements from DOM and close their scopes
        for (const { key, element, scope: itemScope } of removals) {
          yield* renderer.removeChild(container, element);
          yield* Scope.close(itemScope, Exit.void);
          itemMap.delete(key);
        }

        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i];
          const key = config.key(item);
          const existing = itemMap.get(key);

          if (existing) {
            existing.readable._update(item);

            // Only reposition during updates, not initial render
            if (!isInitial) {
              const currentChildren = yield* renderer.getChildren(container);
              const currentPosition = currentChildren.indexOf(existing.element);
              const expectedPosition = i;

              if (currentPosition !== expectedPosition) {
                const refChild = currentChildren[expectedPosition] ?? null;
                yield* renderer.insertBefore(
                  container,
                  existing.element,
                  refChild,
                );
              }
            }
          } else {
            const itemScope = yield* Scope.make();
            const itemReadable = createItemReadable(item);

            const element = yield* config
              .render(itemReadable)
              .pipe(Effect.provideService(Scope.Scope, itemScope));

            // Insert at correct position
            const currentChildren = yield* renderer.getChildren(container);
            if (i >= currentChildren.length) {
              yield* renderer.appendChild(container, element);
            } else {
              yield* renderer.insertBefore(
                container,
                element,
                currentChildren[i],
              );
            }

            itemMap.set(key, {
              element,
              scope: itemScope,
              readable: itemReadable,
            });
          }
        }
      });

    // Render initial items
    const initialItems = yield* items.get;
    yield* updateList(initialItems, true);

    // Subscribe to future changes
    yield* items.changes.pipe(
      Stream.runForEach((newItems) => updateList(newItems, false)),
      Effect.forkIn(scope),
    );

    // Cleanup all item scopes when unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        for (const [, entry] of itemMap) {
          yield* Scope.close(entry.scope, Exit.void);
        }
      }),
    );

    return container;
  });
