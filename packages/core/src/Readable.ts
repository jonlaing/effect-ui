import {
  Effect,
  Function as Fn,
  Option,
  Pipeable,
  Predicate,
  Stream,
} from "effect";

// -----------------------------------------------------------------------------
// TypeId
// -----------------------------------------------------------------------------

export const TypeId: unique symbol = Symbol.for("effex/Readable");
export type TypeId = typeof TypeId;

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

/**
 * A reactive value that can be read and observed for changes.
 * @template A - The type of the value
 */
export interface Readable<A> extends Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  /** Get the current value */
  readonly get: Effect.Effect<A>;
  /** Stream of value changes (does not include current value) */
  readonly changes: Stream.Stream<A>;
  /** Stream of all values (current value followed by changes) */
  readonly values: Stream.Stream<A>;
}

/**
 * @category models
 */
export declare namespace Readable {
  /**
   * A reactive value that can be read and observed for changes.
   * @template A - The type of the value
   */
  export interface Readable<A> extends Pipeable.Pipeable {
    readonly [TypeId]: TypeId;
    /** Get the current value */
    readonly get: Effect.Effect<A>;
    /** Stream of value changes (does not include current value) */
    readonly changes: Stream.Stream<A>;
    /** Stream of all values (current value followed by changes) */
    readonly values: Stream.Stream<A>;
  }

  /**
   * A value that can be either static or reactive.
   * Use `Readable.normalize()` to convert to a `Readable<T>`.
   */
  export type Reactive<T> = T | Readable<T>;
}

/**
 * A value that can be either static or reactive.
 * Use `Readable.normalize()` to convert to a `Readable<T>`.
 */
export type Reactive<T> = T | Readable<T>;

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Check if a value is a Readable.
 */
export const isReadable = (value: unknown): value is Readable<unknown> =>
  Predicate.hasProperty(value, TypeId);

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Create a Readable from a getter effect and a changes stream factory.
 * @param get - Effect that returns the current value
 * @param getChanges - Factory function that returns a stream of changes
 */
export const make = <A>(
  get: Effect.Effect<A>,
  getChanges: () => Stream.Stream<A>,
): Readable<A> => {
  const readable: Readable<A> = {
    [TypeId]: TypeId,
    get,
    get changes() {
      return getChanges();
    },
    get values() {
      return Stream.concat(Stream.fromEffect(get), getChanges());
    },
    pipe() {
      // eslint-disable-next-line prefer-rest-params
      return Pipeable.pipeArguments(this, arguments);
    },
  };
  return readable;
};

/**
 * Create a constant Readable from a value.
 * The Readable always returns the same value and never changes.
 *
 * @example
 * ```ts
 * const constant = Readable.of(42);
 * // constant.get returns 42, constant.changes is empty
 * ```
 */
export const of = <A>(value: A): Readable<A> =>
  make(Effect.succeed(value), () => Stream.empty);

/**
 * Alias for `of` - creates a constant Readable (identity lift).
 */
export const id = of;

/**
 * Normalize a value that may be static or reactive into a Readable.
 * If the value is already a Readable, returns it unchanged.
 * If the value is static, wraps it in a constant Readable.
 *
 * @example
 * ```ts
 * // Normalize a prop that can be static or reactive
 * const disabled = Readable.normalize(props.disabled ?? false);
 * // disabled is now Readable<boolean>
 * ```
 */
export const normalize = <A>(value: A | Readable<A>): Readable<A> =>
  isReadable(value) ? value : of(value);

/**
 * Create a Readable from an initial value and a stream of updates.
 * @param initial - The initial value
 * @param stream - Stream of value updates
 */
export const fromStream = <A>(
  initial: A,
  stream: Stream.Stream<A>,
): Readable<A> => {
  let current = initial;
  const tracked = Stream.tap(stream, (a) =>
    Effect.sync(() => {
      current = a;
    }),
  );

  return make(
    Effect.sync(() => current),
    () => tracked,
  );
};

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

/**
 * Transform a Readable's value using a mapping function.
 *
 * @example
 * ```ts
 * const count = Readable.of(5);
 * const doubled = count.pipe(Readable.map(n => n * 2));
 * // doubled.get returns 10
 * ```
 */
export const map: {
  <A, B>(f: (a: A) => B): (self: Readable<A>) => Readable<B>;
  <A, B>(self: Readable<A>, f: (a: A) => B): Readable<B>;
} = Fn.dual(
  2,
  <A, B>(self: Readable<A>, f: (a: A) => B): Readable<B> =>
    make(Effect.map(self.get, f), () => Stream.map(self.changes, f)),
);

/**
 * Chain Readables by mapping to another Readable and flattening.
 * When the outer Readable changes, switches to the new inner Readable.
 *
 * @example
 * ```ts
 * const userId = Readable.of(1);
 * const user = userId.pipe(Readable.flatMap(id => getUserReadable(id)));
 * ```
 */
export const flatMap: {
  <A, B>(f: (a: A) => Readable<B>): (self: Readable<A>) => Readable<B>;
  <A, B>(self: Readable<A>, f: (a: A) => Readable<B>): Readable<B>;
} = Fn.dual(
  2,
  <A, B>(self: Readable<A>, f: (a: A) => Readable<B>): Readable<B> => {
    const get = Effect.flatMap(self.get, (a) => f(a).get);

    const getChanges = (): Stream.Stream<B> => {
      // When outer changes, switch to the new inner Readable's values
      const outerChanges = Stream.flatMap(self.changes, (a) => f(a).values);
      // Also include inner changes from current value
      const innerChanges = Stream.flatMap(
        Stream.fromEffect(self.get),
        (a) => f(a).changes,
      );
      return Stream.merge(innerChanges, outerChanges);
    };

    return make(get, getChanges);
  },
);

/**
 * Combine two Readables into a Readable of a tuple.
 *
 * @example
 * ```ts
 * const name = Readable.of("John");
 * const age = Readable.of(30);
 * const tuple = name.pipe(Readable.zip(age));
 * // tuple: Readable<[string, number]>
 * ```
 */
export const zip: {
  <B>(that: Readable<B>): <A>(self: Readable<A>) => Readable<[A, B]>;
  <A, B>(self: Readable<A>, that: Readable<B>): Readable<[A, B]>;
} = Fn.dual(
  2,
  <A, B>(self: Readable<A>, that: Readable<B>): Readable<[A, B]> =>
    zipWith(self, that, (a, b) => [a, b] as [A, B]),
);

/**
 * Combine two Readables using a function.
 *
 * @example
 * ```ts
 * const firstName = Readable.of("John");
 * const lastName = Readable.of("Doe");
 * const fullName = firstName.pipe(
 *   Readable.zipWith(lastName, (first, last) => `${first} ${last}`)
 * );
 * ```
 */
export const zipWith: {
  <A, B, C>(
    that: Readable<B>,
    f: (a: A, b: B) => C,
  ): (self: Readable<A>) => Readable<C>;
  <A, B, C>(
    self: Readable<A>,
    that: Readable<B>,
    f: (a: A, b: B) => C,
  ): Readable<C>;
} = Fn.dual(
  3,
  <A, B, C>(
    self: Readable<A>,
    that: Readable<B>,
    f: (a: A, b: B) => C,
  ): Readable<C> => {
    // Track the last emitted values to filter duplicates
    let lastEmitted: [A, B] | undefined;

    const getCurrentPair = Effect.gen(function* () {
      const a = yield* self.get;
      const b = yield* that.get;
      return [a, b] as [A, B];
    });

    const get = Effect.gen(function* () {
      const pair = yield* getCurrentPair;
      lastEmitted = pair;
      return f(pair[0], pair[1]);
    });

    const getChanges = (): Stream.Stream<C> => {
      // Merge both changes streams - when either emits, fetch both current values
      const mergedChanges = Stream.merge(
        Stream.map(self.changes, () => "change" as const),
        Stream.map(that.changes, () => "change" as const),
      );

      return mergedChanges.pipe(
        Stream.mapEffect(() => getCurrentPair),
        // Filter out emissions where the values haven't actually changed
        Stream.filterMap((pair) => {
          if (lastEmitted !== undefined) {
            if (pair[0] === lastEmitted[0] && pair[1] === lastEmitted[1]) {
              return Option.none();
            }
          }
          lastEmitted = pair;
          return Option.some(f(pair[0], pair[1]));
        }),
      );
    };

    return make(get, getChanges);
  },
);

/**
 * Gets the current values from all Readables as a tuple.
 */
const getCurrentValues = <T extends readonly Readable<unknown>[]>(
  readables: T,
): Effect.Effect<{
  [K in keyof T]: T[K] extends Readable<infer A> ? A : never;
}> =>
  Effect.all(readables.map((r) => r.get)) as Effect.Effect<{
    [K in keyof T]: T[K] extends Readable<infer A> ? A : never;
  }>;

/**
 * Combine multiple Readables into a single Readable of a tuple.
 * The combined Readable updates whenever any input changes.
 *
 * @example
 * ```ts
 * const firstName = Readable.of("John");
 * const lastName = Readable.of("Doe");
 * const age = Readable.of(30);
 *
 * const combined = Readable.zipAll([firstName, lastName, age]);
 * // combined: Readable<[string, string, number]>
 * ```
 */
export const zipAll = <T extends readonly Readable<unknown>[]>(
  readables: T,
): Readable<{ [K in keyof T]: T[K] extends Readable<infer A> ? A : never }> => {
  type Result = { [K in keyof T]: T[K] extends Readable<infer A> ? A : never };

  if (readables.length === 0) {
    return make(Effect.succeed([] as unknown as Result), () => Stream.empty);
  }

  // Track the last emitted value to filter duplicates
  let lastEmitted: Result | undefined;

  const get = Effect.gen(function* () {
    const values = yield* getCurrentValues(readables);
    lastEmitted = values;
    return values;
  });

  const getChanges = (): Stream.Stream<Result> => {
    // Merge all changes streams - when any emits, fetch ALL current values
    const mergedChanges = readables
      .map((r) => r.changes)
      .reduce(
        (acc, stream) => Stream.merge(acc, stream),
        Stream.never as Stream.Stream<unknown>,
      );

    return mergedChanges.pipe(
      Stream.mapEffect(() => getCurrentValues(readables)),
      // Filter out emissions where the values haven't actually changed
      Stream.filterMap((values) => {
        if (lastEmitted !== undefined) {
          const same = values.every((v, i) => v === lastEmitted![i]);
          if (same) {
            return Option.none();
          }
        }
        lastEmitted = values;
        return Option.some(values);
      }),
    );
  };

  return make(get, getChanges);
};

/**
 * Alias for `zipAll` for backwards compatibility.
 * @deprecated Use `zipAll` instead.
 */
export const combine = zipAll;

/**
 * Run a side effect for each value emitted by the Readable.
 * Returns an Effect that subscribes to the Readable's values.
 *
 * @example
 * ```ts
 * const count = Readable.of(0);
 * yield* count.pipe(
 *   Readable.tap(n => Effect.log(`Count: ${n}`))
 * );
 * ```
 */
export const tap: {
  <A, E, R>(
    f: (a: A) => Effect.Effect<void, E, R>,
  ): (self: Readable<A>) => Effect.Effect<void, E, R>;
  <A, E, R>(
    self: Readable<A>,
    f: (a: A) => Effect.Effect<void, E, R>,
  ): Effect.Effect<void, E, R>;
} = Fn.dual(
  2,
  <A, E, R>(
    self: Readable<A>,
    f: (a: A) => Effect.Effect<void, E, R>,
  ): Effect.Effect<void, E, R> => Stream.runForEach(self.values, f),
);

/**
 * Filter values from a Readable based on a predicate.
 * Only values that pass the predicate are emitted.
 *
 * Note: The initial value must pass the predicate or the Readable
 * will wait for the first passing value.
 *
 * @example
 * ```ts
 * const numbers = Readable.of(5);
 * const positive = numbers.pipe(Readable.filter(n => n > 0));
 * ```
 */
export const filter: {
  <A>(predicate: (a: A) => boolean): (self: Readable<A>) => Readable<A>;
  <A>(self: Readable<A>, predicate: (a: A) => boolean): Readable<A>;
} = Fn.dual(
  2,
  <A>(self: Readable<A>, predicate: (a: A) => boolean): Readable<A> => {
    const get = Effect.flatMap(self.get, (a) =>
      predicate(a)
        ? Effect.succeed(a)
        : Stream.runHead(Stream.filter(self.changes, predicate)).pipe(
            Effect.flatMap(
              Option.match({
                onNone: () => Effect.never,
                onSome: Effect.succeed,
              }),
            ),
          ),
    );

    const getChanges = () => Stream.filter(self.changes, predicate);

    return make(get, getChanges);
  },
);

/**
 * Remove consecutive duplicate values using reference equality.
 *
 * @example
 * ```ts
 * const input = Readable.of(1);
 * const deduped = input.pipe(Readable.dedupe);
 * ```
 */
export const dedupe = <A>(self: Readable<A>): Readable<A> =>
  dedupeWith(self, (a, b) => a === b);

/**
 * Remove consecutive duplicate values using a custom equality function.
 *
 * @example
 * ```ts
 * const users = Readable.of({ id: 1, name: "John" });
 * const deduped = users.pipe(
 *   Readable.dedupeWith((a, b) => a.id === b.id)
 * );
 * ```
 */
export const dedupeWith: {
  <A>(equals: (a: A, b: A) => boolean): (self: Readable<A>) => Readable<A>;
  <A>(self: Readable<A>, equals: (a: A, b: A) => boolean): Readable<A>;
} = Fn.dual(
  2,
  <A>(self: Readable<A>, equals: (a: A, b: A) => boolean): Readable<A> => {
    let last: { value: A } | undefined;

    const get = Effect.map(self.get, (a) => {
      last = { value: a };
      return a;
    });

    const getChanges = () =>
      Stream.filterMap(self.changes, (a) => {
        if (last !== undefined && equals(last.value, a)) {
          return Option.none();
        }
        last = { value: a };
        return Option.some(a);
      });

    return make(get, getChanges);
  },
);

/**
 * Lift a function that takes an object as its argument to work with
 * potentially reactive properties.
 *
 * @example
 * ```ts
 * const fn = (props: { a: number; b: string }) => `${props.b}-${props.a}`;
 * const lifted = Readable.lift(fn);
 *
 * const a = Readable.of(42);
 * const result = lifted({ a, b: "hello" });
 * // result: Readable<string>
 * ```
 */
export const lift = <T extends Record<string, unknown>, R>(
  fn: (props: T) => R,
): ((props: { [K in keyof T]: T[K] | Readable<T[K]> }) => Readable<R>) => {
  return (props) => {
    const keys = Object.keys(props) as (keyof T)[];
    const readableEntries: { key: keyof T; readable: Readable<unknown> }[] = [];
    const staticEntries: { key: keyof T; value: unknown }[] = [];

    // Partition into reactive vs static
    for (const key of keys) {
      const value = props[key];
      if (isReadable(value)) {
        readableEntries.push({ key, readable: value as Readable<unknown> });
      } else {
        staticEntries.push({ key, value });
      }
    }

    // All static - return constant Readable
    if (readableEntries.length === 0) {
      return make(Effect.succeed(fn(props as T)), () => Stream.empty);
    }

    // Build static props object
    const staticProps: Partial<T> = {};
    for (const { key, value } of staticEntries) {
      staticProps[key] = value as T[keyof T];
    }

    // Combine reactive values and call fn when any change
    const readables = readableEntries.map((e) => e.readable);
    const readableKeys = readableEntries.map((e) => e.key);

    const combined = zipAll(readables);

    return map(combined, (values) => {
      const resolved = { ...staticProps } as T;
      for (let i = 0; i < readableKeys.length; i++) {
        resolved[readableKeys[i]] = values[i] as T[keyof T];
      }
      return fn(resolved);
    });
  };
};

// -----------------------------------------------------------------------------
// Namespace Export
// -----------------------------------------------------------------------------

export const Readable = {
  TypeId,
  isReadable,
  make,
  of,
  id,
  normalize,
  fromStream,
  map,
  flatMap,
  zip,
  zipWith,
  zipAll,
  combine,
  tap,
  filter,
  dedupe,
  dedupeWith,
  lift,
};
