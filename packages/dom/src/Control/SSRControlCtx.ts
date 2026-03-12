/**
 * SSR ControlCtx Layer implementation.
 * Renders once with hydration markers, no subscriptions or animations.
 */

import { Effect, Layer, Scope } from "effect";

import {
  ControlCtx,
  RendererContext,
  Signal,
  type IControlCtx,
  type SlotEntry,
} from "@effex/core";

import * as Element from "../Element/index.js";

type DOMElement = HTMLElement | SVGElement;

interface DOMSlotEntry extends SlotEntry<DOMElement> {
  readonly item: Signal.Signal<unknown>;
  readonly index: Signal.Signal<number>;
}

let ssrIdCounter = 0;

/**
 * Creates a fresh SSR control context with isolated state.
 * Each context has its own containerElement, slots Map, and hydration ID.
 */
const createSSRControlCtx = (): IControlCtx<DOMElement> => {
  // Fresh state per context instance
  const slots = new Map<string, DOMSlotEntry>();
  let containerElement: DOMElement | null = null;
  const hydrationId = `effex-${++ssrIdCounter}`;

  const defaultContainer: Element.Element<DOMElement, never, never> =
    Effect.gen(function* () {
      const renderer = yield* RendererContext;
      const container = yield* renderer.createNode("div");
      yield* renderer.setStyleProperty(container, "display", "contents");
      yield* renderer.setAttribute(container, "data-effex-id", hydrationId);
      return container as DOMElement;
    });

  const ctx: IControlCtx<DOMElement> = {
    fork: () => Effect.succeed(createSSRControlCtx()),

    defaultContainer,

    getContainer: <E, R>(
      create?: () => Element.Element<DOMElement, E, R>,
    ): Element.Element<DOMElement, E, R> =>
      Effect.gen(function* () {
        if (containerElement) return containerElement;
        const renderer = yield* RendererContext;
        const container = create
          ? yield* create()
          : yield* defaultContainer as Element.Element<DOMElement, E, R>;
        yield* renderer.setAttribute(container, "data-effex-id", hydrationId);
        containerElement = container;
        return container;
      }) as Element.Element<DOMElement, E, R>,

    addSlot: <E, R>(
      key: string,
      render: (ctx: {
        item: Signal.Signal<unknown>;
        index: Signal.Signal<number>;
      }) => Element.Element<DOMElement, E, R>,
      addOptions?: {
        atIndex?: number;
        initialItem?: unknown;
        initialIndex?: number;
      },
    ): Effect.Effect<DOMSlotEntry, E, R> =>
      Effect.gen(function* () {
        const slotScope = yield* Scope.make();
        const renderer = yield* RendererContext;

        const item = yield* Signal.make(addOptions?.initialItem).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        );
        const index = yield* Signal.make(addOptions?.initialIndex ?? 0).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        );

        const element = (yield* render({ item, index }).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        )) as DOMElement;

        yield* renderer.setAttribute(element, "data-effex-key", key);

        if (containerElement) {
          yield* renderer.appendChild(containerElement, element);
        }

        const entry: DOMSlotEntry = {
          key,
          element,
          scope: slotScope,
          item,
          index,
        };
        slots.set(key, entry);

        return entry;
      }) as Effect.Effect<DOMSlotEntry, E, R>,

    finalizeContainer: () => Effect.void,

    removeSlot: (): Effect.Effect<void> => Effect.void,

    getSlot: (key: string): Effect.Effect<DOMSlotEntry | undefined> =>
      Effect.sync(() => slots.get(key)),

    getSlotKeys: (): Effect.Effect<readonly string[]> =>
      Effect.sync(() => Array.from(slots.keys())),

    moveSlot: (): Effect.Effect<void> => Effect.void,

    subscribe: (): Effect.Effect<void> => Effect.void,
  };

  return ctx;
};

/**
 * SSR ControlCtx implementation.
 * Renders once with hydration markers, no subscriptions or animations.
 */
export const SSRControlCtx: Layer.Layer<ControlCtx> = Layer.effect(
  ControlCtx,
  Effect.succeed(createSSRControlCtx() as IControlCtx<unknown>),
);
