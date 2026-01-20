import { Context, Effect, MutableRef } from "effect";

import {
  $,
  Component,
  Derived,
  Element,
  provide,
  Readable,
  Signal,
  type ClassValue,
  type ElementRef,
} from "@effex/dom";

/**
 * Context shared between Splitter parts.
 */
export interface SplitterContext {
  /** Layout orientation */
  readonly orientation: "horizontal" | "vertical";
  /** Whether the splitter is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Panel sizes as percentages (sum to 100) */
  readonly sizes: Signal<number[]>;
  /** Index of handle currently being dragged (null if not dragging) */
  readonly draggingHandle: Signal<number | null>;
  /** Container ref for position calculations */
  readonly containerRef: ElementRef<HTMLDivElement>;
  /** Register a panel (returns its index) */
  readonly registerPanel: (minSize: number, maxSize: number) => number;
  /** Register a handle (returns its index) */
  readonly registerHandle: () => number;
  /** Get panel constraints */
  readonly getPanelConstraints: (index: number) => {
    minSize: number;
    maxSize: number;
  };
  /** Start dragging a handle */
  readonly startDrag: (
    handleIndex: number,
    pointerId: number,
    initialClientX: number,
    initialClientY: number,
  ) => Effect.Effect<void>;
  /** Stop dragging */
  readonly stopDrag: () => Effect.Effect<void>;
  /** Resize by keyboard step */
  readonly resizeByStep: (
    handleIndex: number,
    delta: number,
  ) => Effect.Effect<void>;
  /** Keyboard step size */
  readonly keyboardStep: number;
  /** Callback when sizes change */
  readonly onSizesChange?: (sizes: number[]) => Effect.Effect<void>;
  /** Set drag cleanup function */
  readonly setDragCleanup: (cleanup: (() => void) | null) => void;
  /** Generate unique panel ID */
  readonly generatePanelId: () => string;
}

/**
 * Context for individual Splitter.Panel
 */
export interface SplitterPanelContext {
  /** This panel's index */
  readonly index: number;
  /** This panel's unique ID */
  readonly id: string;
  /** This panel's size (percentage) */
  readonly size: Readable.Readable<number>;
  /** Minimum size */
  readonly minSize: number;
  /** Maximum size */
  readonly maxSize: number;
}

/**
 * Effect Context for Splitter state sharing between parts.
 */
export class SplitterCtx extends Context.Tag("SplitterContext")<
  SplitterCtx,
  SplitterContext
>() {}

/**
 * Effect Context for individual Splitter.Panel
 */
export class SplitterPanelCtx extends Context.Tag("SplitterPanelContext")<
  SplitterPanelCtx,
  SplitterPanelContext
>() {}

/**
 * Props for Splitter.Root
 */
export interface SplitterRootProps {
  /** Layout orientation (default: "horizontal") */
  readonly orientation?: "horizontal" | "vertical";
  /** Controlled sizes (percentages) */
  readonly sizes?: Signal<number[]>;
  /** Default sizes (uncontrolled) */
  readonly defaultSizes?: number[];
  /** Whether the splitter is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when sizes change */
  readonly onSizesChange?: (sizes: number[]) => Effect.Effect<void>;
  /** Keyboard resize step (percentage, default: 1) */
  readonly keyboardStep?: number;
  /** Accessible label */
  readonly "aria-label"?: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Root container for a Splitter. Manages panel sizes and drag state.
 */
const Root = Component.gen(function* (props: SplitterRootProps, children) {
  const orientation = props.orientation ?? "horizontal";
  const keyboardStep = props.keyboardStep ?? 1;
  const disabled = Readable.of(props.disabled ?? false);

  // Create or use controlled sizes signal
  const sizes = yield* Signal.fromNullable(
    props.sizes,
    props.defaultSizes ?? [50, 50],
  );

  // Container ref for position calculations
  const containerRef = yield* Element.ref<HTMLDivElement>();

  // Dragging state
  const draggingHandle = yield* Signal.make<number | null>(null);

  // Track the offset from where user clicked to handle position (prevents snapping)
  const dragOffset = MutableRef.make<number>(0);

  // Track cleanup functions for document listeners
  const dragCleanup = MutableRef.make<(() => void) | null>(null);

  // Panel and handle registration counters
  const panelCount = MutableRef.make(0);
  const handleCount = MutableRef.make(0);
  const panelIdCounter = MutableRef.make(0);

  // Store panel constraints
  const panelConstraints = MutableRef.make<
    Map<number, { minSize: number; maxSize: number }>
  >(new Map());

  // Register panel
  const registerPanel = (minSize: number, maxSize: number): number => {
    const index = MutableRef.get(panelCount);
    MutableRef.update(panelCount, (n) => n + 1);

    const constraints = MutableRef.get(panelConstraints);
    constraints.set(index, { minSize, maxSize });
    MutableRef.set(panelConstraints, constraints);

    return index;
  };

  // Register handle
  const registerHandle = (): number => {
    const index = MutableRef.get(handleCount);
    MutableRef.update(handleCount, (n) => n + 1);
    return index;
  };

  // Get panel constraints
  const getPanelConstraints = (
    index: number,
  ): { minSize: number; maxSize: number } => {
    const constraints = MutableRef.get(panelConstraints);
    return constraints.get(index) ?? { minSize: 0, maxSize: 100 };
  };

  // Generate unique panel ID
  const generatePanelId = (): string => {
    const id = MutableRef.get(panelIdCounter);
    MutableRef.update(panelIdCounter, (n) => n + 1);
    return `splitter-panel-${id}`;
  };

  // Calculate new sizes when handle is dragged
  const redistributeSizes = (
    handleIndex: number,
    targetPosition: number,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const currentSizes = yield* sizes.get;
      if (handleIndex >= currentSizes.length - 1) return;

      // Calculate cumulative position of panels before this handle
      let positionBefore = 0;
      for (let i = 0; i <= handleIndex; i++) {
        positionBefore += currentSizes[i] ?? 0;
      }

      // Calculate delta
      const delta = targetPosition - positionBefore;
      if (Math.abs(delta) < 0.1) return;

      // Get constraints for affected panels
      const leftPanel = handleIndex;
      const rightPanel = handleIndex + 1;
      const leftConstraints = getPanelConstraints(leftPanel);
      const rightConstraints = getPanelConstraints(rightPanel);

      // Calculate new sizes
      let newLeftSize = (currentSizes[leftPanel] ?? 0) + delta;
      let newRightSize = (currentSizes[rightPanel] ?? 0) - delta;

      // Apply constraints
      if (newLeftSize < leftConstraints.minSize) {
        const adjustment = leftConstraints.minSize - newLeftSize;
        newLeftSize = leftConstraints.minSize;
        newRightSize -= adjustment;
      }
      if (newLeftSize > leftConstraints.maxSize) {
        const adjustment = newLeftSize - leftConstraints.maxSize;
        newLeftSize = leftConstraints.maxSize;
        newRightSize += adjustment;
      }
      if (newRightSize < rightConstraints.minSize) {
        const adjustment = rightConstraints.minSize - newRightSize;
        newRightSize = rightConstraints.minSize;
        newLeftSize -= adjustment;
      }
      if (newRightSize > rightConstraints.maxSize) {
        const adjustment = newRightSize - rightConstraints.maxSize;
        newRightSize = rightConstraints.maxSize;
        newLeftSize += adjustment;
      }

      // Clamp to valid range
      newLeftSize = Math.max(0, newLeftSize);
      newRightSize = Math.max(0, newRightSize);

      // Update sizes array
      const newSizes = [...currentSizes];
      newSizes[leftPanel] = newLeftSize;
      newSizes[rightPanel] = newRightSize;

      yield* sizes.set(newSizes);

      if (props.onSizesChange) {
        yield* props.onSizesChange(newSizes);
      }
    });

  // Update drag position
  const updateDrag = (clientX: number, clientY: number): Effect.Effect<void> =>
    Effect.gen(function* () {
      const container = Element.getUnsafe(containerRef);
      if (!container) return;

      const handleIdx = yield* draggingHandle.get;
      if (handleIdx === null) return;

      const rect = container.getBoundingClientRect();
      const offset = MutableRef.get(dragOffset);

      // Calculate position as percentage, applying the drag offset
      const pos =
        orientation === "horizontal"
          ? ((clientX - rect.left) / rect.width) * 100 - offset
          : ((clientY - rect.top) / rect.height) * 100 - offset;

      yield* redistributeSizes(handleIdx, pos);
    });

  // Start drag
  const startDrag = (
    handleIndex: number,
    pointerId: number,
    initialClientX: number,
    initialClientY: number,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const isDisabled = yield* disabled.get;
      if (isDisabled) return;

      // Calculate the offset between where user clicked and where handle actually is
      const container = Element.getUnsafe(containerRef);
      if (container) {
        const rect = container.getBoundingClientRect();
        const currentSizes = yield* sizes.get;

        // Calculate current handle position (cumulative size of panels before handle)
        let handlePosition = 0;
        for (let i = 0; i <= handleIndex; i++) {
          handlePosition += currentSizes[i] ?? 0;
        }

        // Calculate where the mouse clicked as a percentage
        const mousePosition =
          orientation === "horizontal"
            ? ((initialClientX - rect.left) / rect.width) * 100
            : ((initialClientY - rect.top) / rect.height) * 100;

        // Store the offset so dragging feels natural
        MutableRef.set(dragOffset, mousePosition - handlePosition);
      }

      yield* draggingHandle.set(handleIndex);

      // Set up document-level pointer tracking
      yield* Effect.sync(() => {
        // Prevent text selection during drag
        const previousUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";

        const handleSelectStart = (e: Event) => {
          e.preventDefault();
        };

        const handlePointerMove = (e: PointerEvent) => {
          if (e.pointerId !== pointerId) return;
          e.preventDefault();
          Effect.runSync(updateDrag(e.clientX, e.clientY));
        };

        const cleanup = () => {
          document.body.style.userSelect = previousUserSelect;
          document.removeEventListener("selectstart", handleSelectStart);
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp);
          document.removeEventListener("pointercancel", handlePointerUp);
          MutableRef.set(dragCleanup, null);
        };

        const handlePointerUp = (e: PointerEvent) => {
          if (e.pointerId !== pointerId) return;
          Effect.runSync(stopDrag());
          cleanup();
        };

        document.addEventListener("selectstart", handleSelectStart);
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointercancel", handlePointerUp);

        MutableRef.set(dragCleanup, cleanup);
      });
    });

  // Stop drag
  const stopDrag = (): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* draggingHandle.set(null);
    });

  // Resize by keyboard step
  const resizeByStep = (
    handleIndex: number,
    delta: number,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const isDisabled = yield* disabled.get;
      if (isDisabled) return;

      const currentSizes = yield* sizes.get;
      if (handleIndex >= currentSizes.length - 1) return;

      // Calculate current position of handle
      let position = 0;
      for (let i = 0; i <= handleIndex; i++) {
        position += currentSizes[i] ?? 0;
      }

      yield* redistributeSizes(handleIndex, position + delta);
    });

  // Set drag cleanup function
  const setDragCleanup = (cleanup: (() => void) | null) => {
    MutableRef.set(dragCleanup, cleanup);
  };

  // Build context
  const ctx: SplitterContext = {
    orientation,
    disabled,
    sizes,
    draggingHandle,
    containerRef,
    registerPanel,
    registerHandle,
    getPanelConstraints,
    startDrag,
    stopDrag,
    resizeByStep,
    keyboardStep,
    onSizesChange: props.onSizesChange,
    setDragCleanup,
    generatePanelId,
  };

  // Clean up drag listeners on unmount
  yield* Effect.addFinalizer(() =>
    Effect.sync(() => {
      const cleanup = MutableRef.get(dragCleanup);
      if (cleanup) {
        cleanup();
        MutableRef.set(dragCleanup, null);
      }
    }),
  );

  const dataDisabled = disabled.map((d) => (d ? "" : undefined));

  return yield* $.div(
    {
      ref: containerRef,
      "data-splitter-root": "",
      "data-orientation": orientation,
      "data-disabled": dataDisabled,
      "aria-label": props["aria-label"],
      class: props.class,
      style: {
        display: "flex",
        flexDirection: orientation === "horizontal" ? "row" : "column",
      },
    },
    provide(SplitterCtx, ctx, Component.normalizeChildren(children)),
  );
});

/**
 * Props for Splitter.Panel
 */
export interface SplitterPanelProps {
  /** Minimum size as percentage (default: 0) */
  readonly minSize?: number;
  /** Maximum size as percentage (default: 100) */
  readonly maxSize?: number;
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Individual panel within a Splitter. Automatically registers with the root.
 */
const Panel = Component.gen(function* (props: SplitterPanelProps, children) {
  const ctx = yield* SplitterCtx;

  const minSize = props.minSize ?? 0;
  const maxSize = props.maxSize ?? 100;

  // Register this panel and get its index
  const index = ctx.registerPanel(minSize, maxSize);
  const id = ctx.generatePanelId();

  // Get this panel's size from the sizes array
  const size = ctx.sizes.map((s) => s[index] ?? 0);

  // Create panel context
  const panelCtx: SplitterPanelContext = {
    index,
    id,
    size,
    minSize,
    maxSize,
  };

  // Style based on orientation and size
  const panelStyle = size.map((s) => ({
    flexBasis: `${s}%`,
    flexGrow: "0",
    flexShrink: "0",
    overflow: "auto",
  }));

  return yield* $.div(
    {
      id,
      "data-splitter-panel": "",
      "data-panel-index": String(index),
      class: props.class,
      style: panelStyle,
    },
    provide(SplitterPanelCtx, panelCtx, Component.normalizeChildren(children)),
  );
});

/**
 * Props for Splitter.Handle
 */
export interface SplitterHandleProps {
  /** Accessible label for this handle */
  readonly "aria-label"?: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Draggable handle between panels. Provides resize functionality.
 */
const Handle = Component.gen(function* (props: SplitterHandleProps) {
  const ctx = yield* SplitterCtx;

  // Register this handle and get its index
  const handleIndex = ctx.registerHandle();

  // Get the panel IDs for aria-controls (controls the panel before this handle)
  // We need to construct the ID since we know the pattern
  const controlledPanelId = `splitter-panel-${handleIndex}`;

  // Check if this handle is being dragged
  const isDragging = ctx.draggingHandle.map((d) => d === handleIndex);

  // Calculate aria-valuenow (position of handle as percentage)
  const ariaValueNow: Readable.Readable<number> = yield* Derived.sync(
    [ctx.sizes],
    ([sizes]) => {
      let position = 0;
      for (let i = 0; i <= handleIndex; i++) {
        position += sizes[i] ?? 0;
      }
      return Math.round(position);
    },
  );

  // Handle pointer down
  const handlePointerDown = (e: PointerEvent) =>
    Effect.gen(function* () {
      e.preventDefault();
      yield* ctx.startDrag(handleIndex, e.pointerId, e.clientX, e.clientY);
    });

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) =>
    Effect.gen(function* () {
      const step = e.shiftKey ? ctx.keyboardStep * 10 : ctx.keyboardStep;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp": {
          e.preventDefault();
          const getDelta = () => {
            if (ctx.orientation === "horizontal")
              return e.key === "ArrowLeft" ? -step : 0;
            return e.key === "ArrowUp" ? -step : 0;
          };
          const delta = getDelta();
          if (delta !== 0) {
            yield* ctx.resizeByStep(handleIndex, delta);
          }
          break;
        }
        case "ArrowRight":
        case "ArrowDown": {
          e.preventDefault();
          const getDelta = () => {
            if (ctx.orientation === "horizontal")
              return e.key === "ArrowRight" ? step : 0;
            return e.key === "ArrowDown" ? step : 0;
          };
          const delta = getDelta();
          if (delta !== 0) {
            yield* ctx.resizeByStep(handleIndex, delta);
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          // Move to minimum (panel before gets minSize)
          const constraints = ctx.getPanelConstraints(handleIndex);
          yield* ctx.resizeByStep(handleIndex, -100 + constraints.minSize);
          break;
        }
        case "End": {
          e.preventDefault();
          // Move to maximum (panel before gets maxSize)
          const constraints = ctx.getPanelConstraints(handleIndex);
          yield* ctx.resizeByStep(handleIndex, 100 - constraints.maxSize);
          break;
        }
      }
    });

  const dataDisabled = ctx.disabled.map((d) => (d ? "" : undefined));
  const dataDragging = isDragging.map((d) => (d ? "" : undefined));
  const tabIndex = ctx.disabled.map((d) => (d ? -1 : 0));

  return yield* $.div(
    {
      role: "separator",
      "aria-valuenow": ariaValueNow,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-controls": controlledPanelId,
      "aria-orientation": ctx.orientation,
      "aria-label": props["aria-label"],
      tabIndex,
      "data-splitter-handle": "",
      "data-orientation": ctx.orientation,
      "data-disabled": dataDisabled,
      "data-dragging": dataDragging,
      class: props.class,
      style: {
        flexShrink: "0",
        cursor: ctx.orientation === "horizontal" ? "col-resize" : "row-resize",
      },
      onPointerDown: handlePointerDown,
      onKeyDown: handleKeyDown,
    },
    [],
  );
});

/**
 * Headless Splitter primitive for building resizable panel layouts.
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Drag-to-resize with pointer capture
 * - Full keyboard support (arrows, Home, End)
 * - Min/max size constraints per panel
 * - ARIA separator pattern
 * - Controlled and uncontrolled modes
 * - CSS-based styling via data attributes
 *
 * @example
 * ```ts
 * // Two-panel horizontal layout
 * Splitter.Root({ orientation: "horizontal", defaultSizes: [30, 70] }, [
 *   Splitter.Panel({ minSize: 20 }, [
 *     $.div({}, "Sidebar"),
 *   ]),
 *   Splitter.Handle({ "aria-label": "Resize sidebar" }),
 *   Splitter.Panel({}, [
 *     $.div({}, "Main content"),
 *   ]),
 * ])
 *
 * // Three-panel layout
 * Splitter.Root({ defaultSizes: [25, 50, 25] }, [
 *   Splitter.Panel({}, [$.div({}, "Left")]),
 *   Splitter.Handle({}),
 *   Splitter.Panel({}, [$.div({}, "Center")]),
 *   Splitter.Handle({}),
 *   Splitter.Panel({}, [$.div({}, "Right")]),
 * ])
 * ```
 */
export const Splitter = {
  Root,
  Panel,
  Handle,
} as const;
