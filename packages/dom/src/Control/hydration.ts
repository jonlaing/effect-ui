/**
 * Hydration-specific control flow implementations.
 * These find existing DOM elements and attach event handlers, then subscribe.
 */

import { Effect, Scope, Stream } from "effect";
import type { Readable } from "@effex/core";
import {
  mapReadable,
  RendererContext,
  type RendererInterface,
} from "@effex/core";
import type { HydrationContextService } from "../HydrationContext";
import { createHydrationRenderer } from "../hydrate/HydrationRenderer";
import { DOMRenderer } from "../DOMRenderer";
import type { WhenConfig, MatchConfig, EachConfig } from "./types";
import { HydrationMismatchError } from "./errors";

/**
 * Create a scoped renderer for hydrating children inside a container.
 */
const withScopedRenderer = <A, E, R>(
  container: HTMLElement,
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, Exclude<R, RendererContext>> => {
  const scopedRenderer = createHydrationRenderer(container);
  return Effect.provideService(
    effect,
    RendererContext,
    scopedRenderer as RendererInterface<unknown>,
  );
};

/**
 * Provide DOMRenderer for creating new content after hydration.
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
 * Hydration implementation of `when`.
 * Finds existing container, attaches handlers, subscribes to changes.
 */
export const hydrationWhen = <E1, R1, E2, R2>(
  ctx: HydrationContextService,
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Effect.Effect<
  HTMLElement,
  E1 | E2 | HydrationMismatchError,
  Scope.Scope | R1 | R2
> =>
  Effect.gen(function* () {
    const hydrationId = yield* ctx.generateId;

    const container = ctx.root.querySelector(
      `[data-effex-type="when"][data-effex-id="${hydrationId}"]`,
    ) as HTMLElement | null;

    if (!container) {
      return yield* Effect.fail(
        new HydrationMismatchError({
          type: "when",
          hydrationId,
          message: `Could not find hydration container for "when" with id "${hydrationId}"`,
        }),
      );
    }

    const initialValue = yield* condition.get;

    // Render the current branch to attach event handlers to existing DOM
    if (initialValue) {
      yield* withScopedRenderer(container, config.onTrue());
    } else {
      yield* withScopedRenderer(container, config.onFalse());
    }

    // Set up reactive subscriptions for future changes
    const scope = yield* Effect.scope;
    yield* condition.changes.pipe(
      Stream.runForEach((newValue) =>
        Effect.gen(function* () {
          container.innerHTML = "";
          const element = newValue
            ? yield* withDOMRenderer(config.onTrue())
            : yield* withDOMRenderer(config.onFalse());
          container.appendChild(element);
        }),
      ),
      Effect.forkIn(scope),
    );

    return container;
  });

/**
 * Hydration implementation of `match`.
 * Finds existing container, attaches handlers, subscribes to changes.
 */
export const hydrationMatch = <A, E, R, E2, R2>(
  ctx: HydrationContextService,
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Effect.Effect<
  HTMLElement,
  E | E2 | HydrationMismatchError,
  Scope.Scope | R | R2
> =>
  Effect.gen(function* () {
    const hydrationId = yield* ctx.generateId;

    const container = ctx.root.querySelector(
      `[data-effex-type="match"][data-effex-id="${hydrationId}"]`,
    ) as HTMLElement | null;

    if (!container) {
      return yield* Effect.fail(
        new HydrationMismatchError({
          type: "match",
          hydrationId,
          message: `Could not find hydration container for "match" with id "${hydrationId}"`,
        }),
      );
    }

    const initialValue = yield* value.get;
    // Use extractPattern if provided, otherwise use the value directly
    const patternValue = config.extractPattern
      ? config.extractPattern(initialValue)
      : initialValue;
    const matchedCase = config.cases.find((c) => c.pattern === patternValue);

    // Render the matched case to attach event handlers to existing DOM
    if (matchedCase) {
      yield* withScopedRenderer(container, matchedCase.render());
    } else if (config.fallback) {
      yield* withScopedRenderer(container, config.fallback());
    }

    // Set up reactive subscriptions for future changes
    const scope = yield* Effect.scope;
    yield* value.changes.pipe(
      Stream.runForEach((newValue) =>
        Effect.gen(function* () {
          container.innerHTML = "";
          // Use extractPattern if provided
          const newPatternValue = config.extractPattern
            ? config.extractPattern(newValue)
            : newValue;
          const newCase = config.cases.find(
            (c) => c.pattern === newPatternValue,
          );
          let element;
          if (newCase) {
            element = yield* withDOMRenderer(newCase.render());
          } else if (config.fallback) {
            element = yield* withDOMRenderer(config.fallback());
          }
          if (element) {
            container.appendChild(element);
          }
        }),
      ),
      Effect.forkIn(scope),
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
 * Hydration implementation of `each`.
 * Finds existing items, attaches handlers, subscribes to changes.
 */
export const hydrationEach = <A, E, R>(
  ctx: HydrationContextService,
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Effect.Effect<HTMLElement, E | HydrationMismatchError, Scope.Scope | R> =>
  Effect.gen(function* () {
    const hydrationId = yield* ctx.generateId;

    const container = ctx.root.querySelector(
      `[data-effex-type="each"][data-effex-id="${hydrationId}"]`,
    ) as HTMLElement | null;

    if (!container) {
      return yield* Effect.fail(
        new HydrationMismatchError({
          type: "each",
          hydrationId,
          message: `Could not find hydration container for "each" with id "${hydrationId}"`,
        }),
      );
    }

    const initialItems = yield* items.get;

    // Create item readables and render each to attach event handlers
    const itemMap = new Map<
      string,
      {
        element: HTMLElement;
        readable: Readable<A> & { _update: (value: A) => void };
      }
    >();

    for (const item of initialItems) {
      const key = config.key(item);

      const existingElement = container.querySelector(
        `[data-effex-key="${key}"]`,
      ) as HTMLElement | null;

      if (existingElement) {
        const itemReadable = createItemReadable(item);

        // Create scoped renderer for this item's children
        const scopedRenderer = createHydrationRenderer(existingElement);

        // Render to attach event handlers
        yield* Effect.provideService(
          config.render(itemReadable),
          RendererContext,
          scopedRenderer as RendererInterface<unknown>,
        );

        itemMap.set(key, {
          element: existingElement,
          readable: itemReadable,
        });
      }
    }

    // Set up reactive subscriptions for future changes
    const scope = yield* Effect.scope;
    yield* items.changes.pipe(
      Stream.runForEach((newItems) =>
        Effect.gen(function* () {
          const newKeys = new Set(newItems.map(config.key));

          // Remove items that no longer exist
          for (const [key, entry] of itemMap) {
            if (!newKeys.has(key)) {
              container.removeChild(entry.element);
              itemMap.delete(key);
            }
          }

          // Update existing or add new items
          for (let i = 0; i < newItems.length; i++) {
            const item = newItems[i];
            const key = config.key(item);
            const existing = itemMap.get(key);

            if (existing) {
              existing.readable._update(item);
            } else {
              const itemReadable = createItemReadable(item);
              const element = yield* withDOMRenderer(
                config.render(itemReadable),
              );

              // Insert at correct position
              const children = Array.from(container.children);
              if (i >= children.length) {
                container.appendChild(element);
              } else {
                container.insertBefore(element, children[i]);
              }

              itemMap.set(key, { element, readable: itemReadable });
            }
          }
        }),
      ),
      Effect.forkIn(scope),
    );

    return container;
  });
