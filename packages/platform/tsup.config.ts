import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "effect",
    "@effex/core",
    "@effex/dom",
    "@effex/router",
    "@effex/form",
    "@effect/platform",
    "@effect/platform-node",
  ],
});
