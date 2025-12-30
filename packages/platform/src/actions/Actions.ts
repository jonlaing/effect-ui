import { Effect, Option } from "effect";

/**
 * Action data structure for hydration
 */
export interface ActionData {
  routeName: string;
  data: unknown;
  timestamp: number;
}

/**
 * Minimal router interface needed for action execution.
 *
 * @template E - The error type from actions
 * @template R - The requirements (dependencies) needed by actions
 *
 * When R is a union of services (e.g., `UserService | DatabaseService`),
 * TypeScript will require all those services to be provided when executing actions.
 */
export interface ActionRouter<E = unknown, R = unknown> {
  executeAction: (
    routeName: string,
    formData: FormData,
    request: Request,
  ) => Effect.Effect<{ routeName: string; data: unknown } | null, E, R>;
  currentRoute: { get: Effect.Effect<Option.Option<string>> };
}

/**
 * Create action data from a request if it's an action request (POST/PUT/PATCH/DELETE).
 *
 * The returned Effect will have the same requirements as the router's executeAction,
 * ensuring TypeScript enforces that all action dependencies are provided.
 *
 * @template E - The error type from the router's actions
 * @template R - The requirements needed by the router's actions
 */
export const makeActionData = <E = unknown, R = unknown>(
  router: ActionRouter<E, R> | undefined,
  request: Request,
): Effect.Effect<ActionData | null, E, R> => {
  const isActionRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(
    request.method.toUpperCase(),
  );

  return Effect.fromNullable(router).pipe(
    Effect.flatMap((r) =>
      isActionRequest ? Effect.succeed(r) : Effect.fail(null),
    ),
    Effect.flatMap((r) =>
      Effect.flatMap(r.currentRoute.get, (routeName) =>
        Option.match(routeName, {
          onSome: (name) => formatActionData(r, name, request),
          onNone: () => Effect.succeed(null),
        }),
      ),
    ),
    Effect.catchAll(() => Effect.succeed(null)),
  ) as Effect.Effect<ActionData | null, E, R>;
};

/**
 * Execute an action and format the result
 */
const formatActionData = <E, R>(
  router: ActionRouter<E, R>,
  routeName: string,
  request: Request,
): Effect.Effect<ActionData, E, R> =>
  Effect.promise(() => request.formData()).pipe(
    Effect.flatMap((formData) =>
      router.executeAction(routeName, formData, request),
    ),
    Effect.map((actionResult) => ({
      routeName,
      data: null,
      ...(actionResult ?? {}),
      timestamp: Date.now(),
    })),
    Effect.catchAll((error) =>
      Effect.succeed({
        routeName,
        data: { error: String(error) },
        timestamp: Date.now(),
      } as ActionData),
    ),
  ) as Effect.Effect<ActionData, E, R>;
