import type { Effect } from "effect";
import type { Readable } from "@core/Readable";
import type { Signal } from "@core/Signal";
import type { Element } from "@dom/Element";

/**
 * Context shared between Accordion parts.
 */
export interface AccordionContext {
  /** Current open value(s) */
  readonly value: Readable<string | string[] | null>;
  /** Toggle an item by value */
  readonly toggle: (itemValue: string) => Effect.Effect<void>;
  /** Whether the accordion is disabled */
  readonly disabled: Readable<boolean>;
  /** Accordion type */
  readonly type: "single" | "multiple";
  /** Whether single-type accordion can collapse all items */
  readonly collapsible: boolean;
}

/**
 * Context for individual Accordion.Item
 */
export interface AccordionItemContext {
  /** This item's value */
  readonly value: string;
  /** Whether this item is open */
  readonly isOpen: Readable<boolean>;
  /** Whether this item is disabled */
  readonly disabled: Readable<boolean>;
  /** Unique ID for ARIA attributes */
  readonly triggerId: string;
  readonly contentId: string;
}

/**
 * Props for Accordion.Root
 */
export interface AccordionRootProps {
  /**
   * Whether single or multiple items can be open at once.
   * @default "single"
   */
  readonly type?: "single" | "multiple";
  /**
   * Controlled value - string for single, string[] for multiple.
   * If provided, component is controlled.
   */
  readonly value?: Signal<string | null> | Signal<string[]>;
  /**
   * Default value for uncontrolled usage.
   * String for single type, string[] for multiple type.
   */
  readonly defaultValue?: string | string[] | null;
  /** Whether the accordion is disabled */
  readonly disabled?: boolean | Readable<boolean>;
  /**
   * When type="single", whether clicking the open item closes it.
   * @default false
   */
  readonly collapsible?: boolean;
  /** Callback when value changes */
  readonly onValueChange?: (value: string | string[] | null) => Effect.Effect<void>;
}

/**
 * Props for Accordion.Item
 */
export interface AccordionItemProps {
  /** Unique value for this item */
  readonly value: string;
  /** Whether this item is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for Accordion.Trigger
 */
export interface AccordionTriggerProps {
  /** Additional class names */
  readonly class?: string | Readable<string>;
}

/** Children type for Accordion.Trigger */
export type AccordionTriggerChildren = Element | string | Readable<string>;

/**
 * Props for Accordion.Content
 */
export interface AccordionContentProps {
  /** Additional class names for the outer container */
  readonly class?: string | Readable<string>;
}

/** Children type for Accordion.Content */
export type AccordionContentChildren = Element | Element[];
