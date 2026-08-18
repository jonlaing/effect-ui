import { Context, Effect, Scope } from "effect";

import { Signal, type SignalArray } from "@stax-ui/dom";

import type { Card, Priority, Status } from "../types.js";

export interface KanbanServiceType {
  readonly cards: SignalArray<Card>;
  readonly dragState: Signal.Signal<{ cardId: string } | null>;
  readonly hoverColumnId: Signal.Signal<Status | null>;
  readonly selectedCard: Signal.Signal<Card | null>;

  readonly moveCard: (
    cardId: string,
    targetStatus: Status,
  ) => Effect.Effect<void>;
  readonly addCard: (
    title: string,
    status: Status,
  ) => Effect.Effect<void, never, Scope.Scope>;
  readonly deleteCard: (cardId: string) => Effect.Effect<void>;
}

export class KanbanService extends Context.Tag("KanbanService")<
  KanbanService,
  KanbanServiceType
>() {}

export const makeKanbanService = () =>
  Effect.gen(function* () {
    const cards = yield* Signal.Array.make<Card>([]);
    const dragState = yield* Signal.make<{ cardId: string } | null>(null);
    const hoverColumnId = yield* Signal.make<Status | null>(null);
    const selectedCard = yield* Signal.make<Card | null>(null);

    // Initialize with sample data
    yield* initializeCards(cards);

    const moveCard = (cardId: string, targetStatus: Status) =>
      Effect.gen(function* () {
        const allCards = yield* cards.get;
        const card = allCards.find((c) => Effect.runSync(c.id.get) === cardId);
        if (card) {
          yield* card.status.set(targetStatus);
          yield* selectedCard.set(null);
          yield* dragState.set(null);
          // Force the array to re-emit so column filters recompute
          yield* cards.update((arr) => arr);
        }
      });

    const addCard = (title: string, status: Status) =>
      Effect.gen(function* () {
        const newCard = yield* Signal.Struct.make({
          id: crypto.randomUUID() as string,
          title,
          description: "",
          priority: null as Priority | null,
          status,
        });
        yield* cards.push(newCard);
      });

    const deleteCard = (cardId: string) =>
      cards.update((arr) =>
        arr.filter((c) => Effect.runSync(c.id.get) !== cardId),
      );

    return {
      cards,
      dragState,
      hoverColumnId,
      selectedCard,
      moveCard,
      addCard,
      deleteCard,
    } satisfies KanbanServiceType;
  });

const initializeCards = (cards: SignalArray<Card>) =>
  Effect.gen(function* () {
    const add = (
      id: string,
      title: string,
      status: Status,
      priority: Priority | null = null,
      description: string = "",
    ) =>
      Effect.gen(function* () {
        const card = yield* Signal.Struct.make({
          id,
          title,
          description,
          priority,
          status,
        });
        yield* cards.push(card);
      });

    yield* add(
      "1",
      "Research competitors",
      "todo",
      "high",
      "Analyze similar products in the market to identify strengths and weaknesses.",
    );
    yield* add(
      "2",
      "Write project brief",
      "todo",
      "medium",
      "Summarize project goals, target audience, and key features to guide the design process.",
    );
    yield* add("3", "Create wireframes", "todo", "low");
    yield* add(
      "4",
      "Design landing page",
      "in-progress",
      "high",
      "Focus on a clean, modern design that highlights the product's unique value proposition.",
    );
    yield* add("5", "Set up CI/CD pipeline", "in-progress");
    yield* add("6", "Initial project setup", "done");
    yield* add(
      "7",
      "Configure dev environment",
      "done",
      "medium",
      "Set up code editor, linters, and other tools to ensure a smooth development workflow.",
    );
  });
