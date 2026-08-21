import { $, AnimationGroup, stagger } from "@stax-ui/dom";

import aDark from "../assets/stax-logo-dark/a.svg?raw";
import iconDark from "../assets/stax-logo-dark/icon.svg?raw";
import sDark from "../assets/stax-logo-dark/s.svg?raw";
import tDark from "../assets/stax-logo-dark/t.svg?raw";
import xDark from "../assets/stax-logo-dark/x.svg?raw";
import aLight from "../assets/stax-logo-light/a.svg?raw";
import iconLight from "../assets/stax-logo-light/icon.svg?raw";
import sLight from "../assets/stax-logo-light/s.svg?raw";
import tLight from "../assets/stax-logo-light/t.svg?raw";
import xLight from "../assets/stax-logo-light/x.svg?raw";
import { StaggerElements } from "./StaggerElements.js";

export interface StaxLogoProps {
  readonly class?: string;
  readonly group?: AnimationGroup;
  readonly intro?: boolean;
}

/**
 * Animated Stax logo — each of the 5 SVG pieces (icon + S + T + A + X)
 * hops in with a 100ms stagger, assembling the full mark piece by piece.
 *
 * All 5 SVGs share the original 333×104 viewBox, so absolutely
 * positioning them inside a relative container overlays them at the
 * same coordinates and reproduces the composed logo pixel-for-pixel.
 * The wrapper's own aspect-ratio pins the layout height without needing
 * an explicit size on every consumer.
 */
export const StaxLogo = (props: StaxLogoProps = {}) => {
  // Each piece stacks BOTH themes' SVGs at the same absolute origin;
  // CSS in styles.css hides whichever doesn't match the active
  // `[data-theme]`. No signal wiring, no hydration flash — the same
  // pattern used by ThemeToggle for its Sun/Moon swap.
  const pieces = [
    [iconDark, iconLight],
    [sDark, sLight],
    [tDark, tLight],
    [aDark, aLight],
    [xDark, xLight],
  ].map(([dark, light]) =>
    $.div(
      $.div({
        class:
          "stax-logo-dark absolute top-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:drop-shadow-md/50",
        innerHTML: dark,
      }),
      $.div({
        class:
          "stax-logo-light absolute top-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:drop-shadow-md/50",
        innerHTML: light,
      }),
    ),
  );

  return $.div(
    {
      class: ["relative w-[333px] h-[104px]", props.class ?? ""],
      "aria-label": "Stax",
    },
    StaggerElements({
      items: pieces,
      animate: {
        enterFrom: "opacity-0 hidden",
        enter: "opacity-100 block",
        enterTo: "block animate-hop-in",
        stagger: stagger(100),
        group: props.group,
      },
      intro: props.intro,
    }),
  );
};
