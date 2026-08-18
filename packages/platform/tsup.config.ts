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
    "@stax-ui/core",
    "@stax-ui/dom",
    "@stax-ui/router",
    "@stax-ui/form",
    "@effect/platform",
    "@effect/platform-node",
  ],
});
