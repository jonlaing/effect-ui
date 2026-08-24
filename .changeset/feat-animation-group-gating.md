---
"@stax-ui/dom": minor
---

feat(dom): auto-complete empty animation groups + `Animation.skip`

Fixes a stall in `Animation.sequence` when a group has no registered
animations — the previous behavior held the sequence forever waiting
on `_done` that never fired. The typical trigger: a
viewport-conditional branch (mobile hides the desktop-only
`animated()` block, so the group never gets a registration), or a
reduced-motion / error path that opts out of a step.

Two new pieces:

**Auto-complete on gate open.** When a group's gate opens, if no
animation registers by the next tick, `_done` fires automatically so
downstream sequence steps can advance. Registrations arriving later —
reactive controls, late-mounted children — still run their
animations; they just don't gate downstream, matching the existing
"late arrivals don't re-open the signal" contract.

```ts
// On mobile, don't render the chips step at all. The sequence
// still cascades through `chips` to `cta` because `chips` completes
// automatically with nothing registered.
const [logo, chips, cta] = yield* Animation.sequence(3);
return yield* $.div(
  {},
  StaxLogo({ group: logo, intro: true }),
  yield* isMobile.get
    ? $.of("")
    : ChipRow({ group: chips, intro: true }),
  CtaButton({ group: cta, intro: true }),
);
```

**Explicit `Animation.skip(group)`.** Forces a group's `_done` to
fire without waiting on any registered animations to finish — the
escape hatch for cases where the element IS rendered but the
sequence should advance anyway (a "skip intro" button,
`prefers-reduced-motion` fast-path, error branches, custom
orchestrator logic). Idempotent, safe to call multiple times.
Doesn't cancel in-flight animation fibers; they run to completion,
they just no longer gate anything downstream.

```ts
const [logo, chips, cta] = yield* Animation.sequence(3);
if (yield* isMobile.get) {
  yield* Animation.skip(chips);
}
```

Purely additive. Existing sequences with real animations behave
identically — the completion path from `_complete` (registered
animation finished) is unchanged.
