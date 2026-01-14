import { Context, Effect } from "effect";
import { Signal, Derived } from "@effex/dom";
import type { ClassValue } from "@effex/dom";
import { Readable } from "@effex/dom";
import { $ } from "@effex/dom";
import { provide } from "@effex/dom";
import { when } from "@effex/dom";
import { Element } from "@effex/dom";
import type { Child } from "@effex/dom";
import type { SignalSet, AnimationOptions } from "@effex/dom";

/**
 * Context shared between TreeView parts.
 */
export interface TreeViewContext {
  /** Expanded node IDs */
  readonly expanded: SignalSet<string>;
  /** Selected node IDs */
  readonly selected: SignalSet<string>;
  /** Selection mode */
  readonly selectionMode: "single" | "multiple" | "none";
  /** Whether the tree is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Toggle a node's expanded state */
  readonly toggleExpanded: (id: string) => Effect.Effect<void>;
  /** Select a node (handles single vs multiple) */
  readonly select: (id: string) => Effect.Effect<void>;
  /** Get reactive isExpanded for a node */
  readonly getIsExpanded: (id: string) => Readable.Readable<boolean>;
  /** Get reactive isSelected for a node */
  readonly getIsSelected: (id: string) => Readable.Readable<boolean>;
  /** Callback when expanded changes */
  readonly onExpandedChange?: (expanded: Set<string>) => Effect.Effect<void>;
  /** Callback when selected changes */
  readonly onSelectedChange?: (selected: Set<string>) => Effect.Effect<void>;
}

/**
 * Context for individual TreeView.Item
 */
export interface TreeViewItemContext {
  /** This item's ID */
  readonly id: string;
  /** Nesting level (1-indexed) */
  readonly level: number;
  /** Parent item ID (null for root items) */
  readonly parentId: string | null;
  /** Whether this item is expanded */
  readonly isExpanded: Readable.Readable<boolean>;
  /** Whether this item is selected */
  readonly isSelected: Readable.Readable<boolean>;
  /** Whether this item is disabled */
  readonly disabled: Readable.Readable<boolean>;
  /** Whether this item has children */
  readonly hasChildren: Signal<boolean>;
}

/**
 * Effect Context for TreeView state sharing between parts.
 */
export class TreeViewCtx extends Context.Tag("TreeViewContext")<
  TreeViewCtx,
  TreeViewContext
>() {}

/**
 * Effect Context for individual TreeView.Item
 */
export class TreeViewItemCtx extends Context.Tag("TreeViewItemContext")<
  TreeViewItemCtx,
  TreeViewItemContext
>() {}

/**
 * Internal context for tracking tree level
 */
interface TreeViewLevelContext {
  readonly level: number;
  readonly parentId: string | null;
}

class TreeViewLevelCtx extends Context.Tag("TreeViewLevelContext")<
  TreeViewLevelCtx,
  TreeViewLevelContext
>() {}

/**
 * Props for TreeView.Root
 */
export interface TreeViewRootProps {
  /** Selection mode */
  readonly selectionMode?: "single" | "multiple" | "none";
  /** Controlled expanded state */
  readonly expanded?: SignalSet<string>;
  /** Default expanded items (uncontrolled) */
  readonly defaultExpanded?: string[];
  /** Controlled selected state */
  readonly selected?: SignalSet<string>;
  /** Default selected items (uncontrolled) */
  readonly defaultSelected?: string[];
  /** Whether the tree is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Callback when expanded changes */
  readonly onExpandedChange?: (expanded: Set<string>) => Effect.Effect<void>;
  /** Callback when selected changes */
  readonly onSelectedChange?: (selected: Set<string>) => Effect.Effect<void>;
  /** Accessible label */
  readonly "aria-label"?: string;
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Root container for a TreeView. Manages expanded/selected state for all items.
 */
const Root = (
  props: TreeViewRootProps,
  children:
    | Element.Element<never, TreeViewCtx | TreeViewLevelCtx>
    | Element.Element<never, TreeViewCtx | TreeViewLevelCtx>[],
): Element.Element =>
  Effect.gen(function* () {
    const selectionMode = props.selectionMode ?? "none";

    // Handle controlled vs uncontrolled state for expanded
    const expanded: SignalSet<string> = props.expanded
      ? props.expanded
      : yield* Signal.Set.make<string>(props.defaultExpanded ?? []);

    // Handle controlled vs uncontrolled state for selected
    const selected: SignalSet<string> = props.selected
      ? props.selected
      : yield* Signal.Set.make<string>(props.defaultSelected ?? []);

    const disabled: Readable.Readable<boolean> = Readable.of(
      props.disabled ?? false,
    );

    const toggleExpanded = (id: string) =>
      Effect.gen(function* () {
        const isDisabled = yield* disabled.get;
        if (isDisabled) return;

        yield* expanded.toggle(id);

        if (props.onExpandedChange) {
          const currentExpanded = yield* expanded.readable.get;
          yield* props.onExpandedChange(new Set(currentExpanded));
        }
      });

    const select = (id: string) =>
      Effect.gen(function* () {
        const isDisabled = yield* disabled.get;
        if (isDisabled) return;

        if (selectionMode === "none") return;

        if (selectionMode === "single") {
          // Replace selection with just this item
          yield* selected.replace([id]);
        } else {
          // Multiple mode: toggle selection
          yield* selected.toggle(id);
        }

        if (props.onSelectedChange) {
          const currentSelected = yield* selected.readable.get;
          yield* props.onSelectedChange(new Set(currentSelected));
        }
      });

    const getIsExpanded = (id: string): Readable.Readable<boolean> =>
      expanded.readable.map((set) => set.has(id));

    const getIsSelected = (id: string): Readable.Readable<boolean> =>
      selected.readable.map((set) => set.has(id));

    const ctxValue: TreeViewContext = {
      expanded,
      selected,
      selectionMode,
      disabled,
      toggleExpanded,
      select,
      getIsExpanded,
      getIsSelected,
      onExpandedChange: props.onExpandedChange,
      onSelectedChange: props.onSelectedChange,
    };

    const levelCtx: TreeViewLevelContext = {
      level: 1,
      parentId: null,
    };

    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    // Keyboard navigation handler
    const handleKeyDown = (e: KeyboardEvent) =>
      Effect.gen(function* () {
        const target = e.target as HTMLElement;
        if (!target.hasAttribute("data-tree-label")) return;

        const items = Array.from(
          document.querySelectorAll("[data-tree-item]:not([data-hidden])"),
        ) as HTMLElement[];

        const labels = items
          .map((item) => item.querySelector("[data-tree-label]") as HTMLElement)
          .filter(Boolean);

        const currentIndex = labels.indexOf(target);
        if (currentIndex === -1) return;

        const currentItem = items[currentIndex];
        const itemId = currentItem.getAttribute("data-tree-item-id");

        e.preventDefault();

        switch (e.key) {
          case "ArrowDown": {
            const nextIndex = Math.min(currentIndex + 1, labels.length - 1);
            labels[nextIndex]?.focus({ preventScroll: true });
            break;
          }
          case "ArrowUp": {
            const prevIndex = Math.max(currentIndex - 1, 0);
            labels[prevIndex]?.focus({ preventScroll: true });
            break;
          }
          case "ArrowRight": {
            if (!itemId) return;

            const isCurrentlyExpanded = yield* expanded.has(itemId);
            const hasChildItems = currentItem.querySelector("[role='group']");

            if (hasChildItems && !isCurrentlyExpanded) {
              // Expand the node
              yield* toggleExpanded(itemId);
              return;
            }
            if (isCurrentlyExpanded) {
              // Move to first child
              const nextIndex = currentIndex + 1;
              if (nextIndex < labels.length) {
                labels[nextIndex]?.focus({ preventScroll: true });
              }
            }
            break;
          }
          case "ArrowLeft": {
            if (!itemId) return;

            const isCurrentlyExpanded = yield* expanded.has(itemId);
            if (isCurrentlyExpanded) {
              // Collapse the node
              yield* toggleExpanded(itemId);
              return;
            }
            // Move to parent
            const parentId = currentItem.getAttribute("data-tree-parent-id");
            if (parentId) {
              const parentItem = document.querySelector(
                `[data-tree-item-id="${parentId}"]`,
              );
              const parentLabel = parentItem?.querySelector(
                "[data-tree-label]",
              ) as HTMLElement;
              parentLabel?.focus({ preventScroll: true });
            }
            break;
          }
          case "Home": {
            labels[0]?.focus({ preventScroll: true });
            break;
          }
          case "End": {
            labels[labels.length - 1]?.focus({ preventScroll: true });
            break;
          }
          case "Enter": {
            if (!itemId) return;

            const hasChildItems = currentItem.querySelector("[role='group']");
            if (hasChildItems) {
              yield* toggleExpanded(itemId);
            }
            break;
          }
          case " ": {
            if (itemId && selectionMode !== "none") {
              yield* select(itemId);
            }
            break;
          }
        }
      });

    return yield* $.div(
      {
        role: "tree",
        "aria-label": props["aria-label"],
        "aria-multiselectable":
          selectionMode === "multiple" ? "true" : undefined,
        "data-disabled": dataDisabled,
        class: props.class,
        onKeyDown: handleKeyDown,
      },
      provide(
        TreeViewCtx,
        ctxValue,
        provide(
          TreeViewLevelCtx,
          levelCtx,
          Array.isArray(children) ? children : [children],
        ),
      ),
    );
  });

/**
 * Props for TreeView.Item
 */
export interface TreeViewItemProps {
  /** Unique identifier for this item */
  readonly id: string;
  /** Whether this item is disabled */
  readonly disabled?: Readable.Reactive<boolean>;
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * Individual tree item container. Can contain nested items.
 */
const Item = (
  props: TreeViewItemProps,
  children:
    | Element.Element<never, TreeViewCtx | TreeViewItemCtx | TreeViewLevelCtx>
    | Element.Element<
        never,
        TreeViewCtx | TreeViewItemCtx | TreeViewLevelCtx
      >[],
): Element.Element<never, TreeViewCtx | TreeViewLevelCtx> =>
  Effect.gen(function* () {
    const treeCtx = yield* TreeViewCtx;
    const levelCtx = yield* TreeViewLevelCtx;

    const hasChildren: Signal<boolean> = yield* Signal.make(false);

    const isExpanded = treeCtx.getIsExpanded(props.id);
    const isSelected = treeCtx.getIsSelected(props.id);

    // Item can be disabled by itself or by parent tree
    const itemDisabled = Readable.of(props.disabled ?? false);
    const disabled: Readable.Readable<boolean> = yield* Derived.sync(
      [treeCtx.disabled, itemDisabled],
      ([treeDisabled, propDisabled]) => treeDisabled || propDisabled,
    );

    const itemCtx: TreeViewItemContext = {
      id: props.id,
      level: levelCtx.level,
      parentId: levelCtx.parentId,
      isExpanded,
      isSelected,
      disabled,
      hasChildren,
    };

    const dataState = isExpanded.map((expanded) =>
      expanded ? "open" : "closed",
    );
    const dataSelected = isSelected.map((selected) =>
      selected ? "true" : undefined,
    );
    const dataDisabled = disabled.map((d) => (d ? "" : undefined));

    // aria-expanded should only be present if item has children
    const ariaExpanded: Readable.Readable<string | undefined> =
      yield* Derived.sync([hasChildren, isExpanded], ([has, exp]) => {
        if (!has) return undefined;
        return exp ? "true" : "false";
      });

    // Determine visibility based on parent expanded state
    const isVisible = levelCtx.parentId
      ? treeCtx.getIsExpanded(levelCtx.parentId)
      : Readable.of(true);

    const dataHidden = isVisible.map((visible) => (visible ? undefined : ""));

    return yield* $.div(
      {
        role: "treeitem",
        "aria-expanded": ariaExpanded,
        "aria-selected": dataSelected,
        "aria-level": String(levelCtx.level),
        "data-state": dataState,
        "data-selected": dataSelected,
        "data-disabled": dataDisabled,
        "data-hidden": dataHidden,
        "data-tree-item": "",
        "data-tree-item-id": props.id,
        "data-tree-parent-id": levelCtx.parentId ?? undefined,
        class: props.class,
      },
      provide(TreeViewItemCtx, itemCtx, children),
    );
  });

/**
 * Props for TreeView.ItemLabel
 */
export interface TreeViewItemLabelProps {
  /** Additional class names */
  readonly class?: ClassValue;
}

/**
 * The clickable/focusable label for a tree item.
 */
const ItemLabel = (
  props: TreeViewItemLabelProps,
  children?:
    | Child<never, TreeViewCtx | TreeViewItemCtx>
    | readonly Child<never, TreeViewCtx | TreeViewItemCtx>[],
): Element.Element<never, TreeViewCtx | TreeViewItemCtx> =>
  Effect.gen(function* () {
    const treeCtx = yield* TreeViewCtx;
    const itemCtx = yield* TreeViewItemCtx;

    const handleClick = () =>
      Effect.gen(function* () {
        const isDisabled = yield* itemCtx.disabled.get;
        if (isDisabled) return;

        const hasKids = yield* itemCtx.hasChildren.get;
        if (hasKids) {
          yield* treeCtx.toggleExpanded(itemCtx.id);
        }

        if (treeCtx.selectionMode !== "none") {
          yield* treeCtx.select(itemCtx.id);
        }
      });

    const dataState = itemCtx.isExpanded.map((expanded) =>
      expanded ? "open" : "closed",
    );
    const dataSelected = itemCtx.isSelected.map((selected) =>
      selected ? "true" : undefined,
    );
    const dataDisabled = itemCtx.disabled.map((d) => (d ? "" : undefined));

    // Roving tabindex - first item gets tabIndex 0, others get -1
    // This is a simplified version; a full implementation would track active item
    const tabIndex = itemCtx.level === 1 && itemCtx.parentId === null ? 0 : -1;

    return yield* $.div(
      {
        tabIndex,
        "data-state": dataState,
        "data-selected": dataSelected,
        "data-disabled": dataDisabled,
        "data-tree-label": "",
        class: props.class,
        onClick: handleClick,
      },
      children ?? [],
    );
  });

/**
 * Props for TreeView.ItemContent
 */
export interface TreeViewItemContentProps {
  /** Additional class names */
  readonly class?: ClassValue;
  /** Animation configuration for enter/exit transitions */
  readonly animate?: AnimationOptions;
}

/**
 * Container for nested child items. Sets hasChildren on parent.
 */
const ItemContent = (
  props: TreeViewItemContentProps,
  children?:
    | Child<never, TreeViewCtx | TreeViewItemCtx | TreeViewLevelCtx>
    | readonly Child<never, TreeViewCtx | TreeViewItemCtx | TreeViewLevelCtx>[],
): Element.Element<never, TreeViewCtx | TreeViewItemCtx | TreeViewLevelCtx> =>
  Effect.gen(function* () {
    const itemCtx = yield* TreeViewItemCtx;
    const levelCtx = yield* TreeViewLevelCtx;

    // Mark parent as having children
    yield* itemCtx.hasChildren.set(true);

    // New level context for nested items
    const newLevelCtx: TreeViewLevelContext = {
      level: levelCtx.level + 1,
      parentId: itemCtx.id,
    };

    const dataState = itemCtx.isExpanded.map((expanded) =>
      expanded ? "open" : "closed",
    );

    const contentChildren = provide(
      TreeViewLevelCtx,
      newLevelCtx,
      children ?? [],
    );

    return yield* when(itemCtx.isExpanded, {
      onTrue: () =>
        $.div(
          {
            role: "group",
            "data-state": dataState,
            class: props.class,
          },
          contentChildren,
        ),
      onFalse: () => $.div({ style: { display: "none" } }),
      animate: props.animate,
    });
  });

/**
 * Headless TreeView primitive for building accessible
 * hierarchical tree structures.
 *
 * Features:
 * - Nested/hierarchical items
 * - Single or multiple selection modes
 * - Controlled and uncontrolled modes
 * - Full keyboard support (arrows, Home, End, Enter, Space)
 * - ARIA tree pattern (role="tree", role="treeitem", role="group")
 * - Disabled state at root or item level
 * - CSS-based styling via data attributes
 *
 * @example
 * ```ts
 * TreeView.Root({ selectionMode: "single", defaultExpanded: ["folder-1"] }, [
 *   TreeView.Item({ id: "folder-1" }, [
 *     TreeView.ItemLabel({}, "Documents"),
 *     TreeView.ItemContent({}, [
 *       TreeView.Item({ id: "file-1" }, [
 *         TreeView.ItemLabel({}, "resume.pdf"),
 *       ]),
 *     ]),
 *   ]),
 *   TreeView.Item({ id: "file-2" }, [
 *     TreeView.ItemLabel({}, "notes.txt"),
 *   ]),
 * ])
 * ```
 */
export const TreeView = {
  Root,
  Item,
  ItemLabel,
  ItemContent,
} as const;
