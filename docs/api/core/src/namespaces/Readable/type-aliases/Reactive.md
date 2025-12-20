[**effex-monorepo**](../../../../../README.md)

***

[effex-monorepo](../../../../../modules.md) / [core/src](../../../README.md) / [Readable](../README.md) / Reactive

# Type Alias: Reactive\<T\>

> **Reactive**\<`T`\> = `T` \| [`Readable`](../interfaces/Readable.md)\<`T`\>

Defined in: [packages/core/src/Readable.ts:55](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L55)

A value that can be either static or reactive.
Use `Readable.of()` to normalize to a `Readable<T>`.

## Type Parameters

### T

`T`

## Example

```ts
interface ButtonProps {
  disabled?: Readable.Reactive<boolean>;
  class?: Readable.Reactive<string>;
}

const Button = (props: ButtonProps) =>
  Effect.gen(function* () {
    const disabled = Readable.of(props.disabled ?? false);
    // Now disabled is Readable<boolean>
  });
```
