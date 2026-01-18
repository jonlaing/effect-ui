import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../lib/createRule";

// Known Effect namespace methods that return Effects
const EFFECT_METHODS = new Set([
  "gen",
  "sync",
  "succeed",
  "fail",
  "die",
  "promise",
  "tryPromise",
  "suspend",
  "async",
  "all",
  "forEach",
  "map",
  "flatMap",
  "tap",
  "catchAll",
  "catchTag",
  "provide",
  "provideService",
  "scoped",
  "andThen",
  "if",
  "when",
  "unless",
  "option",
  "either",
  "exit",
  "match",
  "matchEffect",
  "matchCause",
  "matchCauseEffect",
]);

export const noFloatingEffect = createRule({
  name: "no-floating-effect",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Effects that are not yielded, returned, or run",
    },
    messages: {
      floatingEffect:
        "This Effect is not being handled. Use yield*, return, or Effect.runPromise().",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function isEffectCall(node: TSESTree.CallExpression): boolean {
      // Check for Effect.* calls
      if (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === "Effect" &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        EFFECT_METHODS.has(node.callee.property.name)
      ) {
        return true;
      }
      return false;
    }

    function isHandled(node: TSESTree.Node): boolean {
      const parent = node.parent;
      if (!parent) return false;

      // yield* expression
      if (
        parent.type === AST_NODE_TYPES.YieldExpression &&
        parent.delegate === true
      ) {
        return true;
      }

      // return statement
      if (parent.type === AST_NODE_TYPES.ReturnStatement) {
        return true;
      }

      // variable declaration
      if (parent.type === AST_NODE_TYPES.VariableDeclarator) {
        return true;
      }

      // argument to another function call (pipe, runPromise, etc.)
      if (parent.type === AST_NODE_TYPES.CallExpression) {
        return true;
      }

      // property value, array element
      if (
        parent.type === AST_NODE_TYPES.Property ||
        parent.type === AST_NODE_TYPES.ArrayExpression
      ) {
        return true;
      }

      // Used in logical/conditional expressions
      if (
        parent.type === AST_NODE_TYPES.LogicalExpression ||
        parent.type === AST_NODE_TYPES.ConditionalExpression
      ) {
        return true;
      }

      // Member expression (e.g., Effect.gen(...).pipe(...))
      if (parent.type === AST_NODE_TYPES.MemberExpression) {
        return true;
      }

      // Arrow function body without braces
      if (
        parent.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        parent.body === node
      ) {
        return true;
      }

      return false;
    }

    return {
      CallExpression(node) {
        if (isEffectCall(node) && !isHandled(node)) {
          context.report({
            node,
            messageId: "floatingEffect",
          });
        }
      },
    };
  },
});
