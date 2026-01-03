import { defineConfig } from "vite";
import { effexRoutes, effexSSR } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexRoutes({
      routesDir: "src/routes",
      outputPath: "src/generated/routes.ts",
    }),
    effexSSR({
      entry: "src/vite-entry.ts",
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
