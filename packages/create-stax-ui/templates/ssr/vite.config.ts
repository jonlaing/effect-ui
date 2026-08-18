import { defineConfig } from "vite";

import { staxPlatform } from "@stax-ui/vite-plugin";

export default defineConfig({
  plugins: [staxPlatform({ entry: "src/vite-entry.ts" })],
});
