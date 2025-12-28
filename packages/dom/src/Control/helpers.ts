import { Effect } from "effect";
import type { RendererInterface } from "@effex/core";

/**
 * Helper to create the default container (div with display: contents)
 */
export const createDefaultContainer = (
  renderer: RendererInterface<Node>,
): Effect.Effect<HTMLElement> =>
  Effect.gen(function* () {
    const container = yield* renderer.createNode("div");
    yield* renderer.setStyleProperty(container, "display", "contents");
    return container as HTMLElement;
  });

/**
 * Add hydration markers to a container element during SSR.
 */
export const addHydrationMarkers = (
  renderer: RendererInterface<Node>,
  container: HTMLElement,
  type: "when" | "match" | "each",
  id: string,
  metadata?: Record<string, string>,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* renderer.setAttribute(container, "data-effex-id", id);
    yield* renderer.setAttribute(container, "data-effex-type", type);
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        yield* renderer.setAttribute(container, `data-effex-${key}`, value);
      }
    }
  });

/**
 * Add hydration key to a list item element during SSR.
 */
export const addItemHydrationKey = (
  renderer: RendererInterface<Node>,
  element: HTMLElement,
  key: string,
): Effect.Effect<void> => renderer.setAttribute(element, "data-effex-key", key);
