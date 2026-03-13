import { $ } from "@effex/dom";
import { Router } from "@effex/router";

import { AboutRoute } from "./pages/About";
import { AdminRoute } from "./pages/Admin";
import { HomeRoute } from "./pages/Home";
import { LoginRoute } from "./pages/Login";
import { NotFoundPage } from "./pages/NotFound";
import { UserDetailRoute } from "./pages/UserDetail";
import { UsersRoute } from "./pages/Users";

// Simple page wrapper layout
const PageLayout = <A extends HTMLElement | SVGElement, E, R>(
  children: import("@effex/dom").Element.Element<A, E, R>,
) => $.div({ class: "p-6 bg-gray-50 rounded-lg shadow-sm" }, children);

// Router constructed from co-located route definitions
export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.concat(UsersRoute),
  Router.concat(UserDetailRoute),
  Router.concat(AdminRoute),
  Router.concat(LoginRoute),
  Router.layout(PageLayout),
  Router.fallback(() => NotFoundPage()),
);
