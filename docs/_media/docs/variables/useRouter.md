[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / useRouter

# Variable: useRouter

> `const` **useRouter**: `Effect.Effect`\<[`BaseRouter`](../interfaces/BaseRouter.md), `never`, [`RouterContext`](../classes/RouterContext.md)\> = `RouterContext`

Defined in: [src/router/RouterContext.ts:123](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/router/RouterContext.ts#L123)

Get the router from context.
Use this inside Effect.gen to access router methods.

## Example

```ts
const MyComponent = component("MyComponent", () =>
  Effect.gen(function* () {
    const router = yield* useRouter;

    const handleSubmit = () =>
      Effect.gen(function* () {
        yield* saveData();
        yield* router.push("/success");
      });

    return yield* button({ onClick: handleSubmit }, "Submit");
  }),
);
// Type: Component<"MyComponent", object, never, RouterContext>
```
