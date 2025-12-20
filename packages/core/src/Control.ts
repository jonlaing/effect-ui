import { Effect, Exit, Scope, Stream } from "effect";
import type { Readable } from "./Readable";
import { map as mapReadable } from "./Readable";
import { RendererContext, type Renderer } from "./Renderer";
import type { Element } from "./Element";

/**
 * Options for the `when` control flow.
 */
export interface WhenOptions {
  /** The HTML tag to use for the container element (default: "div") */
  readonly as?: string;
}

/**
 * Options for the `match` control flow.
 */
export interface MatchOptions {
  /** The HTML tag to use for the container element (default: "div") */
  readonly as?: string;
}

/**
 * Options for the `each` control flow.
 */
export interface EachOptions {
  /** The HTML tag to use for the container element (default: "div") */
  readonly as?: string;
}

/**
 * Conditionally render one of two elements based on a reactive boolean.
 * @param condition - Reactive boolean value
 * @param onTrue - Element to render when true
 * @param onFalse - Element to render when false
 * @param options - Optional configuration
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
 * // With custom container tag for valid HTML in tables
 * when(
 *   hasData,
 *   () => tr(td("Data row")),
 *   () => tr(td("No data")),
 *   { as: "tbody" }
 * )
 * ```
 */
export const when = <N, E1 = never, R1 = never, E2 = never, R2 = never>(
  condition: Readable<boolean>,
  onTrue: () => Element<N, E1, R1>,
  onFalse: () => Element<N, E2, R2>,
  options?: WhenOptions,
): Element<N, E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const containerTag = options?.as ?? "div";
    const container = yield* renderer.createNode(containerTag);
    if (!options?.as) {
      yield* renderer.setStyleProperty(container, "display", "contents");
    }

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
          ? yield* onTrue().pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            )
          : yield* onFalse().pipe(
              Effect.provideService(Scope.Scope, currentElementScope),
            );

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
 * A case for pattern matching with {@link match}.
 */
export interface MatchCase<A, N, E = never, R = never> {
  readonly pattern: A;
  readonly render: () => Element<N, E, R>;
}

/**
 * Pattern match on a reactive value and render the corresponding element.
 *
 * @param value - Reactive value to match against
 * @param cases - Array of pattern-render pairs
 * @param fallback - Optional fallback if no pattern matches
 * @param options - Optional configuration
 *
 * @example
 * ```ts
 * type Status = "loading" | "success" | "error"
 * const status = yield* Signal.make<Status>("loading")
 *
 * match(status, [
 *   { pattern: "loading", render: () => div("Loading...") },
 *   { pattern: "success", render: () => div("Done!") },
 *   { pattern: "error", render: () => div("Failed") },
 * ])
 * ```
 */
export const match = <A, N, E = never, R = never, E2 = never, R2 = never>(
  value: Readable<A>,
  cases: readonly MatchCase<A, N, E, R>[],
  fallback?: () => Element<N, E2, R2>,
  options?: MatchOptions,
): Element<N, E | E2, R | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const containerTag = options?.as ?? "div";
    const container = yield* renderer.createNode(containerTag);
    if (!options?.as) {
      yield* renderer.setStyleProperty(container, "display", "contents");
    }

    let currentElement: N | null = null;
    let currentPattern: A | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;

    const render = (
      val: A,
    ): Effect.Effect<void, E | E2, Scope.Scope | RendererContext | R | R2> =>
      Effect.gen(function* () {
        if (val === currentPattern) return;

        const previousElement = currentElement;
        const previousScope = currentElementScope;
        currentPattern = val;

        // Create a new scope for this element that stays open
        currentElementScope = yield* Scope.make();

        const matchedCase = cases.find((c) => c.pattern === val);

        let newElement: N;
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
 * @param items - Reactive array of items
 * @param keyFn - Function to extract a unique key from each item
 * @param render - Function to render each item (receives a Readable for the item)
 * @param options - Optional configuration including the container tag
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
 *   (todo) => li([todo.map(t => t.text)]),
 *   { as: "ul" }
 * )
 * ```
 */
export const each = <A, N, E = never, R = never>(
  items: Readable<readonly A[]>,
  keyFn: (item: A) => string,
  render: (item: Readable<A>) => Element<N, E, R>,
  options?: EachOptions,
): Element<N, E, R> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const containerTag = options?.as ?? "div";
    const container = yield* renderer.createNode(containerTag);
    if (!options?.as) {
      yield* renderer.setStyleProperty(container, "display", "contents");
    }

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
        const newKeys = new Set(newItems.map(keyFn));

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
