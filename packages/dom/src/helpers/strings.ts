/**
 * Convert camelCase to kebab-case.
 * Used for CSS property names since style.setProperty requires kebab-case.
 *
 * @example
 * ```ts
 * toKebabCase("backgroundColor") // "background-color"
 * toKebabCase("fontSize") // "font-size"
 * toKebabCase("color") // "color" (unchanged)
 * ```
 */
export const toKebabCase = (str: string): string =>
  str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * Convert kebab-case to camelCase.
 *
 * @example
 * ```ts
 * toCamelCase("background-color") // "backgroundColor"
 * toCamelCase("font-size") // "fontSize"
 * toCamelCase("color") // "color" (unchanged)
 * ```
 */
export const toCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
