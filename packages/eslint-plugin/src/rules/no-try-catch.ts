import { createRule } from "../lib/createRule";

export const noTryCatch = createRule({
  name: "no-try-catch",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow try/catch blocks in favor of Effect error handling",
    },
    messages: {
      noTryCatch:
        "Avoid try/catch. Use Effect.catchAll(), Effect.catchTag(), or Effect.either() for error handling.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TryStatement(node) {
        context.report({
          node,
          messageId: "noTryCatch",
        });
      },
    };
  },
});
