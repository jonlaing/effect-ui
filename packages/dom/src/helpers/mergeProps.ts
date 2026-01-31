import { Effect } from "effect";

import * as Element from "../Element";
import { MergePropsCtx } from "../Element";

/**
 * Merge props into a child element via MergePropsCtx.
 * Used by primitives implementing the `asChild` pattern.
 *
 * The child element will receive the merged props, with its own
 * explicit props taking precedence over the injected ones.
 *
 * @param props - Props to inject into the child element
 * @param child - The child element to receive the props
 * @returns The child element with merged props
 *
 * @example
 * ```ts
 * // In a primitive component with asChild support
 * const itemProps = {
 *   role: "menuitem",
 *   tabIndex: 0,
 *   onClick: handleClick,
 * };
 *
 * if (props.asChild && Effect.isEffect(children)) {
 *   return yield* mergeProps(itemProps, children);
 * }
 *
 * return yield* $.button(itemProps, children);
 * ```
 */
export const mergeProps = <A extends HTMLElement | SVGElement, E, R>(
  props: Record<string, unknown>,
  child: Element.Element<A, E, R>,
): Element.Element<A, E, R> =>
  Effect.provideService(child, MergePropsCtx, props);
