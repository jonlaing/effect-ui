import { defineConfig } from "vite";

import { effexPlatform } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [effexPlatform({ mode: "ssg", entry: "src/entry.ts" })],
});
