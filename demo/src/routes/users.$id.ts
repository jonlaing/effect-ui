import { Effect, Schema } from "effect";
import { $, component, Link, Route } from "@effex/platform";

// User type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Mock user data
const users: Record<string, User> = {
  "1": {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
  },
  "2": {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Developer",
  },
  "3": {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    role: "Designer",
  },
};

export const route = Route.define({
  params: Schema.Struct({
    id: Schema.String,
  }),
  loader: (p: { readonly id: string }) =>
    Effect.gen(function* () {
      console.log("Running loader for user", p.id);
      yield* Effect.sleep(100);
      const user = users[p.id];
      if (!user) {
        return yield* Effect.fail(new Error(`User ${p.id} not found`));
      }
      return user;
    }),
});

// Page component
const UserPage = component("UserPage", () =>
  Effect.gen(function* () {
    const user = yield* route.loaderData() as Effect.Effect<User>;

    return yield* $.div({ class: "page" }, [
      $.h1({}, [`User: ${user.name}`]),
      $.div({ class: "card" }, [
        $.p({}, [`Email: ${user.email}`]),
        $.p({}, [`Role: ${user.role}`]),
      ]),
      $.div({ class: "card" }, [
        $.p({}, [Link({ href: "/" }, "Back to Home")]),
        $.p({}, [
          Link({ href: `/users/${parseInt(user.id) + 1}` }, "Next User"),
        ]),
      ]),
    ]);
  }),
);

export default UserPage;
