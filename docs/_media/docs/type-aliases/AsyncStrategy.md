[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / AsyncStrategy

# Type Alias: AsyncStrategy

> **AsyncStrategy** = `"abort"` \| `"queue"` \| `"debounce"`

Defined in: [src/core/Derived/types.ts:33](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L33)

Strategy for handling concurrent async computations.

- "abort": Cancel the previous computation when a new one starts
- "queue": Wait for the previous computation to complete
- "debounce": Delay computation and reset timer on new triggers
