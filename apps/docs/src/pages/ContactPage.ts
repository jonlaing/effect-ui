import { Effect } from "effect";

import { $ } from "@stax-ui/dom";

import { Nav } from "../components/Nav.js";

const EMAIL = "jon@jonlaing.dev";
const SUBJECT = "[stax]: Inquiry about Stax";
const MAILTO_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;

const contactLink = (href: string, text: string, external = true) =>
  $.a(
    {
      href,
      class: "text-secondary hover:underline",
      ...(external ? { target: "_blank", rel: "noopener" } : {}),
    },
    text,
  );

/**
 * `/contact` — email + GitHub links, plus a note that the project is
 * open to contributors. Uses the same Nav-column shell as the home
 * page so the layout stays consistent.
 *
 * The `mailto:` href pre-fills the subject with `[stax]: Inquiry
 * about Stax` (percent-encoded via `encodeURIComponent`) so the raw
 * `[stax]` tag makes it into recipients' inboxes and can be filtered
 * server-side.
 */
export const ContactPage = () =>
  Effect.gen(function* () {
    return yield* $.div(
      { class: "flex flex-col lg:flex-row min-h-screen" },
      $.div({ class: "lg:border-r" }, Nav()),
      $.main(
        { class: "flex-1 flex flex-col text-base-content" },
        $.section(
          { class: "px-8 py-16 max-w-2xl mx-auto w-full" },
          $.h1(
            { class: "text-heading tracking-tight mb-8" },
            $.span("Get in "),
            $.span({ class: "text-accent" }, "Touch"),
          ),
          $.p(
            { class: "text-paragraph text-base-content/75 mb-6" },
            "Stax is a fully open-source project, developed in the open on GitHub. Contributors are welcome. Bug reports, feature discussions, and pull requests all land in the same public repo. If you're using Stax and something feels rough, filing an issue is the fastest way to get it on the table.",
          ),
          $.p(
            { class: "text-paragraph text-base-content/75 mb-10" },
            "Email is the best way to reach me for questions, collaborations, licensing, or just to say hi.",
          ),
          $.dl(
            { class: "space-y-6" },
            $.div(
              $.dt(
                {
                  class: [
                    "text-caption-2 font-semibold uppercase tracking-widest",
                    "text-neutral mb-2",
                  ],
                },
                "Email",
              ),
              $.dd(contactLink(MAILTO_HREF, EMAIL, false)),
            ),
            $.div(
              $.dt(
                {
                  class: [
                    "text-caption-2 font-semibold uppercase tracking-widest",
                    "text-neutral mb-2",
                  ],
                },
                "GitHub",
              ),
              $.dd(
                { class: "flex flex-col gap-1" },
                contactLink(
                  "https://github.com/stax-ui/stax",
                  "stax-ui/stax — the framework",
                ),
                contactLink(
                  "https://github.com/stax-ui",
                  "stax-ui — the organization",
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });
