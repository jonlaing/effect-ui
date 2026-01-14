import { Context, type Effect } from "effect";

import type { ElementRef, Readable, Signal } from "@effex/dom";

/**
 * Filter function type for filtering items based on input.
 * @param inputValue - The current input value
 * @param itemTextValue - The text value of the item being filtered
 * @returns true if the item should be shown
 */
export type ComboboxFilterFn = (
  inputValue: string,
  itemTextValue: string,
) => boolean;

/**
 * Context shared between Combobox parts.
 */
export interface ComboboxContext {
  /** Whether the listbox is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the listbox */
  readonly open: () => Effect.Effect<void>;
  /** Close the listbox */
  readonly close: () => Effect.Effect<void>;

  /** The current input value (what user types) */
  readonly inputValue: Signal<string>;

  /** The selected value (committed selection) */
  readonly value: Readable.Readable<string>;
  /** Select a value */
  readonly selectValue: (value: string) => Effect.Effect<void>;

  /** The currently highlighted item value (keyboard navigation) */
  readonly highlightedValue: Signal<string | null>;
  /** Highlight a specific value */
  readonly highlightValue: (value: string | null) => Effect.Effect<void>;
  /** Highlight the next item */
  readonly highlightNext: () => Effect.Effect<void>;
  /** Highlight the previous item */
  readonly highlightPrev: () => Effect.Effect<void>;
  /** Highlight the first item */
  readonly highlightFirst: () => Effect.Effect<void>;
  /** Highlight the last item */
  readonly highlightLast: () => Effect.Effect<void>;

  /** Register an item */
  readonly registerItem: (
    value: string,
    textValue: string,
    disabled: boolean,
  ) => Effect.Effect<void>;
  /** Unregister an item */
  readonly unregisterItem: (value: string) => Effect.Effect<void>;
  /** Map of registered items */
  readonly items: Signal<Map<string, { textValue: string; disabled: boolean }>>;

  /** Filter function (null means no filtering) */
  readonly filterFn: ComboboxFilterFn | null;

  /** Unique ID for the content element */
  readonly contentId: string;
  /** Unique ID for the input element */
  readonly inputId: string;
  /** Get the ID for an item by its value */
  readonly getItemId: (value: string) => string;

  /** Reference to the input element */
  readonly inputRef: ElementRef<HTMLInputElement>;

  /** Whether async loading is in progress */
  readonly isLoading: Readable.Readable<boolean>;

  /** Whether the combobox is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Whether keyboard navigation loops */
  readonly loop: boolean;
}

/**
 * Context for Combobox.Item children.
 */
export interface ComboboxItemContext {
  /** The item's value */
  readonly itemValue: string;
  /** Whether this item is selected */
  readonly isSelected: Readable.Readable<boolean>;
  /** Whether this item is highlighted */
  readonly isHighlighted: Readable.Readable<boolean>;
  /** Whether this item is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Set the text value for this item */
  readonly setTextValue: (text: string) => Effect.Effect<void>;
}

/**
 * Context for Combobox.Content positioning.
 */
export interface ComboboxContentPositionContext {
  readonly side: Readable.Readable<"top" | "bottom">;
  readonly align: Readable.Readable<"start" | "center" | "end">;
  readonly sideOffset: Readable.Readable<number>;
  readonly hasPositioned: Readable.Readable<boolean>;
  readonly setHasPositioned: (value: boolean) => Effect.Effect<void>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Combobox state sharing between parts.
 */
export class ComboboxCtx extends Context.Tag("ComboboxContext")<
  ComboboxCtx,
  ComboboxContext
>() {}

/**
 * Effect Context for Combobox.Item state sharing.
 */
export class ComboboxItemCtx extends Context.Tag("ComboboxItemContext")<
  ComboboxItemCtx,
  ComboboxItemContext
>() {}

/**
 * Effect Context for Combobox.Content positioning.
 */
export class ComboboxContentPositionCtx extends Context.Tag(
  "ComboboxContentPositionContext",
)<ComboboxContentPositionCtx, ComboboxContentPositionContext>() {}
