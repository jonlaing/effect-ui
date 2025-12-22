import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Image } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Image.stories.css";

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
      return yield* $.div({ class: "image-story-container" }, [
        $.div({ class: "image-demo" }, [
          $.div({ class: "image-demo-label" }, "Image with Fallback"),
          Image.Root({ class: "image-wrapper" }, [
            Image.Img({
              src: args.src ?? "",
              alt: args.alt ?? "",
              class: "image-img",
            }),
            Image.Fallback({ class: "image-fallback", delayMs: args.delayMs }, [
              $.span({ class: "image-fallback-icon" }, "🖼️"),
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

export const Avatar: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "image-story-container" }, [
        $.div({ class: "image-demo" }, [
          $.div({ class: "image-demo-label" }, "Avatar Style"),
          $.div({ class: "avatar-row" }, [
            Image.Root({ class: "avatar avatar-sm" }, [
              Image.Img({
                src: "https://i.pravatar.cc/100?u=alice",
                alt: "Alice",
                class: "avatar-img",
              }),
              Image.Fallback({ class: "avatar-fallback", delayMs: 200 }, "A"),
            ]),
            Image.Root({ class: "avatar avatar-md" }, [
              Image.Img({
                src: "https://i.pravatar.cc/100?u=bob",
                alt: "Bob",
                class: "avatar-img",
              }),
              Image.Fallback({ class: "avatar-fallback", delayMs: 200 }, "B"),
            ]),
            Image.Root({ class: "avatar avatar-lg" }, [
              Image.Img({
                src: "https://i.pravatar.cc/100?u=charlie",
                alt: "Charlie",
                class: "avatar-img",
              }),
              Image.Fallback({ class: "avatar-fallback", delayMs: 200 }, "C"),
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
      return yield* $.div({ class: "image-story-container" }, [
        $.div({ class: "image-demo" }, [
          $.div({ class: "image-demo-label" }, "Broken Image (shows fallback)"),
          Image.Root({ class: "image-wrapper" }, [
            Image.Img({
              src: "https://invalid-url-that-will-fail.com/image.jpg",
              alt: "This will fail",
              class: "image-img",
            }),
            Image.Fallback({ class: "image-fallback-error" }, [
              $.span({ class: "image-fallback-icon" }, "⚠️"),
              $.span({}, "Failed to load"),
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

export const DelayedFallback: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "image-story-container" }, [
        $.div({ class: "image-demo" }, [
          $.div({ class: "image-demo-label" }, "Delayed Fallback (600ms)"),
          $.p(
            { class: "image-demo-description" },
            "Fallback won't flash for fast-loading images",
          ),
          Image.Root({ class: "image-wrapper" }, [
            Image.Img({
              src: "https://picsum.photos/200?random=1",
              alt: "Random image",
              class: "image-img",
            }),
            Image.Fallback({ class: "image-fallback", delayMs: 600 }, [
              $.span({ class: "image-fallback-loading" }, "Loading..."),
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

      return yield* $.div({ class: "image-story-container" }, [
        $.div({ class: "image-demo" }, [
          $.div({ class: "image-demo-label" }, "Image Gallery"),
          $.div(
            { class: "image-gallery" },
            images.map((img) =>
              Image.Root({ class: "gallery-item" }, [
                Image.Img({
                  src: img.url,
                  alt: `Gallery image ${img.id}`,
                  class: "gallery-img",
                }),
                Image.Fallback({ class: "gallery-fallback", delayMs: 200 }, [
                  $.div({ class: "gallery-skeleton" }),
                ]),
              ]),
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

      return yield* $.div({ class: "image-story-container" }, [
        $.div({ class: "image-demo" }, [
          $.div({ class: "image-demo-label" }, "Reactive Source"),
          $.p(
            { class: "image-demo-description" },
            "Click button to load a new image",
          ),
          Image.Root({ class: "image-wrapper" }, [
            Image.Img({
              src,
              alt: "Random image",
              class: "image-img",
            }),
            Image.Fallback({ class: "image-fallback", delayMs: 100 }, [
              $.span({ class: "image-fallback-loading" }, "Loading..."),
            ]),
          ]),
          $.button({ class: "image-button", onClick: handleNext }, [
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
