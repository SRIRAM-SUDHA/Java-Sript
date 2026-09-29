# PHASE 3 - Classes & OOP in TypeScript

## Goal
Understand TypeScript's class features as what they actually are: a thin, mostly compile-time-only layer of discipline (`public`/`private`/`protected`, `abstract`) sitting on top of real, unremarkable ES2015+ JavaScript classes. This phase is about knowing precisely which class features are *checker opinions* (erased entirely) and which are *real JavaScript* (static members, getters/setters, `extends`) — that distinction is the difference between using classes fluently and being surprised by what a compiled build actually does at runtime.

> 🧭 Constraint reminder: modern, stable TypeScript (5.x-era). Native `#private` fields are mentioned for contrast where relevant, but the default assumption throughout is TypeScript's own `private`/`protected` keywords.

## Topics
1. **Access modifiers (`public`/`private`/`protected`) and parameter properties**
   - What each modifier actually restricts, and for whom
   - Constructor parameter-property shorthand
2. **Abstract classes vs interfaces**
   - Shared implementation vs pure contract
   - What exists at runtime for each
3. **Static members, getters/setters**
   - Class-level vs instance-level state
   - Property-like syntax backed by real methods
4. **Implementing multiple interfaces vs single inheritance**
   - Why JS/TS allow only one `extends` but unlimited `implements`
   - Mixins as the workaround for shared implementation from multiple sources

---

## 1) Access Modifiers (`public`/`private`/`protected`) and Parameter Properties

### Concepts
- `public` (default if omitted) — accessible from anywhere.
- `private` — accessible only within the declaring class.
- `protected` — accessible within the declaring class and its subclasses.
- **Parameter properties** — a constructor-parameter shorthand that declares *and* assigns a class property in one step: `constructor(private readonly id: string) {}`.

📖 **Plain-English definition**: Access modifiers are labels you put on class members telling the *compiler* who's allowed to touch them — `public` means "anyone," `private` means "only this class's own code," `protected` means "this class and anything that extends it" — but they're instructions to your editor and build step, not locks enforced while the program is actually running.

### Why it exists
- ✅ Encapsulation: hides internal implementation details so a class's *public* surface is the only thing consumers need to understand or depend on.
- ✅ Documents intent for future maintainers — a `private` field says "nothing outside this class should ever read or write this," which is valuable even without runtime enforcement.
- ✅ Parameter properties remove the extremely common boilerplate of "declare a field, then assign it in the constructor" — a pattern so frequent in dependency-injection-heavy code (Angular, NestJS) that the shorthand exists specifically for it.

### How TypeScript actually does this (behind the scenes) 🧠
- **`public`/`private`/`protected` are pure type-checker constructs — they are completely erased in the emitted JavaScript.** There is no special runtime mechanism backing them; the compiled output is an ordinary property assignment with no protection whatsoever. This is fundamentally different from languages where "private" is enforced by the runtime/VM itself.

```ts
class BankAccount {
  private balance: number;

  constructor(openingBalance: number) {
    this.balance = openingBalance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}
```

Compiled JS — `private` has vanished without a trace:
```js
class BankAccount {
  constructor(openingBalance) {
    this.balance = openingBalance;
  }
  deposit(amount) {
    this.balance += amount;
  }
}

const acct = new BankAccount(100);
console.log(acct.balance);   // 100 — fully readable from outside, no error, no exception
acct.balance = 999999;       // fully writable from outside — "private" enforced nothing at runtime
```

- **Contrast: native ES2022 `#private` fields DO exist and ARE enforced at runtime.** `#balance` (with the actual `#` syntax) is a real JavaScript language feature — the engine itself throws if outside code tries to access `instance.#balance`, because `#`-prefixed fields are only reachable from inside the lexical class body that declared them, by construction of the language, not by a checker's opinion. TypeScript fully supports `#private` fields and preserves the real `#` syntax in emitted JS on modern targets (or emulates the same protection via a WeakMap for older targets) — so if you need *actual* runtime privacy (not just development-time discipline), `#private` is the tool, and TypeScript's `private` keyword is not a substitute for it.

```ts
class Vault {
  #secret: string; // real runtime privacy — not just a TS keyword
  constructor(secret: string) { this.#secret = secret; }
  reveal(): string { return this.#secret; }
}

const v = new Vault('synthetic-token-123');
// v.#secret; // ❌ actual SyntaxError at parse time — not reachable from outside the class body, ever
```

- **Parameter properties are pure syntactic sugar the compiler desugars for you.** Writing a modifier directly on a constructor parameter tells TypeScript to do two things automatically: (1) declare a class property of the same name, and (2) insert an assignment from the parameter to `this.<name>` at the very top of the constructor body — *before* any of your own constructor code runs.

```ts
class UsersApiClient {
  constructor(
    private readonly baseUrl: string,
    public readonly timeoutMs: number = 5000
  ) {}
}
```

This is exactly equivalent to hand-writing:
```ts
class UsersApiClient {
  private readonly baseUrl: string;
  public readonly timeoutMs: number;

  constructor(baseUrl: string, timeoutMs: number = 5000) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }
}
```

This desugaring is precisely the mechanism behind the constructor-injection style you see everywhere in Angular and NestJS — `constructor(private http: HttpClient)` isn't dependency-injection magic at the *language* level at all; it's this exact parameter-property sugar producing a normal `this.http` instance property, which the rest of the class then reads like any other field. The DI framework's job is only to decide *what value* gets passed as that constructor argument — the property wiring itself is just this desugaring.

### ✅ Best Practices
- Default new class fields to `private` and only widen to `protected`/`public` when there's a concrete reason a subclass or external caller needs access.
- Use `protected` deliberately for framework/base-class extension points (fields or methods a subclass is meant to override or build on) — not as a vague "maybe someone needs this" default.
- Use parameter properties to cut boilerplate on constructors with several dependencies, especially in DI-style codebases.

### ❌ Avoid
- Relying on `private` as an actual security boundary — hiding a genuinely sensitive value (a token, a password) behind `private` provides zero protection against `(obj as any).secret`, a plain-JS caller, or a `JSON.stringify` round trip. If real protection is required, that's what `#private` fields (or, better, simply not holding the sensitive value in memory longer than needed) are for.
- Mixing parameter properties and manually-declared fields inconsistently in the same constructor — pick one style per class for readability.

### 🎯 Interview insights
- "Are TypeScript's `private` members actually private once the code is running?" is a classic gotcha — the confident, correct answer (erased, erased, erased) plus the `#private` contrast is a strong signal.
- Being able to desugar a parameter property by hand, on the spot, shows real understanding rather than memorized syntax.

### 🔄 SDLC Angle
The erasure fact matters concretely at **code-review and security-review time** — a reviewer who assumes `private` is a real security boundary (and signs off on storing a sensitive value in a "private" field with no further protection) is signing off on a gap that only becomes visible later, in a **security audit or incident**, when someone demonstrates that the value was trivially reachable all along. Access-modifier discipline more broadly is a **design/code-review** decision (what should this class expose?) that pays off at **maintenance time**, when a narrowly-scoped `private` field prevents some other part of the codebase from having quietly come to depend on internal state that was never meant to be public.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "If I mark a class field `private` in TypeScript, is it actually inaccessible from outside the class once the code compiles and runs in the browser or Node?"
- **Strong answer:** No — TypeScript's access modifiers are purely compile-time constructs enforced by the type checker; they're erased completely in the emitted JavaScript, leaving an ordinary, fully-accessible property. If genuine runtime privacy is required, native ES2022 `#private` fields are the real mechanism, since the JavaScript engine itself enforces that they're unreachable from outside the declaring class body.
- **Level-up:** A junior answer says "private means only the class can use it"; a senior answer immediately adds the erasure caveat, contrasts it with `#private`, and can explain why constructor-injection-heavy frameworks like Angular/NestJS rely so heavily on parameter-property desugaring rather than treating it as unrelated syntax sugar.

---

## 2) Abstract Classes vs Interfaces

### Concepts
- An **abstract class** can mix unimplemented ("abstract") members with fully-implemented concrete members, hold real state, and have constructor logic — but cannot be instantiated directly.
- An **interface** is a pure shape description: zero implementation, zero state, zero runtime existence at all.
- A class can `extend` only **one** abstract (or concrete) class, but `implement` **any number** of interfaces.

📖 **Plain-English definition**: An interface is a contract with no code behind it at all — just a promise about shape; an abstract class is a partially-built base you can't use directly on its own, but which already contains real, working code that subclasses inherit for free, alongside the specific pieces it forces each subclass to fill in.

### Why it exists
- ✅ Abstract classes model genuine "is-a" relationships that come with **shared implementation** — the classic template-method pattern, where a base class defines the overall algorithm and defers only the specific steps to subclasses.
- ✅ Interfaces model "can-do" contracts with **no shared code**, which is exactly what lets a single class satisfy many unrelated contracts at once (not limited by single inheritance, since there's no implementation to conflict over).
- ✅ Choosing between them is really choosing "do I have real code to share, or just a shape to require?"

### How TypeScript actually does this (behind the scenes) 🧠
- **Interfaces emit literally nothing.** An interface-only file compiles to empty output — not a comment, not a placeholder, nothing. There is no runtime artifact for an interface to leave behind, because it was never anything but a compile-time shape description.
- **Abstract classes DO exist at runtime, but the abstractness itself doesn't.** The `abstract` keyword and "cannot create an instance of an abstract class" rule are enforced only by the **type checker**, at compile time — TypeScript does not insert any runtime guard into the emitted JS preventing `new` on what was an abstract class. Emitted JS for an abstract class is an ordinary `class` declaration; if you bypass the type checker (a plain-JS caller, or a cast trick), nothing at runtime stops you from instantiating it — the language itself has no concept of "abstract."
- **Concrete (implemented) methods on an abstract class produce real function bodies in the output** — this is the actual mechanical difference from an interface, which has nothing to emit because it has no logic at all. This is also *why* abstract classes let you avoid duplicating implementation across subclasses, while a same-named interface method would need to be reimplemented, verbatim or not, by every single class that declares it.

```ts
abstract class Shape {
  abstract area(): number; // no body — must be implemented by subclasses

  // concrete, shared implementation — every subclass gets this for free
  describe(): string {
    return `This shape has an area of ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(private readonly radius: number) { super(); }
  area(): number { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(private readonly width: number, private readonly height: number) { super(); }
  area(): number { return this.width * this.height; }
}

// const s = new Shape(); // ❌ compile-time only: "Cannot create an instance of an abstract class."
const shapes: Shape[] = [new Circle(3), new Rectangle(4, 5)];
shapes.forEach((s) => console.log(s.describe())); // both reuse the SAME describe() implementation
```

The equivalent with only an interface would force every implementer to duplicate `describe()`'s logic:
```ts
interface ShapeLike {
  area(): number;
  describe(): string; // just a signature — no shared code; Circle AND Rectangle must each write this out
}
```

### ✅ Best Practices
- Reach for an **interface** when you need a contract across otherwise-unrelated classes, or when a class needs to satisfy several contracts at once.
- Reach for an **abstract class** specifically when there's real shared implementation or shared state to reuse alongside the contract — not merely to "feel more object-oriented."
- Keep abstract-class hierarchies shallow — one level of shared behavior is usually enough; prefer composition over deepening the hierarchy further.

### ❌ Avoid
- Using an abstract class purely to force a contract with **no** shared code — an interface is simpler, and (unlike an abstract class) doesn't consume a class's single `extends` slot.
- Assuming "cannot instantiate an abstract class" is enforced at runtime — it's a compile-time-only check, just like access modifiers.
- Deep abstract-class inheritance chains, which reintroduce the classic "fragile base class" problem (a change to the shared base ripples unpredictably into every subclass).

### 🎯 Interview insights
- "When would you choose an abstract class over an interface?" is common — the sharpest answer names the presence of *shared implementation* as the deciding factor, not "abstract classes are more powerful."
- Knowing that abstract-class instantiation prevention is compile-time-only (mirroring the access-modifier erasure story from Topic 1) shows you see the pattern across the whole language, not just this one feature.

### 🔄 SDLC Angle
This choice is squarely a **design-phase** decision — it's made when the class hierarchy for a feature area is first sketched out, and reversing it later (turning an abstract-class hierarchy into interfaces plus composition, or vice versa) is a structural refactor, not a quick edit. It resurfaces at **code review** whenever someone proposes a new abstract class: the reviewer's real question should be "is there actually shared implementation here, or did this just want to be an interface?"

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's the actual difference between an abstract class and an interface, beyond 'one has implementation and one doesn't' — and what happens at runtime with each?"
- **Strong answer:** An interface is pure compile-time metadata — it emits nothing at all in the compiled JavaScript. An abstract class does exist at runtime as a real class with real method bodies for its concrete members; only the "abstract-ness" (the rule that you can't `new` it directly) is a compile-time-only check with no runtime guard behind it. The deciding factor for which to use is whether there's genuine shared implementation to give subclasses for free — if not, an interface is simpler and doesn't cost you your one `extends` slot.
- **Level-up:** A junior answer describes the syntax difference; a senior answer volunteers that abstract-class instantiation prevention is compile-time-only (so bypassing the type checker can still construct one) and can justify the choice in terms of the single-inheritance cost of using `extends`.

---

## 3) Static Members, Getters/Setters

### Concepts
- `static` members belong to the **class itself**, not to any instance — there's exactly one shared copy, reachable via the class name rather than `this` on an object.
- **Getters (`get`)/setters (`set`)** let you expose property-like syntax (`obj.value`) that's actually backed by method logic — computed reads, validated writes.
- Both are, mechanically, **real JavaScript features** — unlike access modifiers, neither is erased.

📖 **Plain-English definition**: `static` members are shared class-wide data or utilities that don't belong to any one instance (think a running counter of how many objects were created); getters and setters let a class make a value look like a plain property from the outside while secretly running real code — validation, computation, logging — every time it's read or written.

### Why it exists
- ✅ `static` models genuinely class-level concerns: factory methods, shared counters/registries, constants tied conceptually to the class.
- ✅ Getters/setters let you protect an invariant (e.g. "balance can never go negative") while keeping the ergonomic `obj.prop` syntax, instead of forcing every caller to remember to call `obj.setBalance(x)`.

### How TypeScript actually does this (behind the scenes) 🧠
- **`static` is NOT erased — it compiles directly to real JavaScript `static` class members**, a native feature JS has supported for static methods since ES2015 and for static fields since ES2022. TypeScript's role here is purely to type-check usage on top of a mechanism that already exists at runtime: for example, catching an attempt to reach a static member through `this` inside an *instance* method (`this.staticThing` is wrong — it should be `ClassName.staticThing`), or vice versa.
- **Getters/setters are likewise real, native JavaScript** — a `get`/`set` pair in a class compiles to an actual accessor property, which under the hood is the same mechanism as an `Object.defineProperty` accessor descriptor: reading `obj.value` genuinely invokes the getter function, writing `obj.value = x` genuinely invokes the setter function. TypeScript's job on top of the real mechanism is to type-check that the getter's return type and the setter's parameter type are compatible, and to raise a compile error if you try to assign to a property that only has a getter (no setter defined).
- Static members also participate in the class's own "static side" type (informally `typeof ClassName`), which is what lets you type factory functions and static generics correctly — a detail that rarely comes up directly but explains why some class-related type errors reference "the static side of the class."

```ts
class RequestId {
  private static counter = 0; // one shared copy across ALL instances

  static next(): string {
    RequestId.counter += 1;
    return `req_${RequestId.counter}`;
  }
}

console.log(RequestId.next()); // req_1
console.log(RequestId.next()); // req_2 — same shared counter, no instance involved at all
```

```ts
class Account {
  #balance = 0; // real runtime-private backing field (see Topic 1)

  get balance(): number {
    return this.#balance;
  }

  set balance(next: number) {
    if (next < 0) {
      throw new Error('Balance cannot go negative');
    }
    this.#balance = next;
  }
}

const acct = new Account();
acct.balance = 500;      // looks like a plain property write — actually calls the setter
console.log(acct.balance); // looks like a plain property read — actually calls the getter
// acct.balance = -10;   // throws at runtime — the setter's validation really runs
```

### ✅ Best Practices
- Reserve `static` for genuine class-level concerns (factories, constants, registries) — for general-purpose helper functions that don't need class-level state at all, a plain exported function is usually simpler and more idiomatic TypeScript.
- Use getters/setters to protect real invariants, not as a reflexive wrapper around a trivial pass-through field — a getter/setter pair that does nothing but forward to a private field with no validation adds indirection without benefit.
- Prefer throwing (or otherwise clearly signaling failure) from a setter over silently ignoring/clamping invalid input — silent correction hides bugs from the caller.

### ❌ Avoid
- Mutable `static` state as a dumping ground for "shared app state" — it behaves like a hidden global, making tests hard to isolate (state leaks between test cases unless explicitly reset) and call sites hard to reason about.
- Setters that swallow invalid input instead of validating and failing clearly — a setter is exactly the right place to enforce an invariant, so silently accepting bad data defeats its purpose.

### 🎯 Interview insights
- Be ready to explain that, unlike access modifiers, `static` and getters/setters are **real runtime JavaScript features** — this is a good moment to show you know *which* class features are erased and which aren't, rather than treating "TypeScript class features" as one uniform bucket.
- A getter/setter example that enforces a genuine invariant (not just a pass-through) demonstrates you understand the *purpose*, not just the syntax.

### 🔄 SDLC Angle
Overuse of mutable `static` state is a classic **testing-phase** pain point — shared class-level state that isn't reset between test cases causes order-dependent test failures that are confusing to diagnose, because the tests look independent but secretly aren't. Getter/setter invariant design is more of an **implementation/code-review** concern: deciding what belongs behind validation logic (and catching a setter that silently accepts bad input) is exactly the kind of thing a careful reviewer should flag before it ships.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Are `static` members and getters/setters erased at compile time the same way access modifiers are?"
- **Strong answer:** No — that's an important distinction. `public`/`private`/`protected` are purely compile-time constructs with no runtime trace at all, but `static` and getters/setters compile to real, native JavaScript features (static class members and accessor properties respectively) that have existed in the language independently of TypeScript. TypeScript's contribution on top of both is purely type-checking — verifying getter/setter type compatibility, or catching static-vs-instance access mistakes — not adding new runtime behavior.
- **Level-up:** A junior answer can use `static` and getters/setters correctly; a senior answer can correctly sort TypeScript's class features into "erased, checker-only" (access modifiers, `abstract`) versus "real JavaScript, checker just type-checks it" (static, getters/setters, `extends`) without hesitating.

---

## 4) Implementing Multiple Interfaces vs Single Inheritance

### Concepts
- A class can `extends` exactly **one** class — single inheritance of *implementation*.
- A class can `implements` **any number** of interfaces — unlimited "inheritance" of *contract* only.
- **Mixins** are the language-provided workaround for combining real implementation from more than one source, since `extends` itself is limited to one parent.

📖 **Plain-English definition**: A class can only have one "real" parent it inherits working code from, but it can sign as many contracts as it wants promising "I have this shape too" — because a contract has no actual behavior inside it to conflict with another contract's behavior, while two parents' *real* code could genuinely clash.

### Why it exists
- ✅ Multiple *implementation* inheritance (a class truly inheriting behavior from more than one parent) creates the well-known "diamond problem" — if two parents both define a method with the same name but different behavior, which one wins? Most modern languages (including JS/TS) sidestep this entirely by disallowing it outright.
- ✅ Interfaces have no such conflict to resolve — implementing many interfaces just means satisfying many shape requirements simultaneously, and shapes don't fight each other the way behavior does.
- ✅ This design forces a clean separation: "shared real behavior" is a scarce resource (one parent only, choose carefully), while "shape contracts" are free and unlimited.

### How TypeScript actually does this (behind the scenes) 🧠
- **`implements` is compile-time-only — it generates zero runtime code for the relationship.** Declaring `class Invoice implements Serializable, Comparable` adds nothing to the emitted JavaScript beyond the class's own members; the checker simply verifies, at compile time, that `Invoice`'s member list independently satisfies `Serializable`'s required shape and `Comparable`'s required shape. There's no runtime marker, no prototype entry, nothing that says "this object implements X" once the code is running.
- **`extends`, by contrast, produces real, runtime JavaScript inheritance** — a genuine prototype chain, with `super()` actually calling the parent constructor at runtime. This is the real constraint: JavaScript classes only support one prototype parent, so `extends` is capped at one for a genuine language reason, not an arbitrary TypeScript rule.

```ts
interface Serializable {
  serialize(): string;
}

interface Comparable<T> {
  compareTo(other: T): number;
}

class Invoice extends Document implements Serializable, Comparable<Invoice> {
  constructor(public readonly amount: number) { super(); }

  serialize(): string { return JSON.stringify({ amount: this.amount }); }
  compareTo(other: Invoice): number { return this.amount - other.amount; }
}
```

Compiled JS — the `implements` clauses disappear entirely; only the real `extends` relationship survives:
```js
class Invoice extends Document {
  constructor(amount) {
    super();
    this.amount = amount;
  }
  serialize() { return JSON.stringify({ amount: this.amount }); }
  compareTo(other) { return this.amount - other.amount; }
}
// Nothing in this output records that Invoice "implements Serializable, Comparable" —
// that fact only ever existed for the type checker.
```

- **Mixins are the actual workaround JS/TS provide** for "I want real shared implementation from more than one source" — since `extends` is genuinely capped at one parent. A mixin is a plain function that takes a class constructor and returns a new, extended class expression, letting you layer independent chunks of real behavior onto a base class without a second `extends` slot:

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
  };
}

class BaseWidget {}
class TimestampedWidget extends Timestamped(BaseWidget) {}
// TimestampedWidget genuinely has a working createdAt field at runtime — real implementation,
// layered on without needing a second class in an `extends` clause.
```

### ✅ Best Practices
- Prefer composition (inject a collaborator, "has-a") over deep inheritance chains for sharing behavior between otherwise-unrelated classes.
- Implement as many interfaces as genuinely describe a class's contracts — it's free at runtime, so there's no cost to being generous here.
- Reserve `extends` for a real, single "is-a" relationship with genuinely shared state/behavior; reach for mixins only when composition doesn't fit and you truly need to layer real implementation from more than one source.

### ❌ Avoid
- Deep single-inheritance chains "just in case" — they reintroduce the fragile-base-class problem and make it hard to reason about which ancestor actually defines a given behavior.
- Building convoluted mixin chains to simulate multiple implementation inheritance when plain composition (a class holding a reference to a collaborator) would be clearer and easier to test.

### 🎯 Interview insights
- "Why can a class implement many interfaces but extend only one class?" is a great question to have a crisp answer for — tie it back to the diamond problem and the fact that `implements` is compile-time-only while `extends` is real runtime inheritance.
- Mentioning mixins unprompted, as the actual language-level answer to "how do I share real implementation from two sources," is a strong senior signal.

### 🔄 SDLC Angle
This is fundamentally an **architecture/design-phase** decision about how a class hierarchy is shaped — over-committing to a deep `extends` chain early is one of the more expensive mistakes to unwind later, because every subclass down the chain has implicitly come to depend on the exact shape and behavior of its ancestors. It resurfaces at **code review** whenever a new class proposes extending an existing one purely to reuse a small piece of behavior — often the sign that composition, or implementing an additional interface, was the better fit.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why can a TypeScript class implement multiple interfaces but only extend a single class?"
- **Strong answer:** `extends` produces real runtime inheritance — an actual JavaScript prototype chain with a real `super()` call — and JavaScript classes only support one prototype parent, which is a genuine language constraint, not an arbitrary TypeScript rule; allowing multiple real-implementation parents would also reintroduce the diamond problem (ambiguous conflicting behavior from two parents). `implements`, by contrast, is compile-time-only and generates no runtime code at all, so implementing many interfaces just means satisfying many independent shape checks, which never conflict with each other the way real behavior could.
- **Level-up:** A junior answer states the rule; a senior answer explains *why* (diamond problem plus the real single-prototype-chain constraint) and can name mixins as the actual mechanism the language provides when you genuinely need shared implementation from more than one source.

---

## Hands-on (Do This)
- Write a class with a `private` field holding a value that should never be touched externally, then prove to yourself it's erased by compiling and reading the output, and by bypassing it with `as any`.
- Rewrite the same class's constructor using parameter properties, then hand-desugar it back into explicit field declarations + constructor assignments to confirm you understand exactly what the shorthand expands to.
- Build a small `abstract class` with one abstract method and one concrete method that calls it (template-method style), with two concrete subclasses — then try (and fail) to instantiate the abstract class directly.
- Add a getter/setter pair to a class that enforces a real invariant (e.g., a percentage that must stay between 0 and 100), and write a small mixin that layers an unrelated piece of real behavior onto an existing class.

## Exit Criteria
- You can state, and prove via compiled output, that access modifiers and `abstract`-instantiation-prevention are erased, while `static`, getters/setters, and `extends` are real runtime JavaScript.
- You can explain the mechanical desugaring of a parameter property by hand.
- You can choose between an abstract class and an interface based on whether there's real shared implementation to reuse, not just gut feeling.
- You can explain why `implements` has no arity limit while `extends` is capped at one, and you know mixins as the real workaround.

## Next
- Continue to `../PHASE 4 — Unions, Intersections & Narrowing/Readme.md`
