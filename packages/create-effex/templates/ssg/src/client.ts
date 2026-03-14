import type { Element } from "@effex/dom";
import { hydrate } from "@effex/dom/hydrate";

import { App } from "./App.js";

hydrate(
  App() as unknown as Element.Element<HTMLElement>,
  document.getElementById("root")!,
);
