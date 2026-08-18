import { Effect } from "effect";

import { $, Readable } from "@stax-ui/dom";

import type { Priority } from "../types.js";

const priorityColors: Record<Priority, string> = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-info",
};

const priorityLabels: Record<Priority, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

export const PriorityBadge = (props: {
  priority: Readable.Readable<Priority | null>;
}) =>
  Effect.gen(function* () {
    const badgeClass = Readable.map(props.priority, (p) =>
      p ? `badge badge-sm ${priorityColors[p]}` : "hidden",
    );

    const label = Readable.map(props.priority, (p) =>
      p ? priorityLabels[p] : "",
    );

    return yield* $.span({ class: badgeClass }, $.of(label));
  });
