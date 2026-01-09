import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Toast, ToastCtx, type ToastPosition } from "@effex/primitives";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type ToastStoryArgs = {
  position?: ToastPosition;
};

const meta: Meta<ToastStoryArgs> = {
  title: "Primitives/Toast",
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Position of the toast viewport",
    },
  },
  args: {
    position: "bottom-right",
  },
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const app = Effect.gen(function* () {
      const ctx = yield* ToastCtx;

      const showToast = () =>
        ctx.add({
          title: "Toast notification",
          description: "This is a default toast message.",
        });

      const triggerButton = yield* $.button(
        {
          class: "btn btn-primary",
          onClick: showToast,
        },
        "Show Toast",
      );

      yield* Toast.Viewport(
        { class: "toast toast-end" },
        Toast.Root({ class: "alert shadow-lg" }, [
          Toast.Title({ class: "font-bold" }),
          Toast.Description({ class: "text-sm" }),
          Toast.Action({ class: "btn btn-sm btn-ghost" }),
          Toast.Close({ class: "btn btn-sm btn-circle btn-ghost" }),
        ]),
      );

      const container = document.createElement("div");
      container.className = "p-4";
      container.appendChild(triggerButton);

      return container;
    });

    const wrapped = Toast.Provider({ position: args.position }, app);

    const container = document.createElement("div");
    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AllTypes: Story = {
  render: (args) => {
    const app = Effect.gen(function* () {
      const ctx = yield* ToastCtx;

      const showDefault = () =>
        ctx.add({
          title: "Default",
          description: "This is a default notification.",
          type: "default",
        });

      const showSuccess = () =>
        ctx.add({
          title: "Success!",
          description: "Your changes have been saved successfully.",
          type: "success",
        });

      const showError = () =>
        ctx.add({
          title: "Error",
          description: "Something went wrong. Please try again.",
          type: "error",
        });

      const showWarning = () =>
        ctx.add({
          title: "Warning",
          description: "Please review your input before continuing.",
          type: "warning",
        });

      const showInfo = () =>
        ctx.add({
          title: "Information",
          description: "Here's some helpful information for you.",
          type: "info",
        });

      const buttons = yield* $.div({ class: "flex flex-wrap gap-2" }, [
        $.button({ class: "btn btn-neutral", onClick: showDefault }, "Default"),
        $.button({ class: "btn btn-success", onClick: showSuccess }, "Success"),
        $.button({ class: "btn btn-error", onClick: showError }, "Error"),
        $.button({ class: "btn btn-warning", onClick: showWarning }, "Warning"),
        $.button({ class: "btn btn-info", onClick: showInfo }, "Info"),
      ]);

      yield* Toast.Viewport(
        { class: "toast toast-end" },
        Toast.Root({ class: "alert shadow-lg" }, [
          Toast.Title({ class: "font-bold" }),
          Toast.Description({ class: "text-sm" }),
          Toast.Action({ class: "btn btn-sm btn-ghost" }),
          Toast.Close({ class: "btn btn-sm btn-circle btn-ghost" }),
        ]),
      );

      const container = document.createElement("div");
      container.className = "p-4";
      container.appendChild(buttons);

      return container;
    });

    const wrapped = Toast.Provider({ position: args.position }, app);

    const container = document.createElement("div");
    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithAction: Story = {
  render: (args) => {
    const app = Effect.gen(function* () {
      const ctx = yield* ToastCtx;

      const showToast = () =>
        ctx.add({
          title: "Message sent",
          description: "Your message has been delivered.",
          type: "success",
          action: {
            label: "Undo",
            onClick: () =>
              Effect.sync(() => {
                console.log("Undo clicked!");
              }),
          },
        });

      const triggerButton = yield* $.button(
        {
          class: "btn btn-success",
          onClick: showToast,
        },
        "Send Message",
      );

      yield* Toast.Viewport(
        { class: "toast toast-end" },
        Toast.Root({ class: "alert shadow-lg" }, [
          Toast.Title({ class: "font-bold" }),
          Toast.Description({ class: "text-sm" }),
          Toast.Action({ class: "btn btn-sm btn-ghost" }),
          Toast.Close({ class: "btn btn-sm btn-circle btn-ghost" }),
        ]),
      );

      const container = document.createElement("div");
      container.className = "p-4";
      container.appendChild(triggerButton);

      return container;
    });

    const wrapped = Toast.Provider({ position: args.position }, app);

    const container = document.createElement("div");
    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Persistent: Story = {
  render: (args) => {
    const app = Effect.gen(function* () {
      const ctx = yield* ToastCtx;

      const showToast = () =>
        ctx.add({
          title: "Important Notice",
          description: "This toast won't auto-dismiss. Click X to close.",
          type: "warning",
          duration: 0,
        });

      const triggerButton = yield* $.button(
        {
          class: "btn btn-warning",
          onClick: showToast,
        },
        "Show Persistent Toast",
      );

      yield* Toast.Viewport(
        { class: "toast toast-end" },
        Toast.Root({ class: "alert shadow-lg" }, [
          Toast.Title({ class: "font-bold" }),
          Toast.Description({ class: "text-sm" }),
          Toast.Action({ class: "btn btn-sm btn-ghost" }),
          Toast.Close({ class: "btn btn-sm btn-circle btn-ghost" }),
        ]),
      );

      const container = document.createElement("div");
      container.className = "p-4";
      container.appendChild(triggerButton);

      return container;
    });

    const wrapped = Toast.Provider({ position: args.position }, app);

    const container = document.createElement("div");
    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const MultipleToasts: Story = {
  render: (args) => {
    const app = Effect.gen(function* () {
      const ctx = yield* ToastCtx;

      let counter = 0;
      const showToast = () => {
        counter++;
        return ctx.add({
          title: `Notification #${counter}`,
          description: `This is toast number ${counter}.`,
          type: ["default", "success", "info", "warning"][counter % 4] as
            | "default"
            | "success"
            | "info"
            | "warning",
        });
      };

      const dismissAll = () => ctx.dismissAll();

      const buttons = yield* $.div({ class: "flex gap-2" }, [
        $.button({ class: "btn btn-info", onClick: showToast }, "Add Toast"),
        $.button(
          { class: "btn btn-neutral", onClick: dismissAll },
          "Clear All",
        ),
      ]);

      yield* Toast.Viewport(
        { class: "toast toast-end" },
        Toast.Root({ class: "alert shadow-lg" }, [
          Toast.Title({ class: "font-bold" }),
          Toast.Description({ class: "text-sm" }),
          Toast.Action({ class: "btn btn-sm btn-ghost" }),
          Toast.Close({ class: "btn btn-sm btn-circle btn-ghost" }),
        ]),
      );

      const container = document.createElement("div");
      container.className = "p-4";
      container.appendChild(buttons);

      return container;
    });

    const wrapped = Toast.Provider(
      { position: args.position, maxVisible: 5 },
      app,
    );

    const container = document.createElement("div");
    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
