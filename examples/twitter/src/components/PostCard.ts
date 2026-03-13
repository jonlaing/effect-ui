import { Effect } from "effect";

import { $, collect, Readable } from "@effex/dom";
import { Link } from "@effex/router";

import type { Post, User } from "../services/PostService.js";

export const PostCard = (props: {
  post: Readable.Readable<Post>;
  author: Readable.Readable<User>;
}) =>
  Effect.gen(function* () {
    const authorLink = yield* Readable.map(
      props.author,
      (a) => `/users/${a.id}`,
    ).get;
    const postLink = yield* Readable.map(props.post, (p) => `/posts/${p.id}`)
      .get;

    return yield* $.div(
      { class: "card bg-base-100 shadow-sm" },
      $.div(
        { class: "card-body p-4" },
        collect(
          // Author info
          $.div(
            { class: "flex items-center gap-2 mb-2" },
            collect(
              $.div(
                { class: "avatar placeholder" },
                $.div(
                  { class: "bg-neutral text-neutral-content w-8 rounded-full" },
                  $.span(
                    { class: "text-xs" },
                    $.of(
                      Readable.map(props.author, (a) =>
                        a.name.charAt(0).toUpperCase(),
                      ),
                    ),
                  ),
                ),
              ),
              $.div(
                {},
                collect(
                  Link(
                    { href: authorLink, class: "font-bold link link-hover" },
                    $.of(Readable.map(props.author, (a) => a.name)),
                  ),
                  $.span(
                    { class: "text-base-content/60 ml-2 text-sm" },
                    $.of(Readable.map(props.author, (a) => a.handle)),
                  ),
                ),
              ),
            ),
          ),
          // Content
          $.p(
            { class: "text-base-content mb-3" },
            $.of(Readable.map(props.post, (p) => p.content)),
          ),
          // Timestamp
          $.div(
            { class: "text-base-content/50 text-xs" },
            Link(
              { href: postLink, class: "link link-hover" },
              $.of(
                Readable.map(props.post, (p) =>
                  new Date(p.createdAt).toLocaleString(),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });
