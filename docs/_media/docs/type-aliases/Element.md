[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / Element

# Type Alias: Element\<E, R\>

> **Element**\<`E`, `R`\> = `Effect.Effect`\<`HTMLElement`, `E`, `Scope.Scope` \| `R`\>

Defined in: [src/dom/Element/types.ts:26](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L26)

A DOM element wrapped in an Effect with scope management.

## Type Parameters

### E

`E` = `never`

The error type (defaults to never for infallible elements)

### R

`R` = `never`

The requirements/context type (defaults to never for no requirements)

## Example

```ts
const myButton: Element = button({ className: "primary" }, ["Click me"]);

// Component that can fail
const UserProfile: Element<UserNotFoundError> = Effect.gen(function* () {
  const user = yield* fetchUser(userId);
  return yield* div([user.name]);
});

// Component with requirements
const NavLink: Element<never, RouterContext> = Effect.gen(function* () {
  const router = yield* RouterContext;
  return yield* button({ onClick: () => router.push("/") }, "Home");
});
```
