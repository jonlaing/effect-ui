import "./styles.css";

import { Layer } from "effect";

import { hydrate } from "@stax-ui/dom/hydrate";
import { makeClientLayer } from "@stax-ui/platform";

import { StorageLive } from "./components/TodoApp/index.js";
import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

hydrate(DocLayout(), document.getElementById("root")!, {
  layers: Layer.mergeAll(makeClientLayer(router), StorageLive),
});
