import { defineConfig } from "vite";
import { effexRoutes } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexRoutes({
      routesDir: "src/routes",
      outputPath: "src/generated/routes.ts",
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        client: "src/client.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  resolve: {
    conditions: ["effect-ts"],
  },
});
