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
      {},
      collect(
        $.div(
          {},
          collect(
            Link(
              { href: authorLink },
              $.strong({}, $.of(Readable.map(props.author, (a) => a.name))),
            ),
            $.of(Readable.map(props.author, (a) => a.handle)),
          ),
        ),
        $.p({}, $.of(Readable.map(props.post, (p) => p.content))),
        $.div(
          {},
          Link(
            { href: postLink },
            $.of(
              Readable.map(props.post, (p) =>
                new Date(p.createdAt).toLocaleString(),
              ),
            ),
          ),
        ),
        $.hr(),
      ),
    );
  });
