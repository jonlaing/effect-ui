import { Effect, Schema } from "effect";

import { $, collect } from "@stax-ui/dom";
import { Link, Route } from "@stax-ui/router";

// Mock users data
const users: Record<number, { id: number; name: string; email: string }> = {
  1: { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  2: { id: 2, name: "Bob Smith", email: "bob@example.com" },
  3: { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
};

// Route definition co-located with the component
export const UserDetailRoute = Route.make("/users/:id").pipe(
  Route.params(Schema.Struct({ id: Schema.NumberFromString })),
  Route.get(
    ({ params: { id } }) => Effect.succeed([id, users[id]] as const),
    ([id, user]) => UserDetailPage({ id, user }),
  ),
);

const UserDetailPage = ({
  id,
  user,
}: {
  id: number;
  user: (typeof users)[number];
}) =>
  Effect.gen(function* () {
    if (!user) {
      return yield* $.div(
        { class: "space-y-4" },
        collect(
          $.h1(
            { class: "text-3xl font-bold text-red-600" },
            $.of("User Not Found"),
          ),
          $.p(
            { class: "text-gray-600" },
            $.of(`No user with ID ${id} exists.`),
          ),
          Link(
            { href: "/users", class: "text-blue-600 hover:underline" },
            $.of("Back to Users"),
          ),
        ),
      );
    }

    return yield* $.div(
      { class: "space-y-4" },
      collect(
        $.h1({ class: "text-3xl font-bold" }, $.of(user.name)),
        $.div(
          { class: "bg-white p-4 rounded shadow" },
          collect(
            $.p(
              {},
              collect(
                $.span({ class: "font-semibold" }, $.of("ID: ")),
                $.of(String(user.id)),
              ),
            ),
            $.p(
              {},
              collect(
                $.span({ class: "font-semibold" }, $.of("Email: ")),
                $.of(user.email),
              ),
            ),
          ),
        ),
        Link(
          { href: "/users", class: "text-blue-600 hover:underline" },
          $.of("Back to Users"),
        ),
      ),
    );
  });
