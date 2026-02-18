/**
 * Client-side ControlCtx Layer implementation.
 * Full reactive updates with optional animation support.
 */

import { Effect, Exit, Layer, Option, Scope, Stream } from "effect";

import {
  ControlCtx,
  RendererContext,
  Signal,
  type IControlCtx,
  type Readable,
  type Renderer,
  type SlotEntry,
} from "@effex/core";

import { runEnterAnimation, runExitAnimation } from "../Animation/index.js";
import * as Element from "../Element";
import { DOMRenderer } from "../Render/DOMRenderer.js";
import { AnimationConfigCtx } from "./AnimationConfigCtx.js";

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

        // Run enter animation if configured (read at runtime, not Layer creation)
        const animationConfigOption =
          yield* Effect.serviceOption(AnimationConfigCtx);
        const animationConfig = Option.getOrUndefined(animationConfigOption);
        const animate = (animationConfig?.list ?? animationConfig?.single) as
          | Parameters<typeof runEnterAnimation>[1]
          | undefined;
        if (animate && element instanceof HTMLElement) {
          yield* runEnterAnimation(Effect.succeed(element), animate);
        }

        return entry;
      }) as Effect.Effect<DOMSlotEntry, E, R>,

    removeSlot: (key: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const entry = slots.get(key);
        if (!entry) return;

        // Run exit animation if configured (read at runtime, not Layer creation)
        const animationConfigOption =
          yield* Effect.serviceOption(AnimationConfigCtx);
        const animationConfig = Option.getOrUndefined(animationConfigOption);
        const animate = (animationConfig?.list ?? animationConfig?.single) as
          | Parameters<typeof runExitAnimation>[1]
          | undefined;
        if (animate && entry.element instanceof HTMLElement) {
          yield* runExitAnimation(Effect.succeed(entry.element), animate);
        }

        if (containerElement && entry.element.parentNode === containerElement) {
          containerElement.removeChild(entry.element);
        }

        yield* Scope.close(entry.scope, Exit.void);
        slots.delete(key);
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

    subscribe: <V, E, R>(
      readable: Readable.Readable<V>,
      handler: (value: V) => Effect.Effect<void, E, R>,
    ): Effect.Effect<void, E, R> =>
      Effect.gen(function* () {
        const scope = yield* Effect.scope;
        yield* readable.changes.pipe(
          Stream.runForEach(handler),
          Effect.forkIn(scope),
        );
      }) as Effect.Effect<void, E, R>,
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
