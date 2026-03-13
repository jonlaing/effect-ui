import { Effect } from "effect";

import { mount, runApp } from "@effex/dom";

import { App } from "./App";

import "./styles.css";

runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!);
  }),
);
