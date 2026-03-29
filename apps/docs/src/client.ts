import "./styles.css";

import { Effect } from "effect";

import { hydrate } from "@effex/dom/hydrate";
import { Navigation } from "@effex/router";

import { DocLayout } from "./layout.js";
import { router } from "./routes.js";

const navLayer = Navigation.makeLayer(router);

hydrate(
  Effect.provide(DocLayout(), navLayer),
  document.getElementById("root")!,
);
