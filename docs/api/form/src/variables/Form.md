[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / Form

# Variable: Form

> `const` **Form**: `object`

Defined in: [packages/form/src/form/Form.ts:231](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/Form.ts#L231)

Form module namespace for creating forms with Effect Schema validation.

## Type Declaration

### make()

> **make**: \<`S`, `E`, `R`\>(`options`) => `Effect`\<[`FormType`](../interfaces/FormType.md)\<`S`, `E`, `R`\>, `never`, `Scope`\>

Create a new Form with reactive state management.

#### Type Parameters

##### S

`S` *extends* `AnyNoContext`

##### E

`E` = `never`

##### R

`R` = `never`

#### Parameters

##### options

[`FormOptions`](../interfaces/FormOptions.md)\<`S`, `E`, `R`\>

Form configuration including schema and initial values

#### Returns

`Effect`\<[`FormType`](../interfaces/FormType.md)\<`S`, `E`, `R`\>, `never`, `Scope`\>

#### Example

```ts
const form = yield* Form.make({
  schema: Schema.Struct({
    email: Schema.String.pipe(Schema.nonEmptyString()),
    password: Schema.String.pipe(Schema.minLength(8)),
  }),
  initial: { email: "", password: "" },
})

// Access fields
form.fields.email.value      // Signal<string>
form.fields.email.errors     // Readable<string[]>
form.fields.email.touched    // Readable<boolean>

// Submit the form
yield* form.submit((values) =>
  Effect.gen(function* () {
    yield* api.register(values)
  })
)
```
