import { defineConfig } from "vite";

import { effexRoutes } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexRoutes({
      routesDir: "src/routes",
      outputPath: "src/generated/routes.ts",
      scaffold: true,
    }),
  ],
  resolve: {
    conditions: ["effect-ts"],
  },
});
