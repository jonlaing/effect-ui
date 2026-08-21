import { Effect } from "effect";

import { $, Signal, when } from "@stax-ui/dom";

export const Counter = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    const isBlocked = yield* Signal.make(false);

    const handleUpdate = (delta: number) => () =>
      Effect.gen(function* () {
        const blocked = yield* isBlocked.get;

        if (!blocked) {
          yield* count.update((n) => n + delta);
          yield* isBlocked.set(true);
          yield* Effect.sleep("2 seconds").pipe(
            Effect.andThen(() => isBlocked.set(false)),
            Effect.forkDaemon,
          );
        }
      });

    const btn =
      "px-3 py-1 rounded-lg bg-accent text-white font-mono cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

    return yield* $.div(
      { class: "flex flex-col gap-4 items-center" },
      $.div(
        { class: "flex items-center gap-4" },
        $.button(
          { class: btn, onClick: handleUpdate(-1), disabled: isBlocked },
          "-",
        ),
        $.span(
          { class: "text-heading-2 tabular-nums min-w-[3ch] text-center" },
          count,
        ),
        $.button(
          { class: btn, onClick: handleUpdate(1), disabled: isBlocked },
          "+",
        ),
      ),
      when(isBlocked, {
        onTrue: () =>
          $.span(
            { class: "text-sm text-base-content/50 italic" },
            "Please wait 2 seconds before updating again.",
          ),
        onFalse: () => $.span(),
      }),
    );
  });
