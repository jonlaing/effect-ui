import { Effect } from "effect";

import { Readable } from "@effex/core";
import { $, collect, each } from "@effex/dom";
import { Link } from "@effex/router";

import { PostCard } from "../components/PostCard.js";
import type { Post, User } from "../services/PostService.js";

export const UserProfilePage = (data: { user: User; posts: readonly Post[] }) =>
  Effect.gen(function* () {
    const user = Readable.of(data.user);
    const posts = Readable.of(data.posts);

    return yield* $.div(
      {},
      collect(
        Link({ href: "/" }, $.of("← Back to feed")),
        $.h1({}, $.of(Readable.map(user, (u) => u.name))),
        $.p({}, $.of(Readable.map(user, (u) => u.handle))),
        $.h2({}, $.of("Posts")),
        each(posts, {
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
