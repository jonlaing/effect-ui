---
"@effex/core": minor
"@effex/dom": minor
"@effex/router": minor
"@effex/form": minor
"@effex/primitives": minor
---

Initial public release of Effex - a reactive UI framework built on Effect.

**@effex/core**
- Signal: Mutable reactive values with equality-based updates
- Derived: Computed values that automatically track dependencies
- Readable: Base interface for reactive values with `get`, `changes`, `values`, and `map`
- Readable.combine: Combine multiple Readables into a tuple
- Readable.lift: Lift functions to accept Readable arguments (great for CVA, clsx)

**@effex/dom**
- Element factories (`$.div`, `$.button`, etc.) with reactive attributes
- Control flow: `when`, `match`, `each` with animation support
- Boundary.suspense for async loading states
- Template literals (`t`) for reactive strings
- Portal for rendering outside the component tree
- CSS-first animations with stagger utilities

**@effex/router**
- Type-safe routing with Effect Schema validation
- Route params as Readables
- History API navigation
- Link component

**@effex/form**
- Schema-based validation with Effect Schema
- Field-level state (value, errors, touched, dirty)
- Configurable validation timing
- Async validators support

**@effex/primitives**
- Headless, accessible UI components (Dialog, Menu, Select, Tabs, etc.)
- WAI-ARIA compliant
- Keyboard navigation built-in
- Works with any styling solution
