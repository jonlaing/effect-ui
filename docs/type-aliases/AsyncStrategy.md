[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / AsyncStrategy

# Type Alias: AsyncStrategy

> **AsyncStrategy** = `"abort"` \| `"queue"` \| `"debounce"`

Defined in: src/Derived.ts:103

Strategy for handling concurrent async computations.
- "abort": Cancel the previous computation when a new one starts
- "queue": Wait for the previous computation to complete
- "debounce": Delay computation and reset timer on new triggers
