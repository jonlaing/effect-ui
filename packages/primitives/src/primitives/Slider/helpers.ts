/**
 * Helper functions for Slider calculations.
 */

export type SliderOrientation = "horizontal" | "vertical";

/**
 * Slider value type - single number or tuple for range mode.
 */
export type SliderValue = number | readonly [number, number];

/**
 * Type guard to check if value is range mode (two thumbs).
 */
export const isRangeValue = (
  value: SliderValue,
): value is readonly [number, number] => Array.isArray(value);

/**
 * Clamp value to min/max and snap to step.
 */
export const clampAndSnap = (
  value: number,
  min: number,
  max: number,
  step: number,
): number => {
  const snapped = Math.round((value - min) / step) * step + min;
  return Math.max(min, Math.min(max, snapped));
};

/**
 * Convert a value to percentage (0-100) within a range.
 */
export const valueToPercent = (
  value: number,
  min: number,
  max: number,
): number => {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
};

/**
 * Enforce minimum gap between thumbs in range mode.
 * Returns adjusted range if thumbs would cross.
 */
export const enforceRange = (
  range: readonly [number, number],
  movedThumb: number,
  minGap: number,
): readonly [number, number] => {
  const [minVal, maxVal] = range;

  if (minVal > maxVal - minGap) {
    if (movedThumb === 0) {
      return [Math.min(minVal, maxVal - minGap), maxVal];
    }
    return [minVal, Math.max(maxVal, minVal + minGap)];
  }
  return range;
};

/**
 * Calculates the CSS style for positioning the range fill element.
 *
 * @param orientation - "horizontal" or "vertical"
 * @param inverted - Whether the slider direction is inverted
 * @param startPercent - Start position as percentage (0-100)
 * @param endPercent - End position as percentage (0-100)
 * @returns CSS style object for absolute positioning
 */
export const getRangeStyle = (
  orientation: SliderOrientation,
  inverted: boolean,
  startPercent: number,
  endPercent: number,
): Record<string, string> => {
  const start = `${startPercent}%`;
  const end = `${100 - endPercent}%`;

  if (orientation === "horizontal") {
    return {
      position: "absolute",
      [inverted ? "right" : "left"]: start,
      [inverted ? "left" : "right"]: end,
      top: "0",
      bottom: "0",
    };
  }

  // Vertical
  return {
    position: "absolute",
    [inverted ? "top" : "bottom"]: start,
    [inverted ? "bottom" : "top"]: end,
    left: "0",
    right: "0",
  };
};

/**
 * Calculates the CSS style for positioning a thumb element.
 *
 * @param orientation - "horizontal" or "vertical"
 * @param inverted - Whether the slider direction is inverted
 * @param percent - Position as percentage (0-100)
 * @returns CSS style object for absolute positioning with touch-action
 */
export const getThumbStyle = (
  orientation: SliderOrientation,
  inverted: boolean,
  percent: number,
): Record<string, string> => {
  const position = inverted ? 100 - percent : percent;

  if (orientation === "horizontal") {
    return {
      position: "absolute",
      left: `${position}%`,
      top: "50%",
      transform: "translate(-50%, -50%)",
      touchAction: "none",
    };
  }

  // Vertical
  return {
    position: "absolute",
    bottom: `${position}%`,
    left: "50%",
    transform: "translate(-50%, 50%)",
    touchAction: "none",
  };
};
