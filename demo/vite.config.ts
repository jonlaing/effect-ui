import { defineConfig } from "vite";
import { effexRoutes, effexSSR } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    effexRoutes({
      routesDir: "src/routes",
      outputPath: "src/generated/routes.ts",
      scaffold: true,
    }),
    effexSSR({
      entry: "src/vite-entry.ts",
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 5000,
  },
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
