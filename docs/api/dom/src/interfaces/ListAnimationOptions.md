[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / ListAnimationOptions

# Interface: ListAnimationOptions

Defined in: [packages/dom/src/Animation/types.ts:100](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L100)

Options for list animations (used with `each`)

## Extends

- [`AnimationOptions`](AnimationOptions.md)

## Properties

### enter?

> `optional` **enter**: `string`

Defined in: [packages/dom/src/Animation/types.ts:27](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L27)

CSS class(es) to apply during the enter animation.
Multiple classes can be space-separated: "fade-in slide-up"

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`enter`](AnimationOptions.md#enter)

***

### enterFrom?

> `optional` **enterFrom**: `string`

Defined in: [packages/dom/src/Animation/types.ts:40](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L40)

CSS class(es) for the initial state before enter animation starts.
These are removed after the first frame to trigger the transition.
Useful for "animate from" states like "opacity-0 translate-y-4"

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`enterFrom`](AnimationOptions.md#enterfrom)

***

### enterTo?

> `optional` **enterTo**: `string`

Defined in: [packages/dom/src/Animation/types.ts:46](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L46)

CSS class(es) for the final state after enter animation completes.
These persist on the element after animation ends.

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`enterTo`](AnimationOptions.md#enterto)

***

### exit?

> `optional` **exit**: `string`

Defined in: [packages/dom/src/Animation/types.ts:33](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L33)

CSS class(es) to apply during the exit animation.
Multiple classes can be space-separated: "fade-out slide-down"

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`exit`](AnimationOptions.md#exit)

***

### exitTo?

> `optional` **exitTo**: `string`

Defined in: [packages/dom/src/Animation/types.ts:52](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L52)

CSS class(es) for the final state after exit animation completes.
Applied at the start of exit, removed when element is removed from DOM.

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`exitTo`](AnimationOptions.md#exitto)

***

### onBeforeEnter?

> `optional` **onBeforeEnter**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [packages/dom/src/Animation/types.ts:71](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L71)

Called before enter animation starts, after element is in DOM

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`onBeforeEnter`](AnimationOptions.md#onbeforeenter)

***

### onBeforeExit?

> `optional` **onBeforeExit**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [packages/dom/src/Animation/types.ts:81](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L81)

Called before exit animation starts

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`onBeforeExit`](AnimationOptions.md#onbeforeexit)

***

### onEnter?

> `optional` **onEnter**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [packages/dom/src/Animation/types.ts:76](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L76)

Called after enter animation completes

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`onEnter`](AnimationOptions.md#onenter)

***

### onExit?

> `optional` **onExit**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [packages/dom/src/Animation/types.ts:86](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L86)

Called after exit animation completes, before element is removed from DOM

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`onExit`](AnimationOptions.md#onexit)

***

### respectReducedMotion?

> `optional` **respectReducedMotion**: `boolean`

Defined in: [packages/dom/src/Animation/types.ts:66](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L66)

Whether to skip animations when user prefers reduced motion.
When true and reduced motion is preferred, animations complete instantly.

#### Default

```ts
true
```

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`respectReducedMotion`](AnimationOptions.md#respectreducedmotion)

***

### stagger?

> `optional` **stagger**: `number` \| [`StaggerFunction`](../type-aliases/StaggerFunction.md)

Defined in: [packages/dom/src/Animation/types.ts:106](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L106)

Stagger timing for list items.
- number: Fixed delay between items in milliseconds
- StaggerFunction: Custom function to calculate delay per item

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [packages/dom/src/Animation/types.ts:59](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/types.ts#L59)

Maximum time in milliseconds to wait for animation/transition to complete.
If exceeded, animation is considered complete.

#### Default

```ts
5000
```

#### Inherited from

[`AnimationOptions`](AnimationOptions.md).[`timeout`](AnimationOptions.md#timeout)
