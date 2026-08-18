import { $, collect } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

import type { Post, User } from "../services/PostService.js";

export const PostDetailPage = (data: { post: Post; author: User }) =>
  $.div(
    {},
    collect(
      Link(
        { href: "/", class: "btn btn-ghost btn-sm mb-4" },
        $.of("← Back to feed"),
      ),
      $.div(
        { class: "card bg-base-100 shadow-sm" },
        $.div(
          { class: "card-body" },
          collect(
            // Author
            $.div(
              { class: "flex items-center gap-3 mb-4" },
              collect(
                $.div(
                  { class: "avatar placeholder" },
                  $.div(
                    {
                      class:
                        "bg-primary text-primary-content w-12 rounded-full",
                    },
                    $.span(
                      { class: "text-lg" },
                      $.of(data.author.name.charAt(0).toUpperCase()),
                    ),
                  ),
                ),
                $.div(
                  {},
                  collect(
                    Link(
                      {
                        href: `/users/${data.author.id}`,
                        class: "font-bold link link-hover",
                      },
                      $.strong({}, $.of(data.author.name)),
                    ),
                    $.span(
                      { class: "text-base-content/60 ml-2 text-sm" },
                      $.of(data.author.handle),
                    ),
                  ),
                ),
              ),
            ),
            // Content
            $.p({ class: "text-lg mb-4" }, $.of(data.post.content)),
            // Timestamp
            $.div(
              { class: "text-base-content/50 text-sm" },
              $.of(new Date(data.post.createdAt).toLocaleString()),
            ),
          ),
        ),
      ),
    ),
  );
