// Re-export everything from core so users can import from @effex/dom
export * from "@effex/core";

// DOM Renderer
export { DOMRenderer, DOMRendererLive } from "./DOMRenderer";

export * as Element from "./Element";

// Control flow
export {
  when,
  match,
  each,
  matchOption,
  matchEither,
  HydrationMismatchError,
} from "./Control";
export type {
  WhenConfig,
  MatchConfig,
  MatchCase,
  EachConfig,
  MatchOptionConfig,
  MatchEitherConfig,
} from "./Control";

// Boundary (async and error handling)
export { Boundary, suspense, error } from "./Boundary";
export type { SuspenseOptions, BoundarySuspenseOptions } from "./Boundary";

// Context provision
export { provide } from "./Provide";

export { collect } from "./Collect";

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

// DOM Helpers
export type { KeyboardNavOptions, ElementRefLike } from "./helpers/index.js";
export {
  onClickOutside,
  createKeyboardNav,
  mergeProps,
} from "./helpers/index.js";
