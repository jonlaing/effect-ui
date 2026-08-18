import { hydrate } from "@stax-ui/dom/hydrate";
import { Platform } from "@stax-ui/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

hydrate(App(), document.getElementById("root")!, {
  layers: Platform.makeClientLayer(router),
});
