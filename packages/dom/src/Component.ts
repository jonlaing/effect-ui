import { Effect } from "effect";
import type { YieldWrap } from "effect/Utils";

import { Readable } from "@effex/core";

import { Element } from "./Element";

export type Child<E = never, R = never> =
  | string
  | number
  | Element.Element<E, R>
  | Readable.Readable<string>
  | Readable.Readable<number>;

/**
 * Valid children types for a DOM component.
 * This is the DOM-specific version with HTMLElement as the node type.
 */
export type Children<E = never, R = never> =
  | Child<E, R>
  | readonly Child<E, R>[];

// Helper types for gen function
// type InferError<Eff> = [Eff] extends [never]
//   ? never
//   : [Eff] extends [YieldWrap<Effect.Effect<infer _A, infer E, infer _R>>]
//     ? E
//     : never;

// type InferRequirements<Eff> = [Eff] extends [never]
//   ? never
//   : [Eff] extends [YieldWrap<Effect.Effect<infer _A, infer _E, infer R>>]
//     ? R
//     : never;

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
  >(
    body: (
      props: Props,
      children?: Children<any, any>,
    ) => Generator<Eff, A, never>,
  ) =>
  <C extends Child<any, any> | readonly Child<any, any>[]>(
    props: Props,
    children?: C,
  ): Effect.Effect<
    A,
    [Eff] extends [never]
      ? never
      : [Eff] extends [YieldWrap<Effect.Effect<infer _A, infer E, infer _R>>]
        ? E
        : never,
    [Eff] extends [never]
      ? never
      : [Eff] extends [YieldWrap<Effect.Effect<infer _A, infer _E, infer R>>]
        ? R
        : never
  > =>
    Effect.gen(() => body(props, children));

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
const normalizeChildren = <T extends Children<any, any>>(
  children: T | readonly T[] | undefined,
): readonly Element.Element<never, never>[] => {
  if (Array.isArray(children)) return children;
  return children != null ? [children as Element.Element<never, never>] : [];
};

// Runtime value to allow namespace member access with verbatimModuleSyntax
// eslint-disable-next-line @typescript-eslint/no-namespace
export const Component = { gen, normalizeChildren } as const;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Component {
  /**
   * Component with props and optional children.
   * This is the return type of Component.gen.
   *
   * In most cases, you should use `Component.gen` instead of annotating
   * with this type directly - types are automatically inferred.
   *
   * @template Props - Props type accepted by the component
   * @template ChildReqs - Context requirements for children (defaults to never)
   * @template ComponentReqs - Context requirements for the component's return type
   * @template ChildError - Error type from children (defaults to never)
   * @template ComponentError - Error type from the component (defaults to ChildError)
   */
  export type Node<Props, ComponentError = never, ComponentReqs = never> = <
    ChildError = never,
    ChildReqs = never,
  >(
    props: Props,
    children?: Children<ChildError, ChildReqs>,
  ) => Element.Element<ComponentError | ChildError, ComponentReqs | ChildReqs>;
}
