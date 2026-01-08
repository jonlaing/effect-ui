/**
 * Plain client-side control flow implementations.
 * No SSR, no hydration - just reactive DOM updates.
 * Delegates to shared updaters for change handling (with optional animation support).
 */

import { Effect, Scope, Stream } from "effect";
import type { Readable } from "@effex/core";
import { RendererContext, type RendererInterface } from "@effex/core";
import { Element } from "../Element";
import type { WhenConfig, MatchConfig, EachConfig } from "./types";
import { createDefaultContainer } from "./helpers";
import {
  createWhenUpdater,
  createMatchUpdater,
  createEachUpdater,
  createItemReadable,
} from "./updaters";

/**
 * Plain client implementation of `when`.
 * Reactive DOM updates with optional animation support.
 */
export const clientWhen = <E1, R1, E2, R2>(
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Element.Element<E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    const initialValue = yield* condition.get;
    const updater = createWhenUpdater(container, config);

    // Create and append initial element
    const initialScope = yield* Scope.make();
    const initialElement = initialValue
      ? yield* config
          .onTrue()
          .pipe(Effect.provideService(Scope.Scope, initialScope))
      : yield* config
          .onFalse()
          .pipe(Effect.provideService(Scope.Scope, initialScope));

    yield* renderer.appendChild(container, initialElement);
    updater.initialize(initialElement, initialValue, initialScope);

    // Subscribe to changes using shared updater
    yield* condition.changes.pipe(
      Stream.runForEach(updater.update),
      Effect.forkIn(scope),
    );

    yield* Effect.addFinalizer(updater.cleanup);

    return container;
  });

/**
 * Plain client implementation of `match`.
 * Reactive DOM updates with optional animation support.
 */
export const clientMatch = <A, E, R, E2, R2>(
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Element.Element<E | E2, R | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    const initialValue = yield* value.get;
    const updater = createMatchUpdater(container, config);

    // Use extractPattern if provided
    const patternValue = config.extractPattern
      ? config.extractPattern(initialValue)
      : initialValue;
    const matchedCase = config.cases.find((c) => c.pattern === patternValue);

    // Create and append initial element (if any)
    if (matchedCase || config.fallback) {
      const initialScope = yield* Scope.make();
      const initialElement = matchedCase
        ? yield* matchedCase
            .render()
            .pipe(Effect.provideService(Scope.Scope, initialScope))
        : yield* config.fallback!().pipe(
            Effect.provideService(Scope.Scope, initialScope),
          );

      yield* renderer.appendChild(container, initialElement);
      updater.initialize(initialElement, initialValue, initialScope);
    } else {
      updater.initialize(null, initialValue, null);
    }

    // Subscribe to changes using shared updater
    yield* value.changes.pipe(
      Stream.runForEach(updater.update),
      Effect.forkIn(scope),
    );

    yield* Effect.addFinalizer(updater.cleanup);

    return container;
  });

/**
 * Plain client implementation of `each`.
 * Reactive DOM updates with optional animation support.
 */
export const clientEach = <A, E, R>(
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Element.Element<E, R> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const scope = yield* Effect.scope;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    const initialItems = yield* items.get;
    const updater = createEachUpdater(container, config);

    // Create and append initial items
    for (const item of initialItems) {
      const key = config.key(item);
      const itemScope = yield* Scope.make();
      const itemReadable = createItemReadable(item);

      const element = yield* config
        .render(itemReadable)
        .pipe(Effect.provideService(Scope.Scope, itemScope));

      yield* renderer.appendChild(container, element);
      updater.addHydratedItem(key, element, itemScope, itemReadable);
    }

    // Subscribe to changes using shared updater
    yield* items.changes.pipe(
      Stream.runForEach(updater.update),
      Effect.forkIn(scope),
    );

    yield* Effect.addFinalizer(updater.cleanup);

    return container;
  });
