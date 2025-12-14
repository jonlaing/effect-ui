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
export { when, match, each, provide, ErrorBoundary, Suspense } from "./Control";
export type { MatchCase, SuspenseOptions } from "./Control";

// Animation
export type {
  AnimationEndResult,
  AnimationHook,
  AnimationOptions,
  ControlAnimationOptions,
  ListAnimationOptions,
  ListControlAnimationOptions,
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

// Refs
export type { Ref as RefType } from "./Ref";
export { Ref } from "./Ref";

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
