/**
 * SSR-specific control flow implementations.
 * These render once with hydration markers and don't set up subscriptions.
 */

import { Effect, Stream } from "effect";
import type { Readable } from "@effex/core";
import {
  mapReadable,
  RendererContext,
  type RendererInterface,
} from "@effex/core";
import type { SSRContextService } from "../SSRContext";
import type { Element } from "../Element";
import type { WhenConfig, MatchConfig, EachConfig } from "./types";
import {
  createDefaultContainer,
  addHydrationMarkers,
  addItemHydrationKey,
} from "./helpers";

/**
 * SSR implementation of `when`.
 * Renders the initial branch with hydration markers, no subscriptions.
 */
export const ssrWhen = <E1, R1, E2, R2>(
  ctx: SSRContextService,
  condition: Readable<boolean>,
  config: WhenConfig<E1, R1, E2, R2>,
): Element<E1 | E2, R1 | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const hydrationId = yield* ctx.generateId;
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
  });

/**
 * SSR implementation of `match`.
 * Renders the matched case with hydration markers, no subscriptions.
 */
export const ssrMatch = <A, E, R, E2, R2>(
  ctx: SSRContextService,
  value: Readable<A>,
  config: MatchConfig<A, E, R, E2, R2>,
): Element<E | E2, R | R2> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const hydrationId = yield* ctx.generateId;
    const initialValue = yield* value.get;

    const container = config.container
      ? yield* config.container()
      : yield* createDefaultContainer(renderer);

    yield* addHydrationMarkers(renderer, container, "match", hydrationId, {
      pattern: JSON.stringify(initialValue),
    });

    // Use extractPattern if provided, otherwise use the value directly
    const patternValue = config.extractPattern
      ? config.extractPattern(initialValue)
      : initialValue;
    const matchedCase = config.cases.find((c) => c.pattern === patternValue);
    let element;

    if (matchedCase) {
      element = yield* matchedCase.render();
    } else if (config.fallback) {
      element = yield* config.fallback();
    }

    if (element) {
      yield* renderer.appendChild(container, element);
    }
    return container;
  });

/**
 * SSR implementation of `each`.
 * Renders all items with hydration markers, no subscriptions.
 */
export const ssrEach = <A, E, R>(
  ctx: SSRContextService,
  items: Readable<readonly A[]>,
  config: EachConfig<A, E, R>,
): Element<E, R> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as RendererInterface<Node>;
    const hydrationId = yield* ctx.generateId;
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
        map: <B>(f: (a: A) => B): Readable<B> => mapReadable(staticReadable, f),
      };

      const element = yield* config.render(staticReadable);
      yield* addItemHydrationKey(renderer, element, key);
      yield* renderer.appendChild(container, element);
    }

    return container;
  });
