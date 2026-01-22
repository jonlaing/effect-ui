import { Effect } from "effect";
import type { YieldWrap } from "effect/Utils";

import {
  Element,
  type Child,
  type InferChildArray,
  type InferChildren,
  type InferError,
  type InferRequirements,
} from "./Element";

/**
 * Create a component using a generator function.
 * Props are passed as the first argument, optional children as the second.
 * Error and requirement types are inferred from yielded effects.
 *
 * @example
 * ```ts
 * const Button = Component.gen(function* (props: ButtonProps, children) {
 *   const handleClick = () => Effect.log("clicked");
 *   return yield* $.button({ onClick: handleClick }, children ?? []);
 * });
 *
 * // With context requirements (automatically inferred)
 * const MenuItem = Component.gen(function* (props: MenuItemProps) {
 *   const ctx = yield* MenuCtx;  // Adds MenuCtx to requirements
 *   return yield* $.button({ class: props.class }, []);
 * });
 *
 * // No props component
 * const Divider = Component.gen(function* () {
 *   return yield* $.hr({ class: "divider" });
 * });
 * ```
 */
const gen =
  <
    Props,
    A extends HTMLElement,
    Eff extends YieldWrap<Effect.Effect<any, any, any>>,
    C extends Child<any, any> | readonly Child<any, any>[],
  >(
    body: (
      props: Props,
      children?: InferChildren<C>,
    ) => Generator<Eff, A, never>,
  ) =>
  (
    props: Props,
    children?: InferChildren<C>,
  ): Element.Element<InferError<Eff>, InferRequirements<Eff>> =>
    Effect.gen(() => body(props, children));

const isChildArray = <C extends Child<any, any> | readonly Child<any, any>[]>(
  value: unknown,
): value is InferChildArray<C> => {
  return Array.isArray(value);
};

/**
 * Normalize children to always be an array.
 * Handles undefined, single child, or array of children.
 *
 * @example
 * ```ts
 * const MyComponent = Component.gen(function* (props, children) {
 *   const childArray = Component.normalizeChildren(children);
 *   // childArray is always T[]
 * });
 * ```
 */
const normalizeChildren = <
  C extends Child<any, any> | readonly Child<any, any>[],
>(
  children: C | undefined,
): InferChildArray<C> => {
  if (isChildArray(children)) {
    return children as unknown as InferChildArray<C>;
  }

  return (children != null ? [children] : []) as unknown as InferChildArray<C>;
};

export const Component = { gen, normalizeChildren } as const;
