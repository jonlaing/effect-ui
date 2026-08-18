import { Effect } from "effect";

import { $, collect, each, Readable } from "@stax-ui/dom";
import { Link } from "@stax-ui/router";

import { PostCard } from "../components/PostCard.js";
import type { Post, User } from "../services/PostService.js";

export const UserProfilePage = (data: { user: User; posts: readonly Post[] }) =>
  Effect.gen(function* () {
    const user = Readable.of(data.user);
    const posts = Readable.of(data.posts);

    return yield* $.div(
      {},
      collect(
        Link(
          { href: "/", class: "btn btn-ghost btn-sm mb-4" },
          $.of("← Back to feed"),
        ),
        // Profile header
        $.div(
          { class: "card bg-base-100 shadow-sm mb-6" },
          $.div(
            { class: "card-body" },
            collect(
              $.div(
                { class: "flex items-center gap-4" },
                collect(
                  $.div(
                    { class: "avatar placeholder" },
                    $.div(
                      {
                        class:
                          "bg-primary text-primary-content w-16 rounded-full",
                      },
                      $.span(
                        { class: "text-2xl" },
                        $.of(
                          Readable.map(user, (u) =>
                            u.name.charAt(0).toUpperCase(),
                          ),
                        ),
                      ),
                    ),
                  ),
                  $.div(
                    {},
                    collect(
                      $.h1(
                        { class: "text-2xl font-bold" },
                        $.of(Readable.map(user, (u) => u.name)),
                      ),
                      $.p(
                        { class: "text-base-content/60" },
                        $.of(Readable.map(user, (u) => u.handle)),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        // Posts
        $.h2({ class: "text-xl font-bold mb-4" }, $.of("Posts")),
        each(posts, {
          container: () => $.div({ class: "flex flex-col gap-3" }),
          key: (post) => post.id,
          render: (post) =>
            PostCard({
              post,
              author: user,
            }),
        }),
      ),
    );
  });
