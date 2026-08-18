import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { staxPlatform } from "@stax-ui/vite-plugin";

export default defineConfig({
  plugins: [tailwindcss(), staxPlatform({ entry: "src/vite-entry.ts" })],
});
