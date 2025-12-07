import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EffectUI",
      fileName: "effect-ui",
    },
    emptyOutDir: false,
    rollupOptions: {
      external: ["effect"],
      output: {
        globals: {
          effect: "Effect",
        },
      },
    },
  },
  resolve: { alias: { src: resolve("src/") } },
});
