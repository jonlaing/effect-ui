import type { Element } from "@effex/dom";
import { hydrate } from "@effex/dom/hydrate";

import { DocLayout } from "./layout.js";

hydrate(
  DocLayout() as unknown as Element.Element<HTMLElement>,
  document.getElementById("root")!,
);
