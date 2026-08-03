import "./styles.css";

import { hydrate } from "@effex/dom/hydrate";
import { Navigation } from "@effex/router";

import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

hydrate(DocLayout() as never, document.getElementById("root")!, {
  layers: Navigation.makeLayer(router),
});
