import { Context, Effect, Ref } from "effect";

// =============================================================================
// Types
// =============================================================================

export interface User {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
}

export interface Post {
  readonly id: string;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt: number;
}

// =============================================================================
// Service Interface
// =============================================================================

export interface PostServiceType {
  readonly getUsers: () => Effect.Effect<readonly User[]>;
  readonly getUser: (id: string) => Effect.Effect<User>;
  readonly getPosts: () => Effect.Effect<readonly Post[]>;
  readonly getPost: (id: string) => Effect.Effect<Post>;
  readonly getPostsByUser: (userId: string) => Effect.Effect<readonly Post[]>;
  readonly createPost: (
    authorId: string,
    content: string,
  ) => Effect.Effect<Post>;
}

export class PostService extends Context.Tag("PostService")<
  PostService,
  PostServiceType
>() {}

// =============================================================================
// In-memory implementation
// =============================================================================

const seedUsers: User[] = [
  { id: "alice", name: "Alice Johnson", handle: "@alice" },
  { id: "bob", name: "Bob Smith", handle: "@bob" },
  { id: "carol", name: "Carol Williams", handle: "@carol" },
];

const seedPosts: Post[] = [
  {
    id: "1",
    authorId: "alice",
    content:
      "Just discovered Effect.ts and it's amazing! Type-safe error handling changes everything.",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "2",
    authorId: "bob",
    content:
      "Building a UI framework with Effect primitives. Reactive signals + dependency injection = chef's kiss.",
    createdAt: Date.now() - 7200000,
  },
  {
    id: "3",
    authorId: "carol",
    content:
      "Hot take: SSR without a framework is actually simpler when you have the right primitives.",
    createdAt: Date.now() - 10800000,
  },
  {
    id: "4",
    authorId: "alice",
    content:
      "The best abstraction is the one that disappears. Routes should just be paths + components.",
    createdAt: Date.now() - 14400000,
  },
];

export const PostServiceLive = Effect.gen(function* () {
  const usersRef = yield* Ref.make<User[]>([...seedUsers]);
  const postsRef = yield* Ref.make<Post[]>([...seedPosts]);
  let nextId = seedPosts.length + 1;

  const service: PostServiceType = {
    getUsers: () => Ref.get(usersRef),

    getUser: (id) =>
      Effect.flatMap(Ref.get(usersRef), (users) => {
        const user = users.find((u) => u.id === id);
        return user
          ? Effect.succeed(user)
          : Effect.die(`User not found: ${id}`);
      }),

    getPosts: () =>
      Effect.map(Ref.get(postsRef), (posts) =>
        [...posts].sort((a, b) => b.createdAt - a.createdAt),
      ),

    getPost: (id) =>
      Effect.flatMap(Ref.get(postsRef), (posts) => {
        const post = posts.find((p) => p.id === id);
        return post
          ? Effect.succeed(post)
          : Effect.die(`Post not found: ${id}`);
      }),

    getPostsByUser: (userId) =>
      Effect.map(Ref.get(postsRef), (posts) =>
        posts
          .filter((p) => p.authorId === userId)
          .sort((a, b) => b.createdAt - a.createdAt),
      ),

    createPost: (authorId, content) =>
      Effect.gen(function* () {
        const id = String(nextId++);
        const post: Post = {
          id,
          authorId,
          content,
          createdAt: Date.now(),
        };
        yield* Ref.update(postsRef, (posts) => [...posts, post]);
        return post;
      }),
  };

  return service;
});
