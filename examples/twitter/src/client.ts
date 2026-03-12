import "./styles.css";

import type { Element } from "@effex/dom";
import { hydrate } from "@effex/dom/hydrate";
import { Platform } from "@effex/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

hydrate(
  App() as unknown as Element.Element<HTMLElement>,
  document.getElementById("root")!,
  {
    layers: Platform.makeClientLayer(router),
  },
);
