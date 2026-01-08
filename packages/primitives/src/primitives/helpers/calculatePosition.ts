import { Match } from "effect";

/**
 * Calculate position for floating content relative to an anchor element.
 */
export function calculatePosition(
  anchorRect: DOMRect,
  side: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  sideOffset: number,
  alignOffset: number,
): { top: number; left: number } {
  const isVertical = side === "top" || side === "bottom";

  const top = isVertical
    ? Match.value(side).pipe(
        Match.when("top", () => anchorRect.top - sideOffset),
        Match.orElse(() => anchorRect.bottom + sideOffset),
      )
    : Match.value(align).pipe(
        Match.when("start", () => anchorRect.top + alignOffset),
        Match.when(
          "center",
          () => anchorRect.top + anchorRect.height / 2 + alignOffset,
        ),
        Match.orElse(() => anchorRect.bottom + alignOffset),
      );

  const left = isVertical
    ? Match.value(align).pipe(
        Match.when("start", () => anchorRect.left + alignOffset),
        Match.when(
          "center",
          () => anchorRect.left + anchorRect.width / 2 + alignOffset,
        ),
        Match.orElse(() => anchorRect.right + alignOffset),
      )
    : Match.value(side).pipe(
        Match.when("left", () => anchorRect.left - sideOffset),
        Match.orElse(() => anchorRect.right + sideOffset),
      );

  return { top, left };
}
