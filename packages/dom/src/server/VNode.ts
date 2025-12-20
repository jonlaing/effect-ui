/**
 * Virtual node types for SSR representation.
 * These are used by StringRenderer to build a tree that can be serialized to HTML.
 */

export type VNode = VElement | VText;

export interface VElement {
  readonly _tag: "VElement";
  readonly type: string;
  attributes: Record<string, string>;
  children: VNode[];
  /** Raw innerHTML content (bypasses escaping) */
  _innerHTML?: string;
}

export interface VText {
  readonly _tag: "VText";
  content: string;
}

export const vElement = (type: string): VElement => ({
  _tag: "VElement",
  type,
  attributes: {},
  children: [],
});

export const vText = (content: string): VText => ({
  _tag: "VText",
  content,
});
