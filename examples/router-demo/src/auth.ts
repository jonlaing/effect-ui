import { Effect } from "effect";

// Simple auth state for demo purposes
// In a real app, this would be a Signal or check cookies/localStorage/service

let authenticated = false;

// Effect that checks if user is authenticated
// Guards accept Effect<boolean> directly
export const isAuthenticated: Effect.Effect<boolean> = Effect.sync(
  () => authenticated,
);

// Helper to log in (for demo)
export const login = (): Effect.Effect<void> =>
  Effect.sync(() => {
    authenticated = true;
  });

// Helper to log out (for demo)
export const logout = (): Effect.Effect<void> =>
  Effect.sync(() => {
    authenticated = false;
  });
