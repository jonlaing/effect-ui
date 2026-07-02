---
"@effex/dom": minor
---

Add animation groups — declarative sequencing across multiple animated blocks. Solves the "chained word-by-word intro" case where each word is its own `each` and word N should only start after word N-1 finishes.

```ts
import { $, collect, each, stagger, Animation } from "@effex/dom";

const App = () =>
  Effect.gen(function* () {
    const [greeting, name, tagline] = yield* Animation.sequence(3);
    return $.div(
      {},
      collect(
        each(greetingLetters, {
          key: (l) => l.id,
          render: (l) => $.span({}, $.of(l.char)),
          animate: { enter: "letter-in", stagger: stagger(40), group: greeting },
        }),
        each(nameLetters, {
          key: (l) => l.id,
          render: (l) => $.span({}, $.of(l.char)),
          animate: { enter: "letter-in", stagger: stagger(40), group: name },
        }),
        each(taglineLetters, {
          key: (l) => l.id,
          render: (l) => $.span({}, $.of(l.char)),
          animate: { enter: "letter-in", stagger: stagger(40), group: tagline },
        }),
      ),
    );
  });
```

New API:

- `Animation.group()` — creates a group with a gate (unresolved) and a completion signal.
- `Animation.sequence(count)` — returns `count` groups wired end-to-end: group 0's gate is open immediately, group N's gate opens when group N-1's registered animations all complete.
- `Animation.parallel(count)` — returns `count` groups with all gates open (useful nested inside `sequence` for concurrent segments in a follow-up release).
- `animate.group: AnimationGroup` — new option on any animated control (`each`, `when`, `match`, ...). The animation registers with the group synchronously, awaits the gate before starting, and signals completion when finished.

Groups finalize when their pending count returns to zero for the first time after having been non-zero. Late registrations that arrive after finalization run immediately (gate is already open) — intended semantics for one-shot intros where post-sequence additions behave like ordinary animations.
