[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AnimationOptions

# Interface: AnimationOptions

Defined in: [src/dom/Animation/types.ts:22](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L22)

Options for enter/exit animations on a single element

## Extended by

- [`ListAnimationOptions`](ListAnimationOptions.md)

## Properties

### enter?

> `optional` **enter**: `string`

Defined in: [src/dom/Animation/types.ts:27](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L27)

CSS class(es) to apply during the enter animation.
Multiple classes can be space-separated: "fade-in slide-up"

***

### enterFrom?

> `optional` **enterFrom**: `string`

Defined in: [src/dom/Animation/types.ts:40](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L40)

CSS class(es) for the initial state before enter animation starts.
These are removed after the first frame to trigger the transition.
Useful for "animate from" states like "opacity-0 translate-y-4"

***

### enterTo?

> `optional` **enterTo**: `string`

Defined in: [src/dom/Animation/types.ts:46](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L46)

CSS class(es) for the final state after enter animation completes.
These persist on the element after animation ends.

***

### exit?

> `optional` **exit**: `string`

Defined in: [src/dom/Animation/types.ts:33](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L33)

CSS class(es) to apply during the exit animation.
Multiple classes can be space-separated: "fade-out slide-down"

***

### exitTo?

> `optional` **exitTo**: `string`

Defined in: [src/dom/Animation/types.ts:52](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L52)

CSS class(es) for the final state after exit animation completes.
Applied at the start of exit, removed when element is removed from DOM.

***

### onBeforeEnter?

> `optional` **onBeforeEnter**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [src/dom/Animation/types.ts:71](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L71)

Called before enter animation starts, after element is in DOM

***

### onBeforeExit?

> `optional` **onBeforeExit**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [src/dom/Animation/types.ts:81](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L81)

Called before exit animation starts

***

### onEnter?

> `optional` **onEnter**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [src/dom/Animation/types.ts:76](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L76)

Called after enter animation completes

***

### onExit?

> `optional` **onExit**: [`AnimationHook`](../type-aliases/AnimationHook.md)

Defined in: [src/dom/Animation/types.ts:86](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L86)

Called after exit animation completes, before element is removed from DOM

***

### respectReducedMotion?

> `optional` **respectReducedMotion**: `boolean`

Defined in: [src/dom/Animation/types.ts:66](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L66)

Whether to skip animations when user prefers reduced motion.
When true and reduced motion is preferred, animations complete instantly.

#### Default

```ts
true
```

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/dom/Animation/types.ts:59](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/types.ts#L59)

Maximum time in milliseconds to wait for animation/transition to complete.
If exceeded, animation is considered complete.

#### Default

```ts
5000
```
