import { Context, Duration, Effect, Exit, Scope, Stream } from "effect";
import type { Readable } from "@core/Readable";
import { map as mapReadable } from "@core/Readable";
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

/**
 * Catches errors from a render function and displays a fallback element.
 * @param tryRender - Function that may fail with an error
 * @param catchRender - Function to render the error fallback
 *
 * @example
 * ```ts
 * ErrorBoundary(
 *   () => riskyComponent(),
 *   (error) => div(["Something went wrong: ", String(error)])
 * )
 * ```
 */
export const ErrorBoundary = <E, R1 = never, E2 = never, R2 = never>(
  tryRender: () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>,
  catchRender: (error: E) => Element<E2, R2>,
): Element<E2, R1 | R2> =>
  Effect.gen(function* () {
    const result = yield* tryRender().pipe(Effect.either);

    if (result._tag === "Left") {
      return yield* catchRender(result.left);
    }

    return result.right;
  });

/**
 * Options for the Suspense component.
 */
export interface SuspenseOptions<E, R1, EF> {
  /**
   * Async function that returns the final element.
   * Can fail with error type E if `catch` is provided.
   */
  readonly render: () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>;

  /**
   * Function to render the loading/fallback state.
   * Must have no requirements (will be rendered in detached context if delay > 0).
   */
  readonly fallback: () => Element<EF, never>;

  /**
   * Optional error handler. If provided, errors from render are caught
   * and this function is called to render an error state.
   * Must have no requirements.
   */
  readonly catch?: (error: E) => Element<never, never>;

  /**
   * Delay before showing the fallback.
   * If the render completes before this duration, no fallback is shown.
   * Accepts Effect Duration strings like "200 millis", "1 second", or a number (milliseconds).
   * If not provided, fallback is shown immediately.
   */
  readonly delay?: Duration.DurationInput;
}

/**
 * Suspense component for async rendering with loading states.
 *
 * Renders the fallback while waiting for the async render to complete.
 * Optionally delays showing the fallback to avoid loading flashes on fast responses.
 * Optionally catches errors and renders an error state.
 *
 * @example
 * ```ts
 * // Simple - show fallback immediately
 * Suspense({
 *   render: () => fetchAndRenderUser(userId),
 *   fallback: () => div("Loading..."),
 * })
 * ```
 *
 * @example
 * ```ts
 * // With delay - avoid loading flash on fast responses
 * Suspense({
 *   render: () => Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* UserPage({ user })
 *   }),
 *   fallback: () => div("Loading user..."),
 *   delay: "200 millis",
 * })
 * ```
 *
 * @example
 * ```ts
 * // With error handling
 * Suspense({
 *   render: () => Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* UserPage({ user })
 *   }),
 *   fallback: () => div("Loading..."),
 *   catch: (error) => div(["Error: ", String(error)]),
 *   delay: "200 millis",
 * })
 * ```
 */
export const Suspense: {
  // Overload 1: No catch, render cannot fail
  <R1 = never, EF = never>(
    options: SuspenseOptions<never, R1, EF> & { catch?: never },
  ): Element<EF, R1>;

  // Overload 2: With catch, render can fail
  <E, R1 = never, EF = never>(
    options: SuspenseOptions<E, R1, EF> & {
      catch: (error: E) => Element<never, never>;
    },
  ): Element<EF, R1>;
} = <E, R1 = never, EF = never>(
  options: SuspenseOptions<E, R1, EF>,
): Element<EF, R1> => {
  const delayMs =
    options.delay !== undefined ? Duration.toMillis(options.delay) : 0;
  const hasCatch = options.catch !== undefined;
  const hasDelay = delayMs > 0;

  // Dispatch to the appropriate implementation
  if (hasDelay && hasCatch) {
    return suspenseWithDelayAndCatch(
      options.render as () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>,
      options.fallback,
      options.catch as (error: E) => Element<never, never>,
      delayMs,
    ) as Element<EF, R1>;
  } else if (hasDelay) {
    return suspenseWithDelay(
      options.render as () => Effect.Effect<
        HTMLElement,
        never,
        Scope.Scope | R1
      >,
      options.fallback,
      delayMs,
    ) as Element<EF, R1>;
  } else if (hasCatch) {
    return suspenseWithCatch(
      options.render as () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>,
      options.fallback,
      options.catch as (error: E) => Element<never, never>,
    ) as Element<EF, R1>;
  } else {
    return suspenseSimple(
      options.render as () => Effect.Effect<
        HTMLElement,
        never,
        Scope.Scope | R1
      >,
      options.fallback,
    ) as Element<EF, R1>;
  }
};

// Internal implementations

const suspenseSimple = <R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<HTMLElement, never, Scope.Scope | R1>,
  fallbackRender: () => Element<EF, never>,
): Element<EF, R1> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";

    const fallback = yield* fallbackRender();
    container.appendChild(fallback);

    yield* asyncRender().pipe(
      Effect.tap((element) =>
        Effect.sync(() => {
          container.replaceChild(element, fallback);
        }),
      ),
      Effect.forkIn(scope),
    );

    return container as HTMLElement;
  });

const suspenseWithCatch = <E, R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>,
  fallbackRender: () => Element<EF, never>,
  catchRender: (error: E) => Element<never, never>,
): Element<EF, R1> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";

    const fallback = yield* fallbackRender();
    container.appendChild(fallback);

    yield* asyncRender().pipe(
      Effect.either,
      Effect.tap((result) =>
        Effect.gen(function* () {
          if (result._tag === "Left") {
            const errorElement = yield* catchRender(result.left);
            container.replaceChild(errorElement, fallback);
          } else {
            container.replaceChild(result.right, fallback);
          }
        }),
      ),
      Effect.forkIn(scope),
    );

    return container as HTMLElement;
  });

const suspenseWithDelay = <R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<HTMLElement, never, Scope.Scope | R1>,
  fallbackRender: () => Element<EF, never>,
  delayMs: number,
): Element<EF, R1> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";

    let completed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let fallbackElement: HTMLElement | null = null;

    timeoutId = setTimeout(() => {
      if (!completed) {
        Effect.runPromise(
          Effect.gen(function* () {
            fallbackElement = yield* Effect.scoped(fallbackRender());
            if (!completed) {
              container.appendChild(fallbackElement);
            }
          }),
        );
      }
    }, delayMs);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      }),
    );

    yield* asyncRender().pipe(
      Effect.tap((element) =>
        Effect.sync(() => {
          completed = true;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (fallbackElement && container.contains(fallbackElement)) {
            container.replaceChild(element, fallbackElement);
          } else {
            container.appendChild(element);
          }
        }),
      ),
      Effect.forkIn(scope),
    );

    return container as HTMLElement;
  });

const suspenseWithDelayAndCatch = <E, R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>,
  fallbackRender: () => Element<EF, never>,
  catchRender: (error: E) => Element<never, never>,
  delayMs: number,
): Element<EF, R1> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";

    let completed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let fallbackElement: HTMLElement | null = null;

    timeoutId = setTimeout(() => {
      if (!completed) {
        Effect.runPromise(
          Effect.gen(function* () {
            fallbackElement = yield* Effect.scoped(fallbackRender());
            if (!completed) {
              container.appendChild(fallbackElement);
            }
          }),
        );
      }
    }, delayMs);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      }),
    );

    yield* asyncRender().pipe(
      Effect.either,
      Effect.tap((result) =>
        Effect.gen(function* () {
          completed = true;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          const newElement =
            result._tag === "Left"
              ? yield* catchRender(result.left)
              : result.right;

          if (fallbackElement && container.contains(fallbackElement)) {
            container.replaceChild(newElement, fallbackElement);
          } else {
            container.appendChild(newElement);
          }
        }),
      ),
      Effect.forkIn(scope),
    );

    return container as HTMLElement;
  });

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
): Element<E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";

    let currentElement: HTMLElement | null = null;
    let currentValue: boolean | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;
    const animate = options?.animate;

    const render = (
      value: boolean,
      isInitial: boolean = false,
    ): Effect.Effect<void, E1 | E2, R1 | R2> =>
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
          container.replaceChild(newElement, previousElement);
        } else {
          container.appendChild(newElement);
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

/**
 * A case for pattern matching with {@link match}.
 */
export interface MatchCase<A, E = never, R = never> {
  readonly pattern: A;
  readonly render: () => Element<E, R>;
}

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
 *
 * @example
 * ```ts
 * // Route matching with async data loading
 * match(router.currentRoute, [
 *   {
 *     pattern: "home",
 *     render: () => HomePage(),
 *   },
 *   {
 *     pattern: "user",
 *     render: () =>
 *       DeferredSuspenseWithBoundary(
 *         () => Effect.gen(function* () {
 *           const params = yield* router.routes.user.params.get
 *           const user = yield* fetchUser(params.id)
 *           return yield* UserPage({ user })
 *         }),
 *         () => div("Loading user..."),
 *         (error) => div(["Error: ", String(error)]),
 *         { delay: 200 }
 *       ),
 *   },
 * ])
 * ```
 */
export const match = <A, E = never, R = never, E2 = never, R2 = never>(
  value: Readable<A>,
  cases: readonly MatchCase<A, E, R>[],
  fallback?: () => Element<E2, R2>,
  options?: ControlAnimationOptions,
): Element<E | E2, R | R2> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";

    let currentElement: HTMLElement | null = null;
    let currentPattern: A | null = null;
    let currentElementScope: Scope.CloseableScope | null = null;
    const animate = options?.animate;

    const render = (
      val: A,
      isInitial: boolean = false,
    ): Effect.Effect<void, E | E2, R | R2> =>
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
          container.replaceChild(newElement, previousElement);
        } else {
          container.appendChild(newElement);
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

/**
 * Render a list of items with efficient updates using keys.
 * @param items - Reactive array of items
 * @param keyFn - Function to extract a unique key from each item
 * @param render - Function to render each item (receives a Readable for the item)
 * @param options - Optional animation configuration
 *
 * @example
 * ```ts
 * interface Todo { id: string; text: string }
 * const todos = yield* Signal.make<Todo[]>([])
 *
 * each(
 *   todos,
 *   (todo) => todo.id,
 *   (todo) => li([todo.map(t => t.text)])
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
): Element<E, R> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const container = document.createElement("div");
    container.style.display = "contents";
    const animate = options?.animate;

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
    ): Effect.Effect<void, E, R> =>
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
          if (container.contains(element)) {
            container.removeChild(element);
          }
          yield* Scope.close(itemScope, Exit.void);
          itemMap.delete(key);
        }

        // Track new items for enter animation
        const newEntries: { element: HTMLElement; index: number }[] = [];

        // Use DocumentFragment for batch insertion during initial render
        const fragment = isInitial ? document.createDocumentFragment() : null;

        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i];
          const key = keyFn(item);
          const existing = itemMap.get(key);

          if (existing) {
            existing.readable._update(item);

            // Only reposition during updates, not initial render
            if (!isInitial) {
              const expectedPosition = i;
              const currentPosition = Array.from(container.children).indexOf(
                existing.element,
              );

              if (currentPosition !== expectedPosition) {
                if (expectedPosition >= container.children.length) {
                  container.appendChild(existing.element);
                } else {
                  container.insertBefore(
                    existing.element,
                    container.children[expectedPosition],
                  );
                }
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

            // Batch insert during initial render, individual inserts during updates
            if (isInitial && fragment) {
              fragment.appendChild(element);
            } else {
              if (i >= container.children.length) {
                container.appendChild(element);
              } else {
                container.insertBefore(element, container.children[i]);
              }
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

        // Append all elements at once during initial render
        if (isInitial && fragment && fragment.childNodes.length > 0) {
          container.appendChild(fragment);
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

/**
 * Provide a context value to children elements.
 * Similar to React's Context.Provider pattern.
 *
 * @param tag - The Effect Context tag
 * @param value - The value to provide
 * @param children - Elements that require this context
 * @returns The children with context provided (can be passed to element factories)
 *
 * @example
 * ```ts
 * // Define a context
 * class ThemeCtx extends Context.Tag("Theme")<ThemeCtx, { color: string }>() {}
 *
 * // Provide it to children
 * $.div(
 *   { class: "app" },
 *   provide(ThemeCtx, { color: "blue" }, [
 *     ThemedButton({}),
 *     ThemedText({}, "Hello"),
 *   ])
 * )
 * ```
 */
export const provide = <I, S, E = never>(
  tag: Context.Tag<I, S>,
  value: S,
  children: Element<E, I> | Element<E, I>[],
): Element<E, never>[] => {
  const childArray = Array.isArray(children) ? children : [children];
  return childArray.map((child) =>
    child.pipe(Effect.provideService(tag, value)),
  );
};
