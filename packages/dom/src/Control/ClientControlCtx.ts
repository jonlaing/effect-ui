/**
 * Client-side ControlCtx Layer implementation.
 * Full reactive updates with optional animation support.
 */

import { Effect, Layer, Scope } from "effect";

import {
  ControlCtx,
  RendererContext,
  Signal,
  type IControlCtx,
  type Renderer,
  type SlotEntry,
} from "@stax-ui/core";

import * as Element from "../Element/index.js";
import { DOMRenderer } from "../Render/DOMRenderer.js";
import {
  applyPreInsertEnterFrom,
  captureSlotRects,
  flipMovedSlots,
  forkSlotEnter,
  forkSlotRemoval,
} from "./slotAnimation.js";
import { subscribeReconcile } from "./subscribeReconcile.js";

type DOMElement = HTMLElement | SVGElement;

interface DOMSlotEntry extends SlotEntry<DOMElement> {
  readonly item: Signal.Signal<unknown>;
  readonly index: Signal.Signal<number>;
}

/**
 * Creates a fresh client control context with isolated state.
 * Each context has its own containerElement and slots Map.
 */
const createClientControlCtx = (): IControlCtx<DOMElement> => {
  // Fresh state per context instance
  const slots = new Map<string, DOMSlotEntry>();
  let containerElement: DOMElement | null = null;
  // Rect snapshot captured by beginSync so endSync can compute FLIP
  // deltas per slot. Null between batches. See slotAnimation.ts for the
  // release mechanics.
  let beforeRects: Map<string, DOMRect> | null = null;

  const defaultContainer: Element.Element<DOMElement, never, never> =
    Effect.gen(function* () {
      const renderer = yield* RendererContext;
      const container = yield* renderer.createNode("div");
      yield* renderer.setStyleProperty(container, "display", "contents");
      return container as DOMElement;
    });

  const ctx: IControlCtx<DOMElement> = {
    fork: () => Effect.succeed(createClientControlCtx()),

    defaultContainer,

    getContainer: <E, R>(
      create?: () => Element.Element<DOMElement, E, R>,
    ): Element.Element<DOMElement, E, R> =>
      Effect.gen(function* () {
        if (containerElement) return containerElement;
        const container = create
          ? yield* create()
          : yield* defaultContainer as Element.Element<DOMElement, E, R>;
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
        totalItems?: number;
        staggerStartAt?: number;
      },
    ): Effect.Effect<DOMSlotEntry, E, R> =>
      Effect.gen(function* () {
        const slotScope = yield* Scope.make();

        const item = yield* Signal.make(addOptions?.initialItem).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        );
        const index = yield* Signal.make(addOptions?.initialIndex ?? 0).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        );

        const element = (yield* render({ item, index }).pipe(
          Effect.provideService(Scope.Scope, slotScope),
          Effect.provideService(
            RendererContext,
            DOMRenderer as unknown as Renderer<unknown>,
          ),
        )) as DOMElement;

        // Apply enterFrom classes BEFORE inserting into the DOM, so the
        // browser's first paint of this element is already in the hidden
        // pre-animation state. Otherwise there's a one-frame flash of the
        // resolved state before forkSlotEnter's fiber gets to apply them.
        yield* applyPreInsertEnterFrom(element);

        if (containerElement) {
          const children = Array.from(containerElement.children);
          const targetIndex = addOptions?.atIndex ?? children.length;
          const refChild = children[targetIndex] ?? null;
          containerElement.insertBefore(element, refChild);
        }

        const entry: DOMSlotEntry = {
          key,
          element,
          scope: slotScope,
          item,
          index,
        };
        slots.set(key, entry);

        yield* forkSlotEnter(element, slotScope, {
          index: addOptions?.atIndex,
          total: addOptions?.totalItems,
          staggerStartAt: addOptions?.staggerStartAt,
        });

        return entry;
      }) as Effect.Effect<DOMSlotEntry, E, R>,

    finalizeContainer: () => Effect.void,

    removeSlot: (key: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const entry = slots.get(key);
        if (!entry) return;
        slots.delete(key);
        yield* forkSlotRemoval(entry, () => {
          if (
            containerElement &&
            entry.element.parentNode === containerElement
          ) {
            containerElement.removeChild(entry.element);
          }
        });
      }),

    getSlot: (key: string): Effect.Effect<DOMSlotEntry | undefined> =>
      Effect.sync(() => slots.get(key)),

    getSlotKeys: (): Effect.Effect<readonly string[]> =>
      Effect.sync(() => Array.from(slots.keys())),

    moveSlot: (key: string, toIndex: number): Effect.Effect<void> =>
      Effect.sync(() => {
        const entry = slots.get(key);
        if (!entry || !containerElement) return;

        const children = Array.from(containerElement.children);
        const currentIndex = children.indexOf(entry.element);

        if (currentIndex === toIndex) return;

        const refChild = children[toIndex] ?? null;
        containerElement.insertBefore(entry.element, refChild);
      }),

    // Snapshot every current slot's bounding rect BEFORE removes/moves
    // run this batch. `endSync` uses this to compute per-slot deltas
    // for the FLIP release. Elements that get added this batch have no
    // pre-batch rect and so are excluded from FLIP — their enter
    // animation owns them.
    beginSync: (): Effect.Effect<void> =>
      Effect.sync(() => {
        beforeRects = captureSlotRects(slots.values());
      }),

    // Close the batch: measure each still-present slot's new rect,
    // fork the FLIP release for anything that moved. No-op when no
    // `move` config is provided by AnimationConfigCtx.
    endSync: (): Effect.Effect<void> =>
      Effect.gen(function* () {
        const before = beforeRects;
        beforeRects = null;
        if (!before) return;
        yield* flipMovedSlots(before, slots.values());
      }),

    subscribe: subscribeReconcile,
  };

  return ctx;
};

/**
 * Client-side ControlCtx implementation.
 * Animation config is read at runtime in addSlot/removeSlot, not at Layer creation.
 */
export const ClientControlCtx: Layer.Layer<ControlCtx> = Layer.effect(
  ControlCtx,
  Effect.succeed(createClientControlCtx() as IControlCtx<unknown>),
);
