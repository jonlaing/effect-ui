import { Context, Effect, Either, Exit, Option, Pipeable, Scope } from "effect";

import {
  AsyncReadableTypeId,
  make as makeAsyncReadable,
  type AsyncReadable,
} from "./AsyncReadable.js";
import { make as makeSignal } from "./Signal.js";

// -----------------------------------------------------------------------------
// Key Types
// -----------------------------------------------------------------------------

/**
 * Allowed primitive types for cache keys.
 */
export type CacheKeySegment = string | number | boolean;

/**
 * A cache key is an array of primitive segments.
 *
 * @example
 * ```ts
 * ['posts']
 * ['posts', 'feed']
 * ['posts', userId]
 * ['users', 42, true]
 * ```
 */
export type CacheKey = ReadonlyArray<CacheKeySegment>;

// -----------------------------------------------------------------------------
// Cache Entry
// -----------------------------------------------------------------------------

interface CacheEntry<A = unknown, E = unknown> {
  readonly key: CacheKey;
  readonly readable: AsyncReadable<A, E>;
  readonly scope: Scope.CloseableScope;
}

// -----------------------------------------------------------------------------
// Key Matching
// -----------------------------------------------------------------------------

/**
 * Serialize a cache key for use as a Map key.
 */
const serializeKey = (key: CacheKey): string =>
  key.map((s) => `${typeof s}:${s}`).join("/");

/**
 * Check if a key matches a prefix.
 * Every segment of the prefix must match the corresponding segment of the key.
 */
const matchesPrefix = (key: CacheKey, prefix: CacheKey): boolean => {
  if (prefix.length > key.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (key[i] !== prefix[i]) return false;
  }
  return true;
};

// -----------------------------------------------------------------------------
// AsyncCache Service Interface
// -----------------------------------------------------------------------------

/**
 * Options for `cache.get`.
 */
export interface CacheGetOptions<A> {
  /**
   * Initial data to seed the cache entry with.
   * When provided and no existing entry exists, the AsyncReadable
   * is created with this value already populated (no initial fetch).
   */
  readonly initialData?: A;
}

/**
 * The AsyncCache service interface.
 */
export interface IAsyncCache {
  /**
   * Get or create a cached AsyncReadable for the given key.
   *
   * If an entry already exists for this exact key, returns it.
   * Otherwise creates a new AsyncReadable, optionally seeded with initialData.
   *
   * @example
   * ```ts
   * const cache = yield* AsyncCache;
   * const posts = yield* cache.get(
   *   ['posts'],
   *   () => Effect.tryPromise(() => fetch('/api/posts').then(r => r.json())),
   *   { initialData: loaderData.posts }
   * );
   * ```
   */
  readonly get: <A, E = never, R = never>(
    key: CacheKey,
    fetcher: () => Effect.Effect<A, E, R>,
    options?: CacheGetOptions<A>,
  ) => Effect.Effect<AsyncReadable<A, E>, never, Scope.Scope | R>;

  /**
   * Invalidate all cache entries whose keys match the given prefix.
   * Matching entries are immediately refetched.
   *
   * @example
   * ```ts
   * // Invalidate all posts queries
   * yield* cache.invalidate(['posts']);
   *
   * // Invalidate a specific user's data
   * yield* cache.invalidate(['users', userId]);
   * ```
   */
  readonly invalidate: (keyPrefix: CacheKey) => Effect.Effect<void>;

  /**
   * Remove all cache entries whose keys match the given prefix.
   * Unlike invalidate, this disposes the entries entirely.
   */
  readonly remove: (keyPrefix: CacheKey) => Effect.Effect<void>;

  /**
   * Remove all entries from the cache.
   */
  readonly clear: () => Effect.Effect<void>;
}

// -----------------------------------------------------------------------------
// Context Tag
// -----------------------------------------------------------------------------

/**
 * Context tag for the AsyncCache service.
 *
 * @example
 * ```ts
 * const cache = yield* AsyncCache;
 * const posts = yield* cache.get(['posts'], fetchPosts, { initialData: data.posts });
 *
 * // Later, after a mutation:
 * yield* cache.invalidate(['posts']);
 * ```
 */
export class AsyncCache extends Context.Tag("@effex/core/AsyncCache")<
  AsyncCache,
  IAsyncCache
>() {}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

/**
 * Create an AsyncCache service instance.
 */
export const makeAsyncCache = (): IAsyncCache => {
  const entries = new Map<string, CacheEntry>();

  const get: IAsyncCache["get"] = <A, E = never, R = never>(
    key: CacheKey,
    fetcher: () => Effect.Effect<A, E, R>,
    options?: CacheGetOptions<A>,
  ): Effect.Effect<AsyncReadable<A, E>, never, Scope.Scope | R> =>
    Effect.gen(function* () {
      const serialized = serializeKey(key);

      // Return existing entry if found
      const existing = entries.get(serialized);
      if (existing) {
        return existing.readable as AsyncReadable<A, E>;
      }

      // Create a new entry
      const entryScope = yield* Scope.make();

      let readable: AsyncReadable<A, E>;

      if (options?.initialData !== undefined) {
        // Create with initial data — don't fetch immediately
        readable = yield* makeSeededAsyncReadable<A, E, R>(
          fetcher,
          options.initialData,
        ).pipe(Effect.provideService(Scope.Scope, entryScope));
      } else {
        // Standard creation — fetches immediately
        readable = yield* makeAsyncReadable<A, E, R>(fetcher).pipe(
          Effect.provideService(Scope.Scope, entryScope),
        );
      }

      const entry: CacheEntry<A, E> = { key, readable, scope: entryScope };
      entries.set(serialized, entry as CacheEntry);

      return readable;
    });

  const invalidate: IAsyncCache["invalidate"] = (keyPrefix) =>
    Effect.gen(function* () {
      for (const [, entry] of entries) {
        if (matchesPrefix(entry.key, keyPrefix)) {
          yield* entry.readable.refetch();
        }
      }
    });

  const remove: IAsyncCache["remove"] = (keyPrefix) =>
    Effect.gen(function* () {
      for (const [serialized, entry] of entries) {
        if (matchesPrefix(entry.key, keyPrefix)) {
          yield* Scope.close(entry.scope, Exit.void);
          entries.delete(serialized);
        }
      }
    });

  const clear: IAsyncCache["clear"] = () =>
    Effect.gen(function* () {
      for (const [serialized, entry] of entries) {
        yield* Scope.close(entry.scope, Exit.void);
        entries.delete(serialized);
      }
    });

  return { get, invalidate, remove, clear };
};

// -----------------------------------------------------------------------------
// Seeded AsyncReadable (internal)
// -----------------------------------------------------------------------------

/**
 * Creates an AsyncReadable that starts with initialData already populated,
 * skipping the initial fetch. Subsequent refetch() calls use the fetcher.
 */
const makeSeededAsyncReadable = <A, E = never, R = never>(
  fetcher: () => Effect.Effect<A, E, R>,
  initialData: A,
): Effect.Effect<AsyncReadable<A, E>, never, Scope.Scope | R> =>
  Effect.gen(function* () {
    const isLoadingSignal = yield* makeSignal(false);
    const valueSignal = yield* makeSignal<Option.Option<A>>(
      Option.some(initialData),
    );
    const errorSignal = yield* makeSignal<Option.Option<E>>(Option.none());

    const runFetch = (): Effect.Effect<void, never, R> =>
      Effect.gen(function* () {
        yield* isLoadingSignal.set(true);
        yield* errorSignal.set(Option.none());

        const result = yield* fetcher().pipe(Effect.either);

        if (Either.isRight(result)) {
          yield* valueSignal.set(Option.some(result.right));
        } else {
          yield* errorSignal.set(Option.some(result.left));
        }

        yield* isLoadingSignal.set(false);
      });

    // Don't fetch — we already have data

    const resetEffect = (): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* isLoadingSignal.set(false);
        yield* valueSignal.set(Option.none());
        yield* errorSignal.set(Option.none());
      });

    const asyncReadable: AsyncReadable<A, E> = {
      [AsyncReadableTypeId]: AsyncReadableTypeId,

      pipe() {
        return Pipeable.pipeArguments(this, arguments);
      },

      isLoading: isLoadingSignal,
      value: valueSignal,
      error: errorSignal,
      refetch: () => runFetch() as Effect.Effect<void>,
      reset: resetEffect,
    };

    return asyncReadable;
  });
