import type { SignalStruct } from "@stax-ui/dom";

export type Status = "todo" | "in-progress" | "done";

export type Priority = "low" | "medium" | "high";

// Card uses SignalStruct for reactive fields
export type Card = SignalStruct<{
  id: string;
  title: string;
  description: string;
  priority: Priority | null;
  status: Status;
}>;

// Column definitions (static, not reactive)
export interface Column {
  id: Status;
  title: string;
}

export const columns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];
