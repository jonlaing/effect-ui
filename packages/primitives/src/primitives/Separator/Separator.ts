import { Effect } from "effect";
import { Readable, $ } from "@effex/dom";
import type { Element } from "@effex/dom";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps {
  /**
   * Orientation of the separator.
   * @default "horizontal"
   */
  readonly orientation?: Readable.Reactive<SeparatorOrientation>;

  /**
   * Whether the separator is purely decorative.
   * When true, it will be hidden from screen readers.
   * @default true
   */
  readonly decorative?: boolean;

  /**
   * Additional class names for styling.
   */
  readonly class?: Readable.Reactive<string>;
}

/**
 * A semantic separator between content sections.
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Proper ARIA attributes (role="separator" when semantic)
 * - Decorative mode for purely visual separators
 *
 * @example
 * ```ts
 * // Horizontal separator (default)
 * Separator({})
 *
 * // Vertical separator
 * Separator({ orientation: "vertical" })
 *
 * // Semantic separator (announced by screen readers)
 * Separator({ decorative: false })
 *
 * // Styled with Tailwind
 * Separator({
 *   class: "shrink-0 bg-border h-[1px] w-full"
 * })
 *
 * // Vertical in a flex container
 * $.div({ class: "flex h-5 items-center space-x-4" }, [
 *   "Blog",
 *   Separator({ orientation: "vertical", class: "h-4 w-[1px] bg-border" }),
 *   "Docs",
 *   Separator({ orientation: "vertical", class: "h-4 w-[1px] bg-border" }),
 *   "Source"
 * ])
 * ```
 */
export const Separator = (props: SeparatorProps = {}): Element =>
  Effect.gen(function* () {
    const orientation = Readable.of(props.orientation ?? "horizontal");
    const decorative = props.decorative ?? true;

    return yield* $.div({
      role: decorative ? "none" : "separator",
      "aria-orientation": decorative ? undefined : orientation,
      class: props.class,
      "data-separator": "",
      "data-orientation": orientation,
    });
  });
