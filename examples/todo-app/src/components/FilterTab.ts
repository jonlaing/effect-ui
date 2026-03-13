import { Effect } from "effect";

import { $, Readable, Signal } from "@effex/dom";

export type Filter = "all" | "active" | "completed";

export interface FilterTabProps {
  filter: Signal.Signal<Filter>;
  value: Filter;
  label: string;
}

// Filter tab component
export const FilterTab = (props: FilterTabProps) =>
  Effect.gen(function* () {
    const isActive = Readable.map(props.filter, (f) => f === props.value);
    const tabClass = Readable.map(isActive, (active) =>
      active ? "tab tab-active" : "tab",
    );

    return yield* $.button(
      {
        class: tabClass,
        onClick: () => props.filter.set(props.value),
      },
      $.of(props.label),
    );
  });
