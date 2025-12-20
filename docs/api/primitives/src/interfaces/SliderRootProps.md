[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / SliderRootProps

# Interface: SliderRootProps

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:71](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L71)

Props for Slider.Root

## Properties

### aria-label?

> `readonly` `optional` **aria-label**: `string`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:99](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L99)

ARIA label

***

### aria-labelledby?

> `readonly` `optional` **aria-labelledby**: `string`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:101](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L101)

ID of labelling element

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:103](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L103)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: [`SliderValue`](../type-aliases/SliderValue.md)

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:75](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L75)

Default value for uncontrolled usage (type determines single vs range)

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:91](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L91)

Whether the slider is disabled

***

### inverted?

> `readonly` `optional` **inverted**: `boolean`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:93](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L93)

Invert the slider direction

***

### largeStep?

> `readonly` `optional` **largeStep**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:87](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L87)

Large step for PageUp/PageDown (default: step * 10)

***

### max?

> `readonly` `optional` **max**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:83](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L83)

Maximum value (default: 100)

***

### min?

> `readonly` `optional` **min**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:81](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L81)

Minimum value (default: 0)

***

### minStepsBetweenThumbs?

> `readonly` `optional` **minStepsBetweenThumbs**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:95](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L95)

Minimum steps between thumbs in range mode (default: 0)

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:97](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L97)

Name attribute for form submission

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:77](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L77)

Callback when value changes during drag

#### Parameters

##### value

[`SliderValue`](../type-aliases/SliderValue.md)

#### Returns

`Effect`\<`void`\>

***

### onValueCommit()?

> `readonly` `optional` **onValueCommit**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:79](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L79)

Callback when dragging ends (value committed)

#### Parameters

##### value

[`SliderValue`](../type-aliases/SliderValue.md)

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: `"horizontal"` \| `"vertical"`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:89](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L89)

Orientation (default: "horizontal")

***

### step?

> `readonly` `optional` **step**: `number`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:85](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L85)

Step increment (default: 1)

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<[`SliderValue`](../type-aliases/SliderValue.md)\>

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:73](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Slider/Slider.ts#L73)

Controlled value - single number or [min, max] tuple for range
