import { Route, Router } from "@stax-ui/router";

import { AboutPage } from "./pages/AboutPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

const HomeRoute = Route.make("/").pipe(Route.render(() => HomePage()));

const AboutRoute = Route.make("/about").pipe(Route.render(() => AboutPage()));

export const router = Router.empty.pipe(
  Router.concat(HomeRoute),
  Router.concat(AboutRoute),
  Router.fallback(() => NotFoundPage()),
);
