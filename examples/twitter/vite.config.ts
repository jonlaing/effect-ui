import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3003,
    // Allow cross-origin requests from the Effect server
    cors: true,
  },
});
