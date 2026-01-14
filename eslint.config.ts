import js from "@eslint/js";
import json from "@eslint/json";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["coverage/**", "public/**", "dist/**", "pnpm-lock.yaml"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,mts,cts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["**/tsconfig*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  eslintPluginPrettierRecommended,
]);
