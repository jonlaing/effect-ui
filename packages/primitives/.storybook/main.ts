import type { StorybookConfig } from "@storybook/html-vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-storysource",
  ],
  framework: "@storybook/html-vite",
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@effex/core": resolve(__dirname, "../../core/src"),
      "@effex/dom": resolve(__dirname, "../../dom/src"),
      "@effex/primitives": resolve(__dirname, "../src"),
    };
    return config;
  },
};
export default config;
