import { Effect } from "effect";
import { Moon, Sun } from "lucide-static";

import { $ } from "@stax-ui/dom";

const STORAGE_KEY = "stax-theme";
const DARK = "night";
const LIGHT = "cmyk";

/**
 * Two-icon theme toggle. Both icons render into the DOM; CSS in
 * styles.css (`.theme-icon-sun` / `.theme-icon-moon`) hides the wrong
 * one based on `<html data-theme>`. This keeps the button SSR-safe —
 * no hydration mismatch when the pre-paint script (in entry.ts) has
 * already flipped `data-theme` to match the user's preference before
 * the client bundle arrives.
 */
export const ThemeToggle = () =>
  $.button(
    {
      class: "btn btn-ghost btn-sm btn-square",
      "aria-label": "Toggle theme",
      onClick: () =>
        Effect.sync(() => {
          const html = document.documentElement;
          const next = html.getAttribute("data-theme") === DARK ? LIGHT : DARK;
          html.setAttribute("data-theme", next);
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {}
        }),
    },
    $.span({
      class: "theme-icon-sun [&_svg]:w-4 [&_svg]:h-4",
      innerHTML: Sun,
    }),
    $.span({
      class: "theme-icon-moon [&_svg]:w-4 [&_svg]:h-4",
      innerHTML: Moon,
    }),
  );
