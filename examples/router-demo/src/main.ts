import { mount, type Element } from "@stax-ui/dom";
import { Navigation } from "@stax-ui/router";

import { App } from "./App";
import { router } from "./routes";

import "./styles.css";

mount(App() as Element.Element<HTMLElement>, document.getElementById("root")!, {
  layers: Navigation.makeLayer(router),
});
