/**
 * Standalone type-inference check for the variadic element factory.
 * Verifies E/R channels union properly across mixed children.
 *
 * This file is compile-only — never executed.
 */

import { Context, Effect } from "effect";

import { $, type Element } from "../index.js";

class ServiceA extends Context.Tag("ServiceA")<
  ServiceA,
  { readonly a: number }
>() {}
class ServiceB extends Context.Tag("ServiceB")<
  ServiceB,
  { readonly b: number }
>() {}

class ErrA {
  readonly _tag = "ErrA";
}
class ErrB {
  readonly _tag = "ErrB";
}

// Two children whose Effect signatures carry distinct errors AND
// distinct service dependencies. No `as` casts — these are genuine
// service/error dependencies picked up through `yield*`.
const childA: Element.Element<HTMLSpanElement, ErrA, ServiceA> = Effect.gen(
  function* () {
    yield* ServiceA;
    if (Math.random() < 0) yield* Effect.fail(new ErrA());
    return yield* $.span({}, "a");
  },
);

const childB: Element.Element<HTMLParagraphElement, ErrB, ServiceB> =
  Effect.gen(function* () {
    yield* ServiceB;
    if (Math.random() < 0) yield* Effect.fail(new ErrB());
    return yield* $.p({}, "b");
  });

// Attrs + variadic children. E should be ErrA | ErrB, R should include
// ServiceA | ServiceB (plus Scope + RendererContext from Element).
const combined1 = $.div({ class: "x" }, childA, childB, "static");

// The point of this file: this assignment must typecheck.
// If E/R don't union across variadic slots, this fails.
const _proof: Element.Element<
  HTMLDivElement,
  ErrA | ErrB,
  ServiceA | ServiceB
> = combined1;

// Children only (no attrs).
const combined2 = $.div(childA, childB, "static");
const _proof2: Element.Element<
  HTMLDivElement,
  ErrA | ErrB,
  ServiceA | ServiceB
> = combined2;

// Nested array with mixed types — union must recurse through arrays.
const combined3 = $.div({}, [childA, [childB, "nested"]]);
const _proof3: Element.Element<
  HTMLDivElement,
  ErrA | ErrB,
  ServiceA | ServiceB
> = combined3;

// Mix of Elements, primitives, arrays, nullish.
const combined4 = $.div(
  { class: "y" },
  childA,
  null,
  false,
  undefined,
  "hello",
  42,
  [childB, "nested"],
);
const _proof4: Element.Element<
  HTMLDivElement,
  ErrA | ErrB,
  ServiceA | ServiceB
> = combined4;

// No children — E and R should be `never`.
const combinedEmpty = $.div();
const _proofEmpty: Element.Element<HTMLDivElement, never, never> =
  combinedEmpty;

void _proof;
void _proof2;
void _proof3;
void _proof4;
void _proofEmpty;
