import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { effexPlatform } from "@effex/vite-plugin";

export default defineConfig({
  plugins: [
    tailwindcss(),
    effexPlatform({ mode: "ssg", entry: "src/entry.ts" }),
  ],
});
