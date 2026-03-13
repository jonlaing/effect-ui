// Import individual creators

import { createArrayFieldState } from "./ArrayFieldState.js";
// Import the registry and wire it up
import {
  createChildFieldState,
  createFieldState,
  fieldStateCreators,
  type CreateFieldState,
  type FieldStateOf,
  type SupportedFieldState,
} from "./createFieldState.js";
import { createLeafFieldState } from "./LeafFieldState.js";
import { createMapFieldState } from "./MapFieldState.js";
import { createStructFieldState } from "./StructFieldState.js";

// Wire up the registry to break the circular dependency
fieldStateCreators.leaf = createLeafFieldState;
fieldStateCreators.struct = createStructFieldState;
fieldStateCreators.array = createArrayFieldState;
fieldStateCreators.map = createMapFieldState;

// Export the main dispatcher and types
export {
  createFieldState,
  createChildFieldState,
  type CreateFieldState,
  type FieldStateOf,
  type SupportedFieldState,
};

// Export individual creators for direct use if needed
export {
  createLeafFieldState,
  createStructFieldState,
  createArrayFieldState,
  createMapFieldState,
};

// Export aggregation helpers
export {
  aggregateTouched,
  aggregateErrors,
  aggregateTouchedDynamic,
  aggregateErrorsDynamic,
} from "./aggregation.js";
