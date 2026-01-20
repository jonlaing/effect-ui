import type { TSESLint } from "@typescript-eslint/utils";

import type { plugin } from "../index";

type Plugin = typeof plugin;

export const createRecommendedConfig = (
  pluginInstance: Plugin,
): TSESLint.FlatConfig.ConfigArray => [
  {
    name: "effex/recommended",
    plugins: {
      "@effex": pluginInstance,
    },
    rules: {
      // Effex custom rules
      "@effex/no-throw": "warn",
      "@effex/no-try-catch": "warn",
      "@effex/no-floating-effect": "error",
      "@effex/prefer-template-literal": "warn",

      // TypeScript rules (non-type-aware)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-shadow": "error",

      // Standard JS rules
      "no-debugger": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "error",
      "no-param-reassign": "error",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "no-nested-ternary": "warn",
      "no-else-return": "warn",
    },
  },
];
