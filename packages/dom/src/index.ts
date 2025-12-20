// Re-export everything from core so users can import from @effex/dom
export {
  Readable,
  type Reactive,
  isReadable,
  of,
  makeReadable,
  mapReadable,
  fromStream,
  Signal,
  type SignalOptions,
  SignalRegistry,
  makeSignal,
  type DerivedOptions,
  type AsyncState,
  type AsyncStrategy,
  type AsyncDerivedOptions,
  type AsyncDerived,
  Derived,
  defaultEquals,
  Reaction,
  type RefType,
  Ref,
  Renderer,
  RendererContext,
  type RendererInterface,
} from "@effex/core";

// DOM Renderer
export { DOMRenderer, DOMRendererLive } from "./DOMRenderer";

// Element
export type {
  Element,
  Child,
  EventHandler,
  BaseAttributes,
  EventAttributes,
  HTMLAttributes,
  ElementFactory,
} from "./Element";
export {
  $,
  div,
  span,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  button,
  input,
  form,
  label,
  ul,
  ol,
  li,
  a,
  img,
  nav,
  header,
  footer,
  main,
  section,
  article,
  aside,
  textarea,
  select,
  option,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
} from "./Element";

// Control flow
export { when, match, each } from "./Control";
export type { WhenConfig, MatchCase, MatchConfig, EachConfig } from "./Control";

// Boundary (async and error handling)
export { Boundary, suspense, error } from "./Boundary";
export type { SuspenseOptions, BoundarySuspenseOptions } from "./Boundary";

// Context provision
export { provide } from "./Provide";

// Animation
export type {
  AnimationEndResult,
  AnimationHook,
  AnimationOptions,
  ListAnimationOptions,
  StaggerFunction,
} from "./Animation/index.js";
export {
  runEnterAnimation,
  runExitAnimation,
  prefersReducedMotion,
  stagger,
  staggerFromCenter,
  staggerEased,
  delay,
  sequence,
  parallel,
  calculateStaggerDelay,
} from "./Animation/index.js";

// Components
export type { Component, Children } from "./Component";
export { component } from "./Component";

// Mounting
export { mount, runApp } from "./Mount";

// Template helpers
export { t } from "./Template";

// Portal
export type { PortalOptions } from "./Portal";
export { Portal } from "./Portal";

// Virtual List
export type {
  VirtualEachOptions,
  VirtualListRefType,
  VirtualListControl,
  VisibleRange,
} from "./VirtualList/index.js";
export { virtualEach, VirtualListRef } from "./VirtualList/index.js";

// Unique ID generation
export { UniqueId } from "./UniqueId";

// Focus Trap
export type { FocusTrapOptions } from "./FocusTrap";
export { FocusTrap } from "./FocusTrap";

// Scroll Lock
export { ScrollLock } from "./ScrollLock";
