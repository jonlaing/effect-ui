import { Context, Effect } from "effect";

/**
 * Abstract renderer interface for creating and manipulating a node tree.
 * Implementations can target DOM, strings (SSR), terminal, native, etc.
 *
 * @template Node - The node type for this renderer (e.g., HTMLElement, VNode, string)
 */
export interface Renderer<Node> {
  /**
   * Create an element node of the given type.
   * @param type - The element tag name
   * @param namespace - Optional namespace URI (e.g., "http://www.w3.org/2000/svg" for SVG)
   */
  readonly createNode: (
    type: string,
    namespace?: string,
  ) => Effect.Effect<Node>;

  /**
   * Create a text node with the given content.
   */
  readonly createTextNode: (text: string) => Effect.Effect<Node>;

  /**
   * Append a child node to a parent node.
   */
  readonly appendChild: (parent: Node, child: Node) => Effect.Effect<void>;

  /**
   * Remove a child node from a parent node.
   */
  readonly removeChild: (parent: Node, child: Node) => Effect.Effect<void>;

  /**
   * Replace an old child node with a new one.
   */
  readonly replaceChild: (
    parent: Node,
    newChild: Node,
    oldChild: Node,
  ) => Effect.Effect<void>;

  /**
   * Insert a child before a reference node.
   */
  readonly insertBefore: (
    parent: Node,
    child: Node,
    reference: Node | null,
  ) => Effect.Effect<void>;

  /**
   * Set an attribute on a node.
   * If value is null/undefined, the attribute should be removed.
   * If value is a boolean, true sets empty string, false removes.
   */
  readonly setAttribute: (
    node: Node,
    key: string,
    value: unknown,
  ) => Effect.Effect<void>;

  /**
   * Remove an attribute from a node.
   */
  readonly removeAttribute: (node: Node, key: string) => Effect.Effect<void>;

  /**
   * Set the className of a node.
   */
  readonly setClassName: (node: Node, className: string) => Effect.Effect<void>;

  /**
   * Set a CSS style property on a node.
   */
  readonly setStyleProperty: (
    node: Node,
    property: string,
    value: string,
  ) => Effect.Effect<void>;

  /**
   * Set the text content of a node.
   */
  readonly setTextContent: (node: Node, text: string) => Effect.Effect<void>;

  /**
   * Set the innerHTML of a node.
   * Note: This may not be supported by all renderers.
   */
  readonly setInnerHTML: (node: Node, html: string) => Effect.Effect<void>;

  /**
   * Set the value property of an input-like node.
   */
  readonly setInputValue: (node: Node, value: string) => Effect.Effect<void>;

  /**
   * Add an event listener to a node.
   * Returns a cleanup function to remove the listener.
   * Note: This may be a no-op for non-interactive renderers (SSR).
   */
  readonly addEventListener: (
    node: Node,
    event: string,
    handler: (event: unknown) => void,
  ) => Effect.Effect<void>;

  /**
   * Get children of a node (for traversal during hydration).
   */
  readonly getChildren: (node: Node) => Effect.Effect<readonly Node[]>;

  /**
   * Check if the renderer is in hydration mode.
   */
  readonly isHydrating: Effect.Effect<boolean>;
}

/**
 * Context tag for the Renderer service.
 * Components access the renderer through this context.
 */
export class RendererContext extends Context.Tag("@effex/Renderer")<
  RendererContext,
  Renderer<unknown>
>() {}

/**
 * Renderer namespace containing the interface and context.
 */
export const Renderer = {
  Context: RendererContext,
};
