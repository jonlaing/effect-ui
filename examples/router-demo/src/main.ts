import { Effect, Layer } from "effect";

import { DOMRendererLive, Element, mount, runApp } from "@stax-ui/dom";
import { Navigation } from "@stax-ui/router";

import { App } from "./App";
import { router } from "./routes";

import "./styles.css";

const program = Effect.gen(function* () {
  // Create navigation layer for the router
  const navLayer = Navigation.makeLayer(router);

  // Combine layers
  const appLayer = Layer.merge(navLayer, DOMRendererLive);

  // Mount the app with layers provided
  yield* mount(
    App() as Element.Element<HTMLElement>,
    document.getElementById("root")!,
  ).pipe(Effect.provide(appLayer));
});

runApp(program);
