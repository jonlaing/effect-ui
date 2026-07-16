# @effex/router

## 1.2.5

### Patch Changes

- Updated dependencies [d95a27a]
  - @effex/dom@1.3.0

## 1.2.4

### Patch Changes

- Updated dependencies [65c74ec]
  - @effex/dom@1.2.2

## 1.2.3

### Patch Changes

- Updated dependencies [2a730e7]
  - @effex/core@1.1.1
  - @effex/dom@1.2.1

## 1.2.2

### Patch Changes

- Updated dependencies [b650fd8]
- Updated dependencies [12654be]
- Updated dependencies [ee8a4d1]
- Updated dependencies [0dd6440]
- Updated dependencies [3c5da0c]
  - @effex/dom@1.2.0

## 1.2.1

### Patch Changes

- Updated dependencies [2e2670e]
  - @effex/dom@1.1.1

## 1.2.0

### Minor Changes

- 9c3fb19: added meta combinator to be able to change title and description of routes

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

### Patch Changes

- Updated dependencies [5023cff]
  - @effex/core@1.1.0
  - @effex/dom@1.1.0

## 1.0.0

### Minor Changes

- 8c68479: Initial public release of Effex - a reactive UI framework built on Effect.

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

### Patch Changes

- 17d0b29: Major refactor to improve DX and code cleanliness
- Updated dependencies [8c68479]
- Updated dependencies [17d0b29]
  - @effex/core@1.0.0
  - @effex/dom@1.0.0
