import { describe, it, expect } from "vitest";
import { parseRouteExportsFromContent } from "./parser";

describe("parseRouteExportsFromContent", () => {
  it("should detect named export const", () => {
    const content = `
      export const params = Schema.Struct({ id: Schema.String });
      export const loader = (params) => Effect.succeed(params);
      export const action = ({ formData }) => Effect.succeed({});
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasParams).toBe(true);
    expect(exports.hasLoader).toBe(true);
    expect(exports.hasAction).toBe(true);
    expect(exports.hasDefaultExport).toBe(false);
  });

  it("should detect default export", () => {
    const content = `
      const MyComponent = component("MyComponent", () => div([]));
      export default MyComponent;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect inline default export", () => {
    const content = `
      export default component("MyComponent", () => div([]));
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect export function syntax", () => {
    const content = `
      export function loader(params) {
        return Effect.succeed(params);
      }
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasLoader).toBe(true);
  });

  it("should detect re-exports with as default", () => {
    const content = `
      const MyPage = component("MyPage", () => div([]));
      export { MyPage as default };
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should handle a complete route file", () => {
    const content = `
      import { Effect, Schema } from "effect";
      import { component, div, h1 } from "@effex/dom";

      export const params = Schema.Struct({
        id: Schema.String,
      });

      export const loader = (params) =>
        Effect.gen(function* () {
          return { id: params.id, name: "Test" };
        });

      export const action = ({ formData, params }) =>
        Effect.gen(function* () {
          return { success: true };
        });

      const UserPage = component("UserPage", () =>
        Effect.gen(function* () {
          return yield* div([h1(["User"])]);
        })
      );

      export default UserPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasParams).toBe(true);
    expect(exports.hasLoader).toBe(true);
    expect(exports.hasAction).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should handle file with only component", () => {
    const content = `
      import { component, div } from "@effex/dom";

      const AboutPage = component("AboutPage", () => div(["About us"]));

      export default AboutPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasParams).toBe(false);
    expect(exports.hasLoader).toBe(false);
    expect(exports.hasAction).toBe(false);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should not false positive on similar names", () => {
    const content = `
      const myParams = { id: "123" };
      const loaderData = {};
      const actionResult = {};

      export default component("Page", () => div([]));
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasParams).toBe(false);
    expect(exports.hasLoader).toBe(false);
    expect(exports.hasAction).toBe(false);
    expect(exports.hasDefaultExport).toBe(true);
  });
});
