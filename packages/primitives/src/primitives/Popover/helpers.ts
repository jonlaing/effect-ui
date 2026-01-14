import { Effect } from "effect";

import { Element } from "@effex/dom";

import { calculatePosition } from "../helpers";
import { PopoverContentPositionCtx, PopoverCtx } from "./types";

export const positionAndReveal = (element: Effect.Effect<HTMLElement>) =>
  Effect.gen(function* () {
    const ctx = yield* PopoverCtx;
    const positioningContext = yield* PopoverContentPositionCtx;

    const side = yield* positioningContext.side.get;
    const align = yield* positioningContext.align.get;
    const sideOffset = yield* positioningContext.sideOffset.get;
    const alignOffset = yield* positioningContext.alignOffset.get;

    const anchorEl = Effect.orElse(ctx.anchorRef, () => ctx.triggerRef);

    // Measure content dimensions (element is in DOM but hidden)
    const contentRect = yield* Element.getBoundingClientRect(element);

    // Calculate final position using content dimensions
    const anchorRect = yield* Element.getBoundingClientRect(anchorEl);

    const { top, left } = calculatePosition(
      anchorRect,
      side,
      align,
      sideOffset,
      alignOffset,
      contentRect.width,
      contentRect.height,
    );

    yield* positioningContext.setHasPositioned(true);

    return yield* element.pipe(
      Element.setStyles({
        top: `${top}px`,
        left: `${left}px`,
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
