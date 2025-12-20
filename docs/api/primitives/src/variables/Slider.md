[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Slider

# Variable: Slider

> `const` **Slider**: `object`

Defined in: [packages/primitives/src/primitives/Slider/Slider.ts:649](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Slider/Slider.ts#L649)

Headless Slider primitive for building accessible range input controls.

Features:
- Single value or range (two thumbs) modes
- Horizontal and vertical orientations
- Click on track to jump position
- Full keyboard support (arrows, PageUp/Down, Home/End)
- ARIA slider attributes
- Data attributes for styling
- Controlled and uncontrolled modes

## Type Declaration

### Range

> **Range**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"SliderRange"`, [`SliderRangeProps`](../interfaces/SliderRangeProps.md), `never`, [`SliderCtx`](../classes/SliderCtx.md)\>

Visual fill between min and value (or between thumbs in range mode).

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for Slider. Manages value state and provides context.

#### Parameters

##### props

[`SliderRootProps`](../interfaces/SliderRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`SliderCtx`](../classes/SliderCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`SliderCtx`](../classes/SliderCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

### Thumb

> **Thumb**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"SliderThumb"`, [`SliderThumbProps`](../interfaces/SliderThumbProps.md), `never`, [`SliderCtx`](../classes/SliderCtx.md)\>

Draggable thumb handle. Has role="slider" with ARIA attributes.

### Track

> **Track**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"SliderTrack"`, [`SliderTrackProps`](../interfaces/SliderTrackProps.md), `never`, [`SliderCtx`](../classes/SliderCtx.md)\>

The track area of the slider. Clickable to jump thumb to position.

## Example

```ts
// Single value slider
Slider.Root({ defaultValue: 50, min: 0, max: 100 }, [
  Slider.Track({ class: "slider-track" }, [
    Slider.Range({ class: "slider-range" }),
  ]),
  Slider.Thumb({ class: "slider-thumb", "aria-label": "Volume" }),
])

// Range slider (two thumbs)
Slider.Root({ defaultValue: [200, 800], min: 0, max: 1000 }, [
  Slider.Track({ class: "slider-track" }, [
    Slider.Range({ class: "slider-range" }),
  ]),
  Slider.Thumb({ "aria-label": "Min price" }),
  Slider.Thumb({ "aria-label": "Max price" }),
])
```
