import { Effect, Scope } from "effect";

import { Readable, Signal } from "@effex/core";

import type { ArrayField, Field, FieldConfig, TypeOf } from "../Field.js";
import type { ArrayFieldState } from "../FieldState.js";
import {
  aggregateErrorsDynamic,
  aggregateTouchedDynamic,
  type SupportedFieldState,
} from "./aggregation.js";
import {
  createChildFieldState,
  type FieldStateOf,
} from "./createFieldState.js";

export const createArrayFieldState = <F extends Field<any, any>>(
  field: ArrayField<F>,
  defaultValue: unknown[],
  formConfig: FieldConfig,
  _createFieldState?: unknown, // Kept for interface consistency, uses module-level createChildFieldState
): Effect.Effect<
  ArrayFieldState<TypeOf<F>, FieldStateOf<F>>,
  never,
  Scope.Scope
> =>
  Effect.gen(function* () {
    type ItemValue = TypeOf<F>;
    type ItemState = FieldStateOf<F>;

    // Capture the current scope to use for creating new items later
    const scope = yield* Scope.Scope;

    // Track initial values for reset
    const initialValues = [...defaultValue] as ItemValue[];

    // Create the underlying signal for the array values
    const valueSignal = yield* Signal.make<readonly ItemValue[]>(
      defaultValue as ItemValue[],
    );

    // Track item states - this is a signal of states array
    const itemStatesSignal = yield* Signal.make<readonly ItemState[]>([]);

    // Merge element's config with form config (element config takes priority)
    const itemConfig: FieldConfig = {
      validateOn:
        field.element.config.validateOn ?? formConfig.validateOn ?? "blur",
      debounce: field.element.config.debounce ?? formConfig.debounce,
    };

    // Create helper for making child states using the captured scope
    const createItemState = createChildFieldState<ItemState>(
      scope,
      field.element,
      itemConfig,
    );

    // Initialize item states from default values
    const initialItemStates: ItemState[] = [];
    for (const itemValue of defaultValue) {
      const itemState = yield* createItemState(itemValue);
      initialItemStates.push(itemState);
    }
    yield* itemStatesSignal.set(initialItemStates);

    // Derive length from value
    const length = Readable.map(valueSignal, (arr) => arr.length);

    // Items readable (just exposes the item states signal)
    const items: Readable.Readable<readonly ItemState[]> = itemStatesSignal;

    // Aggregate touched from all item states (dynamic - recomputes when items change)
    const touched = aggregateTouchedDynamic(
      Readable.map(itemStatesSignal, (states) =>
        states.map((s) => s as SupportedFieldState<unknown>),
      ),
    );

    // Aggregate dirty - compare current length/values to initial
    const dirty: Readable.Readable<boolean> = Readable.map(
      valueSignal,
      (currentValues) => {
        if (currentValues.length !== initialValues.length) return true;
        return currentValues.some((v, i) => v !== initialValues[i]);
      },
    );

    // Aggregate errors from all item states (dynamic - recomputes when items change)
    const errors = aggregateErrorsDynamic(
      Readable.map(itemStatesSignal, (states) =>
        states.map((s) => s as SupportedFieldState<unknown>),
      ),
    );

    // Set entire array
    const set = (newValues: readonly ItemValue[]): Effect.Effect<void> =>
      Effect.gen(function* () {
        // Create new item states for all values
        const newStates: ItemState[] = [];
        for (const value of newValues) {
          const state = yield* createItemState(value);
          newStates.push(state);
        }
        yield* valueSignal.set(newValues);
        yield* itemStatesSignal.set(newStates);
      });

    // Update array with function
    const update = (
      f: (value: readonly ItemValue[]) => readonly ItemValue[],
    ): Effect.Effect<void> =>
      Effect.gen(function* () {
        const current = yield* valueSignal.get;
        yield* set(f(current));
      });

    // Push items to end
    const push = (...newItems: ItemValue[]): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        const newStates: ItemState[] = [];
        for (const item of newItems) {
          const state = yield* createItemState(item);
          newStates.push(state);
        }

        yield* valueSignal.set([...currentValues, ...newItems]);
        yield* itemStatesSignal.set([...currentStates, ...newStates]);
      });

    // Pop last item
    const pop = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        if (currentValues.length > 0) {
          yield* valueSignal.set(currentValues.slice(0, -1));
          yield* itemStatesSignal.set(currentStates.slice(0, -1));
        }
      });

    // Unshift items to beginning
    const unshift = (...newItems: ItemValue[]): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        const newStates: ItemState[] = [];
        for (const item of newItems) {
          const state = yield* createItemState(item);
          newStates.push(state);
        }

        yield* valueSignal.set([...newItems, ...currentValues]);
        yield* itemStatesSignal.set([...newStates, ...currentStates]);
      });

    // Shift first item
    const shift = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        if (currentValues.length > 0) {
          yield* valueSignal.set(currentValues.slice(1));
          yield* itemStatesSignal.set(currentStates.slice(1));
        }
      });

    // Insert at index
    const insertAt = (index: number, item: ItemValue): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        const newState = yield* createItemState(item);

        const newValues = [
          ...currentValues.slice(0, index),
          item,
          ...currentValues.slice(index),
        ];
        const newStates = [
          ...currentStates.slice(0, index),
          newState,
          ...currentStates.slice(index),
        ];

        yield* valueSignal.set(newValues);
        yield* itemStatesSignal.set(newStates);
      });

    // Remove at index
    const removeAt = (index: number): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        if (index >= 0 && index < currentValues.length) {
          const newValues = [
            ...currentValues.slice(0, index),
            ...currentValues.slice(index + 1),
          ];
          const newStates = [
            ...currentStates.slice(0, index),
            ...currentStates.slice(index + 1),
          ];

          yield* valueSignal.set(newValues);
          yield* itemStatesSignal.set(newStates);
        }
      });

    // Move item from one index to another
    const move = (fromIndex: number, toIndex: number): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* itemStatesSignal.get;

        if (
          fromIndex >= 0 &&
          fromIndex < currentValues.length &&
          toIndex >= 0 &&
          toIndex < currentValues.length &&
          fromIndex !== toIndex
        ) {
          const newValues = [...currentValues];
          const newStates = [...currentStates];

          const [movedValue] = newValues.splice(fromIndex, 1);
          newValues.splice(toIndex, 0, movedValue);

          const [movedState] = newStates.splice(fromIndex, 1);
          newStates.splice(toIndex, 0, movedState);

          yield* valueSignal.set(newValues);
          yield* itemStatesSignal.set(newStates);
        }
      });

    // Clear all items
    const clear = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* valueSignal.set([]);
        yield* itemStatesSignal.set([]);
      });

    // Reset to initial values
    const reset = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* set(initialValues);
      });

    const arrayState: ArrayFieldState<ItemValue, ItemState> = {
      value: valueSignal,
      length,
      errors,
      touched,
      dirty,
      items,
      set,
      update,
      push,
      pop,
      unshift,
      shift,
      insertAt,
      removeAt,
      move,
      clear,
      reset,
    };

    return arrayState;
  });
