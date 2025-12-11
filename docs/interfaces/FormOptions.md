[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / FormOptions

# Interface: FormOptions\<S, E, R\>

Defined in: [src/form/types.ts:82](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L82)

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

Defined in: [src/form/types.ts:90](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L90)

Initial values for the form

***

### schema

> `readonly` **schema**: `S`

Defined in: [src/form/types.ts:88](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L88)

Effect Schema for validation

***

### validation?

> `readonly` `optional` **validation**: [`ValidationTiming`](../type-aliases/ValidationTiming.md)

Defined in: [src/form/types.ts:92](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L92)

When to validate fields

***

### validators?

> `readonly` `optional` **validators**: [`Validators`](../type-aliases/Validators.md)\<`Type`\<`S`\>, `E`, `R`\>

Defined in: [src/form/types.ts:94](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L94)

Custom async validators for individual fields
