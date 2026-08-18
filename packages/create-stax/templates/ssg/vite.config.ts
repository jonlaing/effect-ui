import { defineConfig } from "vite";

import { staxPlatform } from "@stax-ui/vite-plugin";

export default defineConfig({
  plugins: [staxPlatform({ mode: "ssg", entry: "src/entry.ts" })],
});
