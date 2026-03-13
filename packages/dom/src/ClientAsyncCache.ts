/**
 * Shared client-side AsyncCache instance.
 *
 * Both `mount` and `hydrate` provide this same layer, so data seeded
 * during hydration (via `cache.get(key, fetcher, { initialData })`)
 * is available to post-hydration client code.
 */

import { Layer } from "effect";

import { AsyncCache, makeAsyncCache } from "@effex/core";

export const ClientAsyncCacheLayer = Layer.succeed(
  AsyncCache,
  makeAsyncCache(),
);
