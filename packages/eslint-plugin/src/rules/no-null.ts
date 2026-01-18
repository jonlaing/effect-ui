import { createRule } from "../lib/createRule";

export const noNull = createRule({
  name: "no-null",
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow null literal in favor of Option from Effect",
    },
    messages: {
      noNull: "Avoid using null. Use Option.none() from Effect instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Literal(node) {
        if (node.value === null) {
          context.report({
            node,
            messageId: "noNull",
          });
        }
      },
    };
  },
});
