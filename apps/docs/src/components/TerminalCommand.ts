import { Effect } from "effect";
import { Check, Copy } from "lucide-static";

import { $, Signal, when } from "@stax-ui/dom";

/**
 * Terminal-styled command block. Layout:
 *
 *     [ $ ]  <command>                              [ copy ]
 *      ↑       ↑                                       ↑
 *      user-select:none so drag-selecting the         swaps to a check
 *      command text doesn't grab the prompt too       for 2s after copy
 *
 * Only the command string is written to the clipboard — the prompt
 * and button are chrome. Pass the command as the sole argument:
 *
 *     TerminalCommand("pnpm create stax-ui my-app")
 */
export const TerminalCommand = (command: string) =>
  Effect.gen(function* () {
    const copied = yield* Signal.make(false);

    return yield* $.div(
      {
        class: [
          "flex items-center gap-3",
          "bg-code text-base-content",
          "px-4 py-3 rounded-lg",
          "text-paragraph font-mono inset-shadow-sm/30",
          "border border-base-100 border-4",
          "shadow-md",
        ],
      },
      $.span({ class: "select-none text-error" }, "$"),
      $.span({ class: "flex-1 min-w-0 truncate" }, command),
      $.button(
        {
          type: "button",
          class: [
            "flex-shrink-0 p-1 rounded",
            "opacity-60 hover:opacity-100 transition-opacity",
            "cursor-pointer",
          ],
          "aria-label": "Copy command to clipboard",
          onClick: () =>
            Effect.gen(function* () {
              yield* Effect.tryPromise({
                try: () => navigator.clipboard.writeText(command),
                catch: () => new Error("Clipboard write failed"),
              }).pipe(Effect.ignore);
              yield* copied.set(true);
              yield* Effect.sleep("2 seconds").pipe(
                Effect.andThen(copied.set(false)),
                Effect.forkDaemon,
              );
            }),
        },
        when(copied, {
          container: () => $.div({ class: "w-4 h-4 relative" }),
          onTrue: () =>
            $.div({
              class:
                "[&_svg]:w-4 [&_svg]:h-4 absolute inset-0 [&_svg]:text-success",
              innerHTML: Check,
            }),
          onFalse: () =>
            $.div({
              class: "[&_svg]:w-4 [&_svg]:h-4 absolute inset-0",
              innerHTML: Copy,
            }),
          animate: {
            enterFrom: "!opacity-0",
            enter: "transition-opacity duration-200",
            enterTo: "opacity-100",
            exit: "transition-opacity duration-200",
            exitTo: "!opacity-0",
          },
        }),
      ),
    );
  });
