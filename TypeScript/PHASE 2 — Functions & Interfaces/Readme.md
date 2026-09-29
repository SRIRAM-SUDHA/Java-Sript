# PHASE 2 - Functions & Interfaces

## Goal
Move past "how do I add a type annotation" and into "how does the type checker actually reason about functions and object shapes." This phase covers the mechanics of function contracts (parameters, overloads), the two competing ways TypeScript lets you name a shape (`interface` vs `type`), how optionality/immutability are expressed and enforced (or not enforced), and the single biggest mental shift for anyone coming from a nominally-typed language: TypeScript doesn't care what you call your type, it cares what shape it has.

> 🧭 Constraint reminder: modern, stable TypeScript (5.x-era). No decorators here yet (that's Phase 8) — this phase is pure function/object type-system mechanics.

## Topics
1. **Function type signatures, optional/default/rest parameters, overloads**
   - Annotating parameters and return types
   - `?`, `= default`, `...rest`
   - Function overload signatures vs the implementation signature
2. **`interface` vs `type` alias (the recurring interview question)**
   - Declaration merging vs single binding
   - What each one can express that the other can't
3. **Optional (`?`) and `readonly` properties**
   - Compile-time-only enforcement
   - How they interact with utility types (`Partial`, `Readonly`)
4. **Structural compatibility ("duck typing" with a compiler)**
   - Structural vs nominal typing
   - Excess property checks
   - Where TypeScript quietly becomes semi-nominal (private/protected members)

---

## 1) Function Type Signatures, Optional/Default/Rest Parameters, Overloads

### Concepts
- A function's **type signature** is its contract: parameter types (in order), which ones are optional, and the return type.
- `param?: T` — optional parameter, must come after all required parameters.
- `param: T = value` — default parameter; also implicitly optional at the call site.
- `...rest: T[]` — rest parameter, collects any remaining arguments into an array.
- **Overloads** — declaring multiple valid call signatures for one function, followed by a single implementation.

📖 **Plain-English definition**: A function's type signature is the "order form" for calling it — it tells you exactly what you must hand over, what you may leave out, and what you'll get back, and the compiler refuses to place an order that doesn't match the form.

### Why it exists
- ✅ Catches wrong argument count/type at the call site, before the code ever runs.
- ✅ Documents the API in a way editors can surface as autocomplete/hover info.
- ✅ Overloads let a single function name return *different, more specific* types depending on *which* inputs were passed — something a single union-typed signature often can't express precisely.

### How TypeScript actually does this (behind the scenes) 🧠
- **Optional parameters** are internally treated as `T | undefined` *plus* a marker on the parameter symbol saying "may be omitted at the call site." That's two separate facts: whether the value can be `undefined`, and whether the *argument itself* can be left out entirely. Optional parameters must come after required ones because the compiler matches positional arguments left-to-right — an optional gap in the middle would make position ambiguous.
- **Default parameters** get their type inferred from the default value if you don't annotate one (`greeting = 'hello'` infers `string`). At the call site, TypeScript treats the parameter as optional (you can omit it), but *inside* the function body it's typed as if it's always present — TS knows the default has already filled the gap by the time your code runs. The default expression itself survives untouched in the compiled JS; TypeScript doesn't need to do anything clever at runtime here because JS has natively supported default parameters since ES2015.
- **Rest parameters** compile to an ordinary JS rest parameter (`...args`) with no special runtime behavior — the interesting part is purely on the type side, where modern TypeScript can type rest parameters as **tuple types** (`[first: string, ...rest: number[]]`) to enforce not just "an array of numbers" but "exactly this shape of trailing arguments," which lets you overload-like differentiate call shapes without writing actual overloads.
- **Overloads are the sharpest point here, and the one people get wrong in interviews**: when you write several "overload signatures" followed by one "implementation signature," only the **implementation signature physically exists at runtime** — it compiles to the one and only JS function. The overload signatures above it are erased entirely; they are pure compile-time metadata the checker uses to validate call sites. Concretely:
  1. When you *call* the function, TypeScript walks the overload signatures **top to bottom** and picks the **first one whose parameter types match** your arguments — it does not pick the "best" or "most specific" match, just the first match, which is why overload order matters.
  2. When you *implement* the function body, you're writing against the implementation signature only — which is deliberately never shown to callers (TypeScript hides it from IntelliSense/autocomplete; callers only ever see the overload list). The implementation signature must be general enough (usually a union of all the overload parameter/return types) to satisfy every overload, which is why the body often needs its own narrowing (e.g. `typeof input === 'string'`) even though the *caller* never sees that union type.

```ts
// Overload signatures (compile-time only — erased from emitted JS)
function parseInput(value: string): string[];
function parseInput(value: number): number[];
function parseInput(value: string | number): string[] | number[];

// Implementation signature (this is the ONLY function that exists at runtime)
function parseInput(value: string | number): string[] | number[] {
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim());
  }
  return [value, value * 2, value * 3];
}

const words = parseInput('alpha, beta, gamma'); // string[] — matched overload #1
const nums = parseInput(10);                    // number[] — matched overload #2
```

Compiled JS (illustrative — this is genuinely all that ships):
```js
function parseInput(value) {
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim());
  }
  return [value, value * 2, value * 3];
}
```
Notice there is exactly **one** function in the output. The three-signature "menu" that gave callers precise return types never had a runtime counterpart — it was scaffolding for the type checker, torn down at compile time.

### ✅ Best Practices
- Order overloads from **most specific to least specific** — the first match wins, so a broad signature placed first will silently swallow calls meant for a narrower one.
- Keep the implementation signature as a private detail — design the overload list as the *actual* public API and let the implementation just be "wide enough to compile."
- Prefer a single function with a **union parameter type** over overloads whenever the *behavior* doesn't change per input type — reach for overloads specifically when the *return type* needs to vary precisely by input type (that's the one thing a plain union signature can't express as precisely).

### ❌ Avoid
- Writing overloads when a union type return would already be acceptable — it adds ceremony for no type-safety gain.
- Forgetting that the implementation signature is not callable from outside — trying to call the function with arguments that only match the implementation signature (but no declared overload) is a compile error.
- Putting a broad/catch-all overload before narrower ones (it will shadow them).

### 🎯 Interview insights
- "What actually exists at runtime when you use function overloads?" is a genuine trick question — many candidates assume each overload is a separate function. The correct answer: only the implementation exists; overloads are erased.
- Be ready to explain *why* overload order matters (first-match-wins, not best-match).
- Mentioning tuple-typed rest parameters as a modern alternative to overloading on argument *count* is a strong senior signal.

### 🔄 SDLC Angle
Function signatures are effectively an API contract, so decisions here belong to the **design/API-design phase** — once a library or shared utility ships with a given signature, changing parameter order or required/optional status is a breaking change that ripples through every caller, making it a **versioning/maintenance** concern, not just a syntax choice. Overload design specifically tends to surface at **code review**, where a reviewer needs to catch a badly-ordered overload list before it ships and silently misroutes calls.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "You wrote three overload signatures for a function — how many functions actually exist once this compiles to JavaScript, and how does TypeScript decide which overload a given call matches?"
- **Strong answer:** Only one function exists at runtime — the implementation signature; the overload signatures above it are compile-time-only and are erased entirely during transpilation. At each call site, the checker scans the declared overloads top-to-bottom and uses the first one whose parameters match the arguments, so overload order is meaningful, not just documentation.
- **Level-up:** A junior answer says "overloads let a function take different argument types"; a senior answer explains the erasure mechanics, the first-match-wins resolution order, and knows when a union parameter type is the simpler, equally correct alternative.

---

## 2) `interface` vs `type` Alias (the Recurring Interview Question)

### Concepts
- Both `interface` and `type` can describe the shape of an object, and for that purpose the checker treats them identically.
- `interface` supports **declaration merging** — multiple `interface Foo {}` blocks with the same name in the same scope combine into one.
- `type` binds a name **once** — redeclaring it in the same scope is a compile error.
- `type` can alias things an `interface` fundamentally cannot: unions, tuples, primitives, mapped types, conditional types.

📖 **Plain-English definition**: An `interface` is a shape you can re-open and add more requirements to later (like an editable form that anyone can staple extra pages onto); a `type` alias is a name you assign to *any* type expression exactly once, and it's the more general, more flexible tool of the two — but it doesn't accept those staple-on extra pages.

### Why it exists
- ✅ TypeScript needed a way to describe object/class shapes that felt natural to OOP-style code and to ambient `.d.ts` library declarations — that's `interface`, inherited in spirit from earlier structural-typing languages.
- ✅ TypeScript separately needed a general "name any type expression" mechanism — unions, tuples, function types, mapped/conditional types — none of which fit naturally into an OOP-style shape declaration. That's `type`.
- ✅ Declaration merging on interfaces specifically exists so that **library authors and consumers can augment ambient types** without forking the library — e.g., adding a custom property to Express's `Request` type or augmenting the global `Window`.

### How TypeScript actually does this (behind the scenes) 🧠
- **Declaration merging is real and mechanical, not a metaphor.** When the checker encounters two `interface Foo { ... }` declarations with the same name in the same scope, it doesn't pick one or error — it merges their member lists into a single combined type before any code that uses `Foo` is checked. This is exactly the mechanism that makes "augmenting a global type from a `.d.ts` file" work.
- **Type aliases don't merge — they conflict.** `type Foo = { a: string }` followed by `type Foo = { b: number }` in the same scope is a **duplicate identifier** compile error. There's no merge step for aliases; the name is bound once.
- **For object shapes, both produce the same internal representation.** When the checker builds its internal structural type for `interface X { a: string }` and for `type Y = { a: string }`, both become the same kind of "object type" with the same member list — assignability, excess-property checks, and structural comparisons treat them identically. This is why "which one is faster" or "which one is more type-safe" for plain object shapes is a myth — they're mechanically the same thing here.
- **`type` can express things `interface` structurally cannot**, because an interface is always ultimately an object-shape (or a callable/constructable shape) — it can't itself *be* a union, a tuple, or a mapped type:
  ```ts
  type Status = 'idle' | 'loading' | 'success' | 'error'; // union — no interface equivalent
  type Point = [x: number, y: number];                     // tuple — no interface equivalent
  type Nullable<T> = T | null;                              // generic alias over any type
  type ReadonlyKeys<T> = { readonly [K in keyof T]: T[K] }; // mapped type — no interface equivalent
  ```
- **`extends` (interfaces) vs `&` (intersections) handle conflicts differently.** `interface B extends A` is checked *incrementally* — if `B` redeclares a member from `A` with an incompatible type, TypeScript flags it immediately as an interface-extension error. A `type C = A & B` intersection instead tries to combine both members structurally; if the property types are incompatible primitives, the intersected property type quietly collapses to `never` rather than raising an "extension" error at the declaration site — the failure only surfaces later, confusingly, when you try to actually assign a value to that property.

Declaration merging, proven:
```ts
// file: window-augmentation.ts (or the same file — merging works either way)
interface FeatureFlags {
  betaCheckout: boolean;
}

// ...later, possibly in a different file entirely...
interface FeatureFlags {
  newSearch: boolean;
}

// The checker merges both blocks into ONE type with both properties:
const flags: FeatureFlags = {
  betaCheckout: true,
  newSearch: false,
}; // ✅ compiles — both properties are required because both interface blocks merged
```

A `type` alias attempting the same thing fails immediately:
```ts
type FeatureFlags = { betaCheckout: boolean };
// type FeatureFlags = { newSearch: boolean };
// ❌ Compile error: "Duplicate identifier 'FeatureFlags'."
```

### ✅ Best Practices
- Default to `interface` for public object shapes meant to be **extended by consumers** (library public APIs, class contracts) — merging is a feature there, not a risk.
- Default to `type` for unions, tuples, function types, and anything built with mapped/conditional types.
- Whatever the team picks for "plain object DTOs," write it down as a **convention** and stay consistent — the mechanical difference for plain shapes is small, but an inconsistent codebase is a real cost.

### ❌ Avoid
- Relying on declaration merging *by accident* — an interface named the same thing as one elsewhere in scope will silently combine, which can hide real bugs (a typo that should have been a "new" type instead quietly merges into an existing one).
- Reaching for `&` intersections expecting them to behave like `extends` conflict-checking — a bad intersection can produce a `never` property type that only fails later, far from the actual mistake.
- Treating this as a purely stylistic, no-stakes choice in interviews — the interviewer is checking whether you know the *mechanical* differences, not just a preference.

### 🎯 Interview insights
- This is one of the single most common TypeScript interview questions — answer with the mechanical differences (merging, union/mapped-type support), not "they're basically the same, I just like `type` better."
- Bonus point: mention that both are structurally identical for plain object shapes — that nuance (knowing where they're the *same*, not just where they differ) is what separates a memorized answer from real understanding.

### 🔄 SDLC Angle
This is a **design-time / code-review-time team-convention decision** more than a runtime-behavior decision — once a codebase picks a default (interface-for-shapes vs type-for-everything, or type-everywhere), it rarely gets revisited, because the cost of "fixing" it later is a large, low-value, project-wide rename with no functional benefit. Where it *does* bite in practice is at **library-boundary design time**: choosing `interface` for anything you expect consumers to augment (or intentionally choosing `type` specifically to *prevent* unwanted external augmentation) is a real architectural decision, not a style nit.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's the difference between `interface` and `type`, and when would you use one over the other?"
- **Strong answer:** For describing a plain object shape, they're structurally identical to the checker — assignability and excess-property checks behave the same way either way. The real differences are mechanical: interfaces support declaration merging (multiple blocks with the same name combine, which is how ambient library augmentation works), while type aliases bind once and error on redeclaration; and type aliases can express things interfaces structurally can't, like unions, tuples, and mapped/conditional types. I default to interface for extensible public object contracts and type for unions and type-level computation.
- **Level-up:** A junior answer says "they're basically the same, just use whichever"; a senior answer can name the concrete mechanical difference (merging vs single binding) and give a real example of when merging is a feature (augmenting a third-party ambient type) versus when it's a footgun (accidental same-name collision).

---

## 3) Optional (`?`) and `readonly` Properties

### Concepts
- `prop?: T` marks a property as possibly absent from an object of that shape.
- `readonly prop: T` prevents *reassignment* of that property after the object is created — at the type level only.
- Both interact with utility types: `Partial<T>` makes every property optional; `Readonly<T>` makes every property readonly; `readonly T[]` / `ReadonlyArray<T>` strips mutating array methods from the type.

📖 **Plain-English definition**: `?` tells the compiler "this key might not be there at all," and `readonly` tells the compiler "once this is set, don't let code write to it again" — but both are promises the *compiler* enforces while you're writing code, not locks the *runtime* enforces while the program is running.

### Why it exists
- ✅ Models real-world optionality directly in the type (a `User` might not have a `middleName`) without needing a separate `| null` union just to express "may be missing."
- ✅ Expresses immutability *intent* (an `id` should never change after creation) so the compiler — and every future reader of the code — can see that guarantee without hunting through the whole codebase for accidental writes.
- ✅ Because both are compile-time constructs, they cost nothing at runtime — no wrapper objects, no proxies, no performance overhead.

### How TypeScript actually does this (behind the scenes) 🧠
- **`?` is two facts bundled together**, not just `T | undefined`. The checker marks the property's Symbol as "optional" (affecting whether it's required in an object literal, and whether accessing it needs narrowing under `strictNullChecks`), *and* the effective type of a read becomes `T | undefined`. That's why an object literal can simply omit an optional key entirely — the "optional" flag, not just the union type, is what makes omission legal.
- **`readonly` is erased completely.** It exists purely in the type checker's member list for that property; the emitted JavaScript property is a completely ordinary, freely-mutable property. Nothing about a `readonly`-typed property is different from any other property once the code is running.

```ts
interface Account {
  readonly id: string;
  nickname?: string;
}

const acct: Account = { id: 'acct_001' };
// acct.id = 'acct_999'; // ❌ compile error: Cannot assign to 'id' because it is a read-only property.
```

Compiled JS — the `readonly` guarantee is simply gone:
```js
const acct = { id: 'acct_001' };
acct.id = 'acct_999'; // ✅ perfectly legal JavaScript — nothing stops this at runtime
```

And any code that bypasses the type checker bypasses `readonly` entirely, with no special effort required:
```ts
(acct as any).id = 'hacked-id'; // ✅ compiles — 'as any' opts back out of the check
```

- **Contrast with real runtime immutability**: `Object.freeze(acct)` *is* enforced by the JavaScript engine itself — an actual runtime mechanism, not a type-checker opinion. `readonly` and `Object.freeze` solve different problems and are often used together: `readonly` documents intent and blocks accidental mutation *from TypeScript-checked code paths*; `Object.freeze` blocks mutation from *any* code, TypeScript-checked or not.
- **`readonly T[]` / `ReadonlyArray<T>`** works by removing the mutating method signatures (`push`, `pop`, `splice`, `sort`, etc.) from the *type's* member list — the array itself at runtime is a completely normal, mutable `Array` instance. Calling `.push()` on a `readonly` array reference fails to *compile*; the same underlying array reached through a non-readonly reference elsewhere is still fully mutable.

### ✅ Best Practices
- Use `readonly` for identifiers, configuration values, and anything conceptually set-once — it documents intent for the next reader even though it isn't a runtime lock.
- Pair `readonly` with `as const` for literal data structures you want treated as fully immutable at the type level.
- Use the `Readonly<T>` utility type on function parameters you never intend the function to mutate — it's a cheap, effective "don't touch this" signal at the API boundary.

### ❌ Avoid
- Treating `readonly` as an actual security or data-integrity guarantee — it is not enforced at runtime and is trivially bypassed by `as any`, plain-JS callers, or serialization round-trips.
- Confusing "optional" with "nullable" — `prop?: T` means the *key* may be absent, not that its *value* may be `null`; if `null` is also a valid value you still need `prop?: T | null`.

### 🎯 Interview insights
- "Is `readonly` enforced at runtime?" is a great litmus-test question — the correct answer is a confident no, with the `Object.freeze` contrast as evidence of understanding the difference between compile-time and runtime guarantees.
- Knowing that `Partial<T>` and `Readonly<T>` are themselves just mapped types built out of `?` and `readonly` (covered in Phase 6) is a strong forward-looking signal.

### 🔄 SDLC Angle
Choosing which fields are optional vs required is a **design/data-modeling decision** made when a shape is first authored, and it's cheap to get wrong early but increasingly expensive to change once many call sites depend on a field always being present. `readonly` misuse — or its absence — is squarely a **code-review** concern: a reviewer who spots a field that's mutated somewhere it clearly shouldn't be (an ID, a creation timestamp) is catching, at review time, a bug class that would otherwise only surface much later as a confusing production data-integrity issue.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "If I mark a class property `readonly` in TypeScript, is it actually protected from being changed once the code is compiled and running?"
- **Strong answer:** No — `readonly` is purely a compile-time check performed by the type checker; it's completely erased in the emitted JavaScript, so the property is an ordinary mutable field at runtime. If real runtime immutability is required, that needs an actual JS mechanism like `Object.freeze`, which `readonly` is often paired with rather than substituted for.
- **Level-up:** A junior answer stops at "readonly prevents reassignment"; a senior answer immediately volunteers the compile-time-vs-runtime distinction and names `Object.freeze` as the real enforcement mechanism, without being prompted.

---

## 4) Structural Compatibility ("Duck Typing" with a Compiler)

### Concepts
- **Structural typing**: type compatibility is determined by *shape* (which members exist, with compatible types) — not by what you named the type or where it sits in an inheritance tree.
- **Nominal typing** (Java, C#): compatibility is determined by *declared identity* — a `Dog` is only assignable where an `Animal` is expected if it explicitly `extends`/`implements` that relationship, no matter how similar the members look.
- TypeScript is structural by default, with one notable semi-nominal exception: `private`/`protected` class members.

📖 **Plain-English definition**: TypeScript doesn't ask "what did you call this thing" — it asks "does this thing have everything the target expects, with compatible types" — exactly like the old programming saying "if it walks like a duck and quacks like a duck, treat it as a duck," except here a compiler is checking the walking and quacking for you before your program ever runs.

### Why it exists
- ✅ TypeScript was designed to describe **existing JavaScript**, where objects are just property bags with no formal type identity — a nominal system would demand every object literal declare "I am officially a `User`," which doesn't match how JS code, and especially JS *libraries*, are actually written.
- ✅ It makes ad-hoc object literals, function parameters, and test doubles/mocks trivially typeable — you don't need a class hierarchy just to pass "something with the right shape" into a function.
- ✅ It matches how JavaScript itself already behaves at runtime (duck typing), so the type system models reality instead of fighting it.

### How TypeScript actually does this (behind the scenes) 🧠
- **Assignability is a member-by-member shape check.** To check if type `S` is assignable to target type `T`, the checker verifies that every *required* member of `T` exists on `S` with a compatible type. `S` is allowed to have *extra* members beyond what `T` requires — a wider shape is still compatible with a narrower target, exactly like "any duck-shaped-enough thing will do."
- **Except for fresh object literals — the "excess property check."** When you assign an object *literal* directly to a typed target, TypeScript applies a stricter, additional check: any property in the literal that isn't in the target type is flagged as an error. This extra check exists specifically to catch typos (`nmae` instead of `name`) that plain structural compatibility would otherwise silently allow. Crucially, this stricter check applies **only to literals assigned directly** — the moment the same-shaped value is held in a variable first, only ordinary (looser) structural compatibility applies.

```ts
interface Point2D {
  x: number;
  y: number;
}

function logPoint(p: Point2D): void {
  console.log(`(${p.x}, ${p.y})`);
}

// ❌ Excess property check fires: fresh object literal has a property Point2D doesn't declare
logPoint({ x: 1, y: 2, z: 3 });

// ✅ No excess property check here: 'p3' is a variable, not a literal, at the call site —
// ordinary structural compatibility just checks that the required members exist.
const p3 = { x: 1, y: 2, z: 3 };
logPoint(p3);
```

- **Two unrelated types with the same shape are freely interchangeable** — no `extends`/`implements` relationship required:

```ts
interface Employee {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
}

function greet(entity: Employee): string {
  return `Hello, ${entity.name}`;
}

const someCustomer: Customer = { id: 'cust_1', name: 'Ravi' };
greet(someCustomer); // ✅ compiles — Customer has everything Employee requires, name says nothing about it
```

- **TypeScript quietly turns semi-nominal for `private`/`protected` class members.** For a class, TypeScript additionally tracks the *declaring class* of each `private`/`protected` member as part of that member's identity. Two classes with identical-looking `private` fields are **not** mutually assignable, even though every public member matches — because the checker treats "this private field, declared in *this specific class*" as a distinct fact from "a private field with the same name declared in some other class." This is the one place TypeScript departs from pure structural typing.

```ts
class WalletA {
  private balance = 0;
  getBalance() { return this.balance; }
}

class WalletB {
  private balance = 0;
  getBalance() { return this.balance; }
}

let w: WalletA = new WalletB();
// ❌ Error: Property 'balance' is private in type 'WalletB' but not in type 'WalletA' the same way —
//    types have separate private declarations even though the shapes look identical.
```

### ✅ Best Practices
- Lean into structural typing for flexible function parameters — accept "anything shaped like X" instead of demanding a specific class/interface lineage.
- Use it deliberately for test doubles/mocks — a plain object literal satisfying an interface's shape is a valid substitute with zero inheritance ceremony.
- Know the excess-property-check escape hatch (assign through a variable, or use a type assertion) for the rare legitimate case of passing a genuinely wider object on purpose.

### ❌ Avoid
- Assuming two differently-named types are automatically *safe* to use interchangeably just because TypeScript allows it — structural compatibility can hide real logic errors (a `Celsius`-labeled `number` is freely assignable wherever a `Fahrenheit`-labeled `number` is expected, because both are just `number` underneath). If that distinction matters, look into "branded"/"nominal-style" types as an advanced technique (tagging a type with a unique, unused property) rather than relying on the name alone.
- Fighting the excess property check by scattering `as any` — prefer assigning through an intermediate variable, or explicitly widening the target type, when the extra properties are intentional.

### 🎯 Interview insights
- "Explain structural vs nominal typing, with an example" is a very common conceptual question — have the `Employee`/`Customer` example ready.
- Knowing the private/protected exception (and *why* it exists — to prevent two unrelated classes with coincidentally identical private state from being treated as interchangeable) is a clear senior-level signal.

### 🔄 SDLC Angle
Structural typing mostly shows up as an **implementation-time productivity win** (no inheritance ceremony needed to satisfy a shape) and as a **code-review-time risk** — a reviewer needs to notice when two conceptually different domain values (a user ID vs an order ID, both typed as `string`) are structurally indistinguishable and could be swapped by mistake with no compiler complaint. Catching that class of bug early, at review time, is far cheaper than debugging a live data-mixup incident in production later.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "TypeScript is described as structurally typed rather than nominally typed — what does that actually mean, and where does TypeScript deviate from pure structural typing?"
- **Strong answer:** Structural typing means compatibility is decided by comparing the actual members and their types, not by declared inheritance — two unrelated interfaces or classes with the same shape are freely interchangeable. TypeScript deviates from this for `private`/`protected` class members: the checker tracks which specific class declared a private member, so two classes with identical-looking private fields aren't mutually assignable, even though everything else about their shape matches.
- **Level-up:** A junior answer defines structural typing correctly but stops there; a senior answer also raises the private/protected exception unprompted and can explain a real risk of pure structural typing (e.g. two same-shaped domain values, like differently-unitted numbers, being silently interchangeable) along with the branded-type workaround.

---

## Hands-on (Do This)
- Write a small `formatId` function with two overloads (string input → formatted string, number input → zero-padded string) and inspect the compiled JS output to confirm only one function exists.
- Take one shared object shape in a personal project and deliberately write it twice: once as an `interface`, once as a `type`. Try declaration-merging the interface version by adding a second `interface` block with an extra property, and confirm the `type` version fails to redeclare.
- Add `readonly` to an identifier-like field in a class, then prove to yourself it's compile-time-only by casting the instance to `any` and reassigning the field.
- Write two unrelated interfaces with an identical shape and pass a value typed as one into a function expecting the other — confirm it compiles with no relationship declared between them.

## Exit Criteria
- You can explain, with the erasure mechanics, what actually exists at runtime when a function has overloads.
- You can give the concrete, mechanical difference between `interface` and `type` (not just a stylistic preference) and demonstrate declaration merging.
- You know `readonly`/`?` are compile-time-only and can name the real runtime mechanism (`Object.freeze`) that `readonly` is often paired with.
- You can explain structural typing with an example, and you know the one place TypeScript becomes semi-nominal (private/protected class members).

## Next
- Continue to `../PHASE 3 — Classes & OOP in TypeScript/Readme.md`
