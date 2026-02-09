import { Effect } from "effect";

import { $, collect, Readable } from "@effex/dom";

export interface StatProps {
  label: string;
  value: Readable.Readable<number>;
}

// Stat component - displays a single statistic using DaisyUI stat styling
export const Stat = (props: StatProps) =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "stat place-items-center" },
      collect(
        $.div({ class: "stat-title" }, $.of(props.label)),
        $.div(
          { class: "stat-value text-primary" },
          $.of(Readable.map(props.value, (n) => String(n))),
        ),
      ),
    );
  });
