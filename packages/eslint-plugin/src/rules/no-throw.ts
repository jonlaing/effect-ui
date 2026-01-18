import { createRule } from "../lib/createRule";

export const noThrow = createRule({
  name: "no-throw",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow throw statements in favor of Effect.fail or Effect.die",
    },
    messages: {
      noThrow:
        "Avoid using throw. Use Effect.fail() for expected errors or Effect.die() for unexpected errors.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ThrowStatement(node) {
        context.report({
          node,
          messageId: "noThrow",
        });
      },
    };
  },
});
