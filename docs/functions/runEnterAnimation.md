[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / runEnterAnimation

# Function: runEnterAnimation()

> **runEnterAnimation**(`element`, `options`): `Effect`\<`void`\>

Defined in: [src/dom/Animation/core.ts:116](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/core.ts#L116)

Run an enter animation on an element.

Sequence:
1. Call onBeforeEnter hook
2. Add enterFrom classes (if provided)
3. Add enter classes
4. Force reflow
5. Remove enterFrom classes (triggers transition)
6. Add enterTo classes
7. Wait for animation/transition to complete
8. Remove enter classes
9. Call onEnter hook

## Parameters

### element

`HTMLElement`

### options

[`AnimationOptions`](../interfaces/AnimationOptions.md)

## Returns

`Effect`\<`void`\>
