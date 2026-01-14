// ============================================================================
// Menu Keyboard Navigation Helpers
// Shared between DropdownMenu, ContextMenu, and other menu components
// ============================================================================

/**
 * Get all focusable menu items within a container.
 * Uses the [data-menu-item] data attribute to find items.
 */
export const getMenuItems = (contentId: string): HTMLElement[] => {
  const contentEl = document.getElementById(contentId);
  if (!contentEl) return [];
  return Array.from(
    contentEl.querySelectorAll("[data-menu-item]:not([data-disabled])"),
  ) as HTMLElement[];
};

/**
 * Navigation state for keyboard handling.
 */
export interface MenuNavigationState {
  items: HTMLElement[];
  currentItem: HTMLElement | undefined;
  currentIndex: number;
  nextIndex: number;
  prevIndex: number;
}

/**
 * Get current navigation state for menu items.
 * @param contentId - The ID of the menu content element
 * @param loop - Whether navigation should loop around
 */
export const getMenuNavigationState = (
  contentId: string,
  loop: boolean,
): MenuNavigationState => {
  const items = getMenuItems(contentId);
  const currentItem = items.find((item) =>
    item.contains(document.activeElement),
  );
  const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

  const nextIndex =
    items.length === 0
      ? -1
      : loop
        ? (currentIndex + 1) % items.length
        : Math.min(items.length - 1, currentIndex + 1);

  const prevIndex =
    items.length === 0
      ? -1
      : loop
        ? (currentIndex - 1 + items.length) % items.length
        : Math.max(0, currentIndex - 1);

  return { items, currentItem, currentIndex, nextIndex, prevIndex };
};

/**
 * Handle arrow key navigation within a menu.
 * Returns true if the event was handled.
 *
 * Supports:
 * - ArrowDown: Focus next item
 * - ArrowUp: Focus previous item
 * - Home: Focus first item
 * - End: Focus last item
 */
export const handleMenuArrowNavigation = (
  event: KeyboardEvent,
  state: MenuNavigationState,
): boolean => {
  const { items, nextIndex, prevIndex } = state;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      items[nextIndex]?.focus({ preventScroll: true });
      return true;
    case "ArrowUp":
      event.preventDefault();
      items[prevIndex]?.focus({ preventScroll: true });
      return true;
    case "Home":
      event.preventDefault();
      items[0]?.focus({ preventScroll: true });
      return true;
    case "End":
      event.preventDefault();
      items[items.length - 1]?.focus({ preventScroll: true });
      return true;
    default:
      return false;
  }
};
