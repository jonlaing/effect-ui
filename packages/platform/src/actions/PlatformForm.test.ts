import { describe, it, expect } from "vitest";
import { Effect, Option, Schema, Stream } from "effect";
import { Form } from "./PlatformForm";
import { Reaction } from "@effex/dom";
import { makeRouterLayer } from "@effex/router";
import type { BaseRouter, ActionResult } from "@effex/router";
import type { Readable } from "@effex/core";

// Helper to run scoped effects with proper typing
// The cast is needed because BaseRouter.submitAction has unknown requirements
const runScoped = <A>(effect: Effect.Effect<A, unknown, unknown>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect) as Effect.Effect<A, never, never>);

// Create a simple readable for testing
const makeTestReadable = <A>(value: A): Readable.Readable<A> => {
  const readable: Readable.Readable<A> = {
    get: Effect.sync(() => value),
    changes: Stream.empty,
    values: Stream.make(value),
    map: <B>(f: (a: A) => B): Readable.Readable<B> =>
      makeTestReadable(f(value)),
  };
  return readable;
};

// Mock router for testing
// Note: We use `unknown` cast here because BaseRouter.layer is self-referential
// (the layer references the router that contains it). This is unavoidable for
// creating such circular structures in TypeScript.
const createMockRouter = (options?: {
  initialPath?: string;
  actionResult?: ActionResult | null;
  submitAction?: (formData: FormData) => Effect.Effect<ActionResult | null>;
}): BaseRouter => {
  const {
    initialPath = "/",
    actionResult = null,
    submitAction,
  } = options ?? {};
  let pathname = initialPath;

  // Create partial router first (all properties except layer)
  const partialRouter = {
    pathname: makeTestReadable(pathname),
    searchParams: makeTestReadable(new URLSearchParams()),
    currentRoute: makeTestReadable(Option.some("test")),
    loaderState: makeTestReadable({
      routeName: "test",
      params: {},
      data: null,
      isLoading: false,
      error: null,
    }),
    actionState: makeTestReadable({
      isSubmitting: false,
      data: null,
      error: null,
      routeName: null,
      submissionId: null,
    }),
    push: (path: string) =>
      Effect.sync(() => {
        pathname = path;
      }),
    replace: (path: string) =>
      Effect.sync(() => {
        pathname = path;
      }),
    back: () => Effect.void,
    forward: () => Effect.void,
    submitAction: submitAction ?? (() => Effect.succeed(actionResult)),
  };

  // Create layer then combine into full router using Object.assign
  // The unknown cast is required for self-referential structures
  const layer = makeRouterLayer(partialRouter as unknown as BaseRouter);
  return Object.assign({}, partialRouter, { layer }) as BaseRouter;
};

describe("PlatformForm", () => {
  describe("Form.make", () => {
    it("should create a form with initial values", async () => {
      const router = createMockRouter();
      const routerLayer = makeRouterLayer(router);

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
                password: Schema.String,
              }),
              initial: { email: "test@example.com", password: "secret123" },
            });

            const values = yield* form.getValues();
            return values;
          }).pipe(Effect.provide(routerLayer)),
        ),
      );

      expect(result).toEqual({
        email: "test@example.com",
        password: "secret123",
      });
    });

    it("should provide field access with correct initial values", async () => {
      const router = createMockRouter();
      const routerLayer = makeRouterLayer(router);

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                name: Schema.String,
                age: Schema.Number,
              }),
              initial: { name: "Alice", age: 30 },
            });

            const name = yield* form.fields.name.value.get;
            const age = yield* form.fields.age.value.get;
            return { name, age };
          }).pipe(Effect.provide(routerLayer)),
        ),
      );

      expect(result).toEqual({ name: "Alice", age: 30 });
    });

    it("should have submitToAction method", async () => {
      const router = createMockRouter();
      const routerLayer = makeRouterLayer(router);

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const form = yield* Form.make({
              schema: Schema.Struct({
                email: Schema.String,
              }),
              initial: { email: "test@example.com" },
            });

            return typeof form.submitToAction;
          }).pipe(Effect.provide(routerLayer)),
        ),
      );

      expect(result).toBe("function");
    });
  });

  describe("submitToAction", () => {
    it("should call router.submitAction with form data", async () => {
      let capturedFormData: FormData | null = null;

      const mockRouter = createMockRouter({
        submitAction: (formData: FormData) => {
          capturedFormData = formData;
          return Effect.succeed({ routeName: "test", data: { success: true } });
        },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String,
              name: Schema.String,
            }),
            initial: { email: "test@example.com", name: "John" },
          });

          yield* form.submitToAction();
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(capturedFormData).not.toBeNull();
      expect(capturedFormData!.get("email")).toBe("test@example.com");
      expect(capturedFormData!.get("name")).toBe("John");
    });

    it("should return action result", async () => {
      const expectedResult: ActionResult = {
        routeName: "contacts",
        data: { id: 123, message: "Created" },
      };

      const router = createMockRouter({ actionResult: expectedResult });
      const routerLayer = makeRouterLayer(router);

      const result = await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String,
            }),
            initial: { email: "test@example.com" },
          });

          return yield* form.submitToAction();
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(result).toEqual(expectedResult);
    });

    it("should sync errors from action response to form fields", async () => {
      const actionResult: ActionResult = {
        routeName: "contacts",
        data: {
          errors: {
            email: ["Email already exists"],
            name: ["Name is required"],
          },
        },
      };

      const router = createMockRouter({ actionResult });
      const routerLayer = makeRouterLayer(router);

      const lastEmailErrors = { value: [] as readonly string[] };
      const lastNameErrors = { value: [] as readonly string[] };

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String,
              name: Schema.String,
            }),
            initial: { email: "", name: "" },
          });

          // Set up reactions to capture error changes
          yield* Reaction.make([form.fields.email.errors], ([e]) =>
            Effect.sync(() => {
              lastEmailErrors.value = e;
            }),
          );
          yield* Reaction.make([form.fields.name.errors], ([e]) =>
            Effect.sync(() => {
              lastNameErrors.value = e;
            }),
          );

          yield* Effect.sleep(10);
          yield* form.submitToAction();
          yield* Effect.sleep(10);
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(lastEmailErrors.value).toContain("Email already exists");
      expect(lastNameErrors.value).toContain("Name is required");
    });
  });

  describe("action mode", () => {
    it("should use action submission when action: true", async () => {
      let submitActionCalled = false;

      const mockRouter = createMockRouter({
        submitAction: () => {
          submitActionCalled = true;
          return Effect.succeed({ routeName: "test", data: { success: true } });
        },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String,
            }),
            initial: { email: "test@example.com" },
            action: true,
          });

          yield* form.submit();
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(submitActionCalled).toBe(true);
    });

    it("should validate before submitting to action", async () => {
      let submitActionCalled = false;

      const mockRouter = createMockRouter({
        submitAction: () => {
          submitActionCalled = true;
          return Effect.succeed({ routeName: "test", data: { success: true } });
        },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String.pipe(Schema.nonEmptyString()),
            }),
            initial: { email: "" }, // Invalid - empty
            action: true,
          });

          yield* form.submit();
        }).pipe(Effect.provide(routerLayer)),
      );

      // Should not call action because validation failed
      expect(submitActionCalled).toBe(false);
    });

    it("should touch all fields before validation in action mode", async () => {
      const mockRouter = createMockRouter({
        actionResult: { routeName: "test", data: { success: true } },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      const result = await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String.pipe(Schema.nonEmptyString()),
              name: Schema.String.pipe(Schema.nonEmptyString()),
            }),
            initial: { email: "", name: "" },
            action: true,
          });

          yield* form.submit();

          const emailTouched = yield* form.fields.email.touched.get;
          const nameTouched = yield* form.fields.name.touched.get;

          return { emailTouched, nameTouched };
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(result.emailTouched).toBe(true);
      expect(result.nameTouched).toBe(true);
    });

    it("should call custom handler after successful action", async () => {
      let handlerCalledWith: { email: string } | null = null;

      const mockRouter = createMockRouter({
        actionResult: { routeName: "test", data: { success: true } },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String,
            }),
            initial: { email: "test@example.com" },
            action: true,
          });

          yield* form.submit((values) =>
            Effect.sync(() => {
              handlerCalledWith = values;
            }),
          );
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(handlerCalledWith).toEqual({ email: "test@example.com" });
    });

    it("should not call custom handler when action returns errors", async () => {
      let handlerCalled = false;

      const mockRouter = createMockRouter({
        actionResult: {
          routeName: "test",
          data: { errors: { email: ["Already exists"] } },
        },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              email: Schema.String,
            }),
            initial: { email: "test@example.com" },
            action: true,
          });

          yield* form.submit(() =>
            Effect.sync(() => {
              handlerCalled = true;
            }),
          );
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(handlerCalled).toBe(false);
    });
  });

  describe("toFormData conversion", () => {
    it("should convert simple values to FormData", async () => {
      let capturedFormData: FormData | null = null;

      const mockRouter = createMockRouter({
        submitAction: (formData: FormData) => {
          capturedFormData = formData;
          return Effect.succeed(null);
        },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              name: Schema.String,
              age: Schema.Number,
              active: Schema.Boolean,
            }),
            initial: { name: "John", age: 30, active: true },
          });

          yield* form.submitToAction();
        }).pipe(Effect.provide(routerLayer)),
      );

      expect(capturedFormData!.get("name")).toBe("John");
      expect(capturedFormData!.get("age")).toBe("30");
      expect(capturedFormData!.get("active")).toBe("true");
    });

    it("should handle null and undefined values", async () => {
      let capturedFormData: FormData | null = null;

      const mockRouter = createMockRouter({
        submitAction: (formData: FormData) => {
          capturedFormData = formData;
          return Effect.succeed(null);
        },
      });

      const routerLayer = makeRouterLayer(mockRouter);

      await runScoped(
        Effect.gen(function* () {
          const form = yield* Form.make({
            schema: Schema.Struct({
              optional: Schema.NullOr(Schema.String),
            }),
            initial: { optional: null },
          });

          yield* form.submitToAction();
        }).pipe(Effect.provide(routerLayer)),
      );

      // null values should not be included
      expect(capturedFormData!.has("optional")).toBe(false);
    });
  });
});
