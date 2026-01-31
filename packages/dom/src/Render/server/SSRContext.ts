import { Context, Effect, Layer, Ref } from "effect";

/**
 * SSR context service interface.
 */
export interface SSRContextService {
  /**
   * Generate a unique hydration ID.
   */
  readonly generateId: Effect.Effect<string>;

  /**
   * Whether we're in SSR mode.
   */
  readonly isSSR: true;
}

/**
 * Context tag for SSR state.
 * Components check for this context to determine if they're rendering on the server
 * and to generate hydration markers.
 */
export class SSRContext extends Context.Tag("@effex/SSRContext")<
  SSRContext,
  SSRContextService
>() {}

/**
 * Create a live SSRContext layer with a fresh ID counter.
 */
export const makeSSRContextLive = Effect.gen(function* () {
  const counter = yield* Ref.make(0);

  const service: SSRContextService = {
    generateId: Ref.updateAndGet(counter, (n) => n + 1).pipe(
      Effect.map((n) => `h${n}`),
    ),
    isSSR: true,
  };

  return Layer.succeed(SSRContext, service);
});

/**
 * Run an effect with a fresh SSR context.
 */
export const withSSRContext = <A, E, R>(
  effect: Effect.Effect<A, E, R | SSRContext>,
): Effect.Effect<A, E, Exclude<R, SSRContext>> =>
  Effect.gen(function* () {
    const layer = yield* makeSSRContextLive;
    return yield* Effect.provide(effect, layer);
  }) as Effect.Effect<A, E, Exclude<R, SSRContext>>;
