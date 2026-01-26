/**
 * Hydration-specific control flow implementations.
 * These find existing DOM elements and attach event handlers, then delegate
 * to shared updaters for reactive changes (with animation support).
 */

import { Effect, Scope, Stream } from "effect";

import {
  RendererContext,
  type Readable,
  type RendererInterface,
} from "@effex/core";

import { Element } from "../Element";
import { createHydrationRenderer } from "../hydrate/HydrationRenderer";
import type { HydrationContextService } from "../HydrationContext";
import { HydrationMismatchError } from "./errors";
import type { EachConfig, MatchConfig, WhenConfig } from "./types";
import {
  createEachUpdater,
  createIndexReadable,
  createItemReadable,
  createMatchUpdater,
  createWhenUpdater,
} from "./updaters";

/**
 * Create a scoped renderer for hydrating children inside a container.
 */
const withScopedRenderer = <A, E, R>(
  container: HTMLElement | SVGElement,
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
 * Hydration implementation of `when`.
 * Finds existing container, attaches handlers, then delegates to shared updater.
 */
export const hydrationWhen = <E1, R1, E2, R2>(
  ctx: HydrationContextService,
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Element.Element<
  HTMLElement | SVGElement,
  E1 | E2 | HydrationMismatchError,
  R1 | R2
> =>
  Effect.gen(function* () {
    const hydrationId = yield* ctx.generateId;

    const container = ctx.root.querySelector(
      `[data-effex-type="when"][data-effex-id="${hydrationId}"]`,
    ) as HTMLElement | SVGElement | null;

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
    const updater = createWhenUpdater(container, config);

    // Hydrate initial element and attach handlers
    const initialScope = yield* Scope.make();
    const initialElement = initialValue
      ? yield* withScopedRenderer(container, config.onTrue()).pipe(
          Effect.provideService(Scope.Scope, initialScope),
        )
      : yield* withScopedRenderer(container, config.onFalse()).pipe(
          Effect.provideService(Scope.Scope, initialScope),
        );

    updater.initialize(initialElement, initialValue, initialScope);

    // Subscribe to changes using shared updater
    const scope = yield* Effect.scope;
    yield* condition.changes.pipe(
      Stream.runForEach(updater.update),
      Effect.forkIn(scope),
    );

    yield* Effect.addFinalizer(updater.cleanup);

    return container;
  });

/**
 * Hydration implementation of `match`.
 * Finds existing container, attaches handlers, then delegates to shared updater.
 */
export const hydrationMatch = <A, E, R, E2, R2>(
  ctx: HydrationContextService,
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Effect.Effect<
  HTMLElement | SVGElement,
  E | E2 | HydrationMismatchError,
  Scope.Scope | R | R2
> =>
  Effect.gen(function* () {
    const hydrationId = yield* ctx.generateId;

    const container = ctx.root.querySelector(
      `[data-effex-type="match"][data-effex-id="${hydrationId}"]`,
    ) as HTMLElement | SVGElement | null;

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
    const updater = createMatchUpdater(container, config);

    // Use extractPattern if provided
    const patternValue = config.extractPattern
      ? config.extractPattern(initialValue)
      : initialValue;
    const matchedCase = config.cases.find((c) => c.pattern === patternValue);

    // Hydrate initial element and attach handlers
    if (matchedCase || config.fallback) {
      const initialScope = yield* Scope.make();
      const initialElement = matchedCase
        ? yield* withScopedRenderer(container, matchedCase.render()).pipe(
            Effect.provideService(Scope.Scope, initialScope),
          )
        : yield* withScopedRenderer(container, config.fallback!()).pipe(
            Effect.provideService(Scope.Scope, initialScope),
          );

      updater.initialize(initialElement, initialValue, initialScope);
    } else {
      updater.initialize(null, initialValue, null);
    }

    // Subscribe to changes using shared updater
    const scope = yield* Effect.scope;
    yield* value.changes.pipe(
      Stream.runForEach(updater.update),
      Effect.forkIn(scope),
    );

    yield* Effect.addFinalizer(updater.cleanup);

    return container;
  });

/**
 * Hydration implementation of `each`.
 * Finds existing items, attaches handlers, then delegates to shared updater.
 */
export const hydrationEach = <A, E, R>(
  ctx: HydrationContextService,
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Element.Element<HTMLElement | SVGElement, E | HydrationMismatchError, R> =>
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
    const updater = createEachUpdater(container, config);

    // Hydrate each existing item and attach handlers
    for (let i = 0; i < initialItems.length; i++) {
      const item = initialItems[i];
      const key = config.key(item);

      const existingElement = container.querySelector(
        `[data-effex-key="${key}"]`,
      ) as HTMLElement | null;

      if (!existingElement) continue;

      const itemScope = yield* Scope.make();
      const itemReadable = createItemReadable(item);
      const indexReadable = createIndexReadable(i);
      const scopedRenderer = createHydrationRenderer(existingElement);

      yield* Effect.provideService(
        config
          .render(itemReadable, indexReadable)
          .pipe(Effect.provideService(Scope.Scope, itemScope)),
        RendererContext,
        scopedRenderer as RendererInterface<unknown>,
      );

      updater.addHydratedItem(
        key,
        existingElement,
        itemScope,
        itemReadable,
        indexReadable,
      );
    }

    // Subscribe to changes using shared updater
    const scope = yield* Effect.scope;
    yield* items.changes.pipe(
      Stream.runForEach(updater.update),
      Effect.forkIn(scope),
    );

    yield* Effect.addFinalizer(updater.cleanup);

    return container;
  });
