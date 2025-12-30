import { describe, it, expect } from "vitest";
import { Effect, Option } from "effect";
import { makeActionData, type ActionRouter, type ActionData } from "./Actions";

const createMockActionRouter = (options?: {
  currentRoute?: string | null;
  actionResult?: { routeName: string; data: unknown } | null;
  actionError?: Error;
}): ActionRouter => {
  const {
    currentRoute = "test",
    actionResult = null,
    actionError,
  } = options ?? {};

  return {
    currentRoute: {
      get: Effect.succeed(
        currentRoute === null ? Option.none() : Option.some(currentRoute),
      ),
    },
    executeAction: (_routeName, _formData, _request) => {
      if (actionError) {
        return Effect.fail(actionError);
      }
      return Effect.succeed(actionResult);
    },
  };
};

const createMockRequest = (method: string, body?: FormData): Request => {
  const init: RequestInit = { method };
  if (body) {
    init.body = body;
  }
  return new Request("http://localhost/test", init);
};

describe("actions", () => {
  describe("makeActionData", () => {
    it("should return null for GET requests", async () => {
      const router = createMockActionRouter();
      const request = createMockRequest("GET");

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).toBeNull();
    });

    it("should return null for HEAD requests", async () => {
      const router = createMockActionRouter();
      const request = createMockRequest("HEAD");

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).toBeNull();
    });

    it("should process POST requests", async () => {
      const formData = new FormData();
      formData.append("name", "test");

      const router = createMockActionRouter({
        currentRoute: "contacts",
        actionResult: { routeName: "contacts", data: { success: true } },
      });
      const request = createMockRequest("POST", formData);

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).not.toBeNull();
      expect(result?.routeName).toBe("contacts");
      expect(result?.data).toEqual({ success: true });
      expect(result?.timestamp).toBeDefined();
    });

    it("should process PUT requests", async () => {
      const formData = new FormData();
      const router = createMockActionRouter({
        actionResult: { routeName: "test", data: { updated: true } },
      });
      const request = createMockRequest("PUT", formData);

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).not.toBeNull();
      expect(result?.data).toEqual({ updated: true });
    });

    it("should process PATCH requests", async () => {
      const formData = new FormData();
      const router = createMockActionRouter({
        actionResult: { routeName: "test", data: { patched: true } },
      });
      const request = createMockRequest("PATCH", formData);

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).not.toBeNull();
      expect(result?.data).toEqual({ patched: true });
    });

    it("should process DELETE requests", async () => {
      const formData = new FormData();
      const router = createMockActionRouter({
        actionResult: { routeName: "test", data: { deleted: true } },
      });
      const request = createMockRequest("DELETE", formData);

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).not.toBeNull();
      expect(result?.data).toEqual({ deleted: true });
    });

    it("should return null when router is undefined", async () => {
      const request = createMockRequest("POST", new FormData());

      const result = await Effect.runPromise(
        makeActionData(undefined, request),
      );

      expect(result).toBeNull();
    });

    it("should return null when no current route matches", async () => {
      const router = createMockActionRouter({ currentRoute: null });
      const request = createMockRequest("POST", new FormData());

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).toBeNull();
    });

    it("should handle action errors gracefully", async () => {
      const router = createMockActionRouter({
        actionError: new Error("Action failed"),
      });
      const request = createMockRequest("POST", new FormData());

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).not.toBeNull();
      expect(result?.routeName).toBe("test");
      expect(result?.data).toEqual({ error: "Error: Action failed" });
    });

    it("should handle null action result", async () => {
      const router = createMockActionRouter({
        actionResult: null,
      });
      const request = createMockRequest("POST", new FormData());

      const result = await Effect.runPromise(makeActionData(router, request));

      expect(result).not.toBeNull();
      expect(result?.routeName).toBe("test");
      expect(result?.data).toBeNull();
    });

    it("should include timestamp in result", async () => {
      const before = Date.now();
      const router = createMockActionRouter({
        actionResult: { routeName: "test", data: {} },
      });
      const request = createMockRequest("POST", new FormData());

      const result = await Effect.runPromise(makeActionData(router, request));
      const after = Date.now();

      expect(result?.timestamp).toBeGreaterThanOrEqual(before);
      expect(result?.timestamp).toBeLessThanOrEqual(after);
    });

    it("should be case insensitive for HTTP methods", async () => {
      const formData = new FormData();
      const router = createMockActionRouter({
        actionResult: { routeName: "test", data: {} },
      });

      // lowercase
      const request1 = new Request("http://localhost/test", {
        method: "post",
        body: formData,
      });
      const result1 = await Effect.runPromise(makeActionData(router, request1));
      expect(result1).not.toBeNull();
    });
  });

  describe("ActionData", () => {
    it("should have correct structure", () => {
      const actionData: ActionData = {
        routeName: "users",
        data: { id: 1, name: "Test" },
        timestamp: Date.now(),
      };

      expect(actionData.routeName).toBe("users");
      expect(actionData.data).toEqual({ id: 1, name: "Test" });
      expect(typeof actionData.timestamp).toBe("number");
    });

    it("should allow null data", () => {
      const actionData: ActionData = {
        routeName: "delete",
        data: null,
        timestamp: Date.now(),
      };

      expect(actionData.data).toBeNull();
    });

    it("should allow complex data", () => {
      const actionData: ActionData = {
        routeName: "complex",
        data: {
          errors: { email: ["Invalid email"] },
          values: { name: "Test" },
          nested: { deep: { value: 1 } },
        },
        timestamp: Date.now(),
      };

      expect(actionData.data).toEqual({
        errors: { email: ["Invalid email"] },
        values: { name: "Test" },
        nested: { deep: { value: 1 } },
      });
    });
  });
});
