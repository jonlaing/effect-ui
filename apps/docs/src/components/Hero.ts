import { $ } from "@stax-ui/dom";

import { StaxLogo } from "./StaxLogo.js";
import { TerminalCommand } from "./TerminalCommand.js";

/**
 * Full-width hero panel — centered logo above a one-liner install
 * command, framed by the repeating pattern texture defined in
 * `.hero-pattern` (light / dark PNGs swap with the theme).
 *
 * Height maxes out around 400px so the hero doesn't dominate on
 * short viewports; content stays centered when the pattern extends
 * beyond it.
 */
export const Hero = () =>
  $.div(
    {
      class: [
        "overflow-hidden aspect-square md:aspect-2/1 lg:aspect-3/1",
        "flex flex-col items-center justify-center gap-8",
        "px-8 py-16 relative [&_*]:z-10",
      ],
    },
    $.div({ class: "hero-bg z-0" }),
    StaxLogo({
      class:
        "scale-50 md:scale-75 lg:scale-100 md:-translate-y-8 lg:translate-y-0",
      intro: true,
    }),
    TerminalCommand("pnpm create stax-ui my-app"),
  );
