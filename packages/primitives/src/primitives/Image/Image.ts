import { Context, Effect } from "effect";
import {
  Signal,
  Readable,
  Derived,
  $,
  provide,
  component,
  Ref,
  Reaction,
} from "@effex/dom";
import type { Element, Child } from "@effex/dom";

export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export interface ImageContext {
  /** Current loading status of the image */
  readonly status: Readable.Readable<ImageLoadingStatus>;
  /** Set the loading status (used by Img component) */
  readonly setStatus: (status: ImageLoadingStatus) => Effect.Effect<void>;
}

export class ImageCtx extends Context.Tag("ImageContext")<
  ImageCtx,
  ImageContext
>() {}

export interface ImageRootProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * Container for image components. Provides loading state context to Img and Fallback.
 */
const Root = (
  props: ImageRootProps,
  children: Child<never, ImageCtx> | readonly Child<never, ImageCtx>[],
): Element =>
  Effect.gen(function* () {
    const status = yield* Signal.make<ImageLoadingStatus>("idle");

    const ctx: ImageContext = {
      status,
      setStatus: (s) => status.set(s),
    };

    return yield* $.span(
      {
        class: props.class,
        "data-image-root": "",
        "data-state": status,
      },
      provide(ImageCtx, ctx, children),
    );
  });

export interface ImageImgProps {
  /** Image source URL */
  readonly src: Readable.Reactive<string>;
  /** Alt text for accessibility */
  readonly alt: string;
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
}

/**
 * The actual image element. Tracks loading state and reports to context.
 */
const Img = component("ImageImg", (props: ImageImgProps) =>
  Effect.gen(function* () {
    const ctx = yield* ImageCtx;
    const imgRef = yield* Ref.make<HTMLImageElement>();

    // Normalize src to Readable
    const src = Readable.of(props.src);

    // React to src changes - reset status to loading
    yield* Reaction.make([src], ([currentSrc]) =>
      Effect.gen(function* () {
        const img = imgRef.current;

        if (currentSrc) {
          yield* ctx.setStatus("loading");
        }

        // Check if already loaded (cached image)
        if (img && img.complete && img.naturalWidth > 0) {
          yield* ctx.setStatus("loaded");
        }
      }),
    );

    // One-time setup: attach event listeners once element exists
    yield* Reaction.make([], () =>
      Effect.gen(function* () {
        const img = yield* imgRef.value;

        img.addEventListener("load", () =>
          Effect.runSync(ctx.setStatus("loaded")),
        );
        img.addEventListener("error", () =>
          Effect.runSync(ctx.setStatus("error")),
        );
      }),
    );

    // Hide image until loaded to prevent flash of broken image
    // Explicitly reset styles when loaded (empty object doesn't clear inline styles)
    const style = ctx.status.map(
      (s): Record<string, string> =>
        s === "loaded"
          ? { position: "", width: "", height: "", opacity: "" }
          : { position: "absolute", width: "1px", height: "1px", opacity: "0" },
    );

    return yield* $.img({
      ref: imgRef,
      src,
      alt: props.alt,
      class: props.class,
      style,
      "data-image-img": "",
    });
  }),
);

export interface ImageFallbackProps {
  /** Additional class names */
  readonly class?: Readable.Reactive<string>;
  /**
   * Delay in milliseconds before showing fallback.
   * Useful to avoid flashing fallback for quickly-loading images.
   * @default 0
   */
  readonly delayMs?: number;
}

/**
 * Fallback content shown while image is loading or if it fails to load.
 */
const Fallback = component(
  "ImageFallback",
  (props: ImageFallbackProps, children) =>
    Effect.gen(function* () {
      const ctx = yield* ImageCtx;
      const delayMs = props.delayMs ?? 0;

      // Track if delay has passed
      const delayPassed = yield* Signal.make(delayMs === 0);

      // Start delay timer if needed
      if (delayMs > 0) {
        yield* Reaction.make([], () =>
          Effect.gen(function* () {
            yield* Effect.sleep(`${delayMs} millis`);
            yield* delayPassed.set(true);
          }),
        );
      }

      // Show fallback if: (idle or loading or error) AND delay has passed
      // Don't show if image is loaded
      const shouldShow = yield* Derived.sync(
        [ctx.status, delayPassed],
        ([status, delayed]) => {
          if (status === "loaded") return false;
          if (!delayed) return false;
          return true;
        },
      );

      const dataState = shouldShow.map((show) => (show ? "visible" : "hidden"));

      return yield* $.span(
        {
          class: props.class,
          "data-image-fallback": "",
          "data-state": dataState,
        },
        children ?? [],
      );
    }),
);

/**
 * Headless Image primitive with loading state management and fallback support.
 *
 * Features:
 * - Automatic loading state tracking (idle → loading → loaded/error)
 * - Fallback content while loading or on error
 * - Optional delay before showing fallback (avoids flash for fast loads)
 * - Reactive src - updates loading state when src changes
 *
 * @example
 * ```ts
 * // Basic image with skeleton fallback
 * Image.Root({}, [
 *   Image.Img({ src: product.image, alt: product.name }),
 *   Image.Fallback({ delayMs: 200 }, Skeleton())
 * ])
 *
 * // Hero image with blur placeholder
 * Image.Root({ class: "relative w-full aspect-video" }, [
 *   Image.Img({
 *     src: hero.fullSize,
 *     alt: hero.alt,
 *     class: "w-full h-full object-cover"
 *   }),
 *   Image.Fallback({ class: "w-full h-full bg-gray-200 animate-pulse" })
 * ])
 *
 * // Gallery thumbnail with error state
 * Image.Root({}, [
 *   Image.Img({ src: thumb.url, alt: thumb.caption }),
 *   Image.Fallback({}, [
 *     Icon({ name: "image-off", class: "text-gray-400" })
 *   ])
 * ])
 * ```
 */
export const Image = {
  Root,
  Img,
  Fallback,
} as const;
