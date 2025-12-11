[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / runExitAnimation

# Function: runExitAnimation()

> **runExitAnimation**(`element`, `options`): `Effect`\<`void`\>

Defined in: [src/dom/Animation/core.ts:159](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Animation/core.ts#L159)

Run an exit animation on an element.

Sequence:
1. Call onBeforeExit hook
2. Add exit classes
3. Add exitTo classes (if provided)
4. Force reflow
5. Wait for animation/transition to complete
6. Remove exit classes
7. Call onExit hook

Note: Element is NOT removed from DOM by this function.
The caller is responsible for DOM removal after this completes.

## Parameters

### element

`HTMLElement`

### options

[`AnimationOptions`](../interfaces/AnimationOptions.md)

## Returns

`Effect`\<`void`\>
