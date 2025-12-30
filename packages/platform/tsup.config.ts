import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
    client: "src/client.ts",
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
    "@effex/primitives",
    "@effect/platform",
    "@effect/platform-node",
  ],
});
