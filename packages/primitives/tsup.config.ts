import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "!src/**/*.stories.ts", "!src/storyHelpers.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["effect", "@effex/dom", "@effex/core"],
});
