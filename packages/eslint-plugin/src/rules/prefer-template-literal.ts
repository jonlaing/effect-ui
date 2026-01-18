import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../lib/createRule";

export const preferTemplateLiteral = createRule({
  name: "prefer-template-literal",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer using t`` template literal over arrays in $.*() calls, unless the array contains only element calls",
    },
    messages: {
      preferTemplate:
        "Use the t`` template literal instead of an array. Example: t`You have ${count} things`",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function isDollarElementCall(node: TSESTree.CallExpression): boolean {
      return (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === "$" &&
        node.callee.property.type === AST_NODE_TYPES.Identifier
      );
    }

    function isElementCall(node: TSESTree.Node): boolean {
      // Check if this is a $.element() call
      if (node.type !== AST_NODE_TYPES.CallExpression) return false;

      const callee = node.callee;

      // $.element() pattern
      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        callee.object.type === AST_NODE_TYPES.Identifier &&
        callee.object.name === "$"
      ) {
        return true;
      }

      return false;
    }

    function shouldWarnOnArray(node: TSESTree.ArrayExpression): boolean {
      const elements = node.elements.filter(
        (el): el is TSESTree.Expression => el !== null,
      );

      // Empty array is fine
      if (elements.length === 0) return false;

      // Check if ALL elements are $.*() calls - if so, don't warn
      const allElementCalls = elements.every((element) =>
        isElementCall(element),
      );
      if (allElementCalls) return false;

      // If we have any non-element content in the array, warn
      // This covers: strings only, expressions only, or mixed
      return true;
    }

    return {
      CallExpression(node) {
        if (!isDollarElementCall(node)) return;

        for (const arg of node.arguments) {
          if (
            arg.type === AST_NODE_TYPES.ArrayExpression &&
            shouldWarnOnArray(arg)
          ) {
            context.report({
              node: arg,
              messageId: "preferTemplate",
            });
          }
        }
      },
    };
  },
});
