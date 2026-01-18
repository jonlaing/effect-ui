import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/jonlaing/effex/tree/main/packages/eslint-plugin/docs/${name}.md`,
);
