import { Effect, Option, Schema } from "effect";

import { AsyncCache, Readable } from "@effex/core";
import { $, collect, each, matchOption } from "@effex/dom";
import { Field, Form } from "@effex/form";
import { RouteDataContext } from "@effex/router";

import { PostCard } from "../components/PostCard.js";
import type { Post, User } from "../services/PostService.js";

// Form definition — validates content is non-empty
const ContentSchema: Schema.Schema<string, string> = Schema.String.pipe(
  Schema.minLength(1),
);
const NewPostForm = Form.make({
  content: Field.make(ContentSchema),
});

const PostList = ({
  posts,
  users,
}: {
  posts: Readable.Readable<readonly Post[]>;
  users: Readable.Readable<readonly User[]>;
}) =>
  each(posts, {
    container: () => $.ul({}),
    key: (post) => post.id,
    render: (post) =>
      Effect.gen(function* () {
        const p = yield* post.get;
        const author = Readable.map(users, (u) =>
          Option.fromNullable(u.find((user) => user.id === p.authorId)),
        );

        return yield* matchOption(author, {
          onNone: () => $.div({}, $.of("Unknown author")),
          onSome: (author) => $.li({}, PostCard({ post, author })),
        });
      }),
  });

export const FeedPage = (data: {
  posts: readonly Post[];
  users: readonly User[];
}) =>
  Effect.gen(function* () {
    const { actions } = yield* RouteDataContext;
    const cache = yield* AsyncCache;

    const feedQuery = yield* cache.get(
      ["feed"],
      () =>
        Effect.tryPromise(() =>
          fetch("/?_data=1").then(
            (r) =>
              r.json() as Promise<{
                data: { posts: Post[]; users: User[] };
              }>,
          ),
        ).pipe(Effect.map((res) => res.data)),
      { initialData: data },
    );

    const posts = Readable.map(feedQuery.value, (fetched) =>
      Option.match(fetched, {
        onSome: (f) => f.posts,
        onNone: () => data.posts,
      }),
    );

    const users = Readable.map(feedQuery.value, (fetched) =>
      Option.match(fetched, {
        onSome: (f) => f.users,
        onNone: () => data.users,
      }),
    );

    return yield* $.div(
      {},
      collect(
        $.h1({}, $.of("Feed")),
        // New post form
        NewPostForm.provide(
          {
            defaults: { content: "" },
            action: actions.create,
            onSubmit: (ctx) =>
              Effect.gen(function* () {
                yield* Effect.tryPromise(() =>
                  fetch(actions.create, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ctx.encoded),
                  }),
                );
                // Invalidate feed cache — triggers refetch, UI updates reactively
                yield* cache.invalidate(["feed"]);
                yield* cache.invalidate(["posts"]); // Also invalidate individual posts cache to update post details if already open
              }),
          },
          Effect.gen(function* () {
            const content = yield* NewPostForm.fields.content;

            return yield* $.form(
              {},
              collect(
                $.textarea({
                  name: "content",
                  placeholder: "What's happening?",
                  rows: 3,
                  value: content.value,
                  onInput: (e: Event) =>
                    content.set((e.target as HTMLTextAreaElement).value),
                }),
                $.br(),
                $.button({ type: "submit" }, $.of("Post")),
              ),
            );
          }),
        ),
        $.hr(),
        // Post list — reactive on client (via cache), static on server
        PostList({ posts, users }),
      ),
    );
  });
