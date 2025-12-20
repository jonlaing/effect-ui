import { Effect, Exit, Option, Scope, Stream } from "effect";
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
  type WhenConfig as CoreWhenConfig,
  type MatchConfig as CoreMatchConfig,
  type EachConfig as CoreEachConfig,
} from "@effex/core";
import type { Element } from "./Element";
import type {
  AnimationOptions,
  ListAnimationOptions,
} from "./Animation/index.js";
import {
  runEnterAnimation,
  runExitAnimation,
  calculateStaggerDelay,
} from "./Animation/index.js";
import { SSRContext } from "./SSRContext";

// Re-export the MatchCase type specialized for HTMLElement
export interface MatchCase<A, E = never, R = never> extends CoreMatchCase<
  A,
  HTMLElement,
  E,
  R
> {}

/**
 * Configuration for the `when` control flow (DOM-specific with animation support).
 */
export interface WhenConfig<E1 = never, R1 = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   *
   * @example
   * ```ts
   * container: () => $.tbody({ class: "data-rows" })
   * ```
   */
  readonly container?: () => Element<never, never>;
  /** Element to render when condition is true */
  readonly onTrue: () => Element<E1, R1>;
  /** Element to render when condition is false */
  readonly onFalse: () => Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
}

/**
 * Configuration for the `match` control flow (DOM-specific with animation support).
 */
export interface MatchConfig<A, E = never, R = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element<never, never>;
  /** Array of pattern-render pairs */
  readonly cases: readonly MatchCase<A, E, R>[];
  /** Optional fallback if no pattern matches */
  readonly fallback?: () => Element<E2, R2>;
  /** Optional animation configuration */
  readonly animate?: AnimationOptions;
}

/**
 * Configuration for the `each` control flow (DOM-specific with animation support).
 */
export interface EachConfig<A, E = never, R = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   *
   * @example
   * ```ts
   * container: () => $.ul({ class: "todo-list" })
   * ```
   */
  readonly container?: () => Element<never, never>;
  /** Function to extract a unique key from each item */
  readonly key: (item: A) => string;
  /** Function to render each item (receives a Readable for the item) */
  readonly render: (item: Readable<A>) => Element<E, R>;
  /** Optional animation configuration */
  readonly animate?: ListAnimationOptions;
}

/**
 * Helper to create the default container (div with display: contents)
 */
const createDefaultContainer = (
  renderer: RendererInterface<Node>,
): Effect.Effect<HTMLElement, never, never> =>
  Effect.gen(function* () {
    const container = yield* renderer.createNode("div");
    yield* renderer.setStyleProperty(container, "display", "contents");
    return container as HTMLElement;
  });

/**
 * Add hydration markers to a container element during SSR.
 */
const addHydrationMarkers = (
  renderer: RendererInterface<Node>,
  container: HTMLElement,
  type: "when" | "match" | "each",
  id: string,
  metadata?: Record<string, string>,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* renderer.setAttribute(container, "data-effex-id", id);
    yield* renderer.setAttribute(container, "data-effex-type", type);
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        yield* renderer.setAttribute(container, `data-effex-${key}`, value);
      }
    }
  });

/**
 * Add hydration key to a list item element during SSR.
 */
const addItemHydrationKey = (
  renderer: RendererInterface<Node>,
  element: HTMLElement,
  key: string,
): Effect.Effect<void> => renderer.setAttribute(element, "data-effex-key", key);

/**
 * Conditionally render one of two elements based on a reactive boolean.
 *
 * @param condition - Reactive boolean value
 * @param config - Configuration object with onTrue, onFalse, optional container and animate
 *
 * @example
 * ```ts
 * const isLoggedIn = yield* Signal.make(false)
 *
 * when(isLoggedIn, {
 *   onTrue: () => $.div("Welcome back!"),
 *   onFalse: () => $.div("Please log in")
 * })
 * ```
 *
 * @example
 * ```ts
 * // With custom container for valid HTML in tables
 * when(hasData, {
 *   container: () => $.tbody({ class: "data-rows" }),
 *   onTrue: () => $.tr($.td("Data row")),
 *   onFalse: () => $.tr($.td("No data"))
 * })
 * ```
 *
 * @example
 * ```ts
 * // With animations
 * when(isVisible, {
 *   onTrue: () => Modal(),
 *   onFalse: () => $.div(),
 *   animate: { enter: "fade-in", exit: "fade-out" }
 * })
 * ```
 */
export const when = <E1 = never, R1 = never, E2 = never, R2 = never>(
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Element<E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const ssrContext = yield* Effect.serviceOption(SSRContext);

    // SSR mode: render initial value with hydration markers, no subscriptions
    if (Option.isSome(ssrContext)) {
      const hydrationId = yield* ssrContext.value.generateId;
      const initialValue = yield* condition.get;

      const container = config.container
        ? yield* config.container()
        : yield* createDefaultContainer(renderer);

      yield* addHydrationMarkers(renderer, container, "when", hydrationId, {
        condition: String(initialValue),
      });

      const element = initialValue
        ? yield* config.onTrue()
        : yield* config.onFalse();

      yield* renderer.appendChild(container, element);
      return container;
    }

    // Client-side: if no animations, use the core implementation
    if (!config.animate) {
      return yield* coreWhen(condition, {
        container: config.container,
        onTrue: config.onTrue,
        onFalse: config.onFalse,
      } as CoreWhenConfig<HTMLElement, E1, R1, E2, R2>);
    }

    // Client-side with animations: use the DOM-specific implementation
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    let currentElement: HTMLElement | null = null;
    let currentValue: boolean | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;
    const animate = config.animate;

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
          ? yield* config
              .onTrue()
              .pipe(Effect.provideService(Scope.Scope, currentElementScope))
          : yield* config
              .onFalse()
              .pipe(Effect.provideService(Scope.Scope, currentElementScope));

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

    return container;
  });

/**
 * Pattern match on a reactive value and render the corresponding element.
 *
 * @param value - Reactive value to match against
 * @param config - Configuration object with cases, optional fallback, container and animate
 *
 * @example
 * ```ts
 * type Status = "loading" | "success" | "error"
 * const status = yield* Signal.make<Status>("loading")
 *
 * match(status, {
 *   cases: [
 *     { pattern: "loading", render: () => $.div("Loading...") },
 *     { pattern: "success", render: () => $.div("Done!") },
 *     { pattern: "error", render: () => $.div("Failed") },
 *   ]
 * })
 * ```
 *
 * @example
 * ```ts
 * // With fallback and animations
 * match(status, {
 *   cases: [
 *     { pattern: "loading", render: () => Spinner() },
 *     { pattern: "success", render: () => SuccessMessage() },
 *   ],
 *   fallback: () => $.div("Unknown status"),
 *   animate: { enter: "fade-in", exit: "fade-out" }
 * })
 * ```
 */
export const match = <A, E = never, R = never, E2 = never, R2 = never>(
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Element<E | E2, R | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const ssrContext = yield* Effect.serviceOption(SSRContext);

    // SSR mode: render initial value with hydration markers, no subscriptions
    if (Option.isSome(ssrContext)) {
      const hydrationId = yield* ssrContext.value.generateId;
      const initialValue = yield* value.get;

      const container = config.container
        ? yield* config.container()
        : yield* createDefaultContainer(renderer);

      yield* addHydrationMarkers(renderer, container, "match", hydrationId, {
        pattern: JSON.stringify(initialValue),
      });

      const matchedCase = config.cases.find((c) => c.pattern === initialValue);
      let element: HTMLElement | undefined;

      if (matchedCase) {
        element = yield* matchedCase.render();
      } else if (config.fallback) {
        element = yield* config.fallback();
      }

      if (element) {
        yield* renderer.appendChild(container, element);
      }
      return container;
    }

    // Client-side: if no animations, use the core implementation
    if (!config.animate) {
      return yield* coreMatch(value, {
        container: config.container,
        cases: config.cases as readonly CoreMatchCase<A, HTMLElement, E, R>[],
        fallback: config.fallback,
      } as CoreMatchConfig<A, HTMLElement, E, R, E2, R2>);
    }

    // Client-side with animations: use the DOM-specific implementation
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    let currentElement: HTMLElement | null = null;
    let currentPattern: A | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;
    const animate = config.animate;

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

    return container;
  });

/**
 * Render a list of items with efficient updates using keys.
 *
 * @param items - Reactive array of items
 * @param config - Configuration object with key, render, optional container and animate
 *
 * @example
 * ```ts
 * interface Todo { id: string; text: string }
 * const todos = yield* Signal.make<Todo[]>([])
 *
 * each(todos, {
 *   container: () => $.ul({ class: "todo-list" }),
 *   key: (todo) => todo.id,
 *   render: (todo) => $.li(todo.map(t => t.text))
 * })
 * ```
 *
 * @example
 * ```ts
 * // With staggered animations
 * each(items, {
 *   container: () => $.ul({ class: "animated-list" }),
 *   key: (item) => item.id,
 *   render: (item) => ListItem(item),
 *   animate: {
 *     enter: "slide-in",
 *     exit: "slide-out",
 *     stagger: 50  // 50ms between items
 *   }
 * })
 * ```
 */
export const each = <A, E = never, R = never>(
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Element<E, R> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const ssrContext = yield* Effect.serviceOption(SSRContext);

    // SSR mode: render initial items with hydration markers, no subscriptions
    if (Option.isSome(ssrContext)) {
      const hydrationId = yield* ssrContext.value.generateId;
      const initialItems = yield* items.get;

      const container = config.container
        ? yield* config.container()
        : yield* createDefaultContainer(renderer);

      yield* addHydrationMarkers(renderer, container, "each", hydrationId);

      // Render each item with a static readable (no updates during SSR)
      for (const item of initialItems) {
        const key = config.key(item);
        const staticReadable: Readable<A> = {
          get: Effect.succeed(item),
          changes: Stream.empty,
          values: Stream.make(item),
          map: <B>(f: (a: A) => B): Readable<B> =>
            mapReadable(staticReadable, f),
        };

        const element = yield* config.render(staticReadable);
        yield* addItemHydrationKey(renderer, element, key);
        yield* renderer.appendChild(container, element);
      }

      return container;
    }

    // Client-side: if no animations, use the core implementation
    if (!config.animate) {
      return yield* coreEach(items, {
        container: config.container,
        key: config.key,
        render: config.render,
      } as CoreEachConfig<A, HTMLElement, E, R>);
    }

    // Client-side with animations: use the DOM-specific implementation
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    const animate = config.animate;

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

        // Run exit animations with stagger (skip on initial render)
        if (animate && removals.length > 0 && !isInitial) {
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

            // Track for enter animation (skip on initial render)
            if (!isInitial) {
              newEntries.push({ element, index: newEntries.length });
            }
          }
        }

        // Run enter animations with stagger on new items (skip on initial render)
        if (animate && newEntries.length > 0 && !isInitial) {
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

    return container;
  });
