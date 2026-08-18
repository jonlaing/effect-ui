---
title: "Introduction"
description: "Welcome to Stax! This introduction gives an overview of what Stax is and how it works."
order: 0
---

# Introduction

<span class="text-sm">Not a big reader? Fast-forward to the [TL;DR](#tl-dr)</span>

## What is Stax?

### The frontend for Effect.ts

Stax is a reactive UI library ecosystem built on top of [Effect.ts](https://effect.website). 
If you're a fan of Effect for the backend, you'll love Stax for the frontend. It boasts
poweful features like type safety, composability, and a functional programming style that
lets you write clean, maintainable, robust code. It's intended to catch mistakes at
compile time, rather than having runtime surprises.

### Composability and Primitives

Stax is built using simple, but powerful primitives, and then composes to enable emergent
functionality that would be a spaghetti mess otherwise. This follow the philosophy that makes
Effect so powerful and flexible. Under the hood, most of Stax primitives are themselves Effects,
so Stax seamlessly integrates with Effect. In fact, our
[meta-framework](https://github.com/stax-ui/stax/tree/main/packages/platform) is just a
thin layer to convert the Stax [router](https://github.com/stax-ui/stax/tree/main/packages/router)
into an Effect [HttpRouter](https://effect-ts.github.io/effect/platform/HttpRouter.ts.html).
Stax isn't intended to reinvent the wheel, but to stand on the shoulders of giants.

### Designed to be Used Anywhere

Additionally, most of Stax is environment agnostic. Currently, we're only targeting the web
([`@stax-ui/dom`](https://github.com/stax-ui/stax/tree/main/packages/dom) and
[`@stax-ui/platform`](https://github.com/stax-ui/stax/tree/main/packages/platform)), but
the rest of the library is designed to be used in any JavaScript environment. In the future,
we hope to support other environments like mobile and desktop, and even non-UI environments
like rich CLI tools.

## What Stax is *Not*

### The React Killer

Stax is not an indictment on any other frontend library or framework. It wasn't made
out of frustration or thinking we could do it better than anyone else. Stax was written
as a love letter to [Effect.ts](https://effect.website) and out of a deep desire to be
able to write Effectful code for the frontend. There are others making great libraries
that integrate with other existing frontend frameworks, like
[Lucas Barake](https://github.com/lucas-barake), but we wanted the full power of Effect
all the way through the application. So we had to build our own from the ground up. 

### The Best Choice for Every Project

Additionally, Stax is admittedly *not* the best choice for every project. It has very
strict type safety and a functional programming style that may not be everyone's cup of tea.
The strictness may also make it cumbersome for quick prototypes or small projects.
Also, since it's build on top of Effect, some may find the learning curve to be steeper
than other libraries. Stax shines when correctness and maintainability are top priorities,
when it's worth investing in the learning curve, and when you want to leverage the full power
of Effect. Stax is meant for production-grade applications where robustness and maintainability
are key.

## Core Concepts

### Reactivity

Stax does not have a virtual DOM like React. Instead, it uses a fine-grained reactivity
system built on top of Effect's [`SubscriptionRef`](https://effect-ts.github.io/effect/SubscriptionRef.ts.html)
to track dependencies and update the DOM via [`Stream`](https://effect-ts.github.io/effect/Stream.ts.html) updates.
This allows for surgical updates to the DOM, rather than re-rendering entire components.

### Type Safety

Stax is designed to catch mistakes at compile time. It leverages TypeScript's type system to ensure
that your code is correct and that you won't run into unexpected runtime errors. For instance, every
element in an Stax app has the type `Element.Element<A, E, R>`, which encodes the type of the
element (usually HTMLElement) in the `A` channel, the errors it may produce in the `E` channel, and
the dependencies it requires in the `R` channel. Your components describe themselves in their type
signature, and the compiler checks that you use them correctly.

## How Stax Was Built

### AI for Speed, Humans for Quality

Stax was first conceived in late 2025; as such, LLMs played a large role in its creation.
It started as just a conversation with an AI to explore whether the idea would even work.
From there, a proof-of-concept was built almost entirely vibe-coded. But that's all it was:
a proof-of-concept. After the idea was validated, then came the real work of building a
production-ready library. Each package was entirely rewritten. In fact, with the addition of
strong human oversight, 2/3rds of the code was deleted without sacrificing functionality.
AI was still used, but it was working off of detailed human-authored design docs
and specifications. We kept the robot on a tight leash!

<a id="tl-dr"></a>
## TL;DR

- Stax is a reactive UI library ecosystem built on top of Effect.ts
- It offers powerful features like type safety, composability, and a functional programming style
- Stax is designed to catch mistakes at compile time, rather than having runtime surprises
- Stax is built using simple, but powerful primitives, and then composes to enable emergent functionality
- Stax is environment agnostic, currently targeting the web but designed to be used in any JavaScript environment
- Stax is not an indictment on any other frontend library or framework, but was built out of a desire to write Effectful code for the frontend
- Stax may not be the best choice for every project, but shines when correctness and maintainability are top priorities
