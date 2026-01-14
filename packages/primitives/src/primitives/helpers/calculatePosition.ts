import { Match } from "effect";

/**
 * Calculate position for floating content relative to an anchor element.
 *
 * When contentWidth/contentHeight are provided, calculates final pixel position
 * without needing CSS transform. When omitted, calculates anchor-relative position
 * that requires transform for alignment.
 */
export function calculatePosition(
  anchorRect: DOMRect,
  side: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  sideOffset: number,
  alignOffset: number,
  contentWidth?: number,
  contentHeight?: number,
): { top: number; left: number } {
  const isVertical = side === "top" || side === "bottom";
  const hasContentDimensions =
    contentWidth !== undefined &&
    contentHeight !== undefined &&
    contentWidth > 0 &&
    contentHeight > 0;

  let top: number;
  let left: number;

  if (isVertical) {
    // Vertical sides (top/bottom): calculate top based on side, left based on align
    if (side === "top") {
      top = hasContentDimensions
        ? anchorRect.top - sideOffset - contentHeight
        : anchorRect.top - sideOffset;
    } else {
      top = anchorRect.bottom + sideOffset;
    }

    left = Match.value(align).pipe(
      Match.when("start", () => anchorRect.left + alignOffset),
      Match.when("center", () =>
        hasContentDimensions
          ? anchorRect.left +
            anchorRect.width / 2 -
            contentWidth / 2 +
            alignOffset
          : anchorRect.left + anchorRect.width / 2 + alignOffset,
      ),
      Match.orElse(() =>
        hasContentDimensions
          ? anchorRect.right - contentWidth + alignOffset
          : anchorRect.right + alignOffset,
      ),
    );
  } else {
    // Horizontal sides (left/right): calculate left based on side, top based on align
    if (side === "left") {
      left = hasContentDimensions
        ? anchorRect.left - sideOffset - contentWidth
        : anchorRect.left - sideOffset;
    } else {
      left = anchorRect.right + sideOffset;
    }

    top = Match.value(align).pipe(
      Match.when("start", () => anchorRect.top + alignOffset),
      Match.when("center", () =>
        hasContentDimensions
          ? anchorRect.top +
            anchorRect.height / 2 -
            contentHeight / 2 +
            alignOffset
          : anchorRect.top + anchorRect.height / 2 + alignOffset,
      ),
      Match.orElse(() =>
        hasContentDimensions
          ? anchorRect.bottom - contentHeight + alignOffset
          : anchorRect.bottom + alignOffset,
      ),
    );
  }

  return { top, left };
}
