import { Effect } from "effect";
import { component, div, h1, p, Link } from "@effex/platform";

const AboutPage = component("AboutPage", () =>
  Effect.gen(function* () {
    return yield* div({ class: "page" }, [
      yield* h1({}, ["About"]),
      yield* p({}, ["This is a sample Effex single-page application."]),
      yield* p({}, [
        "Effex is built entirely on Effect.ts primitives, providing full type safety ",
        "and powerful abstractions for building reactive user interfaces.",
      ]),
      yield* div({ class: "card" }, [
        yield* p({}, [yield* Link({ href: "/" }, "Back to Home")]),
      ]),
    ]);
  }),
);

export default AboutPage;
