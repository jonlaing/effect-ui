import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/*/src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // Package aliases for cross-package imports
      "@effex/core": resolve(__dirname, "packages/core/src/index.ts"),
      "@effex/dom/server": resolve(
        __dirname,
        "packages/dom/src/server/index.ts",
      ),
      "@effex/dom/hydrate": resolve(
        __dirname,
        "packages/dom/src/hydrate/index.ts",
      ),
      "@effex/dom": resolve(__dirname, "packages/dom/src/index.ts"),
      "@effex/router": resolve(__dirname, "packages/router/src/index.ts"),
      "@effex/form": resolve(__dirname, "packages/form/src/index.ts"),
      "@effex/primitives": resolve(
        __dirname,
        "packages/primitives/src/index.ts",
      ),
      "@effex/platform": resolve(__dirname, "packages/platform/src/index.ts"),
    },
  },
});
