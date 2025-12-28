import { Data } from "effect";

/**
 * Error thrown when hydration fails to find an expected DOM element.
 */
export class HydrationMismatchError extends Data.TaggedError(
  "HydrationMismatchError",
)<{
  readonly type: "when" | "match" | "each";
  readonly hydrationId: string;
  readonly message: string;
}> {}
