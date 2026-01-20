import { Match } from "effect";

/**
 * Calculate transform value for positioning and alignment.
 * Handles both:
 * 1. Side positioning - for top/left, shift by 100% so content doesn't cover trigger
 * 2. Alignment - center or end alignment along the cross axis
 */
export function getTransform(
  side: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
): string {
  const isVertical = side === "top" || side === "bottom";

  const getAlignTranslate = () =>
    Match.value(align).pipe(
      Match.when("center", () => "-50%"),
      Match.when("end", () => "-100%"),
      Match.orElse(() => "0"),
    );

  const getHorizontalX = () => (side === "left" ? "-100%" : "0");
  const getVerticalY = () => (side === "top" ? "-100%" : "0");

  // For vertical sides (top/bottom): translateX is based on align
  // For horizontal sides (left/right): translateX is -100% for left, 0 for right
  const translateX = isVertical ? getAlignTranslate() : getHorizontalX();

  // For vertical sides (top/bottom): translateY is -100% for top, 0 for bottom
  // For horizontal sides (left/right): translateY is based on align
  const translateY = isVertical ? getVerticalY() : getAlignTranslate();

  if (translateX === "0" && translateY === "0") {
    return "none";
  }

  return `translate(${translateX}, ${translateY})`;
}
