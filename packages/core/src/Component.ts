import type { Child, Element } from "./Element";

/**
 * Valid children types for a component.
 *
 * @template N - Node type (e.g., HTMLElement for DOM)
 * @template E - Error type
 * @template R - Context requirements
 */
export type Children<N = unknown, E = never, R = never> =
  | Child<N, E, R>
  | readonly Child<N, E, R>[];

/**
 * Generic component type helpers for annotating component function signatures.
 * These are the base types that renderers build upon.
 *
 * Uses tree terminology:
 * - Unit: No props, no children (constant element)
 * - Leaf: Props, no children (terminal node)
 * - Node: Props, optional children (generic - could be leaf or branch)
 * - Branch: Props, required children (internal node)
 *
 * Renderers (like @effex/dom) re-export these with their node type fixed:
 * ```ts
 * // In @effex/dom
 * export type Unit<R, E> = CoreComponent.Unit<HTMLElement, R, E>
 * ```
 */
// Runtime value to allow namespace member access with verbatimModuleSyntax
// eslint-disable-next-line @typescript-eslint/no-namespace
export const Component = {} as const;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Component {
  /**
   * Component with no props and no children.
   *
   * @template N - Node type (e.g., HTMLElement for DOM)
   * @template R - Context requirements
   * @template E - Error type
   */
  export type Unit<N, R = never, E = never> = () => Element<N, E, R>;

  /**
   * Component with props but no children.
   *
   * @template N - Node type (e.g., HTMLElement for DOM)
   * @template Props - Props type
   * @template R - Context requirements
   * @template E - Error type
   */
  export type Leaf<N, Props, R = never, E = never> = (
    props: Props,
  ) => Element<N, E, R>;

  /**
   * Component with props and optional children.
   *
   * @template N - Node type (e.g., HTMLElement for DOM)
   * @template Props - Props type
   * @template ChildReqs - Context requirements for children
   * @template ComponentReqs - Context requirements for the component
   * @template ChildError - Error type from children
   * @template ComponentError - Error type from the component
   */
  export type Node<
    N,
    Props,
    ChildReqs = never,
    ComponentReqs = ChildReqs,
    ChildError = never,
    ComponentError = ChildError,
  > = (
    props: Props,
    children?: Children<N, ChildError, ChildReqs>,
  ) => Element<N, ComponentError, ComponentReqs>;

  /**
   * Component with props and required children.
   *
   * @template N - Node type (e.g., HTMLElement for DOM)
   * @template Props - Props type
   * @template ChildReqs - Context requirements for children
   * @template ComponentReqs - Context requirements for the component
   * @template ChildError - Error type from children
   * @template ComponentError - Error type from the component
   */
  export type Branch<
    N,
    Props,
    ChildReqs = never,
    ComponentReqs = ChildReqs,
    ChildError = never,
    ComponentError = ChildError,
  > = (
    props: Props,
    children: Children<N, ChildError, ChildReqs>,
  ) => Element<N, ComponentError, ComponentReqs>;
}
