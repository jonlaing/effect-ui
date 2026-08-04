import { hydrate } from "@effex/dom/hydrate";
import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

hydrate(App(), document.getElementById("root")!, {
  layers: Platform.makeClientLayer(router),
});
