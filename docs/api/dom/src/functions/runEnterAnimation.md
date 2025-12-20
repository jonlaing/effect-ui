[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / runEnterAnimation

# Function: runEnterAnimation()

> **runEnterAnimation**(`element`, `options`): `Effect`\<`void`\>

Defined in: [packages/dom/src/Animation/core.ts:116](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Animation/core.ts#L116)

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
