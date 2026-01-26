// Re-export everything from core so users can import from @effex/dom
export {
  Readable,
  type Reactive,
  isReadable,
  makeReadable,
  mapReadable,
  fromStream,
  Signal,
  type SignalOptions,
  type SignalSet,
  type SignalArray,
  type SignalMap,
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
  ClassValue,
  EventHandler,
  BaseAttributes,
  EventAttributes,
  HTMLAttributes,
  ElementFactory,
  ChildEffect,
  ChildNode,
} from "./Element";
export {
  Element,
  type ElementRef,
  NoSuchElementException,
  AttributeNotFound,
  DataAttributeNotFound,
  bindElementToRef,
  MergePropsCtx,
} from "./Element";
export {
  $,
  of,
  // Document structure
  div,
  span,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  footer,
  main,
  nav,
  section,
  article,
  aside,
  address,
  // Text content
  blockquote,
  cite,
  q,
  pre,
  code,
  kbd,
  samp,
  varEl,
  abbr,
  dfn,
  mark,
  del,
  ins,
  s,
  u,
  small,
  strong,
  em,
  b,
  i,
  sub,
  sup,
  time,
  data,
  wbr,
  bdi,
  bdo,
  ruby,
  rt,
  rp,
  hr,
  br,
  // Lists
  ul,
  ol,
  li,
  dl,
  dt,
  dd,
  // Links and media
  a,
  img,
  figure,
  figcaption,
  picture,
  audio,
  video,
  source,
  track,
  canvas,
  iframe,
  embed,
  objectEl,
  map,
  area,
  // Tables
  table,
  thead,
  tbody,
  tfoot,
  tr,
  th,
  td,
  caption,
  colgroup,
  col,
  // Forms
  form,
  input,
  textarea,
  select,
  option,
  optgroup,
  button,
  label,
  fieldset,
  legend,
  datalist,
  output,
  progress,
  meter,
  // Interactive
  details,
  summary,
  dialog,
  menu,
  // Template and slots
  template,
  slot,
  // Scripting
  noscript,
  script,
  style,
} from "./Element";

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
