import { describe, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import { beforeEach, expect } from "vitest";

import { bindElementToRef } from "../Element/index.js";
import * as ElementRef from "../Element/ref.js";
import {
  isEditableTarget,
  Keyboard,
  KeyboardBindingError,
  outsideInputs,
  parseBinding,
  withModifier,
} from "./Keyboard.js";

// Detect whether the test process is on macOS. Matches the module's own
// detection so we can assert the `mod` mapping correctly regardless of
// where the test runs.
const IS_MAC =
  typeof navigator !== "undefined" &&
  ((navigator as { userAgentData?: { platform?: string } }).userAgentData
    ?.platform === "macOS" ||
    /\bMac\b/i.test(navigator.userAgent));

// Convenience for constructing keyboard events with the shape the module
// matches against.
const key = (
  k: string,
  modifiers: Partial<
    Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "altKey" | "shiftKey">
  > = {},
): KeyboardEvent =>
  new KeyboardEvent("keydown", {
    key: k,
    bubbles: true,
    cancelable: true,
    ...modifiers,
  });

// Small sleep — the keyboard listener runs handler Effects via
// Runtime.runFork, which is fire-and-forget. Tests that assert side
// effects from the Effect path give it a beat.
const tick = Effect.sleep("5 millis");

describe("Keyboard.parseBinding", () => {
  it.scopedLive("parses a plain key", () =>
    Effect.gen(function* () {
      const parsed = yield* parseBinding("k");
      expect(parsed).toEqual({
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        key: "k",
      });
    }),
  );

  it.scopedLive("parses a named key case-insensitively", () =>
    Effect.gen(function* () {
      // The parser lowercases everything; matches use event.key.toLowerCase()
      // too, so this still fires against real Escape events.
      const parsed = yield* parseBinding("Escape");
      expect(parsed.key).toBe("escape");
    }),
  );

  it.scopedLive("parses each explicit modifier", () =>
    Effect.gen(function* () {
      expect((yield* parseBinding("ctrl+k")).ctrlKey).toBe(true);
      expect((yield* parseBinding("meta+k")).metaKey).toBe(true);
      expect((yield* parseBinding("alt+k")).altKey).toBe(true);
      expect((yield* parseBinding("shift+k")).shiftKey).toBe(true);
    }),
  );

  it.scopedLive("normalizes `mod` per platform", () =>
    Effect.gen(function* () {
      const parsed = yield* parseBinding("mod+k");
      if (IS_MAC) {
        expect(parsed.metaKey).toBe(true);
        expect(parsed.ctrlKey).toBe(false);
      } else {
        expect(parsed.ctrlKey).toBe(true);
        expect(parsed.metaKey).toBe(false);
      }
    }),
  );

  it.scopedLive("aliases `Space` (any casing) to a literal space", () =>
    Effect.gen(function* () {
      expect((yield* parseBinding("Space")).key).toBe(" ");
      expect((yield* parseBinding("space")).key).toBe(" ");
      expect((yield* parseBinding("mod+Space")).key).toBe(" ");
    }),
  );

  it.scopedLive('accepts the canonical `" "` (literal space) verbatim', () =>
    Effect.gen(function* () {
      expect((yield* parseBinding(" ")).key).toBe(" ");
      expect((yield* parseBinding("mod+ ")).key).toBe(" ");
    }),
  );

  it.scopedLive("combines multiple modifiers", () =>
    Effect.gen(function* () {
      const parsed = yield* parseBinding("ctrl+shift+alt+k");
      expect(parsed.ctrlKey).toBe(true);
      expect(parsed.shiftKey).toBe(true);
      expect(parsed.altKey).toBe(true);
      expect(parsed.key).toBe("k");
    }),
  );

  it.scopedLive("fails with KeyboardBindingError on an unknown modifier", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(parseBinding("super+k"));
      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        const failure = Cause.failureOption(exit.cause);
        expect(failure._tag).toBe("Some");
        if (failure._tag === "Some") {
          expect(failure.value).toBeInstanceOf(KeyboardBindingError);
          expect(failure.value.binding).toBe("super+k");
          expect(failure.value.reason).toMatch(/unknown modifier/i);
        }
      }
    }),
  );

  it.scopedLive("fails on an empty modifier token", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(parseBinding("ctrl++k"));
      expect(Exit.isFailure(exit)).toBe(true);
    }),
  );

  it.scopedLive("fails on a missing key (trailing +)", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(parseBinding("ctrl+"));
      expect(Exit.isFailure(exit)).toBe(true);
    }),
  );
});

describe("Keyboard.isEditableTarget", () => {
  it("returns true for a text input", () => {
    const el = document.createElement("input");
    el.type = "text";
    expect(isEditableTarget(el)).toBe(true);
  });

  it("returns false for a checkbox input", () => {
    const el = document.createElement("input");
    el.type = "checkbox";
    expect(isEditableTarget(el)).toBe(false);
  });

  it("returns true for a textarea", () => {
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
  });

  it("returns true for contenteditable", () => {
    const el = document.createElement("div");
    el.setAttribute("contenteditable", "true");
    // jsdom doesn't fully implement contenteditable, but it does honor
    // the attribute for `isContentEditable`. Guard anyway.
    if (el.isContentEditable) expect(isEditableTarget(el)).toBe(true);
  });

  it("returns false for a plain div", () => {
    expect(isEditableTarget(document.createElement("div"))).toBe(false);
  });

  it("returns false for null", () => {
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe("Keyboard.outsideInputs / withModifier", () => {
  it("outsideInputs is true when target is not editable", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const event = new KeyboardEvent("keydown", { key: "j" });
    Object.defineProperty(event, "target", { value: el });
    expect(outsideInputs(event)).toBe(true);
    el.remove();
  });

  it("outsideInputs is false when target is a text input", () => {
    const el = document.createElement("input");
    el.type = "text";
    document.body.appendChild(el);
    const event = new KeyboardEvent("keydown", { key: "j" });
    Object.defineProperty(event, "target", { value: el });
    expect(outsideInputs(event)).toBe(false);
    el.remove();
  });

  it("withModifier is true when Ctrl / Meta / Alt is pressed", () => {
    expect(withModifier(key("k", { ctrlKey: true }))).toBe(true);
    expect(withModifier(key("k", { metaKey: true }))).toBe(true);
    expect(withModifier(key("k", { altKey: true }))).toBe(true);
  });

  it("withModifier is false for a bare key or Shift alone", () => {
    expect(withModifier(key("k"))).toBe(false);
    expect(withModifier(key("K", { shiftKey: true }))).toBe(false);
  });
});

describe("Keyboard.on — document target", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive("fires the handler on a matching keydown", () =>
    Effect.gen(function* () {
      let count = 0;
      yield* Keyboard.on("k", () =>
        Effect.sync(() => {
          count++;
        }),
      );

      document.dispatchEvent(key("k"));
      yield* tick;
      expect(count).toBe(1);

      document.dispatchEvent(key("k"));
      yield* tick;
      expect(count).toBe(2);
    }),
  );

  it.scopedLive("does not fire on a non-matching key", () =>
    Effect.gen(function* () {
      let count = 0;
      yield* Keyboard.on("k", () =>
        Effect.sync(() => {
          count++;
        }),
      );

      document.dispatchEvent(key("j"));
      yield* tick;
      expect(count).toBe(0);
    }),
  );

  it.scopedLive("matches modifiers exactly (mod+k does not fire on k)", () =>
    Effect.gen(function* () {
      let plain = 0;
      let modK = 0;
      yield* Keyboard.on("k", () =>
        Effect.sync(() => {
          plain++;
        }),
      );
      yield* Keyboard.on("mod+k", () =>
        Effect.sync(() => {
          modK++;
        }),
      );

      document.dispatchEvent(key("k"));
      yield* tick;
      expect(plain).toBe(1);
      expect(modK).toBe(0);

      document.dispatchEvent(
        key("k", IS_MAC ? { metaKey: true } : { ctrlKey: true }),
      );
      yield* tick;
      expect(plain).toBe(1);
      expect(modK).toBe(1);
    }),
  );

  it.scopedLive("supports multiple bindings for one handler", () =>
    Effect.gen(function* () {
      let count = 0;
      yield* Keyboard.on(["ArrowDown", "j"], () =>
        Effect.sync(() => {
          count++;
        }),
      );

      document.dispatchEvent(key("ArrowDown"));
      document.dispatchEvent(key("j"));
      yield* tick;
      expect(count).toBe(2);
    }),
  );

  it.scopedLive("removes the listener when the enclosing scope closes", () =>
    Effect.gen(function* () {
      let count = 0;
      yield* Effect.scoped(
        Effect.gen(function* () {
          yield* Keyboard.on("k", () =>
            Effect.sync(() => {
              count++;
            }),
          );
          document.dispatchEvent(key("k"));
          yield* tick;
          expect(count).toBe(1);
        }),
      );
      document.dispatchEvent(key("k"));
      yield* tick;
      expect(count).toBe(1);
    }),
  );

  it.scopedLive("dies on a malformed binding", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        Keyboard.on("super+k", () => Effect.void),
      );
      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        expect(Cause.isDie(exit.cause)).toBe(true);
      }
    }),
  );
});

describe("Keyboard.on — preventDefault + stopPropagation", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive(
    "smart default: preventDefaults outside inputs, not inside",
    () =>
      Effect.gen(function* () {
        yield* Keyboard.on("j", () => Effect.void);

        const outside = key("j");
        Object.defineProperty(outside, "target", { value: document.body });
        document.dispatchEvent(outside);
        expect(outside.defaultPrevented).toBe(true);

        const input = document.createElement("input");
        input.type = "text";
        document.body.appendChild(input);
        const inside = key("j");
        Object.defineProperty(inside, "target", { value: input });
        document.dispatchEvent(inside);
        expect(inside.defaultPrevented).toBe(false);
      }),
  );

  it.scopedLive("preventDefault: true always fires", () =>
    Effect.gen(function* () {
      yield* Keyboard.on("j", () => Effect.void, { preventDefault: true });

      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);
      const event = key("j");
      Object.defineProperty(event, "target", { value: input });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }),
  );

  it.scopedLive("preventDefault: false never fires", () =>
    Effect.gen(function* () {
      yield* Keyboard.on("j", () => Effect.void, { preventDefault: false });

      const event = key("j");
      Object.defineProperty(event, "target", { value: document.body });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }),
  );

  it.scopedLive("preventDefault predicate is evaluated per event", () =>
    Effect.gen(function* () {
      let allow = false;
      yield* Keyboard.on("j", () => Effect.void, {
        preventDefault: () => allow,
      });

      const e1 = key("j");
      document.dispatchEvent(e1);
      expect(e1.defaultPrevented).toBe(false);

      allow = true;
      const e2 = key("j");
      document.dispatchEvent(e2);
      expect(e2.defaultPrevented).toBe(true);
    }),
  );

  it.scopedLive("stopPropagation: false lets the event bubble", () =>
    Effect.gen(function* () {
      const child = document.createElement("div");
      document.body.appendChild(child);

      let bubbled = 0;
      const bubbleListener = () => {
        bubbled++;
      };
      document.addEventListener("keydown", bubbleListener);

      yield* Keyboard.on("k", () => Effect.void, { target: child });
      child.dispatchEvent(key("k"));
      expect(bubbled).toBe(1);

      document.removeEventListener("keydown", bubbleListener);
    }),
  );

  it.scopedLive("stopPropagation: true keeps the event from bubbling", () =>
    Effect.gen(function* () {
      const child = document.createElement("div");
      document.body.appendChild(child);

      let bubbled = 0;
      const bubbleListener = () => {
        bubbled++;
      };
      document.addEventListener("keydown", bubbleListener);

      yield* Keyboard.on("k", () => Effect.void, {
        target: child,
        stopPropagation: true,
      });
      child.dispatchEvent(key("k"));
      expect(bubbled).toBe(0);

      document.removeEventListener("keydown", bubbleListener);
    }),
  );
});

describe("Keyboard.on — HTMLElement target", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive("attaches to the specific element", () =>
    Effect.gen(function* () {
      const el = document.createElement("div");
      document.body.appendChild(el);

      let count = 0;
      yield* Keyboard.on(
        "Escape",
        () =>
          Effect.sync(() => {
            count++;
          }),
        { target: el },
      );

      el.dispatchEvent(key("Escape"));
      yield* tick;
      expect(count).toBe(1);

      document.dispatchEvent(key("Escape"));
      yield* tick;
      expect(count).toBe(1);
    }),
  );

  it.scopedLive("scoped cleanup removes the element listener", () =>
    Effect.gen(function* () {
      const el = document.createElement("div");
      document.body.appendChild(el);

      let count = 0;
      yield* Effect.scoped(
        Effect.gen(function* () {
          yield* Keyboard.on(
            "Escape",
            () =>
              Effect.sync(() => {
                count++;
              }),
            { target: el },
          );
          el.dispatchEvent(key("Escape"));
          yield* tick;
        }),
      );
      expect(count).toBe(1);

      el.dispatchEvent(key("Escape"));
      yield* tick;
      expect(count).toBe(1);
    }),
  );
});

describe("Keyboard.on — ElementRef target", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it.scopedLive("attaches when the ref's element is already connected", () =>
    Effect.gen(function* () {
      const ref = yield* ElementRef.make<HTMLDivElement>();
      const el = document.createElement("div");
      document.body.appendChild(el);
      bindElementToRef(ref, el);

      let count = 0;
      yield* Keyboard.on(
        "Escape",
        () =>
          Effect.sync(() => {
            count++;
          }),
        { target: ref },
      );

      el.dispatchEvent(key("Escape"));
      yield* tick;
      expect(count).toBe(1);
    }),
  );

  it.scopedLive(
    "removes the listener when the scope closes even if the element is still connected",
    () =>
      Effect.gen(function* () {
        const ref = yield* ElementRef.make<HTMLDivElement>();
        const el = document.createElement("div");
        document.body.appendChild(el);
        bindElementToRef(ref, el);

        let count = 0;
        yield* Effect.scoped(
          Effect.gen(function* () {
            yield* Keyboard.on(
              "Escape",
              () =>
                Effect.sync(() => {
                  count++;
                }),
              { target: ref },
            );
            el.dispatchEvent(key("Escape"));
            yield* tick;
          }),
        );
        expect(count).toBe(1);

        el.dispatchEvent(key("Escape"));
        yield* tick;
        expect(count).toBe(1);
      }),
  );
});
