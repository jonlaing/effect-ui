import { Context, type Effect } from "effect";

import type { ElementRef, Readable } from "@effex/dom";

/**
 * Context shared between Popover parts.
 */
export interface PopoverContext {
  /** Whether the popover is currently open */
  readonly isOpen: Readable.Readable<boolean>;
  /** Open the popover */
  readonly open: () => Effect.Effect<void>;
  /** Close the popover */
  readonly close: () => Effect.Effect<void>;
  /** Toggle the popover open state */
  readonly toggle: () => Effect.Effect<void>;
  /** Reference to the trigger element */
  readonly triggerRef: ElementRef<HTMLButtonElement>;
  /** Reference to an optional anchor element */
  readonly anchorRef: ElementRef<HTMLDivElement>;
  /** Unique ID for the popover content */
  readonly contentId: string;
}

export interface PopoverContentPositionContext {
  side: Readable.Readable<"top" | "bottom" | "left" | "right">;
  align: Readable.Readable<"start" | "center" | "end">;
  sideOffset: Readable.Readable<number>;
  alignOffset: Readable.Readable<number>;
  hasPositioned: Readable.Readable<boolean>;
  setHasPositioned: (value: boolean) => Effect.Effect<void>;
}

// ============================================================================
// Context Tags
// ============================================================================

/**
 * Effect Context for Popover state sharing between parts.
 */
export class PopoverCtx extends Context.Tag("PopoverContext")<
  PopoverCtx,
  PopoverContext
>() {}

export class PopoverContentPositionCtx extends Context.Tag(
  "PopoverContentPositionContext",
)<PopoverContentPositionCtx, PopoverContentPositionContext>() {}
