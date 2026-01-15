import {
  Component as CoreComponent,
  type Children as CoreChildren,
} from "@effex/core";

/**
 * Valid children types for a DOM component.
 * This is the DOM-specific version with HTMLElement as the node type.
 */
export type Children<E = never, R = never> = CoreChildren<HTMLElement, E, R>;

/**
 * DOM-specific component type helpers.
 * These are the core Component types with HTMLElement baked in as the node type.
 *
 * Uses tree terminology:
 * - Unit: No props, no children (constant element)
 * - Leaf: Props, no children (terminal node)
 * - Node: Props, optional children (generic - could be leaf or branch)
 * - Branch: Props, required children (internal node)
 *
 * @example
 * ```ts
 * // Unit - no props, no children
 * const Divider: Component.Unit = () => $.hr();
 *
 * // Leaf - props, no children
 * const Img: Component.Leaf<ImageProps, ImageCtx> = (props) =>
 *   Effect.gen(function* () {
 *     const ctx = yield* ImageCtx;
 *     return yield* $.img({ src: props.src, alt: props.alt });
 *   });
 *
 * // Node - props, optional children (most flexible)
 * const Item: Component.Node<ItemProps, MenuCtx> = (props, children) =>
 *   Effect.gen(function* () {
 *     const ctx = yield* MenuCtx;
 *     return yield* $.div({ class: props.class }, children ?? []);
 *   });
 *
 * // Branch - props, required children (provider/container)
 * const Root: Component.Branch<RootProps, MenuCtx, never> = (props, children) =>
 *   Effect.gen(function* () {
 *     const ctx = { ... };
 *     return yield* $.div({}, provide(MenuCtx, ctx, children));
 *   });
 * ```
 */
// Runtime value to allow namespace member access with verbatimModuleSyntax
// eslint-disable-next-line @typescript-eslint/no-namespace
export const Component = {} as const;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Component {
  /**
   * Component with no props and no children.
   * Returns a constant element.
   *
   * @template R - Context requirements of the component
   * @template E - Error type (defaults to never)
   *
   * @example
   * ```ts
   * const Divider: Component.Unit = () => $.hr({ class: "divider" });
   * const Spacer: Component.Unit<LayoutCtx> = () =>
   *   Effect.gen(function* () {
   *     const ctx = yield* LayoutCtx;
   *     return yield* $.div({ style: { height: ctx.spacing } });
   *   });
   * ```
   */
  export type Unit<R = never, E = never> = CoreComponent.Unit<
    HTMLElement,
    R,
    E
  >;

  /**
   * Component with props but no children.
   * Terminal node in the component tree.
   *
   * @template Props - Props type accepted by the component
   * @template R - Context requirements of the component
   * @template E - Error type (defaults to never)
   *
   * @example
   * ```ts
   * const Img: Component.Leaf<ImageImgProps, ImageCtx> = (props) =>
   *   Effect.gen(function* () {
   *     const ctx = yield* ImageCtx;
   *     return yield* $.img({ src: props.src, alt: props.alt });
   *   });
   *
   * const Indicator: Component.Leaf<IndicatorProps, MenuCtx> = (props) =>
   *   Effect.gen(function* () {
   *     return yield* $.div({ class: props.class, "data-indicator": "" });
   *   });
   * ```
   */
  export type Leaf<Props, R = never, E = never> = CoreComponent.Leaf<
    HTMLElement,
    Props,
    R,
    E
  >;

  /**
   * Component with props and optional children.
   * The generic case - could act as a leaf or branch depending on usage.
   * Use this for components that support the asChild pattern or where
   * children are genuinely optional.
   *
   * @template Props - Props type accepted by the component
   * @template ChildReqs - Context requirements for children (defaults to never)
   * @template ComponentReqs - Context requirements for the component's return type
   *                           (defaults to ChildReqs)
   * @template ChildError - Error type from children (defaults to never)
   * @template ComponentError - Error type from the component (defaults to ChildError)
   *
   * @example
   * ```ts
   * // Consumer component with optional children
   * const Item: Component.Node<ItemProps, MenuCtx> = (props, children) =>
   *   Effect.gen(function* () {
   *     const ctx = yield* MenuCtx;
   *     return yield* $.button({ class: props.class }, children ?? []);
   *   });
   *
   * // Component supporting asChild pattern
   * const Trigger: Component.Node<TriggerProps, MenuCtx> = (props, children) =>
   *   Effect.gen(function* () {
   *     if (props.asChild && children) {
   *       return yield* mergeProps(triggerProps, children);
   *     }
   *     return yield* $.button(triggerProps, children ?? []);
   *   });
   * ```
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

  /**
   * Component with props and required children.
   * Internal/branch node - must have children to be meaningful.
   * Use this for provider/container components where children are mandatory.
   *
   * @template Props - Props type accepted by the component
   * @template ChildReqs - Context requirements for children (defaults to never)
   * @template ComponentReqs - Context requirements for the component's return type
   *                           (defaults to ChildReqs, use `never` for provider components)
   * @template ChildError - Error type from children (defaults to never)
   * @template ComponentError - Error type from the component (defaults to ChildError)
   *
   * @example
   * ```ts
   * // Provider component - provides context, requires children
   * const Root: Component.Branch<RootProps, MenuCtx, never> = (props, children) =>
   *   Effect.gen(function* () {
   *     const ctx = { ... };
   *     return yield* $.div({}, provide(MenuCtx, ctx, children));
   *   });
   *
   * // Container that provides additional context
   * const RadioGroup: Component.Branch<
   *   RadioGroupProps,
   *   MenuCtx | RadioGroupCtx,
   *   MenuCtx
   * > = (props, children) =>
   *   Effect.gen(function* () {
   *     const radioCtx = { ... };
   *     return yield* $.div({}, provide(RadioGroupCtx, radioCtx, children));
   *   });
   * ```
   */
  export type Branch<
    Props,
    ChildReqs = never,
    ComponentReqs = ChildReqs,
    ChildError = never,
    ComponentError = ChildError,
  > = CoreComponent.Branch<
    HTMLElement,
    Props,
    ChildReqs,
    ComponentReqs,
    ChildError,
    ComponentError
  >;
}
