import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Image } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type ImageStoryArgs = {
  src?: string;
  alt?: string;
  delayMs?: number;
};

const meta: Meta<ImageStoryArgs> = {
  title: "Primitives/Image",
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: { type: "text" },
      description: "Image source URL",
    },
    alt: {
      control: { type: "text" },
      description: "Alt text for accessibility",
    },
    delayMs: {
      control: { type: "number", min: 0, max: 2000, step: 100 },
      description: "Delay before showing fallback",
    },
  },
  args: {
    src: "https://picsum.photos/200",
    alt: "Random image",
    delayMs: 0,
  },
};

export default meta;
type Story = StoryObj<ImageStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "p-4" }, [
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm font-medium" }, "Image with Fallback"),
          Image.Root(
            { class: "w-48 h-48 rounded-box overflow-hidden bg-base-200" },
            [
              Image.Img({
                src: args.src ?? "",
                alt: args.alt ?? "",
                class: "w-full h-full object-cover",
              }),
              Image.Fallback(
                {
                  class:
                    "w-full h-full flex items-center justify-center bg-base-300",
                  delayMs: args.delayMs,
                },
                [$.span({ class: "text-4xl" }, "🖼️")],
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Avatar: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "p-4" }, [
        $.div({ class: "flex flex-col gap-4" }, [
          $.span({ class: "text-sm font-medium" }, "Avatar Style"),
          $.div({ class: "flex items-center gap-4" }, [
            Image.Root({ class: "avatar" }, [
              $.div({ class: "w-8 rounded-full overflow-hidden" }, [
                Image.Img({
                  src: "https://i.pravatar.cc/100?u=alice",
                  alt: "Alice",
                  class: "w-full h-full object-cover",
                }),
                Image.Fallback(
                  {
                    class:
                      "w-full h-full flex items-center justify-center bg-primary text-primary-content text-sm font-bold",
                    delayMs: 200,
                  },
                  "A",
                ),
              ]),
            ]),
            Image.Root({ class: "avatar" }, [
              $.div({ class: "w-12 rounded-full overflow-hidden" }, [
                Image.Img({
                  src: "https://i.pravatar.cc/100?u=bob",
                  alt: "Bob",
                  class: "w-full h-full object-cover",
                }),
                Image.Fallback(
                  {
                    class:
                      "w-full h-full flex items-center justify-center bg-secondary text-secondary-content text-lg font-bold",
                    delayMs: 200,
                  },
                  "B",
                ),
              ]),
            ]),
            Image.Root({ class: "avatar" }, [
              $.div({ class: "w-16 rounded-full overflow-hidden" }, [
                Image.Img({
                  src: "https://i.pravatar.cc/100?u=charlie",
                  alt: "Charlie",
                  class: "w-full h-full object-cover",
                }),
                Image.Fallback(
                  {
                    class:
                      "w-full h-full flex items-center justify-center bg-accent text-accent-content text-xl font-bold",
                    delayMs: 200,
                  },
                  "C",
                ),
              ]),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const BrokenImage: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "p-4" }, [
        $.div({ class: "flex flex-col gap-2" }, [
          $.span(
            { class: "text-sm font-medium" },
            "Broken Image (shows fallback)",
          ),
          Image.Root(
            { class: "w-48 h-48 rounded-box overflow-hidden bg-base-200" },
            [
              Image.Img({
                src: "https://invalid-url-that-will-fail.com/image.jpg",
                alt: "This will fail",
                class: "w-full h-full object-cover",
              }),
              Image.Fallback(
                {
                  class:
                    "w-full h-full flex flex-col items-center justify-center gap-2 bg-error/10 text-error",
                },
                [
                  $.span({ class: "text-3xl" }, "⚠️"),
                  $.span({ class: "text-sm" }, "Failed to load"),
                ],
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DelayedFallback: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "p-4" }, [
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm font-medium" }, "Delayed Fallback (600ms)"),
          $.p(
            { class: "text-xs text-base-content/70" },
            "Fallback won't flash for fast-loading images",
          ),
          Image.Root(
            { class: "w-48 h-48 rounded-box overflow-hidden bg-base-200" },
            [
              Image.Img({
                src: "https://picsum.photos/200?random=1",
                alt: "Random image",
                class: "w-full h-full object-cover",
              }),
              Image.Fallback(
                {
                  class:
                    "w-full h-full flex items-center justify-center bg-base-300",
                  delayMs: 600,
                },
                [$.span({ class: "loading loading-spinner loading-lg" })],
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Gallery: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const images = [
        { id: 1, url: "https://picsum.photos/150?random=1" },
        { id: 2, url: "https://picsum.photos/150?random=2" },
        { id: 3, url: "https://picsum.photos/150?random=3" },
        { id: 4, url: "https://picsum.photos/150?random=4" },
        { id: 5, url: "https://picsum.photos/150?random=5" },
        { id: 6, url: "https://picsum.photos/150?random=6" },
      ];

      return yield* $.div({ class: "p-4" }, [
        $.div({ class: "flex flex-col gap-4" }, [
          $.span({ class: "text-sm font-medium" }, "Image Gallery"),
          $.div(
            { class: "grid grid-cols-3 gap-2" },
            images.map((img) =>
              Image.Root(
                {
                  class:
                    "aspect-square rounded-box overflow-hidden bg-base-200",
                },
                [
                  Image.Img({
                    src: img.url,
                    alt: `Gallery image ${img.id}`,
                    class:
                      "w-full h-full object-cover hover:scale-105 transition-transform",
                  }),
                  Image.Fallback({ class: "w-full h-full", delayMs: 200 }, [
                    $.div({ class: "w-full h-full skeleton" }),
                  ]),
                ],
              ),
            ),
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ReactiveSource: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const imageIndex = yield* Signal.make(1);
      const src = imageIndex.map(
        (i) => `https://picsum.photos/200?random=${i}`,
      );

      const handleNext = () =>
        Effect.gen(function* () {
          const current = yield* imageIndex.get;
          yield* imageIndex.set(current + 1);
        });

      return yield* $.div({ class: "p-4" }, [
        $.div({ class: "flex flex-col gap-4" }, [
          $.span({ class: "text-sm font-medium" }, "Reactive Source"),
          $.p(
            { class: "text-xs text-base-content/70" },
            "Click button to load a new image",
          ),
          Image.Root(
            { class: "w-48 h-48 rounded-box overflow-hidden bg-base-200" },
            [
              Image.Img({
                src,
                alt: "Random image",
                class: "w-full h-full object-cover",
              }),
              Image.Fallback(
                {
                  class:
                    "w-full h-full flex items-center justify-center bg-base-300",
                  delayMs: 100,
                },
                [$.span({ class: "loading loading-spinner loading-lg" })],
              ),
            ],
          ),
          $.button({ class: "btn btn-primary w-48", onClick: handleNext }, [
            "Load Next Image",
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
