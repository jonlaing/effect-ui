# Contributing to Stax

Stax is an open-source framework, and it's better with more people
working on it. Contributions are welcome from anyone, whatever your
experience level, background, or identity. If you've never contributed
to an open-source project before, this is a fine place to start. If
you've been shipping frameworks for a decade, that experience is welcome
too.

## Communication

Talk to each other with respect and professionalism. Assume good faith.
Disagree about code, not people.

If someone's behavior makes contributing feel unsafe or unwelcoming,
email [jon@jonlaing.dev][contact]. Those go to me directly and I read
them.

## How to contribute

**Bug reports** live in [GitHub Issues][issues]. Include:

- What you expected to happen.
- What actually happened.
- The smallest reproduction you can put together. A failing test is
  ideal, a code snippet is fine, a link to a repro repo is fine.
- Your Stax version and environment (Node, browser, etc.).

**Feature proposals** also live in issues. Lead with the motivation —
what problem are you trying to solve? — before the proposed API. The
discussion often reshapes the solution before any code gets written,
which saves you time.

**Pull requests** follow the standard fork → branch → PR flow:

- Small, self-contained changes can go straight to a PR.
- Larger changes should start with an issue so we can agree on the shape
  before you invest the time.
- Bug fixes should include a regression test that fails on `main` and
  passes with your change.
- New features should ship with tests and documentation for any public
  API.

For the PR itself:

- Tests pass (`pnpm test`).
- Typecheck clean (`pnpm typecheck`).
- Changeset attached if the change touches a published package
  (`pnpm changeset`).

## Coding standards

Contributions should meet the same bar the rest of the codebase does:

- **Tests are required.** Bug fixes ship with a regression test that
  fails on `main` and passes with the change. New features ship with
  tests covering the public surface. Coverage numbers aren't the goal
  — the goal is that behavior is captured in code that fails loudly
  when it changes.

- **TSDoc on the public API.** Anything exported for consumers to use
  (functions, types, classes, constants) needs a TSDoc block that
  explains the contract, not the mechanics. `@example` blocks are
  encouraged for combinators and factories.

- **Effect-native, not Effect-adjacent.** Every effectful operation is
  an `Effect`. Errors go in the error channel, not thrown. Dependencies
  come from the context (`R`), not from module-level singletons. If
  Effect already models the paradigm you need — schedules, streams,
  layers, fibers, resource management — reach for that first before
  writing a helper.

- **Combinators over kitchen-sink APIs.** Prefer small composable
  pieces that pipe together over one function with fifteen optional
  parameters or a large config object. Helpers are fine when they
  materially improve DX, not when they duplicate what Effect already
  offers.

- **Type honesty.** `Element<A, E, R>` and any `Effect`'s error and
  requirement channels must reflect reality. No `as any`, no casting
  `unknown` down to `never`, no hiding a service dependency to keep a
  signature clean. What typechecks is what runs, and that only holds
  if the types tell the truth.

- **SSR-safe by default.** Code that ships from any package has to
  work when rendered on the server. No top-level `window`, `document`,
  or `localStorage` references. Browser-only work belongs inside an
  event handler, an `Effect.sync` guarded by context, or a client-only
  entrypoint.

- **Names follow the ecosystem.** `Foo.make`, `Foo.map`, `Foo.get` —
  matches Effect's own module style, so anyone comfortable with Effect
  knows what to reach for. PascalCase for components (`Sidebar.ts`),
  camelCase for module utilities (`content.ts`), kebab-case for
  content (`quick-start.md`).

- **Comments explain _why_, not _what_.** Identifiers describe what
  the code does. Comments earn their place when they explain a hidden
  constraint, invariant, or workaround — anything a future reader
  wouldn't figure out from the code itself. TSDoc on the public API
  is a separate concern (that's contract).

- **Deprecate, don't delete.** Public API changes go through a
  deprecation cycle: mark the old thing `@deprecated` in TSDoc with a
  pointer to the new thing, ship one release with both, remove in the
  next major. A rename that skips the deprecation step breaks
  downstream consumers with no runway.

- **No `console.*` in library code.** Use Effect's `Console` or the
  framework's `logDebug` / `logError` helpers. `console.log` bypasses
  log-level configuration, doesn't participate in Effect's logging
  stream, and can't be filtered by consumers.

## On AI-assisted code

You can use AI tools when contributing to Stax. You don't need to
disclose it.

What matters is the output: **the human submitting the code is
responsible for it**. That means:

- You can explain every line: what it does, why it exists, and what
  happens if you remove it.
- The code meets the same production-quality bar as the rest of the
  codebase — correct, readable, maintainable, and consistent with the
  surrounding style.
- Tests exist to prove it works, and they were written with the same
  care as the implementation.

This is the same bar we hold hand-written code to. AI doesn't change it,
doesn't lower it, and doesn't provide cover when it's not met.

## Licensing

Stax is licensed under [Mozilla Public License 2.0](./LICENSE).

Contributions follow the standard inbound = outbound model: **by
submitting a pull request, you agree that your contribution is licensed
under MPL 2.0**. You keep your copyright — no CLA, no assignment. Your
contribution becomes part of the project under the same terms as
everything else.

This is deliberate. Any future relicensing would require every
contributor's permission, which makes closing the source effectively
impossible once the project has more than one author. That's the
guarantee Stax stays open.

[contact]: mailto:jon@jonlaing.dev?subject=%5Bstax%5D%3A%20Community%20concern
[issues]: https://github.com/stax-ui/stax/issues
