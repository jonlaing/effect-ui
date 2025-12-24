import { Effect } from "effect";
import { component, div, h1, h2, p, ul, li, Link } from "@effex/platform";

const HomePage = component("HomePage", () =>
  Effect.gen(function* () {
    return yield* div({ class: "page" }, [
      yield* h1({}, ["Welcome to Effex"]),
      yield* p({}, ["A reactive UI framework built on Effect.ts primitives."]),
      yield* div({ class: "card" }, [
        yield* h2({}, ["Get Started"]),
        yield* p({}, [
          "Edit ",
          yield* code({}, ["src/routes/_index.tsx"]),
          " to modify this page.",
        ]),
      ]),
      yield* div({ class: "card" }, [
        yield* h2({}, ["Features"]),
        yield* ul({}, [
          yield* li({}, ["File-based routing"]),
          yield* li({}, ["Server-side rendering"]),
          yield* li({}, ["Loaders for data fetching"]),
          yield* li({}, ["Actions for form handling"]),
          yield* li({}, ["Seamless hydration"]),
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

// Helper for code element
const code = (props: Record<string, unknown>, children: string[]) =>
  Effect.gen(function* () {
    const el = document.createElement("code");
    el.style.background = "#f1f5f9";
    el.style.padding = "0.125rem 0.375rem";
    el.style.borderRadius = "0.25rem";
    el.style.fontFamily = "monospace";
    for (const child of children) {
      el.appendChild(document.createTextNode(child));
    }
    return el;
  });

export default HomePage;
