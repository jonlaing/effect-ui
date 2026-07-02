/**
 * Hydration ControlCtx Layer implementation.
 * Finds existing DOM and attaches handlers, then subscribes like client mode.
 */

import { Context, Effect, Layer, Scope, Stream } from "effect";

import {
  ControlCtx,
  RendererContext,
  Signal,
  type IControlCtx,
  type Readable,
  type Renderer,
  type SlotEntry,
} from "@effex/core";

import * as Element from "../Element/index.js";
import { DOMRenderer } from "../Render/DOMRenderer.js";
import { forkSlotEnter, forkSlotRemoval } from "./slotAnimation.js";

type DOMElement = HTMLElement | SVGElement;

interface DOMSlotEntry extends SlotEntry<DOMElement> {
  readonly item: Signal.Signal<unknown>;
  readonly index: Signal.Signal<number>;
}

/**
 * Context for providing the hydration root element.
 */
export class HydrationRootCtx extends Context.Tag(
  "@effex/dom/HydrationRootCtx",
)<HydrationRootCtx, DOMElement>() {}

/**
 * Creates a fresh client-like control context for nested/forked contexts during hydration.
 * Used when fork() is called - nested control functions don't read from DOM.
 *
 * AnimationConfigCtx is read lazily inside addSlot/removeSlot at the moment
 * the effect runs, not captured at construction time — that way nested control
 * flow (e.g. `each` with `animate`) sees the config its parent provided.
 */
const createClientLikeControlCtx = (
  startInClientMode = false,
): IControlCtx<DOMElement> => {
  const slots = new Map<string, DOMSlotEntry>();
  let containerElement: DOMElement | null = null;
  // Captured when getContainer runs so finalizeContainer can pop the stack
  let capturedRenderer: Renderer<unknown> | null = null;
  // Tracks whether initial hydration sync is complete.
  // After finalizeContainer, future addSlot calls use DOMRenderer.
  // When startInClientMode is true, skip the hydration phase entirely.
  let hydrationDone = startInClientMode;

  const defaultContainer: Element.Element<DOMElement, never, never> =
    Effect.gen(function* () {
      const renderer = yield* RendererContext;
      capturedRenderer = renderer;
      const container = yield* renderer.createNode("div");
      yield* renderer.setStyleProperty(container, "display", "contents");
      return container as DOMElement;
    });

  const ctx: IControlCtx<DOMElement> = {
    // Propagate hydrationDone so nested control functions created after
    // hydration finishes start in client mode immediately.
    fork: () => Effect.succeed(createClientLikeControlCtx(hydrationDone)),

    defaultContainer,

    getContainer: <E, R>(
      create?: () => Element.Element<DOMElement, E, R>,
    ): Element.Element<DOMElement, E, R> =>
      Effect.gen(function* () {
        if (containerElement) return containerElement;
        // Capture renderer for finalizeContainer
        if (!capturedRenderer) {
          capturedRenderer = yield* RendererContext;
        }
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

        let element: DOMElement;

        if (!hydrationDone) {
          // During initial hydration: use the hydration renderer to walk
          // existing DOM and attach event handlers / reactive subscriptions.
          element = (yield* render({ item, index }).pipe(
            Effect.provideService(Scope.Scope, slotScope),
          )) as DOMElement;
          // Don't insert — content is already in the DOM
        } else {
          // After hydration: use DOMRenderer to create new DOM.
          // Provide a fresh client-mode ControlCtx so nested control flow
          // (each, matchOption, etc.) doesn't inherit the stale hydration root.
          const freshCtx = createClientLikeControlCtx(true);
          element = (yield* render({ item, index }).pipe(
            Effect.provideService(Scope.Scope, slotScope),
            Effect.provideService(
              RendererContext,
              DOMRenderer as unknown as Renderer<unknown>,
            ),
            Effect.provideService(ControlCtx, freshCtx as IControlCtx<unknown>),
          )) as DOMElement;

          if (containerElement) {
            const children = Array.from(containerElement.children);
            const targetIndex = addOptions?.atIndex ?? children.length;
            const refChild = children[targetIndex] ?? null;
            containerElement.insertBefore(element, refChild);
          }
        }

        const entry: DOMSlotEntry = {
          key,
          element,
          scope: slotScope,
          item,
          index,
        };
        slots.set(key, entry);

        if (hydrationDone) {
          yield* forkSlotEnter(element, slotScope);
        }

        return entry;
      }) as Effect.Effect<DOMSlotEntry, E, R>,

    finalizeContainer: () => {
      // Mark hydration as complete — future addSlot calls use DOMRenderer
      hydrationDone = true;
      // Pop the container from the hydration stack if the renderer supports it.
      // capturedRenderer was set when getContainer ran.
      if (containerElement && capturedRenderer) {
        return capturedRenderer.finalizeNode(containerElement);
      }
      return Effect.void;
    },

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
 * Creates a hydration control context that reads from existing DOM.
 * fork() returns a client-like context for nested control functions.
 *
 * AnimationConfigCtx is read lazily inside addSlot/removeSlot — see the
 * note on createClientLikeControlCtx for why.
 */
const createHydrationControlCtx = (
  containerElement: DOMElement,
): IControlCtx<DOMElement> => {
  const slots = new Map<string, DOMSlotEntry>();
  // Tracks whether the initial hydration pass is complete.
  // Once true, fork() returns client-mode contexts.
  let hydrationComplete = false;

  // Parse existing slots from DOM
  const children = Array.from(containerElement.children) as DOMElement[];
  for (const child of children) {
    const key = child.getAttribute("data-effex-key");
    if (key) {
      slots.set(key, {
        key,
        element: child,
        scope: null as unknown as Scope.CloseableScope,
        item: null as unknown as Signal.Signal<unknown>,
        index: null as unknown as Signal.Signal<number>,
      });
    }
  }

  const defaultContainer: Element.Element<DOMElement, never, never> =
    Effect.succeed(containerElement);

  const ctx: IControlCtx<DOMElement> = {
    // After hydration completes, nested control functions start in client mode
    fork: () => Effect.succeed(createClientLikeControlCtx(hydrationComplete)),

    defaultContainer,

    getContainer: <E, R>(
      _create?: () => Element.Element<DOMElement, E, R>,
    ): Element.Element<DOMElement, E, R> =>
      Effect.succeed(containerElement) as Element.Element<DOMElement, E, R>,

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
        const existing = slots.get(key);
        if (existing && existing.element) {
          const slotScope = yield* Scope.make();
          const item = yield* Signal.make(addOptions?.initialItem).pipe(
            Effect.provideService(Scope.Scope, slotScope),
          );
          const index = yield* Signal.make(addOptions?.initialIndex ?? 0).pipe(
            Effect.provideService(Scope.Scope, slotScope),
          );

          const entry: DOMSlotEntry = {
            key,
            element: existing.element,
            scope: slotScope,
            item,
            index,
          };
          slots.set(key, entry);
          return entry;
        }

        // No existing element, create new one (client fallback)
        hydrationComplete = true;
        const slotScope = yield* Scope.make();
        const item = yield* Signal.make(addOptions?.initialItem).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        );
        const index = yield* Signal.make(addOptions?.initialIndex ?? 0).pipe(
          Effect.provideService(Scope.Scope, slotScope),
        );

        const freshCtx = createClientLikeControlCtx(true);
        const element = (yield* render({ item, index }).pipe(
          Effect.provideService(Scope.Scope, slotScope),
          Effect.provideService(
            RendererContext,
            DOMRenderer as unknown as Renderer<unknown>,
          ),
          Effect.provideService(ControlCtx, freshCtx as IControlCtx<unknown>),
        )) as DOMElement;

        const containerChildren = Array.from(containerElement.children);
        const targetIndex = addOptions?.atIndex ?? containerChildren.length;
        const refChild = containerChildren[targetIndex] ?? null;
        containerElement.insertBefore(element, refChild);

        const entry: DOMSlotEntry = {
          key,
          element,
          scope: slotScope,
          item,
          index,
        };
        slots.set(key, entry);

        yield* forkSlotEnter(element, slotScope);

        return entry;
      }) as Effect.Effect<DOMSlotEntry, E, R>,

    // No-op — container was provided externally, not found via hydration walker
    finalizeContainer: () => Effect.void,

    removeSlot: (key: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const entry = slots.get(key);
        if (!entry) return;
        slots.delete(key);
        yield* forkSlotRemoval(entry, () => {
          if (entry.element.parentNode === containerElement) {
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
        if (!entry) return;

        const containerChildren = Array.from(containerElement.children);
        const currentIndex = containerChildren.indexOf(entry.element);

        if (currentIndex === toIndex) return;

        const refChild = containerChildren[toIndex] ?? null;
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
 * Hydration ControlCtx implementation.
 * Finds existing DOM and attaches handlers, then subscribes like client mode.
 *
 * AnimationConfigCtx is intentionally NOT read here — it would be captured
 * at Layer construction time (at the hydration root), before any `each`
 * gets a chance to provide it. Instead each addSlot/removeSlot reads the
 * service lazily, mirroring ClientControlCtx.
 */
export const HydrationControlCtx: Layer.Layer<
  ControlCtx,
  never,
  HydrationRootCtx
> = Layer.effect(
  ControlCtx,
  Effect.gen(function* () {
    const containerElement = yield* HydrationRootCtx;
    return createHydrationControlCtx(containerElement) as IControlCtx<unknown>;
  }),
);
