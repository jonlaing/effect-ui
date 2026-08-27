import { mount } from "@stax-ui/dom";
import { Navigation } from "@stax-ui/router";

import { App } from "./App.js";
import { router } from "./routes.js";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

mount(App(), container, {
  layers: Navigation.makeLayer(router),
});
