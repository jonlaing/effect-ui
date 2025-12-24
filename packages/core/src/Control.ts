import { Effect, Exit, Scope, Stream } from "effect";
import type { Readable } from "./Readable";
import { map as mapReadable } from "./Readable";
import { RendererContext, type Renderer } from "./Renderer";
import type { Element } from "./Element";

/**
 * Sentinel value to represent "not yet rendered" state.
 * This is necessary because null/undefined could be valid pattern values.
 */
const NOT_RENDERED = Symbol("NOT_RENDERED");

/**
 * Configuration for the `when` control flow.
 */
export interface WhenConfig<N, E1 = never, R1 = never, E2 = never, R2 = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   *
   * @example
   * ```ts
   * container: () => $.tbody({ class: "data-rows" })
   * ```
   */
  readonly container?: () => Element<N, never, never>;
  /** Element to render when condition is true */
  readonly onTrue: () => Element<N, E1, R1>;
  /** Element to render when condition is false */
  readonly onFalse: () => Element<N, E2, R2>;
}

/**
 * A case for pattern matching with {@link match}.
 */
export interface MatchCase<A, N, E = never, R = never> {
  readonly pattern: A;
  readonly render: () => Element<N, E, R>;
}

/**
 * Configuration for the `match` control flow.
 */
export interface MatchConfig<
  A,
  N,
  E = never,
  R = never,
  E2 = never,
  R2 = never,
> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   */
  readonly container?: () => Element<N, never, never>;
  /** Array of pattern-render pairs */
  readonly cases: readonly MatchCase<A, N, E, R>[];
  /** Optional fallback if no pattern matches */
  readonly fallback?: () => Element<N, E2, R2>;
}

/**
 * Configuration for the `each` control flow.
 */
export interface EachConfig<A, N, E = never, R = never> {
  /**
   * Optional custom container element. If not provided, defaults to a div
   * with `display: contents`.
   *
   * @example
   * ```ts
   * container: () => $.ul({ class: "todo-list" })
   * ```
   */
  readonly container?: () => Element<N, never, never>;
  /** Function to extract a unique key from each item */
  readonly key: (item: A) => string;
  /** Function to render each item (receives a Readable for the item) */
  readonly render: (item: Readable<A>) => Element<N, E, R>;
}

/**
 * Helper to create the default container (div with display: contents)
 */
const createDefaultContainer = <N>(
  renderer: Renderer<N>,
): Effect.Effect<N, never, never> =>
  Effect.gen(function* () {
    const container = yield* renderer.createNode("div");
    yield* renderer.setStyleProperty(container, "display", "contents");
    return container;
  });

/**
 * Conditionally render one of two elements based on a reactive boolean.
 *
 * @param condition - Reactive boolean value
 * @param config - Configuration object with onTrue, onFalse, and optional container
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
 */
export const when = <N, E1 = never, R1 = never, E2 = never, R2 = never>(
  condition: Readable<boolean>,
  config: WhenConfig<N, E1, R1, E2, R2>,
): Element<N, E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    let currentElement: N | null = null;
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

        // Create a new scope for this element that stays open
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
 * @param config - Configuration object with cases, optional fallback, and optional container
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
 * // With fallback
 * match(status, {
 *   cases: [
 *     { pattern: "loading", render: () => Spinner() },
 *   ],
 *   fallback: () => $.div("Unknown status")
 * })
 * ```
 */
export const match = <A, N, E = never, R = never, E2 = never, R2 = never>(
  value: Readable<A>,
  config: MatchConfig<A, N, E, R, E2, R2>,
): Element<N, E | E2, R | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    let currentElement: N | null = null;
    let currentPattern: A | typeof NOT_RENDERED = NOT_RENDERED;
    let currentElementScope: Scope.CloseableScope | null = null;

    const render = (
      val: A,
    ): Effect.Effect<void, E | E2, Scope.Scope | RendererContext | R | R2> =>
      Effect.gen(function* () {
        if (currentPattern !== NOT_RENDERED && val === currentPattern) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentPattern = val;

        // Create a new scope for this element that stays open
        currentElementScope = yield* Scope.make();

        const matchedCase = config.cases.find((c) => c.pattern === val);

        let newElement: N;
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
 * @param config - Configuration object with key, render, and optional container
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
 */
export const each = <A, N, E = never, R = never>(
  items: Readable<readonly A[]>,
  config: EachConfig<A, N, E, R>,
): Element<N, E, R> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    const itemMap = new Map<
      string,
      {
        element: N;
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
          element: N;
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
