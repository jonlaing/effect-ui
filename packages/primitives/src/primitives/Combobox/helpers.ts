import { Effect } from "effect";

import { Element } from "@effex/dom";

import { calculatePosition } from "../helpers";
import { ComboboxContentPositionCtx, ComboboxCtx } from "./types";

export const positionAndReveal = (element: Effect.Effect<HTMLElement>) =>
  Effect.gen(function* () {
    const ctx = yield* ComboboxCtx;
    const positioningContext = yield* ComboboxContentPositionCtx;

    const side = yield* positioningContext.side.get;
    const align = yield* positioningContext.align.get;
    const sideOffset = yield* positioningContext.sideOffset.get;

    // Measure content dimensions (element is in DOM but hidden)
    const contentRect = yield* Element.getBoundingClientRect(element);

    // Calculate final position using input dimensions
    const anchorRect = yield* Element.getBoundingClientRect(ctx.inputRef);

    const { top, left } = calculatePosition(
      anchorRect,
      side,
      align,
      sideOffset,
      0,
      contentRect.width,
      contentRect.height,
    );

    yield* positioningContext.setHasPositioned(true);

    return yield* element.pipe(
      Element.setStyles({
        top: `${top}px`,
        left: `${left}px`,
        minWidth: `${anchorRect.width}px`,
        opacity: "",
      }),
    );
  }).pipe(
    Effect.catchAll(() =>
      element.pipe(
        Element.setStyles({
          animation: "",
          opacity: "",
        }),
      ),
    ),
  );
