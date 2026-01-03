import { Deferred, Effect, Scope } from "effect";
import type {
  VirtualListControl,
  VirtualListRef as VirtualListRefType,
} from "./types";

/**
 * Create a VirtualListRef to access scroll control methods.
 *
 * @example
 * ```ts
 * const listRef = yield* VirtualListRef.make()
 *
 * yield* virtualEach(items, {
 *   key: (item) => item.id,
 *   itemHeight: 48,
 *   ref: listRef,
 *   render: (item) => $.li(item.map(i => i.text)),
 * })
 *
 * // Later, scroll to a specific item
 * yield* listRef.ready.pipe(
 *   Effect.flatMap((control) => control.scrollTo(50))
 * )
 * ```
 */
export const makeVirtualListRef = (): Effect.Effect<
  VirtualListRefType,
  never,
  Scope.Scope
> =>
  Effect.gen(function* () {
    const deferred = yield* Deferred.make<VirtualListControl>();
    let current: VirtualListControl | null = null;

    const ref: VirtualListRefType = {
      get current() {
        return current;
      },
      ready: Deferred.await(deferred),
      _set: (control: VirtualListControl) => {
        current = control;
        Effect.runSync(Deferred.succeed(deferred, control));
      },
      _deferred: deferred,
    };

    return ref;
  });

/**
 * VirtualListRef module for creating refs to access scroll control.
 */
export const VirtualListRef = {
  make: makeVirtualListRef,
};
