import { Data, Effect, Runtime, Scope, Stream } from "effect";

import { getUnsafe, isElementRef, type ElementRef } from "../Element/ref.js";

// -----------------------------------------------------------------------------
// Platform detection
// -----------------------------------------------------------------------------

/**
 * Whether the runtime is on macOS. Computed once at module load; drives
 * the `mod` modifier's mapping to `meta` vs `ctrl`.
 *
 * Prefers `navigator.userAgentData.platform` when available (Chromium's
 * modern replacement for the deprecated `navigator.platform`) and falls
 * back to a `userAgent` regex — the userAgent string isn't deprecated
 * and covers every browser we care about. Falls back to `false` in
 * non-browser environments (SSR).
 */
const IS_MAC =
  typeof navigator !== "undefined" &&
  ((navigator as { userAgentData?: { platform?: string } }).userAgentData
    ?.platform === "macOS" ||
    /\bMac\b/i.test(navigator.userAgent));

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Predicate deciding whether to `preventDefault` a matched event.
 */
export type PreventDefaultRule = boolean | ((event: KeyboardEvent) => boolean);

/**
 * Handler for a matched keyboard event. Must return
 * `Effect<void, never, never>` — the framework refuses to accept
 * plain functions here because plain-function handlers are exactly
 * where uncaught exceptions and un-typed side effects sneak in.
 * Wrap DOM writes in `Effect.sync` when that's all you need.
 */
export type KeyboardHandler = (
  event: KeyboardEvent,
) => Effect.Effect<void, never, never>;

/**
 * Options for a keyboard binding.
 */
export interface KeyboardOptions {
  /**
   * Where to listen. Defaults to `"document"` — global.
   *
   * * `"document"` — global listener on `document`.
   * * `HTMLElement` — bound to that specific element.
   * * `ElementRef` — reactive; the listener is (re)attached when the
   *   ref's element mounts and detached when it unmounts, via the
   *   ref's `isConnected` Readable.
   */
  readonly target?: "document" | HTMLElement | ElementRef;

  /**
   * Whether to `preventDefault` a matched event.
   *
   * * `true` — always
   * * `false` — never
   * * predicate — evaluated per event
   * * omitted — smart default that skips preventDefault when the event
   *   target is an editable element (input, textarea, contenteditable),
   *   so that global bindings like `"j"` for feed nav don't block
   *   typing in a search box. See {@link outsideInputs}.
   */
  readonly preventDefault?: PreventDefaultRule;

  /**
   * Whether to `stopPropagation` a matched event. Defaults to `false`,
   * so a parent scope's handler for the same binding also fires. Set
   * true when a child should "consume" the key from the parent (e.g.
   * Escape closes the child modal without also closing the parent).
   */
  readonly stopPropagation?: boolean;
}

// -----------------------------------------------------------------------------
// Predicates (exported as `Keyboard.*`)
// -----------------------------------------------------------------------------

/**
 * True when the event target is an editable element — an
 * `<input>` of a text-entry type, a `<textarea>`, or an element with
 * `isContentEditable`. Non-text `<input>` types (checkbox, radio,
 * button, submit, reset, file, image, range, color) are excluded
 * because a bound keyboard shortcut on those doesn't collide with
 * typing.
 */
const NON_TEXT_INPUT_TYPES = new Set([
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "file",
  "image",
  "range",
  "color",
]);

export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.has(target.type.toLowerCase());
  }
  if (target instanceof HTMLTextAreaElement) return true;
  // `isContentEditable` reads as `undefined` on plain elements in some
  // engines (notably jsdom) rather than `false`. Coerce so the return
  // type is honestly a boolean.
  return target.isContentEditable === true;
};

/**
 * Predicate: preventDefault unless the event target is an editable
 * element. The default behavior when `preventDefault` is omitted.
 */
export const outsideInputs = (event: KeyboardEvent): boolean =>
  !isEditableTarget(event.target);

/**
 * Predicate: preventDefault only when a non-Shift modifier is pressed.
 * Shift is intentionally excluded — `shift+/` produces `?` on many
 * layouts and is often what the user "meant to type."
 */
export const withModifier = (event: KeyboardEvent): boolean =>
  event.ctrlKey || event.metaKey || event.altKey;

// -----------------------------------------------------------------------------
// Binding parser
// -----------------------------------------------------------------------------

interface ParsedBinding {
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  /** Lowercased key value that `event.key.toLowerCase()` must match. */
  readonly key: string;
}

const KNOWN_MODIFIERS = new Set(["mod", "meta", "ctrl", "alt", "shift"]);

/**
 * Raised by {@link parseBinding} when the binding string is malformed —
 * unknown modifier, empty token, or empty binding. Programmer-error
 * territory. `Keyboard.on` converts this to a defect via `Effect.orDie`,
 * but callers building bindings from dynamic sources (user prefs, JSON
 * config) can call `parseBinding` themselves and handle the typed
 * error in the E channel.
 */
export class KeyboardBindingError extends Data.TaggedError(
  "stax/dom/KeyboardBindingError",
)<{
  readonly binding: string;
  readonly reason: string;
}> {}

/**
 * Parse a binding string like `"mod+k"` into modifier flags and the
 * canonical key value.
 *
 * Modifier tokens are trimmed and matched case-insensitively; the key
 * token (last one) is preserved as-is so `" "` — the canonical
 * `KeyboardEvent.key` for space — round-trips correctly. `"Space"`
 * (any casing) is also accepted as a readability alias for `" "`.
 *
 * Fails with a {@link KeyboardBindingError} on unknown modifiers or
 * empty tokens.
 */
export const parseBinding = (
  binding: string,
): Effect.Effect<ParsedBinding, KeyboardBindingError> =>
  Effect.gen(function* () {
    const tokens = binding.split("+");
    if (
      tokens.length === 0 ||
      tokens.some((t, i) => t === "" && i !== tokens.length - 1)
    ) {
      // Empty modifier token — the key token is checked separately below.
      return yield* new KeyboardBindingError({
        binding,
        reason: "empty modifier token",
      });
    }

    let ctrlKey = false;
    let metaKey = false;
    let altKey = false;
    let shiftKey = false;

    for (let i = 0; i < tokens.length - 1; i++) {
      const modifier = tokens[i].trim().toLowerCase();
      if (!KNOWN_MODIFIERS.has(modifier)) {
        return yield* new KeyboardBindingError({
          binding,
          reason: `unknown modifier "${tokens[i]}" (expected one of: mod, meta, ctrl, alt, shift)`,
        });
      }
      switch (modifier) {
        case "mod":
          if (IS_MAC) metaKey = true;
          else ctrlKey = true;
          break;
        case "meta":
          metaKey = true;
          break;
        case "ctrl":
          ctrlKey = true;
          break;
        case "alt":
          altKey = true;
          break;
        case "shift":
          shiftKey = true;
          break;
      }
    }

    // Key token preserved verbatim — do NOT trim, because `" "` is
    // the canonical `KeyboardEvent.key` for space and we'd erase it.
    // "Space" (any casing) is the one accepted alias.
    const rawKey = tokens[tokens.length - 1];
    if (rawKey === "") {
      return yield* new KeyboardBindingError({
        binding,
        reason: "missing key",
      });
    }
    const key = rawKey.toLowerCase() === "space" ? " " : rawKey.toLowerCase();

    return { ctrlKey, metaKey, altKey, shiftKey, key };
  });

/**
 * True if the parsed binding's modifiers and key match the event.
 * Key comparison is case-insensitive — the binding "k" fires on plain
 * "k" as well as any event whose `.key` lowercases to "k". Shift is a
 * modifier flag; `"K"` in a binding is treated as `"k"` (still requires
 * an explicit `shift+` to fire on Shift+K).
 */
const matches = (parsed: ParsedBinding, event: KeyboardEvent): boolean => {
  if (event.ctrlKey !== parsed.ctrlKey) return false;
  if (event.metaKey !== parsed.metaKey) return false;
  if (event.altKey !== parsed.altKey) return false;
  if (event.shiftKey !== parsed.shiftKey) return false;
  return event.key.toLowerCase() === parsed.key;
};

// -----------------------------------------------------------------------------
// preventDefault resolution
// -----------------------------------------------------------------------------

const resolvePreventDefault = (
  rule: PreventDefaultRule | undefined,
  event: KeyboardEvent,
): boolean => {
  if (rule === undefined) return outsideInputs(event);
  if (typeof rule === "boolean") return rule;
  return rule(event);
};

// -----------------------------------------------------------------------------
// Listener attachment
// -----------------------------------------------------------------------------

type Attachable = Document | HTMLElement;

const attachListener = (
  target: Attachable,
  listener: (event: KeyboardEvent) => void,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.acquireRelease(
    Effect.sync(() =>
      target.addEventListener("keydown", listener as EventListener),
    ),
    () =>
      Effect.sync(() =>
        target.removeEventListener("keydown", listener as EventListener),
      ),
  );

/**
 * Attach a listener to an ElementRef, honoring its connection lifecycle.
 * Subscribes to `ref.isConnected.changes`; when the element connects,
 * add the listener; when it disconnects, remove it. On scope close,
 * unsubscribes and removes any lingering listener.
 */
const attachToElementRef = (
  ref: ElementRef,
  listener: (event: KeyboardEvent) => void,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Mutable slot for the currently attached element. Not shared with
    // any other fiber, so a plain closure variable is fine.
    let attached: HTMLElement | null = null;

    const attach = () => {
      const el = getUnsafe(ref);
      if (!(el instanceof HTMLElement)) return;
      if (attached === el) return;
      if (attached) {
        attached.removeEventListener("keydown", listener as EventListener);
      }
      el.addEventListener("keydown", listener as EventListener);
      attached = el;
    };

    const detach = () => {
      if (!attached) return;
      attached.removeEventListener("keydown", listener as EventListener);
      attached = null;
    };

    // Initial state — if the ref is already connected when we set up,
    // attach immediately. Otherwise the changes subscription below will
    // catch the first connection.
    const initialConnected = yield* ref.isConnected.get;
    if (initialConnected) attach();

    // Ride the isConnected stream for future transitions.
    yield* Effect.forkScoped(
      Stream.runForEach(ref.isConnected.changes, (connected) =>
        Effect.sync(() => {
          if (connected) attach();
          else detach();
        }),
      ),
    );

    // Guarantee cleanup even if the stream is still emitting when the
    // outer scope closes.
    yield* Effect.addFinalizer(() => Effect.sync(() => detach()));
  });

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Attach a keyboard binding. Auto-cleans up when the enclosing scope
 * closes.
 *
 * @example
 * ```ts
 * // Global — bound to `document`
 * yield* Keyboard.on("mod+k", () => open.set(true));
 *
 * // Element-local via ElementRef — auto-rebinds on mount/unmount
 * yield* Keyboard.on("Escape", () => close(), { target: containerRef });
 *
 * // Multiple bindings, one handler
 * yield* Keyboard.on(["ArrowDown", "j"], moveDown, { target: containerRef });
 *
 * // Custom preventDefault predicate
 * yield* Keyboard.on("Enter", submit, {
 *   preventDefault: (e) => paletteOpen.value === false,
 * });
 * ```
 */
export const on = (
  binding: string | readonly string[],
  handler: KeyboardHandler,
  options: KeyboardOptions = {},
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Malformed binding strings are programmer bugs, not something a
    // caller can meaningfully recover from at Keyboard.on's use site —
    // die on parse failure. Callers who DO need to handle it (dynamic
    // bindings from user prefs, config, etc.) can call `parseBinding`
    // themselves and get the typed `KeyboardBindingError` in the E
    // channel.
    const parsed = yield* Effect.orDie(
      Effect.all(
        (Array.isArray(binding) ? binding : [binding]).map(parseBinding),
      ),
    );

    // Capture the ambient runtime once at bind time so the plain-DOM
    // listener can fire the handler's Effect using the same context
    // (services, layers) as the outer program.
    const runtime = yield* Effect.runtime<never>();

    const listener = (event: KeyboardEvent) => {
      if (!parsed.some((p) => matches(p, event))) return;
      if (resolvePreventDefault(options.preventDefault, event)) {
        event.preventDefault();
      }
      if (options.stopPropagation) {
        event.stopPropagation();
      }
      // Handler is always an Effect. Fire-and-forget on the captured
      // runtime — event listeners can't await.
      Runtime.runFork(runtime)(handler(event));
    };

    const target = options.target ?? "document";
    if (target === "document") {
      yield* attachListener(document, listener);
    } else if (target instanceof HTMLElement) {
      yield* attachListener(target, listener);
    } else if (isElementRef(target)) {
      yield* attachToElementRef(target, listener);
    } else {
      // TypeScript exhaustiveness — should be unreachable.
      throw new Error(`Keyboard: unsupported target ${String(target)}`);
    }
  });

/**
 * Public namespace. Exports the `on` binder plus the named predicates
 * usable as `preventDefault` values and the `isEditableTarget` helper.
 */
export const Keyboard = {
  on,
  outsideInputs,
  withModifier,
  isEditableTarget,
} as const;
