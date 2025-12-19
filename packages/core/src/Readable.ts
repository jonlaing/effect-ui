import { Effect, Option, Stream } from "effect";

/**
 * A reactive value that can be read and observed for changes.
 * @template A - The type of the value
 */
export interface Readable<A> {
  /** Get the current value */
  readonly get: Effect.Effect<A>;
  /** Stream of value changes (does not include current value) */
  readonly changes: Stream.Stream<A>;
  /** Stream of all values (current value followed by changes) */
  readonly values: Stream.Stream<A>;
  /** Transform the readable value */
  readonly map: <B>(f: (a: A) => B) => Readable<B>;
}

/**
 * @category models
 */
export declare namespace Readable {
  /**
   * A reactive value that can be read and observed for changes.
   * @template A - The type of the value
   */
  export interface Readable<A> {
    /** Get the current value */
    readonly get: Effect.Effect<A>;
    /** Stream of value changes (does not include current value) */
    readonly changes: Stream.Stream<A>;
    /** Stream of all values (current value followed by changes) */
    readonly values: Stream.Stream<A>;
    /** Transform the readable value */
    readonly map: <B>(f: (a: A) => B) => Readable<B>;
  }

  /**
   * A value that can be either static or reactive.
   * Use `Readable.of()` to normalize to a `Readable<T>`.
   *
   * @example
   * ```ts
   * interface ButtonProps {
   *   disabled?: Readable.Reactive<boolean>;
   *   class?: Readable.Reactive<string>;
   * }
   *
   * const Button = (props: ButtonProps) =>
   *   Effect.gen(function* () {
   *     const disabled = Readable.of(props.disabled ?? false);
   *     // Now disabled is Readable<boolean>
   *   });
   * ```
   */
  export type Reactive<T> = T | Readable<T>;
}

/**
 * A value that can be either static or reactive.
 * Use `Readable.of()` to normalize to a `Readable<T>`.
 */
export type Reactive<T> = T | Readable<T>;

export const isReadable = <A>(value: A | Readable<A>): value is Readable<A> =>
  value !== null &&
  typeof value === "object" &&
  "get" in value &&
  "changes" in value &&
  "values" in value &&
  "map" in value;

/**
 * Create a constant Readable that never changes.
 * Useful for normalizing `T | Readable<T>` props.
 *
 * @example
 * ```ts
 * const disabled = Readable.of(false)
 * // disabled.get returns false, disabled.changes is empty
 *
 * // Normalize a prop that can be static or reactive
 * const normalized: Readable<boolean> =
 *   typeof props.disabled === "boolean"
 *     ? Readable.of(props.disabled)
 *     : props.disabled ?? Readable.of(false)
 * ```
 */
export const of = <A>(value: A | Readable<A>): Readable<A> =>
  isReadable(value) ? value : make(Effect.succeed(value), () => Stream.empty);

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
    get,
    get changes() {
      return getChanges();
    },
    get values() {
      return Stream.concat(Stream.fromEffect(get), getChanges());
    },
    map: <B>(f: (a: A) => B) =>
      make(Effect.map(get, f), () => Stream.map(getChanges(), f)),
  };
  return readable;
};

/**
 * Transform a Readable's value using a mapping function.
 * @param self - The readable to transform
 * @param f - The mapping function
 */
export const map = <A, B>(self: Readable<A>, f: (a: A) => B): Readable<B> =>
  make(Effect.map(self.get, f), () => Stream.map(self.changes, f));

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

/**
 * Gets the current values from all Readables as a tuple.
 */
const getCurrentValues = <T extends readonly Readable<unknown>[]>(
  readables: T,
): Effect.Effect<{ [K in keyof T]: T[K] extends Readable<infer A> ? A : never }> =>
  Effect.all(readables.map((r) => r.get)) as Effect.Effect<{
    [K in keyof T]: T[K] extends Readable<infer A> ? A : never;
  }>;

/**
 * Combine multiple Readables into a single Readable of a tuple.
 * The combined Readable updates whenever any input changes.
 *
 * When any dependency changes, ALL current values are re-fetched to ensure
 * consistency and avoid stale values.
 *
 * @example
 * ```ts
 * const firstName = yield* Signal.make("John");
 * const lastName = yield* Signal.make("Doe");
 *
 * const combined = Readable.combine([firstName, lastName]);
 * // combined: Readable<[string, string]>
 *
 * const fullName = combined.map(([first, last]) => `${first} ${last}`);
 * ```
 */
export const combine = <T extends readonly Readable<unknown>[]>(
  readables: T,
): Readable<{ [K in keyof T]: T[K] extends Readable<infer A> ? A : never }> => {
  type Result = { [K in keyof T]: T[K] extends Readable<infer A> ? A : never };

  if (readables.length === 0) {
    return make(Effect.succeed([] as unknown as Result), () => Stream.empty);
  }

  // Track the last emitted value to filter duplicates (for any number of readables)
  let lastEmitted: Result | undefined;

  // Get fetches current values from all readables and tracks them
  const get = Effect.gen(function* () {
    const values = yield* getCurrentValues(readables);
    lastEmitted = values;
    return values;
  });

  // Changes stream: subscribe to all changes and emit when values actually change
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
        // Check if values are the same as last emitted
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
 * Lift a function that takes an object as its argument to work with
 * potentially reactive properties. Properties can be either static values
 * or Readables, and the result is a Readable that updates when any
 * reactive property changes.
 *
 * This is particularly useful for integrating with libraries like
 * class-variance-authority (CVA) or clsx.
 *
 * @example
 * ```ts
 * import { cva } from "class-variance-authority";
 *
 * const buttonCva = cva("btn font-medium", {
 *   variants: {
 *     variant: { primary: "bg-blue-500", secondary: "bg-gray-200" },
 *     size: { sm: "px-2 py-1", md: "px-4 py-2" },
 *   },
 * });
 *
 * // Lift the CVA function
 * const buttonStyles = Readable.lift(buttonCva);
 *
 * // Now it accepts Readables and returns a Readable<string>
 * const variant = yield* Signal.make<"primary" | "secondary">("primary");
 * const className = buttonStyles({ variant, size: "md" });
 * // className: Readable<string> - updates when variant changes
 *
 * // Use in an element
 * yield* $.button({ class: className }, "Click me");
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

    const combined = combine(readables);

    return combined.map((values) => {
      const resolved = { ...staticProps } as T;
      for (let i = 0; i < readableKeys.length; i++) {
        resolved[readableKeys[i]] = values[i] as T[keyof T];
      }
      return fn(resolved);
    });
  };
};

/**
 * Readable namespace containing factory functions and type utilities.
 */
export const Readable = {
  isReadable,
  of,
  make,
  map,
  fromStream,
  combine,
  lift,
};
