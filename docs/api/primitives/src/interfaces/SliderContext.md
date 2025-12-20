[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / SliderContext

# Interface: SliderContext

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:25](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L25)

Context shared between Slider parts.

## Properties

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:43](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L43)

Whether the slider is disabled

***

### draggingThumb

> `readonly` **draggingThumb**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`number`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:61](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L61)

Currently dragging thumb index (-1 if not dragging)

***

### inverted

> `readonly` **inverted**: `boolean`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:47](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L47)

Whether values are inverted

***

### isRange

> `readonly` **isRange**: `boolean`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:45](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L45)

Whether it's a range slider

***

### largeStep

> `readonly` **largeStep**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L39)

Large step for PageUp/PageDown

***

### max

> `readonly` **max**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:35](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L35)

Maximum allowed value

***

### min

> `readonly` **min**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:33](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L33)

Minimum allowed value

***

### minStepsBetweenThumbs

> `readonly` **minStepsBetweenThumbs**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:63](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L63)

Minimum steps between thumbs in range mode

***

### orientation

> `readonly` **orientation**: `"horizontal"` \| `"vertical"`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:41](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L41)

Orientation

***

### pointerToValue()

> `readonly` **pointerToValue**: (`clientX`, `clientY`) => `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L53)

Convert pointer position to value

#### Parameters

##### clientX

`number`

##### clientY

`number`

#### Returns

`number`

***

### registerThumb()

> `readonly` **registerThumb**: () => `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L51)

Register a thumb (returns its index)

#### Returns

`number`

***

### setDragCleanup()

> `readonly` **setDragCleanup**: (`cleanup`) => `void`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:65](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L65)

Register cleanup function for drag listeners

#### Parameters

##### cleanup

() => `void` | `null`

#### Returns

`void`

***

### setThumbValue()

> `readonly` **setThumbValue**: (`index`, `value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:31](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L31)

Update a specific thumb's value (0 for single/min, 1 for max in range)

#### Parameters

##### index

`number`

##### value

`number`

#### Returns

`Effect`\<`void`\>

***

### setValue()

> `readonly` **setValue**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:29](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L29)

Set the full value

#### Parameters

##### value

[`SliderValue`](../type-aliases/SliderValue.md)

#### Returns

`Effect`\<`void`\>

***

### startDrag()

> `readonly` **startDrag**: (`thumbIndex`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:57](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L57)

Start dragging a thumb

#### Parameters

##### thumbIndex

`number`

#### Returns

`Effect`\<`void`\>

***

### step

> `readonly` **step**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:37](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L37)

Step increment

***

### stopDrag()

> `readonly` **stopDrag**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:59](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L59)

Stop dragging

#### Returns

`Effect`\<`void`\>

***

### trackRef

> `readonly` **trackRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLDivElement`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:49](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L49)

Track element ref for position calculations

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<[`SliderValue`](../type-aliases/SliderValue.md)\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:27](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L27)

Current value(s) - single number or [min, max] tuple

***

### valueToPercent()

> `readonly` **valueToPercent**: (`value`) => `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:55](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L55)

Get percentage position for a value (0-100)

#### Parameters

##### value

`number`

#### Returns

`number`
