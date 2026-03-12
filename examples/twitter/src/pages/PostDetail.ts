import { $, collect } from "@effex/dom";
import { Link } from "@effex/router";

import type { Post, User } from "../services/PostService.js";

export const PostDetailPage = (data: { post: Post; author: User }) =>
  $.div(
    {},
    collect(
      Link({ href: "/" }, $.of("← Back to feed")),
      $.div(
        {},
        collect(
          Link(
            { href: `/users/${data.author.id}` },
            $.strong({}, $.of(data.author.name)),
          ),
          $.of(` ${data.author.handle}`),
        ),
      ),
      $.p({}, $.of(data.post.content)),
      $.div({}, $.of(new Date(data.post.createdAt).toLocaleString())),
    ),
  );
