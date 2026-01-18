import type { TSESLint } from "@typescript-eslint/utils";

import { createRecommendedConfig } from "./configs/recommended";
import {
  noFloatingEffect,
  noNull,
  noThrow,
  noTryCatch,
  preferTemplateLiteral,
} from "./rules";

const rules = {
  "no-throw": noThrow,
  "no-try-catch": noTryCatch,
  "no-null": noNull,
  "no-floating-effect": noFloatingEffect,
  "prefer-template-literal": preferTemplateLiteral,
} as const;

export const plugin = {
  meta: {
    name: "@effex/eslint-plugin",
    version: "0.0.1",
  },
  rules,
  configs: {} as Record<string, TSESLint.FlatConfig.ConfigArray>,
};

// Build recommended config using the plugin itself
plugin.configs.recommended = createRecommendedConfig(plugin);

export default plugin;
export { rules };
