[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / PopoverContext

# Interface: PopoverContext

Defined in: [src/primitives/Popover/Popover.ts:15](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L15)

Context shared between Popover parts.

## Properties

### anchorRef

> `readonly` **anchorRef**: [`SignalType`](../type-aliases/SignalType.md)\<`HTMLElement` \| `null`\>

Defined in: [src/primitives/Popover/Popover.ts:27](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L27)

Reference to an optional anchor element

***

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Popover/Popover.ts:21](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L21)

Close the popover

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/Popover/Popover.ts:29](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L29)

Unique ID for the popover content

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Popover/Popover.ts:17](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L17)

Whether the popover is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Popover/Popover.ts:19](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L19)

Open the popover

#### Returns

`Effect`\<`void`\>

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Popover/Popover.ts:23](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L23)

Toggle the popover open state

#### Returns

`Effect`\<`void`\>

***

### triggerRef

> `readonly` **triggerRef**: [`SignalType`](../type-aliases/SignalType.md)\<`HTMLElement` \| `null`\>

Defined in: [src/primitives/Popover/Popover.ts:25](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L25)

Reference to the trigger element
