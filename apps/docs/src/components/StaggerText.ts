import { Effect } from "effect";

import { $, each, ListAnimationOptions, Readable } from "@stax-ui/dom";

export interface StaggerTextProps {
  /** The text to animate, one character at a time. */
  readonly text: string;
  animate?: ListAnimationOptions;
  readonly intro?: boolean;
  /** Optional class applied to the wrapping element. */
  readonly class?: string;
}

/**
 * Splits `text` into individual characters and applies `animation` to each,
 * staggered by `staggerMs` so they animate in sequence.
 *
 * The stagger is pure CSS (a per-character animation-delay), so it plays on the
 * first paint and works without JS / through hydration — no mount logic needed.
 * Each character is inline-block so transform-based animations apply, and spaces
 * become non-breaking spaces to keep word gaps between the inline-block chars.
 */
export const StaggerText = (props: StaggerTextProps) =>
  Effect.gen(function* () {
    const chars = Readable.of(
      props.text.split("").map((char, i) => ({ i, char })),
    );

    return yield* $.div(
      {
        class: ["inline-block relative", props.class ?? ""],
        "aria-label": props.text,
      },

      $.div({ class: ["opacity-0"] }, props.text),
      $.div(
        { class: ["absolute inset-0 flex"] },
        each(chars, {
          key: (item) => `${item.char}-${item.i}`,
          render: (item) =>
            $.div(
              {
                "aria-hidden": "true",
              },
              Readable.map(item, ({ char }) => char),
            ),
          animate: props.animate,
          intro: props.intro,
        }),
      ),
    );
  });
