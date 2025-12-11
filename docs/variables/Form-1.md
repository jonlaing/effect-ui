[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Form

# Variable: Form

> `const` **Form**: `object`

Defined in: [src/form/Form.ts:233](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/Form.ts#L233)

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
