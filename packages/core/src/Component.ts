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
 * Renderers (like @effex/dom) re-export these with their node type fixed.
 *
 * Use `Component.gen` to create components with automatic type inference.
 */
// Runtime value to allow namespace member access with verbatimModuleSyntax
// eslint-disable-next-line @typescript-eslint/no-namespace
export const Component = {} as const;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Component {
  /**
   * Component with props and optional children.
   * This is the return type of Component.gen.
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
}
