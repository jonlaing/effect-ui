import { Effect } from "effect";

import { mount, runApp } from "@effex/dom";

import { App } from "./App";

runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!);
  }),
);
