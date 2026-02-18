import { Effect } from "effect";

import { $, collect } from "@effex/dom";

import { columns } from "../types.js";
import { Column } from "./Column.js";

export const KanbanBoard = () =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "flex gap-4 p-6 overflow-x-auto min-h-screen justify-center" },
      collect(...columns.map((column) => Column({ column }))),
    );
  });
