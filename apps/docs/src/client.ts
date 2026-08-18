import "./styles.css";

import { hydrate } from "@stax-ui/dom/hydrate";
import { Navigation } from "@stax-ui/router";

import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

hydrate(DocLayout(), document.getElementById("root")!, {
  layers: Navigation.makeLayer(router),
});
