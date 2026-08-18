import { Effect } from "effect";

import { $, collect, each, Readable, Signal } from "@stax-ui/dom";

export interface StatProps {
  label: string;
  value: Readable.Readable<number>;
}

// Stat component - displays a single statistic using DaisyUI stat styling
export const Stat = (props: StatProps) =>
  Effect.gen(function* () {
    const valueList = yield* Signal.Array.make([0]);

    yield* Readable.tap(props.value, (n) =>
      Effect.gen(function* () {
        yield* valueList.push(n);

        const currSize = yield* valueList.length.get;
        if (currSize > 1) {
          yield* Effect.sleep(300); // Wait for exit animation to finish
          yield* valueList.shift();
        }
      }),
    );

    return yield* $.div(
      { class: "stat place-items-center" },
      collect(
        $.div({ class: "stat-title" }, $.of(props.label)),
        $.div(
          { class: "stat-value text-primary overflow-hidden h-14" },
          each(valueList, {
            key: (v) => v.toString(),
            render: (v) => $.div({}, $.of(v)),
            animate: {
              enterFrom:
                "opacity-0 translate-y-1/2 transition-all duration-300",
              enter: "opacity-100 translate-y-0 ",
              exit: "opactity-100 translate-y-0 transition-all duration-300",
              exitTo: "opacity-0 -translate-y-1/2",
            },
          }),
        ),
      ),
    );
  });
