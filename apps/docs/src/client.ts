import "./styles.css";

import { hydrate } from "@stax-ui/dom/hydrate";
import { makeClientLayer } from "@stax-ui/platform";

import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

hydrate(DocLayout(), document.getElementById("root")!, {
  layers: makeClientLayer(router),
});
