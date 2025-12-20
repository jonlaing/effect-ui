[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / RendererInterface

# Interface: RendererInterface\<Node\>

Defined in: [packages/core/src/Renderer.ts:9](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L9)

Abstract renderer interface for creating and manipulating a node tree.
Implementations can target DOM, strings (SSR), terminal, native, etc.

## Type Parameters

### Node

`Node`

The node type for this renderer (e.g., HTMLElement, VNode, string)

## Properties

### addEventListener()

> `readonly` **addEventListener**: (`node`, `event`, `handler`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:99](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L99)

Add an event listener to a node.
Returns a cleanup function to remove the listener.
Note: This may be a no-op for non-interactive renderers (SSR).

#### Parameters

##### node

`Node`

##### event

`string`

##### handler

(`event`) => `void`

#### Returns

`Effect`\<`void`\>

***

### appendChild()

> `readonly` **appendChild**: (`parent`, `child`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:23](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L23)

Append a child node to a parent node.

#### Parameters

##### parent

`Node`

##### child

`Node`

#### Returns

`Effect`\<`void`\>

***

### createNode()

> `readonly` **createNode**: (`type`) => `Effect`\<`Node`\>

Defined in: [packages/core/src/Renderer.ts:13](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L13)

Create an element node of the given type.

#### Parameters

##### type

`string`

#### Returns

`Effect`\<`Node`\>

***

### createTextNode()

> `readonly` **createTextNode**: (`text`) => `Effect`\<`Node`\>

Defined in: [packages/core/src/Renderer.ts:18](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L18)

Create a text node with the given content.

#### Parameters

##### text

`string`

#### Returns

`Effect`\<`Node`\>

***

### getChildren()

> `readonly` **getChildren**: (`node`) => `Effect`\<readonly `Node`[]\>

Defined in: [packages/core/src/Renderer.ts:108](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L108)

Get children of a node (for traversal during hydration).

#### Parameters

##### node

`Node`

#### Returns

`Effect`\<readonly `Node`[]\>

***

### insertBefore()

> `readonly` **insertBefore**: (`parent`, `child`, `reference`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:42](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L42)

Insert a child before a reference node.

#### Parameters

##### parent

`Node`

##### child

`Node`

##### reference

`Node` | `null`

#### Returns

`Effect`\<`void`\>

***

### isHydrating

> `readonly` **isHydrating**: `Effect`\<`boolean`\>

Defined in: [packages/core/src/Renderer.ts:113](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L113)

Check if the renderer is in hydration mode.

***

### removeAttribute()

> `readonly` **removeAttribute**: (`node`, `key`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:62](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L62)

Remove an attribute from a node.

#### Parameters

##### node

`Node`

##### key

`string`

#### Returns

`Effect`\<`void`\>

***

### removeChild()

> `readonly` **removeChild**: (`parent`, `child`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L28)

Remove a child node from a parent node.

#### Parameters

##### parent

`Node`

##### child

`Node`

#### Returns

`Effect`\<`void`\>

***

### replaceChild()

> `readonly` **replaceChild**: (`parent`, `newChild`, `oldChild`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:33](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L33)

Replace an old child node with a new one.

#### Parameters

##### parent

`Node`

##### newChild

`Node`

##### oldChild

`Node`

#### Returns

`Effect`\<`void`\>

***

### setAttribute()

> `readonly` **setAttribute**: (`node`, `key`, `value`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:53](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L53)

Set an attribute on a node.
If value is null/undefined, the attribute should be removed.
If value is a boolean, true sets empty string, false removes.

#### Parameters

##### node

`Node`

##### key

`string`

##### value

`unknown`

#### Returns

`Effect`\<`void`\>

***

### setClassName()

> `readonly` **setClassName**: (`node`, `className`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:67](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L67)

Set the className of a node.

#### Parameters

##### node

`Node`

##### className

`string`

#### Returns

`Effect`\<`void`\>

***

### setInnerHTML()

> `readonly` **setInnerHTML**: (`node`, `html`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:87](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L87)

Set the innerHTML of a node.
Note: This may not be supported by all renderers.

#### Parameters

##### node

`Node`

##### html

`string`

#### Returns

`Effect`\<`void`\>

***

### setInputValue()

> `readonly` **setInputValue**: (`node`, `value`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:92](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L92)

Set the value property of an input-like node.

#### Parameters

##### node

`Node`

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### setStyleProperty()

> `readonly` **setStyleProperty**: (`node`, `property`, `value`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:72](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L72)

Set a CSS style property on a node.

#### Parameters

##### node

`Node`

##### property

`string`

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### setTextContent()

> `readonly` **setTextContent**: (`node`, `text`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Renderer.ts:81](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Renderer.ts#L81)

Set the text content of a node.

#### Parameters

##### node

`Node`

##### text

`string`

#### Returns

`Effect`\<`void`\>
