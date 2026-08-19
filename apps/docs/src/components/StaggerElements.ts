import { Effect } from "effect";

import { $, each, Element, ListAnimationOptions, Readable } from "@stax-ui/dom";

export interface StaggerElementsProps<
  A extends HTMLElement | SVGElement,
  E,
  R,
> {
  /** The elements to render, one per staggered slot. */
  readonly items: readonly Element.Element<A, E, R>[];
  animate?: ListAnimationOptions;
  readonly intro?: boolean;
  /** Optional class applied to the wrapping element. */
  readonly class?: string;
}

/**
 * Generic version of `StaggerText`. Instead of splitting a string into
 * characters, this takes an array of pre-built Elements (SVGs, icons,
 * whatever) and animates each into place through `each` — same stagger
 * / animation machinery, different item type.
 *
 * Positioning of the items is the caller's responsibility (they're
 * rendered in a bare wrapper div; use absolute-inset children if you
 * want them to overlay, or flex/grid children if you want them in a
 * row).
 */
export const StaggerElements = <A extends HTMLElement | SVGElement, E, R>(
  props: StaggerElementsProps<A, E, R>,
) =>
  Effect.gen(function* () {
    // Wrap items with their index so `each` has a stable key. The
    // element itself is opaque — we just yield it from render.
    const items = Readable.of(props.items.map((el, i) => ({ i, el })));

    return yield* $.div(
      { class: [props.class ?? ""] },
      each(items, {
        key: (item) => `item-${item.i}`,
        render: (item) =>
          Effect.gen(function* () {
            const { el } = yield* item.get;
            return yield* el;
          }),
        animate: props.animate,
        intro: props.intro,
      }),
    );
  });
