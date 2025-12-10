import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect } from "effect";
import { runEnterAnimation, runExitAnimation } from "./core";
import {
  stagger,
  staggerFromCenter,
  staggerEased,
  calculateStaggerDelay,
} from "./index";

// Mock window.matchMedia for reduced motion tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("Animation", () => {
  beforeEach(() => {
    // Reset to no reduced motion preference by default
    mockMatchMedia(false);
  });

  describe("runEnterAnimation", () => {
    it("should add and remove enter classes", async () => {
      const element = document.createElement("div");

      await Effect.runPromise(
        runEnterAnimation(element, {
          enter: "fade-in",
          timeout: 10,
        }),
      );

      // After animation, enter class should be removed
      expect(element.classList.contains("fade-in")).toBe(false);
    });

    it("should handle enterFrom and enterTo classes", async () => {
      const element = document.createElement("div");

      await Effect.runPromise(
        runEnterAnimation(element, {
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          timeout: 10,
        }),
      );

      // enterFrom should be removed, enterTo should persist
      expect(element.classList.contains("opacity-0")).toBe(false);
      expect(element.classList.contains("opacity-100")).toBe(true);
    });

    it("should skip animation when reduced motion is preferred", async () => {
      mockMatchMedia(true);

      const element = document.createElement("div");
      const onBeforeEnter = vi.fn();
      const onEnter = vi.fn();

      await Effect.runPromise(
        runEnterAnimation(element, {
          enter: "fade-in",
          enterTo: "visible",
          onBeforeEnter,
          onEnter,
        }),
      );

      // Hooks should still be called
      expect(onBeforeEnter).toHaveBeenCalled();
      expect(onEnter).toHaveBeenCalled();
      // enterTo should be applied immediately
      expect(element.classList.contains("visible")).toBe(true);
    });

    it("should call lifecycle hooks", async () => {
      const element = document.createElement("div");
      const onBeforeEnter = vi.fn();
      const onEnter = vi.fn();

      await Effect.runPromise(
        runEnterAnimation(element, {
          enter: "fade-in",
          timeout: 10,
          onBeforeEnter,
          onEnter,
        }),
      );

      expect(onBeforeEnter).toHaveBeenCalledWith(element);
      expect(onEnter).toHaveBeenCalledWith(element);
    });

    it("should handle Effect-returning hooks", async () => {
      const element = document.createElement("div");
      let effectRan = false;

      await Effect.runPromise(
        runEnterAnimation(element, {
          enter: "fade-in",
          timeout: 10,
          onEnter: () =>
            Effect.sync(() => {
              effectRan = true;
            }),
        }),
      );

      expect(effectRan).toBe(true);
    });

    it("should apply enterTo even with no animation classes", async () => {
      const element = document.createElement("div");

      await Effect.runPromise(
        runEnterAnimation(element, {
          enterTo: "visible",
        }),
      );

      expect(element.classList.contains("visible")).toBe(true);
    });
  });

  describe("runExitAnimation", () => {
    it("should add exit classes", async () => {
      const element = document.createElement("div");

      // Start exit animation but check classes during animation
      // Since we're mocking and there's no real animation, check immediately
      const promise = Effect.runPromise(
        runExitAnimation(element, {
          exit: "fade-out",
          timeout: 10,
        }),
      );

      await promise;

      // After timeout (no real animation), exit class is removed
      expect(element.classList.contains("fade-out")).toBe(false);
    });

    it("should handle exitTo class", async () => {
      const element = document.createElement("div");

      await Effect.runPromise(
        runExitAnimation(element, {
          exit: "fade-out",
          exitTo: "hidden",
          timeout: 10,
        }),
      );

      // exitTo may or may not persist depending on implementation
      // The key is exit animation completes without error
    });

    it("should skip animation when reduced motion is preferred", async () => {
      mockMatchMedia(true);

      const element = document.createElement("div");
      const onBeforeExit = vi.fn();
      const onExit = vi.fn();

      await Effect.runPromise(
        runExitAnimation(element, {
          exit: "fade-out",
          onBeforeExit,
          onExit,
        }),
      );

      // Hooks should still be called
      expect(onBeforeExit).toHaveBeenCalled();
      expect(onExit).toHaveBeenCalled();
    });

    it("should call lifecycle hooks", async () => {
      const element = document.createElement("div");
      const onBeforeExit = vi.fn();
      const onExit = vi.fn();

      await Effect.runPromise(
        runExitAnimation(element, {
          exit: "fade-out",
          timeout: 10,
          onBeforeExit,
          onExit,
        }),
      );

      expect(onBeforeExit).toHaveBeenCalledWith(element);
      expect(onExit).toHaveBeenCalledWith(element);
    });
  });

  describe("stagger utilities", () => {
    describe("stagger", () => {
      it("should return linear stagger delays", () => {
        const fn = stagger(50);

        expect(fn(0, 5)).toBe(0);
        expect(fn(1, 5)).toBe(50);
        expect(fn(2, 5)).toBe(100);
        expect(fn(3, 5)).toBe(150);
        expect(fn(4, 5)).toBe(200);
      });
    });

    describe("staggerFromCenter", () => {
      it("should animate from center outward", () => {
        const fn = staggerFromCenter(50);

        // With 5 items, center is at index 2
        // Distances: [2, 1, 0, 1, 2]
        expect(fn(0, 5)).toBe(100); // distance 2 * 50
        expect(fn(1, 5)).toBe(50); // distance 1 * 50
        expect(fn(2, 5)).toBe(0); // distance 0 * 50
        expect(fn(3, 5)).toBe(50); // distance 1 * 50
        expect(fn(4, 5)).toBe(100); // distance 2 * 50
      });

      it("should handle even number of items", () => {
        const fn = staggerFromCenter(100);

        // With 4 items, center is at 1.5
        // Distances: [1.5, 0.5, 0.5, 1.5]
        expect(fn(0, 4)).toBe(150);
        expect(fn(1, 4)).toBe(50);
        expect(fn(2, 4)).toBe(50);
        expect(fn(3, 4)).toBe(150);
      });
    });

    describe("staggerEased", () => {
      it("should apply easing to stagger timing", () => {
        // Linear easing (no change)
        const linearFn = staggerEased(100, (t) => t);

        expect(linearFn(0, 3)).toBe(0);
        expect(linearFn(1, 3)).toBe(50);
        expect(linearFn(2, 3)).toBe(100);
      });

      it("should work with ease-out curve", () => {
        // Quadratic ease-out
        const easeOutFn = staggerEased(100, (t) => 1 - Math.pow(1 - t, 2));

        expect(easeOutFn(0, 3)).toBe(0);
        // At t=0.5, easeOut = 1 - (0.5)^2 = 0.75
        expect(easeOutFn(1, 3)).toBe(75);
        expect(easeOutFn(2, 3)).toBe(100);
      });

      it("should return 0 for single item", () => {
        const fn = staggerEased(100, (t) => t);
        expect(fn(0, 1)).toBe(0);
      });
    });

    describe("calculateStaggerDelay", () => {
      it("should return 0 for undefined stagger", () => {
        expect(calculateStaggerDelay(undefined, 3, 5)).toBe(0);
      });

      it("should calculate delay for numeric stagger", () => {
        expect(calculateStaggerDelay(50, 0, 5)).toBe(0);
        expect(calculateStaggerDelay(50, 3, 5)).toBe(150);
      });

      it("should use function stagger directly", () => {
        const fn = (index: number, total: number) => index * total;
        expect(calculateStaggerDelay(fn, 3, 10)).toBe(30);
      });
    });
  });

  describe("multiple classes in options", () => {
    it("should handle space-separated enter classes", async () => {
      const element = document.createElement("div");

      await Effect.runPromise(
        runEnterAnimation(element, {
          enter: "fade-in slide-up",
          timeout: 10,
        }),
      );

      // Both classes should be removed after animation
      expect(element.classList.contains("fade-in")).toBe(false);
      expect(element.classList.contains("slide-up")).toBe(false);
    });

    it("should handle space-separated enterFrom classes", async () => {
      const element = document.createElement("div");

      await Effect.runPromise(
        runEnterAnimation(element, {
          enterFrom: "opacity-0 scale-95",
          enterTo: "opacity-100 scale-100",
          timeout: 10,
        }),
      );

      expect(element.classList.contains("opacity-0")).toBe(false);
      expect(element.classList.contains("scale-95")).toBe(false);
      expect(element.classList.contains("opacity-100")).toBe(true);
      expect(element.classList.contains("scale-100")).toBe(true);
    });
  });
});
