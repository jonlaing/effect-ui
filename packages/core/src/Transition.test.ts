import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { Signal } from "./Signal.js";
import { InvalidTransition, Transition } from "./Transition.js";

describe("Transition", () => {
  describe("make", () => {
    it("should create a transition with initial state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            return yield* machine.current.get;
          }),
        ),
      );
      expect(result).toBe("idle");
    });
  });

  describe("to", () => {
    it("should transition to allowed state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            yield* machine.to("loading");
            return yield* machine.current.get;
          }),
        ),
      );
      expect(result).toBe("loading");
    });

    it("should fail when transitioning to disallowed state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            return yield* machine.to("success").pipe(Effect.either);
          }),
        ),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(InvalidTransition);
        expect(result.left.from).toBe("idle");
        expect(result.left.to).toBe("success");
        expect(result.left.allowed).toEqual(["loading"]);
      }
    });

    it("should chain multiple valid transitions", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            yield* machine.to("loading");
            yield* machine.to("success");
            yield* machine.to("idle");
            return yield* machine.current.get;
          }),
        ),
      );
      expect(result).toBe("idle");
    });
  });

  describe("is", () => {
    it("should return true when in specified state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "idle",
            );
            return yield* machine.is("idle").get;
          }),
        ),
      );
      expect(result).toBe(true);
    });

    it("should return false when not in specified state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "idle",
            );
            return yield* machine.is("loading").get;
          }),
        ),
      );
      expect(result).toBe(false);
    });

    it("should update reactively when state changes", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "idle",
            );
            const wasIdle = yield* machine.is("idle").get;
            yield* machine.to("loading");
            const isIdle = yield* machine.is("idle").get;
            const isLoading = yield* machine.is("loading").get;
            return { wasIdle, isIdle, isLoading };
          }),
        ),
      );
      expect(result).toEqual({ wasIdle: true, isIdle: false, isLoading: true });
    });
  });

  describe("canTransitionTo", () => {
    it("should return true for allowed transitions", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            return yield* machine.canTransitionTo("loading").get;
          }),
        ),
      );
      expect(result).toBe(true);
    });

    it("should return false for disallowed transitions", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            return yield* machine.canTransitionTo("success").get;
          }),
        ),
      );
      expect(result).toBe(false);
    });

    it("should update reactively when state changes", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle"],
              },
              "idle",
            );
            const canGoToSuccessFromIdle =
              yield* machine.canTransitionTo("success").get;
            yield* machine.to("loading");
            const canGoToSuccessFromLoading =
              yield* machine.canTransitionTo("success").get;
            return { canGoToSuccessFromIdle, canGoToSuccessFromLoading };
          }),
        ),
      );
      expect(result).toEqual({
        canGoToSuccessFromIdle: false,
        canGoToSuccessFromLoading: true,
      });
    });
  });

  describe("guards", () => {
    it("should allow guarded transition when guard is true", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isOnline = yield* Signal.make(true);
            const machine = yield* Transition.make(
              {
                idle: [{ to: "loading", when: isOnline }],
                loading: ["success"],
                success: ["idle"],
              },
              "idle",
            );
            yield* machine.to("loading");
            return yield* machine.current.get;
          }),
        ),
      );
      expect(result).toBe("loading");
    });

    it("should block guarded transition when guard is false", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isOnline = yield* Signal.make(false);
            const machine = yield* Transition.make(
              {
                idle: [{ to: "loading", when: isOnline }],
                loading: ["success"],
                success: ["idle"],
              },
              "idle",
            );
            return yield* machine.to("loading").pipe(Effect.either);
          }),
        ),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(InvalidTransition);
      }
    });

    it("should reactively update canTransitionTo when guard changes", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isOnline = yield* Signal.make(false);
            const machine = yield* Transition.make(
              {
                idle: [{ to: "loading", when: isOnline }],
                loading: ["success"],
                success: ["idle"],
              },
              "idle",
            );
            const canWhenOffline =
              yield* machine.canTransitionTo("loading").get;
            yield* isOnline.set(true);
            const canWhenOnline = yield* machine.canTransitionTo("loading").get;
            return { canWhenOffline, canWhenOnline };
          }),
        ),
      );
      expect(result).toEqual({ canWhenOffline: false, canWhenOnline: true });
    });

    it("should allow unguarded path when guarded path fails", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const premiumUser = yield* Signal.make(false);
            const machine = yield* Transition.make(
              {
                idle: [
                  { to: "premium", when: premiumUser },
                  "basic", // always allowed
                ],
                premium: ["idle"],
                basic: ["idle"],
              },
              "idle",
            );
            const canGoPremium = yield* machine.canTransitionTo("premium").get;
            const canGoBasic = yield* machine.canTransitionTo("basic").get;
            return { canGoPremium, canGoBasic };
          }),
        ),
      );
      expect(result).toEqual({ canGoPremium: false, canGoBasic: true });
    });

    it("should handle multiple guards to same target (OR logic)", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const isAdmin = yield* Signal.make(false);
            const hasPermission = yield* Signal.make(false);
            const machine = yield* Transition.make(
              {
                idle: [
                  { to: "admin", when: isAdmin },
                  { to: "admin", when: hasPermission },
                ],
                admin: ["idle"],
              },
              "idle",
            );

            // Neither guard passes
            const canWhenNeither = yield* machine.canTransitionTo("admin").get;

            // First guard passes
            yield* isAdmin.set(true);
            const canWhenAdmin = yield* machine.canTransitionTo("admin").get;

            // Reset, second guard passes
            yield* isAdmin.set(false);
            yield* hasPermission.set(true);
            const canWhenHasPermission =
              yield* machine.canTransitionTo("admin").get;

            return { canWhenNeither, canWhenAdmin, canWhenHasPermission };
          }),
        ),
      );
      expect(result).toEqual({
        canWhenNeither: false,
        canWhenAdmin: true,
        canWhenHasPermission: true,
      });
    });
  });

  describe("guard (callback)", () => {
    it("should run callback when in enabled state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "idle",
            );

            const submit = machine.guard(["idle"], () =>
              Effect.succeed("submitted"),
            );

            return yield* submit();
          }),
        ),
      );
      expect(result).toBe("submitted");
    });

    it("should fail when not in enabled state (default)", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "loading",
            );

            const submit = machine.guard(["idle"], () =>
              Effect.succeed("submitted"),
            );

            return yield* submit().pipe(Effect.either);
          }),
        ),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(InvalidTransition);
        expect(result.left.from).toBe("loading");
      }
    });

    it("should return void when blocked with onBlocked: ignore", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "loading",
            );

            const submit = machine.guard(
              ["idle"],
              () => Effect.succeed("submitted"),
              { onBlocked: "ignore" },
            );

            return yield* submit();
          }),
        ),
      );
      expect(result).toBeUndefined();
    });

    it("should pass arguments to callback", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "idle",
            );

            const submitWithData = machine.guard(
              ["idle"],
              (name: string, value: number) =>
                Effect.succeed(`${name}: ${value}`),
            );

            return yield* submitWithData("count", 42);
          }),
        ),
      );
      expect(result).toBe("count: 42");
    });

    it("should allow multiple enabled states", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success", "error"],
                success: ["idle"],
                error: ["idle", "loading"],
              },
              "error",
            );

            const retry = machine.guard(["idle", "error"], () =>
              Effect.succeed("retrying"),
            );

            return yield* retry();
          }),
        ),
      );
      expect(result).toBe("retrying");
    });
  });

  describe("InvalidTransition error", () => {
    it("should have correct error message", () => {
      const error = new InvalidTransition("idle", "success", [
        "loading",
        "error",
      ]);
      expect(error.message).toBe(
        'Invalid transition from "idle" to "success". Allowed: [loading, error]',
      );
      expect(error._tag).toBe("InvalidTransition");
    });
  });

  describe("edge cases", () => {
    it("should handle empty transitions array", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                terminal: [],
              },
              "terminal",
            );
            const canTransition =
              yield* machine.canTransitionTo("terminal").get;
            return canTransition;
          }),
        ),
      );
      expect(result).toBe(false);
    });

    it("should handle self-transition when explicitly allowed", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                counting: ["counting", "done"],
                done: [],
              },
              "counting",
            );
            yield* machine.to("counting");
            yield* machine.to("counting");
            yield* machine.to("done");
            return yield* machine.current.get;
          }),
        ),
      );
      expect(result).toBe("done");
    });

    it("should not allow self-transition when not explicitly listed", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const machine = yield* Transition.make(
              {
                idle: ["loading"],
                loading: ["success"],
                success: [],
              },
              "idle",
            );
            return yield* machine.to("idle").pipe(Effect.either);
          }),
        ),
      );
      expect(result._tag).toBe("Left");
    });
  });
});
