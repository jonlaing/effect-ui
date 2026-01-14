import { Effect, Either, Option } from "effect";

import { isBrowser, RouterInternalsContext } from "./internals";
import { tryMatchSync } from "./matching";
import type {
  ActionResult,
  AllActionErrors,
  AllActionRequirements,
  AnyRoute,
} from "./types";

export interface ActionMethods<Routes extends Record<string, AnyRoute>> {
  executeAction: (
    routeName: string,
    formData: FormData,
    request: Request,
  ) => Effect.Effect<
    ActionResult | null,
    AllActionErrors<Routes>,
    AllActionRequirements<Routes>
  >;
  submitAction: (
    formData: FormData,
  ) => Effect.Effect<
    ActionResult | null,
    AllActionErrors<Routes>,
    AllActionRequirements<Routes>
  >;
  initializeActionData: (
    routeName: string,
    data: unknown,
  ) => Effect.Effect<void>;
}

/**
 * Create action-related methods for the router.
 * Note: runLoaderAndUpdateState is passed as a parameter since it's created by createLoaderMethods.
 */
export const createActionMethods = <Routes extends Record<string, AnyRoute>>(
  runLoaderAndUpdateState: Effect.Effect<void>,
): Effect.Effect<ActionMethods<Routes>, never, RouterInternalsContext> =>
  Effect.gen(function* () {
    const internals = yield* RouterInternalsContext;
    const routes = internals.routes as Routes;
    const { currentRoute, pathnameSignal, actionStateSignal } = internals;

    // Generate unique submission ID
    let submissionCounter = 0;
    const generateSubmissionId = () => {
      submissionCounter += 1;
      return `submission-${submissionCounter}-${Date.now()}`;
    };

    const executeAction = (
      routeName: string,
      formData: FormData,
      request: Request,
    ): Effect.Effect<
      ActionResult | null,
      AllActionErrors<Routes>,
      AllActionRequirements<Routes>
    > =>
      Effect.gen(function* () {
        const routeDef = routes[routeName as keyof Routes];
        if (!routeDef || !routeDef.action) {
          return null;
        }

        const pathname = yield* pathnameSignal.get;
        const rawParams = tryMatchSync(routeDef, pathname) ?? {};

        const data = yield* routeDef.action({
          formData,
          request,
          params: rawParams,
        }) as Effect.Effect<
          unknown,
          AllActionErrors<Routes>,
          AllActionRequirements<Routes>
        >;

        return {
          routeName,
          data,
        } satisfies ActionResult;
      });

    // Submit action and update reactive state
    // On client: POST to server via fetch
    // On server: Execute action directly (for SSR form submissions)
    const submitAction = (
      formData: FormData,
    ): Effect.Effect<
      ActionResult | null,
      AllActionErrors<Routes>,
      AllActionRequirements<Routes>
    > =>
      Effect.gen(function* () {
        const currentRouteOption = yield* currentRoute.get;
        if (Option.isNone(currentRouteOption)) {
          return null;
        }
        const currentRouteName = currentRouteOption.value;

        const routeDef = routes[currentRouteName as keyof Routes];
        if (!routeDef || !routeDef.action) {
          return null;
        }

        const submissionId = generateSubmissionId();

        // Set submitting state
        yield* actionStateSignal.set({
          isSubmitting: true,
          data: null,
          error: null,
          routeName: currentRouteName as string,
          submissionId,
        });

        const pathname = yield* pathnameSignal.get;

        // On client: POST to server via fetch
        if (isBrowser()) {
          return yield* submitActionClient<Routes>(
            runLoaderAndUpdateState,
            currentRouteName as string,
            formData,
            submissionId,
          );
        }

        // On server: Execute action directly
        return yield* submitActionServer<Routes>(
          runLoaderAndUpdateState,
          routeDef,
          currentRouteName as string,
          pathname,
          formData,
          submissionId,
        );
      }) as Effect.Effect<
        ActionResult | null,
        AllActionErrors<Routes>,
        AllActionRequirements<Routes>
      >;

    const initializeActionData = (
      routeName: string,
      data: unknown,
    ): Effect.Effect<void> =>
      actionStateSignal.set({
        isSubmitting: false,
        data,
        error: null,
        routeName,
        submissionId: null,
      });

    return { executeAction, submitAction, initializeActionData };
  });

/**
 * Handle action submission on the client via fetch.
 */
const submitActionClient = <Routes extends Record<string, AnyRoute>>(
  runLoaderAndUpdateState: Effect.Effect<void>,
  currentRouteName: string,
  formData: FormData,
  submissionId: string,
): Effect.Effect<
  ActionResult | null,
  AllActionErrors<Routes>,
  AllActionRequirements<Routes> | RouterInternalsContext
> =>
  Effect.gen(function* () {
    const { actionStateSignal } = yield* RouterInternalsContext;

    const response = yield* Effect.tryPromise(() =>
      fetch(window.location.href, {
        method: "POST",
        body: formData,
        headers: {
          "X-Effex-Action": "1",
        },
      }),
    ).pipe(
      Effect.mapError((error) => error as unknown as AllActionErrors<Routes>),
    );

    if (!response.ok) {
      const error = new Error(`Action failed: ${response.statusText}`);
      yield* actionStateSignal.set({
        isSubmitting: false,
        data: null,
        error,
        routeName: currentRouteName,
        submissionId,
      });
      return yield* Effect.fail(error as unknown as AllActionErrors<Routes>);
    }

    const actionData = yield* Effect.tryPromise(
      () =>
        response.json() as Promise<{
          routeName: string;
          data: unknown;
          timestamp: number;
          error?: string;
        }>,
    ).pipe(
      Effect.mapError((error) => error as unknown as AllActionErrors<Routes>),
    );

    if (actionData.error) {
      const error = new Error(actionData.error);
      yield* actionStateSignal.set({
        isSubmitting: false,
        data: null,
        error,
        routeName: currentRouteName,
        submissionId,
      });
      return yield* Effect.fail(error as unknown as AllActionErrors<Routes>);
    }

    yield* actionStateSignal.set({
      isSubmitting: false,
      data: actionData.data,
      error: null,
      routeName: actionData.routeName,
      submissionId,
    });

    // Re-run loader after successful action to get fresh data
    yield* runLoaderAndUpdateState;

    return {
      routeName: actionData.routeName,
      data: actionData.data,
    } satisfies ActionResult;
  });

/**
 * Handle action submission on the server directly.
 */
const submitActionServer = <Routes extends Record<string, AnyRoute>>(
  runLoaderAndUpdateState: Effect.Effect<void>,
  routeDef: AnyRoute,
  currentRouteName: string,
  pathname: string,
  formData: FormData,
  submissionId: string,
): Effect.Effect<
  ActionResult | null,
  AllActionErrors<Routes>,
  AllActionRequirements<Routes> | RouterInternalsContext
> =>
  Effect.gen(function* () {
    const { actionStateSignal } = yield* RouterInternalsContext;

    const rawParams = tryMatchSync(routeDef, pathname) ?? {};

    // TODO: This creates a synthetic Request because action handlers expect one,
    // but during SSR we don't have a real HTTP request. The localhost URL is just
    // a placeholder to satisfy the Request constructor. Consider passing the actual
    // server request through from the platform layer instead.
    const request = new Request(`http://localhost${pathname}`, {
      method: "POST",
      body: formData,
    });

    const result = yield* Effect.either(
      routeDef.action!({
        formData,
        request,
        params: rawParams,
      }) as Effect.Effect<unknown>,
    );

    if (Either.isRight(result)) {
      yield* actionStateSignal.set({
        isSubmitting: false,
        data: result.right,
        error: null,
        routeName: currentRouteName,
        submissionId,
      });

      // Re-run loader after successful action to get fresh data
      yield* runLoaderAndUpdateState;

      return {
        routeName: currentRouteName,
        data: result.right,
      } satisfies ActionResult;
    } else {
      yield* actionStateSignal.set({
        isSubmitting: false,
        data: null,
        error: result.left,
        routeName: currentRouteName,
        submissionId,
      });

      return yield* Effect.fail(result.left as AllActionErrors<Routes>);
    }
  });
