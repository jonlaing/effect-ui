import "./styles.css";

import type { Element } from "@stax-ui/dom";
import { hydrate } from "@stax-ui/dom/hydrate";
import { Platform } from "@stax-ui/platform";

import { App } from "./App.js";
import { router } from "./routes.js";

hydrate(
  App() as unknown as Element.Element<HTMLElement>,
  document.getElementById("root")!,
  {
    layers: Platform.makeClientLayer(router),
  },
);
