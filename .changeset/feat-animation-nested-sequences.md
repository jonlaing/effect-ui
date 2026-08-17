---
"@effex/dom": minor
---

feat(animation): nested sequences via optional `group` parameter

`Animation.sequence` and `Animation.parallel` now accept an optional
`{ group?: AnimationGroup }` second argument that nests the returned
groups under a parent slot. Uses the existing `AnimationGroup` mechanism
end-to-end — no new concepts.

```ts
const [greeting, nameChunk, tagline] = yield* Animation.sequence(3);
const [firstName, lastName] = yield* Animation.sequence(2, {
  group: nameChunk,
});
// Timeline: greeting → firstName → lastName → tagline
```

When `options.group` is set: the child chain's first group gates on the
parent's `_gate` (instead of opening immediately), and the whole chain is
registered against the parent as one virtual animation. The parent's
`_done` fires normally once its pending count drains — parents can even
have direct animations attached alongside the nested chain and pending
counts accumulate correctly.

`Animation.parallel` variant opens every child gate in unison when the
parent's gate opens and completes the parent's virtual registration only
after every child's `_done` has fired.

Nests to arbitrary depth (`sequence(2, { group: childSeq[0] })`) — the
returned groups are ordinary `AnimationGroup`s.

Zero breaking changes — behavior when `options` is omitted is identical
to before.

Closes #91.
