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

  let translateX = "0";
  let translateY = "0";

  // Handle side positioning - top/left need to shift by their own dimensions
  if (side === "top") {
    translateY = "-100%";
  } else if (side === "left") {
    translateX = "-100%";
  }

  // Handle alignment on the cross axis
  if (isVertical) {
    // Horizontal alignment for top/bottom sides
    switch (align) {
      case "center":
        translateX = "-50%";
        break;
      case "end":
        translateX = "-100%";
        break;
    }
  } else {
    // Vertical alignment for left/right sides
    switch (align) {
      case "center":
        translateY = "-50%";
        break;
      case "end":
        translateY = "-100%";
        break;
    }
  }

  if (translateX === "0" && translateY === "0") {
    return "none";
  }

  return `translate(${translateX}, ${translateY})`;
}

/**
 * Calculate position for popover content relative to an anchor element.
 */
export function calculatePosition(
  anchorRect: DOMRect,
  side: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  sideOffset: number,
  alignOffset: number,
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  // Calculate main axis position
  switch (side) {
    case "top":
      top = anchorRect.top - sideOffset;
      break;
    case "bottom":
      top = anchorRect.bottom + sideOffset;
      break;
    case "left":
      left = anchorRect.left - sideOffset;
      break;
    case "right":
      left = anchorRect.right + sideOffset;
      break;
  }

  // Calculate cross axis alignment
  if (side === "top" || side === "bottom") {
    switch (align) {
      case "start":
        left = anchorRect.left + alignOffset;
        break;
      case "center":
        left = anchorRect.left + anchorRect.width / 2 + alignOffset;
        break;
      case "end":
        left = anchorRect.right + alignOffset;
        break;
    }
  } else {
    // left/right sides
    switch (align) {
      case "start":
        top = anchorRect.top + alignOffset;
        break;
      case "center":
        top = anchorRect.top + anchorRect.height / 2 + alignOffset;
        break;
      case "end":
        top = anchorRect.bottom + alignOffset;
        break;
    }
  }

  return { top, left };
}
