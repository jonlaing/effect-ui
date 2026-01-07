import { describe, it, expect } from "vitest";
import { parseRouteExportsFromContent } from "./parser";

describe("parseRouteExportsFromContent", () => {
  it("should detect route export from Route.define", () => {
    const content = `
      import { Route } from "@effex/router";
      import { Schema } from "effect";

      export const route = Route.define({
        params: Schema.Struct({ id: Schema.String }),
        loader: (params) => Effect.succeed({ name: "test" }),
      });

      export default component("UserPage", () => div([]));
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect default export", () => {
    const content = `
      const MyComponent = component("MyComponent", () => div([]));
      export default MyComponent;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
    expect(exports.hasRoute).toBe(false);
  });

  it("should detect inline default export", () => {
    const content = `
      export default component("MyComponent", () => div([]));
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect re-exports with as default", () => {
    const content = `
      const MyPage = component("MyPage", () => div([]));
      export { MyPage as default };
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should handle file with only component (no Route.define)", () => {
    const content = `
      import { component, div } from "@effex/dom";

      const AboutPage = component("AboutPage", () => div(["About us"]));

      export default AboutPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(false);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should detect route export with re-export syntax", () => {
    const content = `
      const route = Route.define({});
      export { route };
      export default MyPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });

  it("should handle complete route file with Route.define", () => {
    const content = `
      import { Effect, Schema } from "effect";
      import { component, div, h1 } from "@effex/dom";
      import { Route } from "@effex/router";

      export const route = Route.define({
        params: Schema.Struct({ id: Schema.String }),
        loader: (params) => Effect.succeed({ id: params.id, name: "Test" }),
        action: ({ formData }) => Effect.succeed({ success: true }),
      });

      const UserPage = component("UserPage", () =>
        Effect.gen(function* () {
          return yield* div([h1(["User"])]);
        })
      );

      export default UserPage;
    `;

    const exports = parseRouteExportsFromContent(content);

    expect(exports.hasRoute).toBe(true);
    expect(exports.hasDefaultExport).toBe(true);
  });
});
