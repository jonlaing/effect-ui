import { Effect, Scope } from "effect";

import { Readable, Signal } from "@effex/core";

import type { Field, FieldConfig, MapField, TypeOf } from "../Field.js";
import type { MapFieldState } from "../FieldState.js";
import {
  aggregateErrorsDynamic,
  aggregateTouchedDynamic,
  type SupportedFieldState,
} from "./aggregation.js";
import {
  createChildFieldState,
  type FieldStateOf,
} from "./createFieldState.js";

export const createMapFieldState = <K, F extends Field<any, any>>(
  field: MapField<K, F>,
  defaultValue: Map<K, unknown>,
  formConfig: FieldConfig,
  _createFieldState?: unknown, // Kept for interface consistency, uses module-level createChildFieldState
): Effect.Effect<
  MapFieldState<K, TypeOf<F>, FieldStateOf<F>>,
  never,
  Scope.Scope
> =>
  Effect.gen(function* () {
    type EntryValue = TypeOf<F>;
    type EntryState = FieldStateOf<F>;

    // Capture the current scope to use for creating new entry states later
    const scope = yield* Scope.Scope;

    // Track initial values for reset
    const initialEntries = new Map(defaultValue) as Map<K, EntryValue>;

    // Create the underlying signal for the map values
    const valueSignal = yield* Signal.make<ReadonlyMap<K, EntryValue>>(
      defaultValue as Map<K, EntryValue>,
    );

    // Track entry states
    const entryStatesSignal = yield* Signal.make<ReadonlyMap<K, EntryState>>(
      new Map(),
    );

    // Merge element's config with form config (element config takes priority)
    const entryConfig: FieldConfig = {
      validateOn:
        field.element.config.validateOn ?? formConfig.validateOn ?? "blur",
      debounce: field.element.config.debounce ?? formConfig.debounce,
    };

    // Create helper for making child states using the captured scope
    const createEntryState = createChildFieldState<EntryState>(
      scope,
      field.element,
      entryConfig,
    );

    // Initialize entry states from default values
    const initialEntryStates = new Map<K, EntryState>();
    for (const [key, value] of defaultValue.entries()) {
      const entryState = yield* createEntryState(value);
      initialEntryStates.set(key, entryState);
    }
    yield* entryStatesSignal.set(initialEntryStates);

    // Derive size from value
    const size = Readable.map(valueSignal, (map) => map.size);

    // Entries readable (just exposes the entry states signal)
    const entries: Readable.Readable<ReadonlyMap<K, EntryState>> =
      entryStatesSignal;

    // Aggregate touched from all entry states (dynamic - recomputes when entries change)
    const touched = aggregateTouchedDynamic(
      Readable.map(entryStatesSignal, (states) =>
        Array.from(states.values()).map(
          (s) => s as SupportedFieldState<unknown>,
        ),
      ),
    );

    // Aggregate dirty - compare current entries to initial
    const dirty: Readable.Readable<boolean> = Readable.map(
      valueSignal,
      (currentMap) => {
        if (currentMap.size !== initialEntries.size) return true;
        for (const [key, value] of currentMap.entries()) {
          if (!initialEntries.has(key) || initialEntries.get(key) !== value) {
            return true;
          }
        }
        return false;
      },
    );

    // Aggregate errors from all entry states (dynamic - recomputes when entries change)
    const errors = aggregateErrorsDynamic(
      Readable.map(entryStatesSignal, (states) =>
        Array.from(states.values()).map(
          (s) => s as SupportedFieldState<unknown>,
        ),
      ),
    );

    // Get entry state for a specific key
    const getEntry = (key: K): Effect.Effect<EntryState | undefined> =>
      Effect.gen(function* () {
        const states = yield* entryStatesSignal.get;
        return states.get(key);
      });

    // Set the entire map value
    const set = (
      newEntries:
        | ReadonlyMap<K, EntryValue>
        | Iterable<readonly [K, EntryValue]>,
    ): Effect.Effect<void> =>
      Effect.gen(function* () {
        const entriesMap =
          newEntries instanceof Map
            ? newEntries
            : new Map(newEntries as Iterable<readonly [K, EntryValue]>);

        const newStates = new Map<K, EntryState>();
        for (const [key, value] of entriesMap.entries()) {
          const entryState = yield* createEntryState(value);
          newStates.set(key, entryState);
        }

        yield* valueSignal.set(entriesMap);
        yield* entryStatesSignal.set(newStates);
      });

    // Update the map value with a function
    const update = (
      f: (
        value: ReadonlyMap<K, EntryValue>,
      ) => ReadonlyMap<K, EntryValue> | Iterable<readonly [K, EntryValue]>,
    ): Effect.Effect<void> =>
      Effect.gen(function* () {
        const current = yield* valueSignal.get;
        yield* set(f(current));
      });

    // Set a single entry value
    const setEntry = (key: K, value: EntryValue): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* entryStatesSignal.get;

        const newValues = new Map(currentValues);
        newValues.set(key, value);

        const newStates = new Map(currentStates);
        if (!newStates.has(key)) {
          // Create new entry state
          const entryState = yield* createEntryState(value);
          newStates.set(key, entryState);
        } else {
          // Update existing entry state's value
          const existingState = newStates.get(key)!;
          yield* (existingState as SupportedFieldState<EntryValue>).set(value);
        }

        yield* valueSignal.set(newValues);
        yield* entryStatesSignal.set(newStates);
      });

    // Delete an entry
    const deleteEntry = (key: K): Effect.Effect<boolean> =>
      Effect.gen(function* () {
        const currentValues = yield* valueSignal.get;
        const currentStates = yield* entryStatesSignal.get;

        if (!currentValues.has(key)) {
          return false;
        }

        const newValues = new Map(currentValues);
        newValues.delete(key);

        const newStates = new Map(currentStates);
        newStates.delete(key);

        yield* valueSignal.set(newValues);
        yield* entryStatesSignal.set(newStates);
        return true;
      });

    // Clear all entries
    const clear = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* valueSignal.set(new Map());
        yield* entryStatesSignal.set(new Map());
      });

    // Reset to initial values
    const reset = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* set(initialEntries);
      });

    const mapState: MapFieldState<K, EntryValue, EntryState> = {
      value: valueSignal,
      size,
      errors,
      touched,
      dirty,
      entries,
      getEntry,
      set,
      update,
      setEntry,
      delete: deleteEntry,
      clear,
      reset,
    };

    return mapState;
  });
