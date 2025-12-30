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
 * Minimal router interface needed for action execution
 */
export interface ActionRouter {
  executeAction: (
    routeName: string,
    formData: FormData,
    request: Request,
  ) => Effect.Effect<
    { routeName: string; data: unknown } | null,
    unknown,
    unknown
  >;
  currentRoute: { get: Effect.Effect<Option.Option<string>> };
}

/**
 * Create action data from a request if it's an action request (POST/PUT/PATCH/DELETE)
 */
export const makeActionData = (
  router: ActionRouter | undefined,
  request: Request,
): Effect.Effect<ActionData | null> => {
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
  ) as Effect.Effect<ActionData | null>;
};

/**
 * Execute an action and format the result
 */
const formatActionData = (
  router: ActionRouter,
  routeName: string,
  request: Request,
) =>
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
  );
