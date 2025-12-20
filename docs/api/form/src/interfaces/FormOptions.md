[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / FormOptions

# Interface: FormOptions\<S, E, R\>

Defined in: [packages/form/src/form/types.ts:81](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L81)

Options for creating a Form.

## Type Parameters

### S

`S` *extends* `Schema.Schema.AnyNoContext`

The schema type

### E

`E` = `never`

The error type from validators

### R

`R` = `never`

The requirements from validators

## Properties

### initial

> `readonly` **initial**: `Type`\<`S`\>

Defined in: [packages/form/src/form/types.ts:89](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L89)

Initial values for the form

***

### schema

> `readonly` **schema**: `S`

Defined in: [packages/form/src/form/types.ts:87](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L87)

Effect Schema for validation

***

### validation?

> `readonly` `optional` **validation**: [`ValidationTiming`](../type-aliases/ValidationTiming.md)

Defined in: [packages/form/src/form/types.ts:91](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L91)

When to validate fields

***

### validators?

> `readonly` `optional` **validators**: [`Validators`](../type-aliases/Validators.md)\<`Type`\<`S`\>, `E`, `R`\>

Defined in: [packages/form/src/form/types.ts:93](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L93)

Custom async validators for individual fields
