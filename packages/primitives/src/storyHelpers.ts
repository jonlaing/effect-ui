import { Effect } from "effect";
import type { Element } from "@effex/dom";
import { DOMRendererLive } from "@effex/dom";

/**
 * Render an Effect UI component for Storybook.
 * Creates a scoped container and mounts the component.
 *
 * IMPORTANT: Uses Effect.runFork with Effect.never to keep the scope alive,
 * allowing reactive subscriptions (Signals, Reactions, when/each) to work.
 */
export const renderEffect = <E>(element: Element<E, never>): HTMLElement => {
  const container = document.createElement("div");

  const program = Effect.gen(function* () {
    const el = yield* element;
    container.appendChild(el);
    // Keep scope alive for reactivity - without this, all subscriptions die
    yield* Effect.never;
  });

  // Fork the effect so it runs in background with scope kept open
  Effect.runFork(Effect.scoped(program).pipe(Effect.provide(DOMRendererLive)));

  return container;
};

/**
 * Async version of renderEffect that waits for the element to be created.
 * Use this when you need to ensure the element is fully rendered.
 *
 * IMPORTANT: Uses Effect.runFork with Effect.never to keep the scope alive,
 * allowing reactive subscriptions (Signals, Reactions, when/each) to work.
 */
export const renderEffectAsync = async <E>(
  element: Element<E, never>,
): Promise<HTMLElement> => {
  const container = document.createElement("div");

  // Use a native Promise to signal when rendering is complete
  let resolveReady: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  const program = Effect.gen(function* () {
    const el = yield* element;
    container.appendChild(el);
    resolveReady();
    // Keep scope alive for reactivity
    yield* Effect.never;
  });

  // Fork the effect so it runs in background with scope kept open
  Effect.runFork(Effect.scoped(program).pipe(Effect.provide(DOMRendererLive)));

  // Wait for the element to be appended
  await ready;

  return container;
};
