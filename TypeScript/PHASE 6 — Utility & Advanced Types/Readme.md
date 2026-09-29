# PHASE 6 - Utility & Advanced Types

## Goal
Move from "I annotate variables" to "I compute types." This phase is where TypeScript stops looking like JavaScript with sprinkles and starts looking like its own small functional language that runs at compile time. You'll learn the built-in utility types every codebase uses (`Partial`, `Pick`, `Omit`, `Record`, etc.), then open the hood and see they're just ordinary mapped types — and mapped types themselves are built from two primitives (`keyof` + `in`). From there, conditional types (`T extends U ? X : Y`) and `infer` let you write types that branch and extract sub-types, and template literal types let you build new string-literal types out of other ones. This is squarely "onsite / deep-dive round" material — the difference between someone who has used `Partial<T>` and someone who can write their own.

## Topics
1. **Built-in Utility Types**
   - `Partial`, `Required`, `Readonly`
   - `Pick`, `Omit`, `Record`
   - `Exclude`, `Extract`
   - `ReturnType`, `Parameters`
2. **Mapped Types**
   - `keyof` and the `in` operator
   - Modifiers: `?`, `readonly`, and their negations `-?`, `-readonly`
   - Key remapping with `as` (TS 4.1+)
3. **Conditional Types & `infer`**
   - `T extends U ? X : Y` as a compile-time if/else
   - Distributive conditional types over unions
   - `infer` to capture and extract a sub-type
4. **Template Literal Types**
   - Building new string-literal types from unions
   - Intrinsic string types: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`
   - Combining with mapped types (`as` key remapping)

---

## 1) Built-in Utility Types

### Concepts
- TypeScript ships a set of generic helper types you use constantly: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, T>`, `Exclude<T, U>`, `Extract<T, U>`, `ReturnType<T>`, `Parameters<T>`.
- None of these are special-cased compiler magic in the way `keyof` or `typeof` are — they are ordinary generic type aliases, written in TypeScript itself, and shipped inside the compiler's own bundled `.d.ts` files.
- You can `Ctrl+Click` / "Go to Definition" on any of them in your editor and read the actual source.

📖 **Plain-English definition**: utility types are pre-built "type transformations" — small functions that take a type in and produce a new, related type out (e.g. "give me the same shape as `User`, but every field optional"), so you don't have to hand-write and maintain a near-duplicate interface every time you need a slightly different shape of the same data.

### Why it exists
- Real objects need many *related* shapes: the full `User`, the shape you accept on `PATCH /users/:id` (all fields optional), the shape you're allowed to send to the client (no password hash), the shape you use as a lookup table keyed by role.
- Hand-writing each of these as a separate `interface` means editing 4-5 places every time a field is added/renamed to `User` — a maintenance trap.
- Utility types let you *derive* every one of those shapes from a single source of truth (`User`), so a change to the base type propagates automatically and the compiler will flag every derived usage that breaks.

### How TypeScript actually does this (behind the scenes) 🧠
- All of these live in TypeScript's own standard library declaration files that ship with every install — primarily `lib.es5.d.ts` (the utility types are old enough to be defined there, not in a newer `lib` file) inside `node_modules/typescript/lib/`.
- They are literally just generic type aliases. For example (this is the *real*, current definition, verbatim in spirit):
  ```ts
  type Partial<T> = {
      [P in keyof T]?: T[P];
  };

  type Required<T> = {
      [P in keyof T]-?: T[P];
  };

  type Readonly<T> = {
      readonly [P in keyof T]: T[P];
  };

  type Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };

  type Record<K extends keyof any, T> = {
      [P in K]: T;
  };

  type Exclude<T, U> = T extends U ? never : T;

  type Extract<T, U> = T extends U ? T : never;

  type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

  type ReturnType<T extends (...args: any) => any> =
      T extends (...args: any) => infer R ? R : any;

  type Parameters<T extends (...args: any) => any> =
      T extends (...args: infer P) => any ? P : never;
  ```
- Notice `Omit` isn't independently defined — it's `Pick` composed with `Exclude`, which is itself a conditional type. This is the pattern the whole utility-type library follows: a handful of primitives (`keyof`, `in`, conditional types, `infer`) combine to build everything else.
- Because these are ordinary type aliases, they are **fully erased** at compile time — there's zero runtime trace of `Partial`, `Pick`, etc. in the emitted JavaScript. They only ever exist to the type checker.

### Code example
```ts
interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
}

// PATCH payload: every field optional, and you never PATCH the id or hash
type UserUpdatePayload = Partial<Omit<User, 'id' | 'passwordHash'>>;

// What's safe to send to a browser client
type PublicUser = Omit<User, 'passwordHash'>;

// A lookup table of default permissions per role
type Permission = 'read' | 'write' | 'delete';
const defaultPermissions: Record<User['role'], Permission[]> = {
  admin: ['read', 'write', 'delete'],
  member: ['read', 'write'],
  guest: ['read'],
};

// Extracting a function's shape instead of re-typing it
function createUser(email: string, displayName: string): User {
  /* ... */
  return {} as User;
}

type CreateUserArgs = Parameters<typeof createUser>;   // [email: string, displayName: string]
type CreateUserResult = ReturnType<typeof createUser>; // User

function updateUser(id: string, patch: UserUpdatePayload): PublicUser {
  /* ... */
  return {} as PublicUser;
}
```

### ✅ Best Practices
- Derive request/response DTOs from one canonical entity type instead of hand-duplicating interfaces.
- Prefer `Omit<T, 'field'>` over rewriting a type by hand — it keeps the derived type in sync when `T` changes.
- Use `ReturnType<typeof fn>` / `Parameters<typeof fn>` to avoid re-typing a function's contract elsewhere (e.g. in a mock or a caller).

### ❌ Avoid
- Defining a second, hand-written interface that's "basically `User` but optional" — it silently drifts out of sync.
- Chaining so many nested utility types (`Partial<Omit<Pick<...>>>`) that the resulting type is unreadable — extract an intermediate named type instead.
- Using `Record<string, T>` when your key set is actually a known, finite union — you lose the exhaustiveness/typo-catching benefit of a real key union.

### 🎯 Interview insights
- Be ready to write `Omit` and `Pick` from memory using mapped/conditional types, not just use them.
- Know that `Omit<T, K>` is defined in terms of `Pick` + `Exclude` — a common "explain how this is implemented" follow-up.
- Be able to explain `ReturnType`/`Parameters` in terms of `infer` (covered in Topic 3).

### 🔄 SDLC Angle
Utility types are primarily an **implementation-time** tool for eliminating duplication, but their payoff shows up at **maintenance** time: when a field is added to (or renamed on) the base entity type, every type derived via `Partial`/`Pick`/`Omit` updates automatically, and the compiler immediately flags every call site that's now inconsistent — turning what would be a silent runtime bug (a stale hand-written DTO) into a compile-time error caught in **code review** or even before the PR is opened. Choosing *which* type is the "source of truth" that others are derived from is a small but real **design-time** decision that's worth getting right early.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Write a type `PartialBy<T, K>` that makes only the keys in `K` optional on `T`, leaving the rest required — using `Pick`/`Omit`/mapped types." (A very common "show me you understand type composition" prompt.)
- **Strong answer:** `type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>` — take the fields *not* in `K` as-is via `Omit`, take the fields *in* `K` via `Pick` and make just those optional via `Partial`, then intersect the two halves back together. Walk through it with a concrete example (`PartialBy<User, 'displayName'>` makes only `displayName` optional).
- **Level-up:** A junior candidate can *use* `Partial`/`Pick`/`Omit`. A senior candidate can *compose* them to build a new named utility type on the spot, and can explain why the intersection (`&`) is the right way to stitch the two halves back together rather than trying to write one giant mapped type.

---

## 2) Mapped Types

### Concepts
- A mapped type produces a new object type by iterating over a set of property keys and transforming each one.
- Two building blocks make this possible: `keyof T` (produces a union of `T`'s property keys as literal types) and the `in` operator (iterates a union of string/number/symbol literal types, one property per member).
- Mapped types can also add or strip the `?` (optional) and `readonly` modifiers per property, using `-?` / `-readonly` to explicitly *remove* a modifier that the source type has.
- Since TS 4.1, an `as` clause inside the mapped type lets you *rename* keys as you map them ("key remapping").

📖 **Plain-English definition**: a mapped type is a "for-each over the property names of a type" — for every key in some set of keys, produce a (possibly renamed, possibly re-modified) property in a brand-new object type, instead of writing that object type's properties out by hand one at a time.

### Why it exists
- Without mapped types, every utility type (`Partial`, `Readonly`, etc.) would have to be a compiler built-in written in the TypeScript compiler's own source code (like `keyof` and `typeof` are) — not something a library author, or you, could ever build yourself.
- Mapped types generalize "take this type's shape and adjust every property the same way" into a reusable, user-space language feature.
- They're the mechanism that makes the entire utility-type library (Topic 1) possible without special-casing each one in the compiler.

### How TypeScript actually does this (behind the scenes) 🧠
- `keyof T` is evaluated by the compiler as a union of `T`'s own property key literal types. For `interface Point { x: number; y: number }`, `keyof Point` is the type `"x" | "y"` — nothing more than a union of two string literal types.
- `{ [P in K]: ... }` where `K` is a union of literal types produces one property per union member — the compiler literally distributes over the union, generating one property signature per key.
- This is exactly how `Partial<T>` is defined in `lib.es5.d.ts`:
  ```ts
  type Partial<T> = {
      [P in keyof T]?: T[P];
  };
  ```
  Read it as: "for each key `P` in the union `keyof T`, produce a property named `P`, typed as `T[P]` (an indexed access — 'look up the type of that property on `T`'), and mark it optional with `?`."
- `Readonly<T>` is the same shape but adds the `readonly` modifier instead of `?`:
  ```ts
  type Readonly<T> = {
      readonly [P in keyof T]: T[P];
  };
  ```
- Modifiers can also be **removed**, not just added — this is what `Required<T>` does with `-?`:
  ```ts
  type Required<T> = {
      [P in keyof T]-?: T[P];
  };
  ```
  `-?` means "whatever this property's optionality was on `T`, strip it — make it required here." The symmetric `-readonly` exists too, for building a "mutable" version of a `readonly` type — this isn't in the standard library by default, but it's a one-liner you can write yourself (shown below).
- Since TS 4.1, an `as` clause lets you remap the key itself, not just its type/modifiers — this is how patterns like "turn every property `x` into `getX`" or "build `on${EventName}` handler prop names" (Topic 4) are implemented:
  ```ts
  type Getters<T> = {
      [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
  };
  ```

### Code example
```ts
interface Config {
  readonly host: string;
  readonly port: number;
  timeout?: number;
}

// Build your own "make it mutable" utility — not in the standard library,
// but a direct, one-line application of the -readonly modifier.
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Build your own "no optional fields at all, guaranteed" utility
type Concrete<T> = {
  [P in keyof T]-?: T[P];
};

type MutableConfig = Mutable<Config>;     // host/port become writable
type ConcreteConfig = Concrete<Config>;   // timeout becomes required

function applyConfig(cfg: MutableConfig) {
  cfg.host = 'localhost'; // OK now — readonly was stripped
}

// Key remapping with `as`: turn a settings object's keys into "on-change" prop names
interface FormFields {
  email: string;
  age: number;
}

type ChangeHandlers<T> = {
  [P in keyof T as `on${Capitalize<string & P>}Change`]: (value: T[P]) => void;
};

// Equivalent to: { onEmailChange: (value: string) => void; onAgeChange: (value: number) => void }
const handlers: ChangeHandlers<FormFields> = {
  onEmailChange: (value) => console.log('email ->', value),
  onAgeChange: (value) => console.log('age ->', value),
};
```

### ✅ Best Practices
- Reach for a mapped type when you catch yourself about to hand-write an object type that's "the same shape as X, but every property Y."
- Name the result (`type Mutable<T> = ...`) rather than inlining a complex mapped type at every call site.
- Use key remapping (`as`) instead of a second pass of `Pick`/rename boilerplate when you need to systematically rename keys.

### ❌ Avoid
- Forgetting that `-?`/`-readonly` only make sense as *modifiers on a mapped type*, not as standalone syntax anywhere else.
- Writing a mapped type over `keyof any` (which is `string | number | symbol`) when you meant `keyof T` — the former gives you an unconstrained index signature, not a mirror of `T`'s actual keys.
- Over-engineering: if `Partial`/`Pick`/`Omit`/`Record` already say what you mean, don't hand-roll an equivalent mapped type just to look clever.

### 🎯 Interview insights
- Be able to state, precisely, what `keyof T` produces (a union of literal key types) — this trips up people who only ever *use* `keyof` without knowing what it evaluates to.
- Know the four modifier operators cold: `?`, `-?`, `readonly`, `-readonly`.
- Bonus points for mentioning key remapping (`as`) unprompted — it signals you've read real modern TS, not just a 2019-era tutorial.

### 🔄 SDLC Angle
Mapped types are an **implementation-time** technique, but understanding them is really what unlocks reading and reviewing *other people's* utility-type-heavy code during **code review** — without knowing `keyof`/`in`/modifiers, a nontrivial mapped type in a PR just looks like unreadable syntax noise. They also matter at **design time** when you're deciding whether a recurring transformation (e.g., "every entity needs a mutable draft version for editing") deserves its own named, shared mapped type in a `types/` module versus being redefined ad hoc in each feature.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Implement your own version of `Readonly<T>` and `Required<T>` without looking them up." 
- **Strong answer:** Explain `keyof T` gives the union of property names, then write `type MyReadonly<T> = { readonly [P in keyof T]: T[P] }` and `type MyRequired<T> = { [P in keyof T]-?: T[P] }`, explicitly calling out that `-?` strips optionality rather than adding it. If pushed further, add a `Mutable<T>` using `-readonly` to show you understand the modifier is symmetric.
- **Level-up:** A junior candidate recognizes `Partial`/`Readonly` by name. A senior candidate can derive them live, explains *why* `keyof` + `in` are the two primitives everything else is built from, and can extend the pattern to something not in the standard library (like key remapping with `as`) without being prompted.

---

## 3) Conditional Types & `infer`

### Concepts
- `T extends U ? X : Y` is a type-level if/else: the compiler checks whether `T` is assignable to `U`, and picks `X` or `Y` accordingly — evaluated entirely during type checking, with no runtime equivalent.
- When `T` is a *naked* generic type parameter and the checked type is a union, the conditional **distributes** over each union member independently, then re-unions the results.
- `infer` can only appear inside the `extends` clause of a conditional type. It introduces a new type variable that the compiler tries to "solve for" by pattern-matching the shape you're checking against.
- This is how you extract a piece of a type (a function's return type, a `Promise`'s resolved type, an array's element type) instead of just testing whether it matches.

📖 **Plain-English definition**: a conditional type lets you write "if this type looks like *this*, produce that other type; otherwise produce a different one" — entirely at compile time — and `infer` is the keyword that lets you say "and while you're checking if it matches this shape, grab the piece that matched and hand it back to me by name."

### Why it exists
- Static types need to react to *what kind* of type they're given — e.g. "if this is an array, give me the element type; if it's a `Promise`, give me the resolved type" — without the programmer manually writing a different type for every possible input shape.
- `infer` solves a very specific, very common need: pulling a *part* out of a type you're already pattern-matching against, instead of forcing you to duplicate that sub-shape as a second generic parameter.
- Without conditional types + `infer`, meta-utilities like `ReturnType<T>` (Topic 1) would be impossible to express as ordinary user-space TypeScript — they'd need to be compiler built-ins.

### How TypeScript actually does this (behind the scenes) 🧠
- The compiler evaluates `T extends U ? X : Y` by asking: "is every value that could satisfy `T` also assignable to `U`?" If yes, the whole expression's type *is* `X`; if no, it's `Y`. This happens purely in the type checker — it never produces a runtime `if`.
- **Distribution**: if `T` is a naked type parameter (not wrapped in something like `[T]`) and you pass a union in for `T`, TypeScript checks the condition against *each member of the union separately* and unions the results back together. This is exactly how `Exclude<T, U> = T extends U ? never : T` filters a union: given `Exclude<'a' | 'b' | 'c', 'b'>`, the compiler checks `'a' extends 'b' ? never : 'a'` (→ `'a'`), `'b' extends 'b' ? never : 'b'` (→ `never`), and `'c' extends 'b' ? never : 'c'` (→ `'c'`), then unions the three results — `never` drops out of a union automatically, leaving `'a' | 'c'`.
- `infer` introduces a placeholder type variable *inside* the `extends` clause, and the compiler fills it in by structurally matching the shape. This is `ReturnType`'s actual definition again, read carefully this time:
  ```ts
  type ReturnType<T extends (...args: any) => any> =
      T extends (...args: any) => infer R ? R : any;
  ```
  "If `T` is a function type, capture whatever its return type is into `R`, and produce `R`. Otherwise (unreachable here, because the constraint already requires `T` to be a function), produce `any`."
- The same mechanism unwraps a `Promise`'s resolved type:
  ```ts
  type Awaited2<T> = T extends Promise<infer U> ? U : T;
  // Awaited2<Promise<string>> -> string
  // Awaited2<number>          -> number  (not a Promise, passes through unchanged)
  ```
- Conditional types can also **recurse**, which is how deep utilities (flattening nested arrays, deeply-partial types) are built — the compiler keeps re-evaluating the conditional on the narrowed-down type until a base case is hit.

### Code example
```ts
// Extracting the element type of an array, generically
type ElementType<T> = T extends (infer E)[] ? E : never;
type Numbers = ElementType<number[]>;   // number
type Strings = ElementType<string[]>;   // string

// Unwrapping a Promise's resolved value (a simplified version of lib's real `Awaited<T>`)
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

async function fetchUserId(): Promise<string> {
  return 'user_123';
}

type FetchedId = UnwrapPromise<ReturnType<typeof fetchUserId>>; // string

// Distributive conditional in action: filtering a union
type Status = 'pending' | 'active' | 'archived' | 'deleted';
type NonTerminalStatus = Exclude<Status, 'archived' | 'deleted'>; // 'pending' | 'active'

// A small recursive conditional type: deep-readonly
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

interface Nested { a: { b: { c: number } } }
type FrozenNested = DeepReadonly<Nested>; // every level, all the way down, becomes readonly
```

### ✅ Best Practices
- Reach for `infer` specifically when you need to *extract* a sub-part of a type you're already checking the shape of — don't reach for it just to test a condition (a plain conditional without `infer` is enough for that).
- Give conditional types a real base case when writing recursive ones (like `DeepReadonly`'s `T extends object ? ... : T`) so primitives terminate the recursion instead of looping.
- Keep the branch types (`X`/`Y`) simple and named — deeply nested inline conditionals in a function signature are unreadable in an editor tooltip.

### ❌ Avoid
- Relying on distribution when you actually want the union treated as one atomic type — wrap it in a tuple (`[T] extends [U] ? X : Y`) to disable distribution when that's not what you want.
- Writing conditional types so deeply recursive that they blow the compiler's recursion limit ("Type instantiation is excessively deep") — a real, common compiler error on overly clever generic libraries.
- Using `infer` outside an `extends` clause — it's a syntax error; `infer` only has meaning as part of a conditional type's pattern match.

### 🎯 Interview insights
- Be able to explain distribution precisely: it only happens when the checked type is a *naked* type parameter, and it's why `Exclude`/`Extract` work the way they do over unions.
- Know `ReturnType<T>`'s real definition by heart — it's one of the most commonly asked "explain how this works" TypeScript questions.
- Be ready to write a small `infer`-based utility live (unwrap a `Promise`, extract an array's element type) — interviewers use this as a proxy for "do you actually understand the type system, or did you memorize utility type names."

### 🔄 SDLC Angle
Conditional types + `infer` mostly matter at **implementation time**, when you're building shared, reusable type utilities (often in a `types/` or `utils` module) that the rest of the codebase's **code review** and **maintenance** phases benefit from silently — e.g., a `Handler<T>` type that automatically derives the correct callback signature from an event map, so adding a new event later is a one-line change instead of a manual signature update everywhere. Getting a *recursive* conditional type wrong (missing base case, unintended distribution) is a classic bug that surfaces as a confusing compiler error message, which is why these utilities deserve extra scrutiny and unit-level "type tests" during review.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Implement `ReturnType<T>` and `Parameters<T>` from scratch using conditional types and `infer`, and explain what `infer` is actually doing."
- **Strong answer:** `type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never` — the conditional checks that `T` matches a function shape, and `infer R` captures whatever fills the return-type position of that shape into a new type variable `R`, which becomes the result. `Parameters` is the mirror image, inferring the tuple of argument types instead: `T extends (...args: infer P) => any ? P : never`.
- **Level-up:** A junior candidate can describe conditional types as "type-level ternary" but freezes on `infer`. A senior candidate explains `infer` as pattern-matching a type variable out of a shape, can state precisely *when* distribution over unions happens (naked type parameter) and how to suppress it (`[T] extends [U]`), and can name a real bug they've hit from an unintended distributive conditional.

---

## 4) Template Literal Types

### Concepts
- Template literal types let you build new **string literal types** by combining other string literal or union types, using the exact same `` `...${...}` `` syntax as JS template literals — but entirely in type position.
- When you interpolate a union into a template literal type, the compiler distributes over it, producing a union of every combination — the same distributive behavior conditional types have.
- TypeScript ships four intrinsic (compiler built-in, not written-in-TS) string manipulation types for use inside template literals: `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>`.
- All of this happens **at compile time only** — there is no runtime string concatenation happening anywhere because of a template literal type; if you need the actual runtime string, you still write ordinary JS template literals.

📖 **Plain-English definition**: a template literal type is a way to say "the type here isn't just *any* string — it's specifically one of the strings you get by gluing together these particular literal pieces," computed by the compiler the same way you'd compute the actual strings at runtime, just one level up, on types instead of values.

### Why it exists
- A lot of real-world string data isn't arbitrary — event names (`'click'`, `'onClick'`), CSS-in-JS property names, route paths (`/users/:id`), Redux-style action types (`'user/loaded'`) all follow a predictable *pattern*, and `string` alone is too loose to catch a typo like `'onClcik'`.
- Before template literal types (added in TS 4.1), the only way to get this precision was to hand-enumerate every literal string as its own union member — infeasible for anything combinatorial (e.g. every event name crossed with "on"-prefixed handler names).
- They let a library author express "this prop must be named exactly `on` + a capitalized event name" as a *type*, and have the compiler generate and check every valid combination automatically.

### How TypeScript actually does this (behind the scenes) 🧠
- Given a union type interpolated into a template literal type, the compiler distributes exactly like a conditional type does over a naked type parameter — it computes the cross product of every combination:
  ```ts
  type EventName = 'click' | 'hover' | 'focus';
  type HandlerName = `on${Capitalize<EventName>}`;
  // Evaluated by the compiler as the union:
  // 'onClick' | 'onHover' | 'onFocus'
  ```
- `Capitalize<T>` (and `Uppercase`/`Lowercase`/`Uncapitalize`) are **intrinsic** types — they're not expressible as ordinary mapped/conditional TypeScript the way `Partial` is. They're implemented directly inside the TypeScript compiler's checker in native code (you'll find them declared in `lib.es5.d.ts` with the `intrinsic` keyword: `type Capitalize<S extends string> = intrinsic;`), because string case-transformation isn't something the mapped/conditional type system alone can express.
- Combined with mapped-type key remapping (`as`, from Topic 2), template literal types let you programmatically build entire families of related property names on an object type — this is exactly how the `Getters<T>`/`ChangeHandlers<T>` examples in Topic 2 work: `` `on${Capitalize<string & P>}Change` `` builds a new key for every original key `P`.
- Crucially, **none of this exists after compilation**. The emitted JavaScript for code using `HandlerName` has no trace of the type — if you actually need the string `'onClick'` at runtime, that's produced by ordinary JS template literal syntax or string concatenation, completely independent of (though often mirroring) the type-level computation.

### Code example
```ts
// Building a union of valid handler-prop names from a union of event names
type EventName = 'save' | 'cancel' | 'delete';
type HandlerPropName = `on${Capitalize<EventName>}`;
// 'onSave' | 'onCancel' | 'onDelete'

interface DialogProps {
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

// Combining template literal types with mapped-type key remapping (Topic 2)
// to derive that same props shape directly from the event union, with zero duplication:
type HandlerMap<E extends string> = {
  [K in E as `on${Capitalize<K>}`]: () => void;
};
type DerivedDialogProps = HandlerMap<EventName>;
// { onSave: () => void; onCancel: () => void; onDelete: () => void }

// A realistic Redux-style action-type pattern
type EntityName = 'user' | 'order' | 'invoice';
type ActionVerb = 'created' | 'updated' | 'deleted';
type ActionType = `${EntityName}/${ActionVerb}`;
// 'user/created' | 'user/updated' | ... | 'invoice/deleted'  (9 combinations)

function dispatch(type: ActionType, payload: unknown) {
  // type is guaranteed to be one of the 9 valid combinations — a typo like
  // 'usr/created' is a compile error, not a silently-swallowed runtime bug.
}

dispatch('user/created', { id: 'u_1' }); // OK
// dispatch('user/creatd', {});          // Compile error: not assignable to ActionType
```

### ✅ Best Practices
- Use template literal types to eliminate an entire class of "stringly-typed" typo bugs (event names, action types, CSS property patterns) instead of widening to plain `string`.
- Combine with mapped-type key remapping (`as`) when the *shape* of an object should be derived from a union, not hand-written.
- Keep the source unions (`EventName`, `EntityName`, etc.) as the one place you edit — let the template literal type and everything derived from it update automatically.

### ❌ Avoid
- Interpolating a wide type (plain `string` or `number`) into a template literal type expecting precision — `` `on${string}` `` matches almost anything and gives you little more than plain `string` did.
- Building combinatorially huge unions (crossing several large unions) — this can produce a very large number of literal type combinations and slow the compiler down or hit its limits.
- Forgetting these are compile-time only — you still need ordinary runtime string logic (e.g. an actual `.toUpperCase()` call) to compute the string value your program uses; the type doesn't run itself.

### 🎯 Interview insights
- Be ready to explain that template literal types distribute over interpolated unions exactly like conditional types do — the same underlying compiler behavior, in a different piece of syntax.
- Know that `Capitalize`/`Uppercase`/`Lowercase`/`Uncapitalize` are compiler intrinsics, not something expressible in plain user-space mapped/conditional TypeScript.
- Be able to give a concrete real-world motivating example (event handler prop names, Redux action types, route param strings) — this shows you've used the feature, not just read about it.

### 🔄 SDLC Angle
Template literal types are an **implementation-time / API-design** tool: a library or module author decides, at design time, whether a string-shaped contract (event names, action types, route patterns) deserves this level of precision, trading a small amount of type complexity for catching an entire class of typo bugs at **code review** / compile time instead of at **runtime** in production (a mistyped action type that silently never matches any reducer case is a classic, hard-to-notice production bug). It rarely affects deployment or tooling config — its payoff is almost entirely in preventing a specific, common category of bug before the code ever ships.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How would you type an object whose keys are `onClick`, `onHover`, etc., derived from a union of event names, without writing each property by hand?"
- **Strong answer:** Combine a mapped type with key remapping and a template literal type: `type Handlers<E extends string> = { [K in E as `on${Capitalize<K>}`]: () => void }`, then instantiate it with your actual event-name union. Emphasize that the compiler computes every combination as a real, checked union of string literal types — a typo in a handler name becomes a compile error instead of `undefined` at runtime.
- **Level-up:** A junior candidate can use a pre-existing template literal type. A senior candidate can compose one from scratch by combining `keyof`/`in`/`as` (mapped types) with template literal interpolation, and can explain the connection to distributive conditional types unprompted — showing the type-system primitives aren't isolated tricks but compose together.

---

## Hands-on (Do This)
- Write your own `PartialBy<T, K>` and `RequiredBy<T, K>` utility types from scratch, then verify them against a real interface in your codebase.
- Implement `DeepPartial<T>` (a recursive conditional/mapped type) and use it to type a "patch" function for a nested settings object.
- Build a `HandlerMap<E>` template-literal + mapped type for a real set of event names in a project you're working on, and confirm a typo'd event name fails to compile.
- Read the actual `lib.es5.d.ts` shipped with your installed TypeScript (`node_modules/typescript/lib/lib.es5.d.ts`) and find `Partial`, `Omit`, `ReturnType` in the real source.

## Exit Criteria
- You can write `Partial`, `Pick`, `Omit`, `Readonly`, `Exclude`, `Extract`, `ReturnType`, and `Parameters` from memory, using only `keyof`, `in`, modifiers, and conditional types + `infer`.
- You can explain distribution (over unions, in both conditional types and template literal types) and when it's suppressed.
- You can build a small template-literal + mapped-type combo to derive an object shape from a union, without looking up a reference.

## Next
- Continue to `../PHASE 7 — Modules, Namespaces & Declaration Files/Readme.md`
