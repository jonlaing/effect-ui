import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Toast, ToastCtx, type ToastPosition } from "@effex/primitives";
import { button } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Toast.stories.css";

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

      const triggerButton = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--default",
          onClick: showToast,
        },
        "Show Toast",
      );

      // Create the viewport - it will be populated when toasts are added
      yield* Toast.Viewport({});

      const container = document.createElement("div");
      container.className = "toast-story-container";
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

      const buttons = document.createElement("div");
      buttons.className = "toast-story-buttons";

      const defaultBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--default",
          onClick: showDefault,
        },
        "Default",
      );

      const successBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--success",
          onClick: showSuccess,
        },
        "Success",
      );

      const errorBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--error",
          onClick: showError,
        },
        "Error",
      );

      const warningBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--warning",
          onClick: showWarning,
        },
        "Warning",
      );

      const infoBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--info",
          onClick: showInfo,
        },
        "Info",
      );

      buttons.appendChild(defaultBtn);
      buttons.appendChild(successBtn);
      buttons.appendChild(errorBtn);
      buttons.appendChild(warningBtn);
      buttons.appendChild(infoBtn);

      yield* Toast.Viewport({});

      const container = document.createElement("div");
      container.className = "toast-story-container";
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

      const triggerButton = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--success",
          onClick: showToast,
        },
        "Send Message",
      );

      yield* Toast.Viewport({});

      const container = document.createElement("div");
      container.className = "toast-story-container";
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
          duration: 0, // No auto-dismiss
        });

      const triggerButton = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--warning",
          onClick: showToast,
        },
        "Show Persistent Toast",
      );

      yield* Toast.Viewport({});

      const container = document.createElement("div");
      container.className = "toast-story-container";
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

      const buttons = document.createElement("div");
      buttons.className = "toast-story-buttons";

      const addBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--info",
          onClick: showToast,
        },
        "Add Toast",
      );

      const clearBtn = yield* button(
        {
          class: "toast-trigger-button toast-trigger-button--default",
          onClick: dismissAll,
        },
        "Clear All",
      );

      buttons.appendChild(addBtn);
      buttons.appendChild(clearBtn);

      yield* Toast.Viewport({});

      const container = document.createElement("div");
      container.className = "toast-story-container";
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
