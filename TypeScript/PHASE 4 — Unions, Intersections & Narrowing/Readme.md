# PHASE 4 - Unions, Intersections & Narrowing

## Goal
Move past "JS with type annotations" and start thinking in TypeScript's actual type system: how union and intersection types compose shapes, how the compiler narrows a variable's type as your code runs through branches, and how to use discriminated unions plus exhaustiveness checking to make illegal states genuinely unrepresentable — and have the compiler prove it.

## Topics
1. **Union types (`|`) and intersection types (`&`)**
   - Unions as "one of these shapes"
   - Intersections as "all of these shapes, merged"
   - Why you can only access common members before narrowing
2. **Type guards: `typeof`, `instanceof`, `in`, custom type predicates (`is`)**
   - How the compiler narrows per-variable through control flow
   - Writing your own `is` predicate functions
   - Why a bad predicate compiles fine but lies at runtime
3. **Discriminated unions**
   - The "tag" property mechanism
   - Why this replaces classic OOP polymorphism for data modeling
4. **Exhaustiveness checking with `never`**
   - The "assign to `never`" trick, precisely
   - Why it's a real compile-time safety net, not a party trick

---

## 1) Union types (`|`) and intersection types (`&`)

### Concepts
- A **union type** (`A | B`) means a value could be an `A` **or** a `B` — you don't know which until runtime.
- An **intersection type** (`A & B`) means a value is an `A` **and** a `B` at the same time — it must satisfy both shapes simultaneously.
- Unions and intersections are set operations on the *space of allowed values/shapes*, not on properties directly — that framing is the key to reasoning about them correctly.

📖 **Plain-English definition**: A union type is like saying "the delivery will be a car or a bike, I don't know which yet" — you can only rely on what cars and bikes have in common until you check. An intersection type is like saying "this vehicle is both a car and amphibious" — it must have every feature of both, merged into one thing.

### Why it exists
- Real-world data is rarely one fixed shape: API responses, form values, and event payloads naturally vary (`string | number`, `SuccessResponse | ErrorResponse`).
- Without unions, you'd either over-widen to `any` (losing all safety) or write brittle overloaded APIs for every combination of shapes.
- Intersections let you compose small, focused types into a richer one (mixins, extending a base type with extra fields) without duplicating fields across interfaces.

### How TypeScript actually does this (behind the scenes) 🧠
A union type `A | B` is the **set union** of the values each member allows. If `A` is `{ id: string }` and `B` is `{ code: number }`, then `A | B` is "anything that's a valid `A`, or a valid `B`." Critically, the compiler will only let you access a member **without narrowing** if that member exists on *every* branch of the union (the intersection of their member sets, confusingly — the safe surface area of a union is the intersection of each member's properties). That's why `value.id` fails to compile on `A | B` above (`B` has no `id`) even though it would work fine if the runtime value happened to be an `A`. The compiler isn't being paranoid: it genuinely cannot know which branch you have without you proving it, so it only grants you the guaranteed-safe subset.

An intersection type `A & B` is the **set intersection** of values, but structurally that translates to the **union of members**: a value has to simultaneously be a valid `A` and a valid `B`, so it must carry every property from both. `{ id: string } & { code: number }` produces a shape with both `id` and `code` required. This is why intersections are used to *merge* object shapes (mixins, extending a base entity type with a feature-specific type), while unions are used to express *alternatives*.

The compiler tracks all of this through **control-flow analysis (CFA)**: at each point in your function, TypeScript maintains a computed type for every variable based on everything it has proven true up to that exact line — assignments, `if`/`else` branches, early `return`s, `typeof` checks, etc. This is why narrowing a union inside an `if` block only applies *within that block's lexical scope* (and along code paths that are provably still reachable from it): the compiler is literally re-deriving the type at each node of the control-flow graph, not mutating some global record of the variable's "real" type. Step outside the `if`, and the compiler reverts to whatever it can prove is true at that point in the graph — which, after the block ends, is usually the original wider union again (unless the `if` branch was the only way to reach the code that follows, e.g. via an early `return`).

```ts
interface CardPayment {
  id: string;
  cardLast4: string;
}

interface UpiPayment {
  id: string;
  upiHandle: string;
}

// Union: "one of these two shapes" - safe surface is only what's common (id).
type Payment = CardPayment | UpiPayment;

function describe(payment: Payment): string {
  // payment.cardLast4; // ❌ compile error: not every member of the union has this
  return `Payment ${payment.id}`; // ✅ id exists on both branches
}

// Intersection: "both of these shapes, merged" - every property from both is required.
interface Timestamped {
  createdAt: Date;
}

type AuditedCardPayment = CardPayment & Timestamped;

const payment: AuditedCardPayment = {
  id: 'pay_1',
  cardLast4: '4242',
  createdAt: new Date(), // required - it's an intersection, not optional add-on
};
```

### ✅ Best Practices
- Reach for a union when a value can genuinely be one of several distinct shapes (API result variants, config modes).
- Reach for an intersection to compose orthogonal concerns (a base entity type `&` a feature-specific type) rather than duplicating fields.
- Keep union members structurally distinguishable (a shared "tag" property — see topic 3) so narrowing is actually possible later.

### ❌ Avoid
- Intersecting two types with the *same* property name but incompatible types (e.g., `{ id: string } & { id: number }`) — the property collapses to `never`, silently making the type unusable, and the error only surfaces later, confusingly, wherever you try to assign to it.
- Reaching for `any` "because the value could be one of a few things" instead of writing the actual union — you lose all of the safety a union gives you for free.
- Deeply nested unions of unions without a shared discriminant — they become unreadable and unnarrowable in practice.

### 🎯 Interview insights
- Be ready to say, precisely: "union is OR, intersection is AND — but intersection ANDs the *shape requirements* together, so you get more required properties, not fewer."
- A very common trip-up question: "why can't I access this property on a union type?" — the answer is always "it's not present on every member, and the compiler can't assume which member you have."
- Mentioning control-flow analysis by name (not just "narrowing") signals you understand the mechanism, not just the syntax.

### 🔄 SDLC Angle
Choosing union vs. intersection is a **design-phase** modeling decision — it's where you decide whether two concepts are alternatives (union) or facets of the same thing (intersection). Getting it backwards doesn't cause a compile error immediately; it shows up later, during **implementation**, as awkward code that keeps needing type assertions to "fix" a shape the compiler correctly says isn't guaranteed — a strong signal to revisit the modeling choice rather than fight the compiler.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's the difference between `A | B` and `A & B`, and why can you access fewer properties on a union than you might expect?"
- **Strong answer:** "A union means the value is one of several shapes, so I only get compiler access to properties every member shares — anything else requires narrowing first. An intersection means the value must satisfy every constituent type simultaneously, so I get all of their properties merged into one required shape. The mental trap is expecting a union to behave like 'has properties from either side' — it doesn't, because the compiler can't know which side you actually have at that point."
- **Level-up:** Junior answers describe the syntax; senior answers explain *why* the compiler restricts member access on unions (it can't prove which branch you have) and can name the failure mode of intersecting conflicting property types collapsing to `never`.

---

## 2) Type guards: `typeof`, `instanceof`, `in`, custom type predicates (`is`)

### Concepts
- A **type guard** is any expression the compiler recognizes as proof that narrows a union to a smaller type within a branch.
- Built-in guards: `typeof x === 'string'`, `x instanceof SomeClass`, `'prop' in x`.
- A **custom type predicate** (`function isX(v: unknown): v is X`) lets you write your own narrowing logic and teach the compiler to trust it.

📖 **Plain-English definition**: A type guard is a runtime check (`typeof`, `instanceof`, `in`, or your own function) that TypeScript recognizes as *proof* — so that inside the branch where the check passed, it narrows the variable's type to only the possibilities consistent with that check having succeeded.

### Why it exists
- Union types are only useful if you can eventually find out *which* member you actually have, safely, at runtime — that's what a guard does.
- JavaScript already has these runtime checks (`typeof`, `instanceof`, `in`); TypeScript's contribution is recognizing them and updating its static type information to match, so you don't need a type assertion afterward.
- Real-world types (parsed JSON, API responses, `unknown` values) often need custom validation logic beyond what `typeof`/`instanceof` can express — custom predicates let that validation logic also drive narrowing.

### How TypeScript actually does this (behind the scenes) 🧠
The compiler tracks a **narrowed type per variable, per point in the control-flow graph** — the same mechanism from topic 1. Each recognized guard is a pattern the checker specifically knows how to interpret and fold into that graph:
- `typeof x === 'string'` narrows `x` to `string` in the "true" branch, and removes `string` from the union in the "false"/`else` branch.
- `x instanceof SomeClass` narrows to `SomeClass` (and any more specific subclasses) in the true branch, using the prototype chain, which is a **real runtime check** — it costs an actual instruction, unlike most of TypeScript's type system which vanishes at compile time.
- `'prop' in x` narrows to whichever union members declare a `prop` key, based on the *declared* shape of each member — this only works reliably for discriminating between object shapes, not for arbitrary runtime property presence.

A **custom type predicate** is a function whose *declared return type* is `v is X` instead of `boolean`. This is purely a signal to the type checker: the function's actual JavaScript body still just computes and returns `true`/`false` like any boolean function — nothing about its runtime behavior changes. What changes is that the compiler, seeing the `is` return type annotation, will now narrow the argument's static type to `X` in the branch where the predicate returned `true` (and, for a full union check, will narrow the `else` branch too, if the predicate's `X` is one member of that union). **This is the crucial and dangerous part: the compiler trusts the annotation, not the implementation.** It does not verify that the function's logic actually corresponds to `X` — that's on you. If the predicate's logic is wrong, the compiler will happily narrow to a type that doesn't match reality, and you get a runtime bug that the type system actively assured you couldn't happen.

Concrete unsound example — this compiles cleanly and is a real, subtle bug:
```ts
interface Cat { kind: 'cat'; meow(): void; }
interface Dog { kind: 'dog'; bark(): void; }

// ❌ WRONG predicate: always returns true, regardless of the actual value.
function isCat(pet: Cat | Dog): pet is Cat {
  return true; // bug: should check pet.kind === 'cat'
}

function handle(pet: Cat | Dog): void {
  if (isCat(pet)) {
    pet.meow(); // TS believes this is 100% safe - it is NOT.
  } else {
    pet.bark(); // unreachable per TS's (wrong) narrowing, but reachable in reality
  }
}

handle({ kind: 'dog', bark: () => console.log('woof') });
// Runtime: TypeError: pet.meow is not a function
// The compiler never ran this code and never checked the predicate's body
// against its claimed return type - "pet is Cat" is a promise, not a proof.
```
This is exactly why custom type predicates deserve extra scrutiny in code review: they are one of the few places in TypeScript where a function can be *type-correct* by the compiler's own rules and still be *unsound*, because the `is` annotation is a hint the checker takes on faith.

```ts
// A CORRECT custom type predicate - the logic actually matches the claim.
interface CardPayment { kind: 'card'; cardLast4: string; }
interface UpiPayment { kind: 'upi'; upiHandle: string; }
type Payment = CardPayment | UpiPayment;

function isCardPayment(payment: Payment): payment is CardPayment {
  return payment.kind === 'card'; // logic genuinely proves the claim
}

function receipt(payment: Payment): string {
  if (isCardPayment(payment)) {
    return `Card ending ${payment.cardLast4}`; // safely narrowed to CardPayment
  }
  return `UPI ${payment.upiHandle}`; // narrowed to UpiPayment by elimination
}
```

### ✅ Best Practices
- Prefer built-in guards (`typeof`, `instanceof`, `in`, or a discriminant check) whenever they're sufficient — they need no manual proof obligation.
- When you do write a custom predicate, make its check as literal and obviously-correct as possible (e.g., a single property comparison) — the harder it is to eyeball, the more dangerous a bug in it is.
- Add a unit test specifically for a custom predicate's true/false boundary, since the compiler will never catch a logic error in it.

### ❌ Avoid
- Writing a custom predicate that returns `true`/`false` based on unrelated or incomplete logic "to make the types work" — this is worse than not narrowing at all, because it actively suppresses the compiler's real warnings.
- Using `in` to narrow against properties that exist on the *runtime* object but aren't declared in the type (it narrows based on declared shape, not actual runtime keys).
- Assuming `instanceof` works across different realms/bundles (e.g., two copies of the same class from different bundled modules) — the prototype check can fail even for "the same" class.

### 🎯 Interview insights
- Be ready to explain that a type predicate is "compile-time-only trust" — nothing runtime-checks that the function's logic matches its declared `is` type.
- A strong signal in interviews: proactively mention that a wrong predicate is a *silent* bug (compiles fine, fails at runtime) rather than a type error — this is the single most misunderstood part of this topic.
- Know the practical difference between `in` (works on any object shape check) and `instanceof` (specifically checks the prototype chain, so only meaningful for class instances).

### 🔄 SDLC Angle
Built-in guards are largely an **implementation-phase** tool with little review risk — the compiler itself verifies they're used correctly. Custom type predicates are different: they're a **code-review** hotspot precisely because the compiler cannot verify their correctness, only their *declared shape*. A reviewer should treat any `x is Y` function the way they'd treat an unchecked type assertion — read the implementation line by line and ask "does this genuinely prove what it claims?" — because an unsound predicate that slips through review becomes a **production** bug that looks, from the type checker's perspective, exactly like correct code.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's a custom type predicate, and how could one cause a bug that the compiler doesn't catch?"
- **Strong answer:** "A type predicate is a function annotated to return `arg is SomeType` instead of `boolean` — it's purely a signal to the type checker that narrows the argument's type in the branch where it returns true. Under the hood it's a completely ordinary boolean function at runtime; TypeScript never verifies that its logic actually matches the claimed type. So if I write a predicate with buggy logic — say, one that always returns `true`, or checks the wrong property — the code still compiles cleanly, the compiler narrows to the wrong type with full confidence, and the mismatch only surfaces as a runtime error, like calling a method that doesn't exist on the actual object."
- **Level-up:** A junior answer describes the syntax (`x is Y`); a senior answer volunteers the unsoundness risk unprompted and treats custom predicates as a specific code-review concern, not just a convenience feature.

---

## 3) Discriminated unions

### Concepts
- A **discriminated union** is a union of object types that all share one common, literal-typed property (the **discriminant** or **tag**) with a *different* literal value per member.
- Checking the tag (usually via `switch` or `if`) lets the compiler narrow to the exact member type — no `instanceof`, no custom predicate needed.
- This is the idiomatic TypeScript replacement for "polymorphism via inheritance" or "switch on a type-name string" in classic OOP.

📖 **Plain-English definition**: A discriminated union is a set of related shapes that all carry a small "what kind of thing am I" label (like `kind: 'card'` vs `kind: 'upi'`), so that checking that one label tells you — and tells the compiler — everything else about the shape you're holding.

### Why it exists
- Modeling variant data (network request states, payment methods, form field types) as a plain union works, but without a shared tag, narrowing requires clunky custom guards for every member.
- A literal discriminant makes narrowing *automatic and cheap*: one `switch (x.kind)` gives you full type safety in every branch, with no extra functions to write or trust.
- It sidesteps classical OOP inheritance (a `PaymentMethod` base class with a `describe()` method overridden per subclass) in favor of plain data + a switch — which is easier to reason about, easier to serialize (JSON has no classes), and keeps behavior centralized instead of scattered across subclasses.

### How TypeScript actually does this (behind the scenes) 🧠
The mechanism is entirely built from what topics 1 and 2 already established — a discriminated union isn't a separate language feature, it's a *pattern* that makes control-flow narrowing maximally effective. Each member of the union declares the tag property with a distinct **literal type** (not just `string`, but the specific string `'card'` or `'upi'` as its own type). When you write `switch (payment.kind)` or `if (payment.kind === 'card')`, the compiler can perform **exhaustive structural elimination**: because it knows the *complete* set of literal values the tag can hold (it's a closed union), checking equality against one literal value logically proves — and lets the compiler prove — that every *other* possible member is excluded in that branch. This is stronger than a generic `in` or `instanceof` check because the compiler doesn't need any special-cased runtime-check pattern; it's just ordinary literal-type equality narrowing, extended across every member of the union simultaneously.

This is precisely why discriminated unions replace OOP polymorphism for data modeling: in an inheritance-based design, "what kind of payment is this and what do I do with it" is answered by dynamic dispatch (`payment.describe()`, overridden per subclass) — the logic is scattered across N subclass files, and adding a new operation means touching every subclass. In a discriminated union, "what kind of payment is this" is answered by the tag, and "what do I do with it" is a single `switch` statement colocated in one place — adding a new *operation* is one function; adding a new *variant* is where the tradeoff shows up (see topic 4), but the compiler actively helps with that case instead of silently letting you forget a subclass override.

```ts
type NetworkRequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function renderState<T>(state: NetworkRequestState<T>): string {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      // state is narrowed to { status: 'success'; data: T } here - .data is safe
      return `Loaded: ${JSON.stringify(state.data)}`;
    case 'error':
      // state is narrowed to { status: 'error'; message: string } here
      return `Error: ${state.message}`;
  }
}
```

### ✅ Best Practices
- Use a short, literal string (or enum) as the tag — `kind`, `type`, `status` are common, idiomatic names.
- Keep the tag as the *first* property by convention for readability, though it has no effect on narrowing.
- Colocate all the "what do I do per variant" logic in one `switch`/`if` chain rather than spreading it across classes — this is the whole point of the pattern.

### ❌ Avoid
- Using a non-literal type for the tag (`kind: string` instead of `kind: 'card'`) — this defeats narrowing entirely, since the compiler can't distinguish members by an unbounded `string`.
- Mixing a discriminant-based design with `instanceof` checks on the same hierarchy — pick one narrowing strategy per union to avoid confusing, inconsistent code.
- Letting a `switch` return early or use `if/else if` chains without a final `else`/`default` — you lose the exhaustiveness safety net covered next.

### 🎯 Interview insights
- Know this pattern by name and be ready to model a real example live (network request states, form field types, Redux-style actions) — it's one of the most commonly asked "show me you actually get TypeScript" questions.
- Be ready to contrast it explicitly with OOP inheritance/polymorphism — this contrast is what separates "I know the syntax" from "I understand why TypeScript code looks this way."
- Mention that this pattern is also how Redux-style action types and many state machines are modeled in real production TypeScript codebases.

### 🔄 SDLC Angle
Choosing a discriminated union to model a domain concept (payment methods, request states, form field variants) is a **design-phase** decision, and it's one that pays for itself disproportionately at **maintenance** time: months later, when someone adds a new variant, the compiler (via exhaustiveness checking, next topic) forces every switch statement across the codebase that handles this union to be updated, rather than silently leaving old code that "forgot" the new case. That property — new states are caught everywhere, automatically — is exactly the kind of thing that's cheap to set up early and extremely expensive to retrofit onto an already-sprawling OOP hierarchy or a loosely-typed `{ type: string, ...rest: any }` shape.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Model a network request's state — idle, loading, success with data, or error with a message — using TypeScript's type system, and write a function that renders each state."
- **Strong answer:** "I'd use a discriminated union with a literal `status` tag: `{ status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; message: string }`. Then a `switch` on `state.status` lets the compiler narrow to the exact shape in each case — `state.data` is only accessible in the `'success'` branch, `state.message` only in `'error'` — with zero casts or custom guards needed. I'd also assign the default case to a `never`-typed variable so that if a new state gets added later, every switch handling this type fails to compile until it's updated."
- **Level-up:** A junior answer produces a working union; a senior answer proactively adds the exhaustiveness check and explains *why* it matters for long-term maintenance — that's the detail that signals real production experience, not just textbook knowledge.

---

## 4) Exhaustiveness checking with `never`

### Concepts
- `never` is the type of a value that *cannot occur* — a function that always throws, an infinite loop, or (crucially here) a variable that, after all real cases are excluded, has no possible values left.
- The **exhaustiveness check** pattern: in the `default` (or final `else`) branch of a switch/if-chain over a discriminated union, assign the remaining value to a variable typed `never`.
- If every union member was truly handled above, the compiler agrees the leftover type is `never` and the assignment compiles. If a new member was added and *not* handled, the leftover type is that unhandled member — not `never` — and the assignment fails to compile.

📖 **Plain-English definition**: The `never`-assignment trick is a tripwire you leave in your code: it only stays silent as long as every possible case has genuinely been handled above it, and the instant someone adds a new case without updating this switch, the tripwire goes off as a compile error, pointing exactly at the code that needs updating.

### Why it exists
- Discriminated unions are often extended over a codebase's life (a new payment method, a new request status) — the risk is always "did I update *every* place that switches on this type?"
- Without this check, a forgotten `case` typically falls through to a `default` that either does nothing, throws unhelpfully at runtime, or silently returns `undefined` — a bug that surfaces in production, not in review.
- With this check, the *exact same mistake* becomes a compiler error at build time, at every call site that needs updating — turning a runtime hunt into a compile-time to-do list.

### How TypeScript actually does this (behind the scenes) 🧠
This works purely from the narrowing mechanics already covered — there's no special "exhaustiveness" language feature, just a clever use of ordinary type checking. Walk through it precisely:

1. You have a discriminated union, say `Shape = Circle | Square | Triangle`, each with a distinct literal `kind`.
2. In a `switch (shape.kind)`, each `case` narrows `shape` down by eliminating that literal from the remaining possibilities (this is the same literal-narrowing from topic 3, applied cumulatively down the switch).
3. By the time control reaches the `default` branch, the compiler has narrowed `shape`'s type to whatever is *left over* after eliminating every literal handled by a preceding `case`. If `Circle`, `Square`, and `Triangle` were all handled, there is nothing left — the leftover type is literally `never`, the empty set.
4. You write `const _exhaustive: never = shape;` in the `default` branch. Assigning a value to a `never`-typed variable is only allowed if the value being assigned is *itself* typed `never` (since `never` is a subtype of every type, but *only* `never` is assignable *to* `never`). Since the compiler computed `shape`'s narrowed type as `never` in step 3, this assignment type-checks cleanly.
5. Now suppose, months later, someone adds a `Rectangle` member to the `Shape` union but forgets to add a `case 'rectangle'` here. Redo step 3: after eliminating `Circle | Square | Triangle` via the existing cases, the leftover type is now `Rectangle` — not `never`. Step 4's assignment, `const _exhaustive: never = shape`, now tries to assign a `Rectangle` to a `never`-typed variable, which is not allowed (only `never` itself is assignable to `never`) — **and the build fails**, with the compiler pointing at this exact line, in this exact switch, as the place that needs updating.

This is why it's a genuinely valuable engineering technique and not a trick for its own sake: it converts "a human has to remember to grep for every switch over this type and update them all" into "the compiler will refuse to build until every switch over this type is updated" — a guarantee, not a hope.

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default: {
      // If Shape ever gains a new member (e.g. 'rectangle') without a case above,
      // `shape` here is narrowed to that leftover member, NOT never - and this
      // line fails to compile, pointing straight at the switch that needs an update.
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

// Helper version, reusable across many switches in a codebase:
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
// usage: default: return assertNever(shape);
```

### ✅ Best Practices
- Add the exhaustiveness check to every switch over a "closed" domain union (states, variants, action types) as a matter of course — it costs three lines and prevents a whole bug class.
- Use a shared `assertNever(value: never): never` helper across the codebase instead of repeating the pattern inline, so the intent is instantly recognizable to reviewers.
- Enable `noImplicitReturns` / `strict` mode so the compiler also flags a switch that's missing a `return` in some branch, complementing this pattern.

### ❌ Avoid
- Adding a "catch-all" `default` that just does something generic (logs and continues, returns a fallback value) *without* the `never` assignment — this silently defeats the entire safety net by giving every unhandled case somewhere harmless-looking to fall into.
- Using `if/else if` chains without a final `else` doing the same `never` check — the pattern works identically there, it's just easy to forget outside of `switch`.
- Believing this is only useful for "big enterprise codebases" — it pays off the very first time a teammate (or future you) adds a variant and forgets one call site.

### 🎯 Interview insights
- Be ready to explain the mechanism precisely, not just recite "assign to never in the default case" — interviewers probing for depth will ask *why* that assignment fails when a case is missing, and "only `never` is assignable to `never`" is the exact answer.
- This is a favorite "have you actually used TypeScript in anger" signal — most JS-to-TS learners never encounter it because tutorials rarely go this deep.
- Good follow-up point: this technique composes with discriminated unions specifically because the tag is a closed set of literals — it doesn't work the same way on an open-ended type like `string`.

### 🔄 SDLC Angle
This is squarely a **design-and-implementation-phase** investment (a few lines, added once, when the union and its first switch are written) that pays its dividend at **maintenance** time — specifically the moment a new business requirement adds a new variant to an existing domain concept. Instead of a **code-review** or **production** surprise ("we shipped a new payment method but forgot to handle it in the receipt renderer"), the build itself refuses to pass until every affected switch is updated, which converts a class of subtle logic bug into an impossible-to-miss compile error, visible to the very engineer making the change, at the moment they make it.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "You have a switch statement handling every case of a union type today. Six months from now, someone adds a new member to that union but forgets to update this switch. How do you make sure that's caught automatically?"
- **Strong answer:** "I'd add an exhaustiveness check in the default branch: assign the value being switched on to a variable explicitly typed `never`. Today, since every real case is handled above, the compiler narrows the leftover type in the default branch down to `never`, so the assignment is valid. The moment a new union member is added without a matching case, the leftover type in that default branch becomes that new member instead of `never`, and assigning it to a `never`-typed variable fails to compile — so the build breaks exactly where the missing case needs to be added, instead of shipping a silent bug."
- **Level-up:** A junior answer might reach for a runtime `default: console.warn('unhandled')`, which only surfaces the problem after it ships; a senior answer reaches for the compile-time `never` check specifically because it converts a runtime risk into a build-time guarantee, and can explain the assignability rule (`never` is only assignable to `never`) that makes it work.

---

## Hands-on (Do This)
- Model a `NetworkRequestState<T>` discriminated union (`idle | loading | success | error`) and write a `render()` function over it with a full exhaustiveness check in the default branch.
- Write one **correct** and one **deliberately broken** custom type predicate (like the `isCat`/`isDog` example above), and prove to yourself in a scratch file that the broken one still compiles.
- Take an existing union type in your own code (or the example above) and add a new variant — confirm the compiler now points you at every switch that needs updating.

## Exit Criteria
- You can explain, without hedging, why a union only exposes members common to every branch, and why an intersection requires all properties from every constituent.
- You can write a correct custom type predicate and explain exactly why an incorrect one still compiles.
- You default to discriminated unions for variant data, and you never write a switch over a closed union without an exhaustiveness check.

## Next
- Continue to `../PHASE 5 — Generics/Readme.md`
