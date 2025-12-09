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
export { when, match, each, ErrorBoundary, Suspense, SuspenseWithBoundary } from "./Control";
export type { MatchCase } from "./Control";

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
