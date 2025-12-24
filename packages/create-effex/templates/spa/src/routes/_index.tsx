import { Effect } from "effect";
import { component, div, h1, h2, p, ul, li, Link } from "@effex/platform";

const HomePage = component("HomePage", () =>
  Effect.gen(function* () {
    return yield* div({ class: "page" }, [
      yield* h1({}, ["Welcome to Effex"]),
      yield* p({}, ["A reactive UI framework built on Effect.ts primitives."]),
      yield* div({ class: "card" }, [
        yield* h2({}, ["Get Started"]),
        yield* p({}, ["Edit src/routes/_index.tsx to modify this page."]),
      ]),
      yield* div({ class: "card" }, [
        yield* h2({}, ["Features"]),
        yield* ul({}, [
          yield* li({}, ["File-based routing"]),
          yield* li({}, ["Client-side rendering"]),
          yield* li({}, ["Reactive signals"]),
          yield* li({}, ["Type-safe forms"]),
        ]),
      ]),
      yield* div({ class: "card" }, [
        yield* h2({}, ["Navigation"]),
        yield* ul({}, [
          yield* li({}, [yield* Link({ href: "/about" }, "About")]),
        ]),
      ]),
    ]);
  }),
);

export default HomePage;
