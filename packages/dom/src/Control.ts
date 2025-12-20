import { Effect, Exit, Scope, Stream } from "effect";
import type { Readable } from "@effex/core";
import {
  mapReadable,
  RendererContext,
  type RendererInterface,
} from "@effex/core";
import {
  when as coreWhen,
  match as coreMatch,
  each as coreEach,
  type MatchCase as CoreMatchCase,
} from "@effex/core";
import type { Element } from "./Element";
import type {
  ControlAnimationOptions,
  ListAnimationOptions,
  ListControlAnimationOptions,
} from "./Animation/index.js";
import {
  runEnterAnimation,
  runExitAnimation,
  calculateStaggerDelay,
} from "./Animation/index.js";

// Re-export the MatchCase type specialized for HTMLElement
export interface MatchCase<A, E = never, R = never> extends CoreMatchCase<
  A,
  HTMLElement,
  E,
  R
> {}

/**
 * Conditionally render one of two elements based on a reactive boolean.
 * @param condition - Reactive boolean value
 * @param onTrue - Element to render when true
 * @param onFalse - Element to render when false
 * @param options - Optional animation configuration
 *
 * @example
 * ```ts
 * const isLoggedIn = yield* Signal.make(false)
 * when(
 *   isLoggedIn,
 *   () => div(["Welcome back!"]),
 *   () => div(["Please log in"])
 * )
 * ```
 *
 * @example
 * ```ts
 * // With animations
 * when(
 *   isVisible,
 *   () => Modal(),
 *   () => div(),
 *   { animate: { enter: "fade-in", exit: "fade-out" } }
 * )
 * ```
 */
export const when = <E1 = never, R1 = never, E2 = never, R2 = never>(
  condition: Readable<boolean>,
  onTrue: () => Element<E1, R1>,
  onFalse: () => Element<E2, R2>,
  options?: ControlAnimationOptions,
): Element<E1 | E2, R1 | R2> => {
  // If no animations, use the core implementation
  if (!options?.animate) {
    return coreWhen(condition, onTrue, onFalse, {
      as: options?.as,
    }) as Element<E1 | E2, R1 | R2>;
  }

  // With animations, use the DOM-specific implementation
  return Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;
    const containerTag = options?.as ?? "div";
    const container = yield* renderer.createNode(containerTag);
    if (!options?.as) {
      yield* renderer.setStyleProperty(container, "display", "contents");
    }

    let currentElement: HTMLElement | null = null;
    let currentValue: boolean | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;
    const animate = options.animate;

    const render = (
      value: boolean,
      isInitial: boolean = false,
    ): Effect.Effect<void, E1 | E2, Scope.Scope | RendererContext | R1 | R2> =>
      Effect.gen(function* () {
        if (value === currentValue) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentValue = value;

        // Create a new scope for this element that stays open
        currentElementScope = yield* Scope.make();

        const newElement = value
          ? yield* onTrue().pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            )
          : yield* onFalse().pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            );

        // Run exit animation on previous element (skip on initial render)
        if (animate && previousElement && !isInitial) {
          yield* runExitAnimation(previousElement, animate);
        }

        // Close the previous scope after exit animation
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

        // Run enter animation on new element (skip on initial render)
        if (animate && !isInitial) {
          yield* runEnterAnimation(newElement, animate);
        }
      });

    // Render initial value synchronously (no animations)
    const initialValue = yield* condition.get;
    yield* render(initialValue, true);

    // Then subscribe to future changes (with animations)
    yield* condition.changes.pipe(
      Stream.runForEach((value) => render(value, false)),
      Effect.forkIn(scope),
    );

    // Cleanup when this component is unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        if (currentElementScope) {
          yield* Scope.close(currentElementScope, Exit.void);
        }
      }),
    );

    return container as HTMLElement;
  });
};

/**
 * Pattern match on a reactive value and render the corresponding element.
 * For async data loading, use {@link DeferredSuspense} or {@link DeferredSuspenseWithBoundary}
 * inside the render function.
 *
 * @param value - Reactive value to match against
 * @param cases - Array of pattern-render pairs
 * @param fallback - Optional fallback if no pattern matches
 * @param options - Optional animation configuration
 *
 * @example
 * ```ts
 * // Simple matching
 * type Status = "loading" | "success" | "error"
 * const status = yield* Signal.make<Status>("loading")
 *
 * match(status, [
 *   { pattern: "loading", render: () => div("Loading...") },
 *   { pattern: "success", render: () => div("Done!") },
 *   { pattern: "error", render: () => div("Failed") },
 * ])
 * ```
 *
 * @example
 * ```ts
 * // With animations
 * match(status, [
 *   { pattern: "loading", render: () => Spinner() },
 *   { pattern: "success", render: () => SuccessMessage() },
 *   { pattern: "error", render: () => ErrorMessage() },
 * ], undefined, { animate: { enter: "fade-in", exit: "fade-out" } })
 * ```
 */
export const match = <A, E = never, R = never, E2 = never, R2 = never>(
  value: Readable<A>,
  cases: readonly MatchCase<A, E, R>[],
  fallback?: () => Element<E2, R2>,
  options?: ControlAnimationOptions,
): Element<E | E2, R | R2> => {
  // If no animations, use the core implementation
  if (!options?.animate) {
    return coreMatch(
      value,
      cases as readonly CoreMatchCase<A, HTMLElement, E, R>[],
      fallback,
      { as: options?.as },
    ) as Element<E | E2, R | R2>;
  }

  // With animations, use the DOM-specific implementation
  return Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;
    const containerTag = options?.as ?? "div";
    const container = yield* renderer.createNode(containerTag);
    if (!options?.as) {
      yield* renderer.setStyleProperty(container, "display", "contents");
    }

    let currentElement: HTMLElement | null = null;
    let currentPattern: A | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;
    const animate = options.animate;

    const render = (
      val: A,
      isInitial: boolean = false,
    ): Effect.Effect<void, E | E2, Scope.Scope | RendererContext | R | R2> =>
      Effect.gen(function* () {
        if (val === currentPattern) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentPattern = val;

        // Create a new scope for this element that stays open
        currentElementScope = yield* Scope.make();

        const matchedCase = cases.find((c) => c.pattern === val);

        let newElement: HTMLElement;
        if (matchedCase) {
          newElement = yield* matchedCase
            .render()
            .pipe(Effect.provideService(Scope.Scope, currentElementScope));
        } else if (fallback) {
          newElement = yield* fallback().pipe(
            Effect.provideService(Scope.Scope, currentElementScope),
          );
        } else {
          // No match and no fallback - close the scope we just created
          yield* Scope.close(currentElementScope, Exit.void);
          currentElementScope = previousScope;
          return;
        }

        // Run exit animation on previous element (skip on initial render)
        if (animate && previousElement && !isInitial) {
          yield* runExitAnimation(previousElement, animate);
        }

        // Close the previous scope after exit animation
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

        // Run enter animation on new element (skip on initial render)
        if (animate && !isInitial) {
          yield* runEnterAnimation(newElement, animate);
        }
      });

    // Render initial value (no animations)
    const initialValue = yield* value.get;
    yield* render(initialValue, true);

    // Then subscribe to future changes (with animations)
    yield* value.changes.pipe(
      Stream.runForEach((val) => render(val, false)),
      Effect.forkIn(scope),
    );

    // Cleanup when this component is unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        if (currentElementScope) {
          yield* Scope.close(currentElementScope, Exit.void);
        }
      }),
    );

    return container as HTMLElement;
  });
};

/**
 * Render a list of items with efficient updates using keys.
 * @param items - Reactive array of items
 * @param keyFn - Function to extract a unique key from each item
 * @param render - Function to render each item (receives a Readable for the item)
 * @param options - Optional configuration including container tag and animations
 *
 * @example
 * ```ts
 * interface Todo { id: string; text: string }
 * const todos = yield* Signal.make<Todo[]>([])
 *
 * // Use `as: "ul"` to render a proper HTML list
 * each(
 *   todos,
 *   (todo) => todo.id,
 *   (todo) => $.li(todo.map(t => t.text)),
 *   { as: "ul" }
 * )
 * ```
 *
 * @example
 * ```ts
 * // With staggered animations
 * each(
 *   items,
 *   (item) => item.id,
 *   (item) => ListItem(item),
 *   {
 *     as: "ul",
 *     animate: {
 *       enter: "slide-in",
 *       exit: "slide-out",
 *       stagger: 50  // 50ms between items
 *     }
 *   }
 * )
 * ```
 */
export const each = <A, E = never, R = never>(
  items: Readable<readonly A[]>,
  keyFn: (item: A) => string,
  render: (item: Readable<A>) => Element<E, R>,
  options?: ListControlAnimationOptions,
): Element<E, R> => {
  // If no animations, use the core implementation
  if (!options?.animate) {
    return coreEach(items, keyFn, render, { as: options?.as }) as Element<E, R>;
  }

  // With animations, use the DOM-specific implementation
  return Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;
    const containerTag = options?.as ?? "div";
    const container = yield* renderer.createNode(containerTag);
    if (!options?.as) {
      yield* renderer.setStyleProperty(container, "display", "contents");
    }
    const animate = options.animate;

    const itemMap = new Map<
      string,
      {
        element: HTMLElement;
        scope: Scope.CloseableScope;
        readable: {
          get: Effect.Effect<A>;
          changes: Stream.Stream<A>;
          values: Stream.Stream<A>;
          map: <B>(f: (a: A) => B) => Readable<B>;
          _update: (value: A) => void;
        };
      }
    >();

    const updateList = (
      newItems: readonly A[],
      isInitial: boolean = false,
    ): Effect.Effect<void, E, Scope.Scope | RendererContext | R> =>
      Effect.gen(function* () {
        const newKeys = new Set(newItems.map(keyFn));

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

        // Run exit animations with stagger (skip on initial render)
        if (animate && removals.length > 0 && !isInitial) {
          const stagger = (animate as ListAnimationOptions).stagger;
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

        // Remove elements from DOM and close their scopes after animations complete
        for (const { key, element, scope: itemScope } of removals) {
          yield* renderer.removeChild(container, element);
          yield* Scope.close(itemScope, Exit.void);
          itemMap.delete(key);
        }

        // Track new items for enter animation
        const newEntries: { element: HTMLElement; index: number }[] = [];

        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i];
          const key = keyFn(item);
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
            // Create a scope for this item that stays open until the item is removed
            const itemScope = yield* Scope.make();

            let currentValue = item;
            const subscribers = new Set<(value: A) => void>();

            // Cache the changes stream - only create once
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

            const itemReadable: {
              get: Effect.Effect<A>;
              changes: Stream.Stream<A>;
              values: Stream.Stream<A>;
              map: <B>(f: (a: A) => B) => Readable<B>;
              _update: (value: A) => void;
            } = {
              get: Effect.sync(() => currentValue),
              get changes(): Stream.Stream<A> {
                return getChanges();
              },
              get values(): Stream.Stream<A> {
                return Stream.concat(Stream.make(currentValue), this.changes);
              },
              map: function <B>(f: (a: A) => B): Readable<B> {
                return mapReadable(this as Readable<A>, f);
              },
              _update: (value: A) => {
                currentValue = value;
                for (const handler of subscribers) {
                  handler(value);
                }
              },
            };

            const element = yield* render(itemReadable).pipe(
              Effect.provideService(Scope.Scope, itemScope),
            );

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

            // Track for enter animation (skip on initial render)
            if (!isInitial) {
              newEntries.push({ element, index: newEntries.length });
            }
          }
        }

        // Run enter animations with stagger on new items (skip on initial render)
        if (animate && newEntries.length > 0 && !isInitial) {
          const stagger = (animate as ListAnimationOptions).stagger;
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
      });

    // Render initial items synchronously (no animations)
    const initialItems = yield* items.get;
    yield* updateList(initialItems, true);

    // Then subscribe to future changes (with animations)
    yield* items.changes.pipe(
      Stream.runForEach((newItems) => updateList(newItems, false)),
      Effect.forkIn(scope),
    );

    // Cleanup all item scopes when this component is unmounted
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        for (const [, entry] of itemMap) {
          yield* Scope.close(entry.scope, Exit.void);
        }
      }),
    );

    return container as HTMLElement;
  });
};
