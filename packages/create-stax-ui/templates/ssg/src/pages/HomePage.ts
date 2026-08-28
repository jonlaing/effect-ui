import { $ } from "@stax-ui/dom";

export interface HomeData {
  title: string;
  description: string;
}

export const HomePage = (data: HomeData) =>
  $.div(
    $.h1(data.title),
    $.p(data.description),
    $.div(
      { class: "card" },
      $.h2("Features"),
      $.ul(
        $.li("Static site generation"),
        $.li("Pre-rendered HTML pages"),
        $.li("Built on Effect.ts"),
        $.li("Type-safe routing"),
      ),
    ),
  );
