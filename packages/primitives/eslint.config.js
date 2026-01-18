import tseslint from "typescript-eslint";

import effexPlugin from "@effex/eslint-plugin";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  ...tseslint.configs.recommended,
  ...effexPlugin.configs.recommended,
];
