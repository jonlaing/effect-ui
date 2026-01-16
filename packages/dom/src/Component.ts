import { Effect } from "effect";
import type { YieldWrap } from "effect/Utils";

import {
  Component as CoreComponent,
  type Children as CoreChildren,
} from "@effex/core";

/**
 * Valid children types for a DOM component.
 * This is the DOM-specific version with HTMLElement as the node type.
 */
export type Children<E = never, R = never> = CoreChildren<HTMLElement, E, R>;

// Helper types for gen function
type InferError<Eff> = [Eff] extends [never]
  ? never
  : [Eff] extends [YieldWrap<Effect.Effect<infer _A, infer E, infer _R>>]
    ? E
    : never;

type InferRequirements<Eff> = [Eff] extends [never]
  ? never
  : [Eff] extends [YieldWrap<Effect.Effect<infer _A, infer _E, infer R>>]
    ? R
    : never;

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
const gen: <
  Props,
  Eff extends YieldWrap<Effect.Effect<any, any, any>>,
  CEff extends YieldWrap<Effect.Effect<any, any, any>>,
  A extends HTMLElement = HTMLElement,
>(
  body: (
    props: Props,
    children?: Children<InferError<CEff>, InferRequirements<CEff>>,
  ) => Generator<Eff, A, never>,
) => Component.Node<
  Props,
  InferRequirements<CEff>,
  InferRequirements<Eff>,
  InferError<CEff>,
  InferError<Eff>
> = (body) => (props, children) => Effect.gen(() => body(props, children));

// Runtime value to allow namespace member access with verbatimModuleSyntax
// eslint-disable-next-line @typescript-eslint/no-namespace
export const Component = { gen } as const;

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
  export type Node<
    Props,
    ChildReqs = never,
    ComponentReqs = ChildReqs,
    ChildError = never,
    ComponentError = ChildError,
  > = CoreComponent.Node<
    HTMLElement,
    Props,
    ChildReqs,
    ComponentReqs,
    ChildError,
    ComponentError
  >;
}
