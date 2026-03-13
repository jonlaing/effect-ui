import { defineConfig } from "vite";

import { effexPlatform } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [effexPlatform({ entry: "src/vite-entry.ts" })],
});
