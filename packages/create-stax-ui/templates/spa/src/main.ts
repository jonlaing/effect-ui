import { mount, runApp, type Element } from "@stax-ui/dom";
import { Navigation } from "@stax-ui/router";

import { App } from "./App.js";
import { router } from "./routes.js";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

runApp(mount(App() as unknown as Element.Element<HTMLElement>, container), {
  layer: Navigation.makeLayer(router),
});
