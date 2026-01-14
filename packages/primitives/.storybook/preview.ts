import type { Preview } from "@storybook/html-vite";
import { themes } from "storybook/theming";

import "./tailwind.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    docs: {
      theme: themes.dark,
    },
  },
};

export default preview;
