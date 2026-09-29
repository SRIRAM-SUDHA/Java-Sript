# PHASE 1 - Core Types & Type System Fundamentals

## Goal
Get fluent in TypeScript's basic vocabulary - the primitive and structural building blocks, the four types everyone confuses (`any`, `unknown`, `never`, `void`), when to write a type annotation versus letting inference do the work, and how literal types plus `as const` let you describe exact values instead of just broad categories.

## Topics
1. **Primitives, arrays, tuples, enums**
   - The basic building blocks
   - Arrays vs tuples (fixed-length, fixed-position typing)
   - Enums and their modern alternative
2. **`any` vs `unknown` vs `never` vs `void`**
   - What the type checker actually does differently for each
   - Assignability rules, concretely
   - When each one is the *correct* choice
3. **Type annotations vs type inference**
   - When TypeScript can figure it out itself
   - When you should write the annotation anyway
   - Contextual typing
4. **Literal types and `as const`**
   - Types that describe one exact value, not a category
   - How `as const` changes inference
   - Where this shows up constantly in real code (discriminated unions, config objects)

---

## 1) Primitives, Arrays, Tuples, Enums

### Concepts
- Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`) map directly onto JavaScript's own primitive types.
- Arrays (`T[]` or `Array<T>`) describe a list of arbitrary length where every element is the same type.
- Tuples (`[T, U, ...]`) describe a fixed-length array where **each position** has its own, potentially different, type.
- Enums give a name to a fixed set of related constant values - though modern TS style often prefers string-literal unions instead.

📖 **Plain-English definition**: Primitives are the same basic values JavaScript already has (strings, numbers, booleans) with a type name attached. Arrays type "a list of these, however many there are." Tuples type "exactly this many values, in exactly this order, and here's what each position is." Enums name a fixed menu of allowed values so you don't have to remember magic strings/numbers by hand.

### Why it exists
- 📐 JavaScript already distinguishes primitive values at runtime (`typeof`); TypeScript's primitive types just let the compiler reason about that distinction *before* runtime.
- 🎯 Plain `T[]` can't express "this array always has exactly 2 elements: a string then a number" - tuples exist because some real data (coordinate pairs, `useState`-style `[value, setter]` pairs, CSV rows) genuinely has fixed shape by position, not just by element type.
- 🏷️ Enums exist to replace scattered magic strings/numbers ("status 1 means pending, 2 means shipped... somewhere in a comment") with a single named, checkable set of values.

### How TypeScript actually does this (behind the scenes) 🧠
For primitives, the checker just tracks which JS primitive category a value belongs to and disallows operations that don't make sense for that category (`"hello" - 1` is a compile error; JS would silently produce `NaN`).

For arrays, `string[]` is genuinely just sugar for `Array<string>` - both mean "index into this with any number and get a `string` back" - the checker doesn't track *how many* elements exist, only *what type* each element is.

Tuples are structurally arrays too (`[string, number]` is assignable to `(string | number)[]`), but TypeScript additionally tracks a **fixed length and a type per index**, so `tuple[0]` is known to be `string` and `tuple[1]` is known to be `number` specifically, and reading past the declared length (without a rest element) is a compile error - real positional narrowing that a plain array type can't give you.

Enums are the interesting case for "how does TS actually do this": a numeric `enum` compiles into a real runtime JS object that maps names to numbers **and** numbers back to names (see Phase 0, topic 3, for the actual compiled output) - which is why `Role[0]` works at runtime to get back `"Admin"`. A `string enum`, by contrast, only generates a one-directional forward mapping (no reverse lookup), because there's no unambiguous way to reverse-map arbitrary string values. This runtime cost, plus some cross-module inconsistencies enums have historically had with certain bundlers, is why many modern TypeScript style guides (including this one) prefer a plain union of string literals for a fixed set of values, reserving `enum` for cases where you specifically want the runtime object.

```ts
// Primitives
let username: string = "asha_dev";
let retries: number = 3;
let isActive: boolean = true;

// Array - any length, all elements the same type
const scores: number[] = [10, 20, 30];

// Tuple - fixed length, each position typed independently
const httpResult: [status: number, body: string] = [200, "OK"];
// httpResult[0] is known to be `number`; httpResult[1] is known to be `string`.
// httpResult[2] -> compile error, index out of bounds.

// Enum (numeric, default)
enum OrderStatus {
  Pending,   // 0
  Shipped,   // 1
  Delivered, // 2
}
const status: OrderStatus = OrderStatus.Shipped;

// Modern alternative: string-literal union (no runtime object, often preferred - see topic 4)
type OrderStatusLiteral = "pending" | "shipped" | "delivered";
const status2: OrderStatusLiteral = "shipped";
```

### ✅ Best Practices
- Use tuples for genuinely positional, fixed-shape data (a `[latitude, longitude]` pair, a `[key, value]` entry) - not as a workaround for "I have three different things and don't want to name them."
- Prefer string-literal unions over `enum` for most new code - no runtime object, no reverse-mapping surprises, and they interoperate better with plain JSON data (see topic 4 and Phase 4).
- Name tuple elements (`[status: number, body: string]`) when the position isn't self-evident - it shows up as a hint in editor tooling.

### ❌ Avoid
- Using `any[]` when you actually know the element type - defeats the entire purpose of typing the array.
- Reaching for numeric `enum` out of habit when a string-literal union would be safer and lighter (numeric enums allow any number to be assigned via a plain numeric literal in some configurations, weakening the "fixed set of values" guarantee).
- Treating a tuple like a regular array (`.push()`ing onto it) - it compiles in some cases but defeats the fixed-shape guarantee the tuple type was supposed to give you.

### 🎯 Interview insights
- Being asked "what's the difference between an array type and a tuple type" is common, and the crisp answer is: arrays are same-type/arbitrary-length, tuples are per-position-type/fixed-length.
- "Why would you avoid TypeScript enums?" is a legitimate senior-level question - the strong answer cites the runtime-object cost and reverse-mapping asymmetry between numeric and string enums, not just "they're old-fashioned."
- Knowing that `[string, number]` is still structurally an array (assignable to `(string|number)[]`) shows a deeper grasp of how tuples fit into the wider type system.

### 🔄 SDLC Angle
Choosing tuple vs array vs enum is an *implementation/design*-time decision that pays off (or doesn't) much later: a tuple used for genuinely fixed, positional data becomes self-documenting and safe to destructure years later during *maintenance*; an enum choice affects bundle size and cross-module behavior in ways that mostly surface during *deployment* (a numeric-enum's compiled runtime object is a small but real thing bundlers have to tree-shake, and mismatched enum versions across build boundaries have been a known source of production bugs in monorepos).

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "When would you use a tuple instead of an array, and why might you avoid `enum` in modern TypeScript?"
- **Strong answer:** "I'd use a tuple when data is genuinely fixed-length and position-meaningful, like a `[latitude, longitude]` pair, so each index gets its own precise type instead of a shared union type. For a fixed set of named values, I'd lean toward a string-literal union over `enum` in most new code, because a literal union has zero runtime footprint and serializes naturally to JSON, whereas a numeric enum compiles into a real object with a reverse mapping that you're paying for at runtime whether you use it or not."
- **Level-up:** Junior answers can define tuples and enums; senior answers can explain the *runtime cost* difference between enum flavors and justify a team style-guide decision (literal unions by default) rather than just describing syntax.

---

## 2) `any` vs `unknown` vs `never` vs `void`

### Concepts
- These four types are the most confused in TypeScript because they all sound like "a type for when you don't have a specific type" - but the checker treats each one completely differently.
- `any` and `unknown` are opposites in spirit: `any` turns checking **off**; `unknown` turns checking **up** (forces you to prove safety before use).
- `never` and `void` both relate to "nothing," but at different levels: `never` means "this can't happen / no value ever reaches here"; `void` means "a value is returned but you should ignore it."

📖 **Plain-English definition**: `any` tells TypeScript "stop checking this, trust me completely." `unknown` tells TypeScript "this could be anything, so don't let me touch it until I've proven what it actually is." `never` describes a value that can never actually occur - a function that always throws, or a branch of a union that's been fully handled. `void` describes a function's return value that exists in JS terms but is meant to be thrown away by callers - typically because the function's only reason to be called is a side effect.

### Why it exists
- 🚪 `any` exists as an escape hatch for the boundary of the type system - untyped third-party JS, genuinely dynamic code, or incremental migration (Phase 9) - not as a general-purpose "give up on this" button.
- 🛡️ `unknown` exists because `any` was too dangerous as the *default* type for "value of unknown origin" (an API response, `JSON.parse` output) - it gives you the honesty of "I don't know what this is yet" without disabling safety.
- 🚫 `never` exists so the type system can represent "this code path is unreachable" precisely - which is what powers exhaustiveness checking over discriminated unions (Phase 4).
- 🔇 `void` exists to type functions whose return value is meaningless to the caller (typically callbacks/event handlers) - distinct from `undefined`, which is a real, usable value.

### How TypeScript actually does this (behind the scenes) 🧠
This is fundamentally about **assignability rules** - what the checker allows to flow into and out of each type:

- **`any`**: assignable *to* anything, and anything is assignable *to* it, in both directions, with no error. Once a value is `any`, every operation on it - property access, calling it as a function, arithmetic - is allowed without complaint, because the checker has effectively stopped tracking that value's type at all. This is the only type in the language that behaves this way; it's not "a very permissive type," it's a hole punched clean through the type system.
- **`unknown`**: assignable *from* anything (any value can be put into an `unknown` variable), but assignable *to* almost nothing - you cannot call a method on it, access a property, or pass it where a specific type is expected, until you **narrow** it (via `typeof`, `instanceof`, a type predicate, or an assertion). This is deliberately the "safe `any`": it accepts anything but refuses to let you use it unsafely.
- **`never`**: assignable *to* every other type (vacuously - if a value can never exist, it trivially satisfies any type's requirements), but nothing (other than another `never`) is assignable *to* it. It's the type of a function that never returns normally (always throws or loops forever), and the type TypeScript infers for an already-fully-narrowed branch of a union (there's nothing left it could be). Assigning a value to a variable of type `never` outside of exhaustiveness-check code is essentially always a compile error, which is exactly the property exhaustiveness checking relies on (Phase 4).
- **`void`**: describes a function's return type when the return value is meant to be ignored. Crucially, this is different from the function returning `undefined` as a type: TypeScript specifically allows a function typed as returning `void` to actually return *any* value at the implementation level for callback-compatibility reasons (so array methods like `.forEach` can accept callbacks that happen to return something, like an arrow function shorthand `arr.forEach(x => list.push(x))`, where `.push()` returns a number) - but the caller is not allowed to *use* that returned value, since the declared type says to ignore it.

```ts
// any - checking is fully disabled
let anything: any = fetchLegacyJson();
anything.whatever.deeply.nested(); // compiles, no error - even though this will likely crash at runtime.

// unknown - must narrow before use
let incoming: unknown = fetchLegacyJson();
// incoming.whatever;             // Error: 'incoming' is of type 'unknown'.
if (typeof incoming === "object" && incoming !== null && "whatever" in incoming) {
  console.log((incoming as { whatever: string }).whatever); // OK, now narrowed/asserted
}

// never - a function that never returns normally
function fail(message: string): never {
  throw new Error(message);
}

// never - exhaustiveness checking (Phase 4 covers this pattern in depth)
type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    default:
      const exhaustiveCheck: never = shape; // if a new Shape variant is added and not handled above,
      throw new Error(`Unhandled shape: ${exhaustiveCheck}`); // this line fails to compile.
  }
}

// void - return value exists in JS, but callers must ignore it
function logEvent(name: string): void {
  console.log(`Event: ${name}`);
  // implicitly returns undefined
}
const result = logEvent("click"); // result has type void - you *have* a value, but you're not meant to use it
```

### ✅ Best Practices
- Default to `unknown` (never `any`) for values of genuinely unclear origin - API responses, `JSON.parse()` output, `catch (e: unknown)` (modern default in strict configs) - and narrow before use.
- Use `never` deliberately for exhaustiveness checks in `switch` statements over discriminated unions - it turns "forgot to handle a new case" into a compile error instead of a silent runtime gap.
- Type callback parameters as `void` when you genuinely don't care about their return value - it signals intent and matches how the built-in JS callback APis are typed.

### ❌ Avoid
- Using `any` as a quick fix to silence a compile error - it doesn't fix the underlying type mismatch, it just hides it from the checker (and from every downstream consumer of that value).
- Confusing `void` with `undefined` - `void` is about "ignore the return value" as a contract for callers; `undefined` is an actual value you can check for, store, and compare against.
- Letting `any` "leak" - because `any` is assignable to everything, one `any` value can silently disable checking anywhere it flows into, even variables/parameters that were otherwise strictly typed.

### 🎯 Interview insights
- "What's the difference between `any` and `unknown`?" is close to guaranteed in any TS-focused interview - the correct framing is about assignability and narrowing, not vague adjectives like "safer."
- Being able to write a correct exhaustiveness-check `never` pattern from memory is a strong, concrete signal of real experience with discriminated unions.
- Explaining why `void`-typed callbacks can still "return" something at the implementation level (the `.forEach(x => arr.push(x))` case) shows unusually deep familiarity with the type's actual assignability rule.

### 🔄 SDLC Angle
Whether a codebase leans on `any` or `unknown` at its boundaries is often set at *design* time (a team's `tsconfig`/lint rules, e.g. banning `any` via `@typescript-eslint/no-explicit-any`) and enforced continuously in *code review*, where a lingering `any` is one of the most common review comments in a mature TS codebase. `never`-based exhaustiveness checks pay off specifically at *maintenance* time: when a new variant is added to a union months later, the exhaustiveness check turns a would-be silent runtime gap into an immediate compile error at the exact call site that needs updating.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why would you use `unknown` instead of `any` for a value coming from an external API?"
- **Strong answer:** "`any` disables type checking entirely in both directions, so once a value is `any`, nothing downstream is protected, even if the rest of the codebase is strictly typed. `unknown` still accepts a value of any shape, but the compiler refuses to let me use it - call methods on it, access properties - until I actually narrow it with a type guard or validation. That forces me to prove the shape I'm assuming is correct, right at the boundary, instead of just hoping."
- **Level-up:** A junior answer can define the two types; a senior answer connects `unknown` to runtime validation patterns (narrowing via `zod`/type predicates) and can explain concretely how a stray `any` "poisons" everything it touches, since assignability with `any` is unrestricted in both directions.

---

## 3) Type Annotations vs Type Inference

### Concepts
- TypeScript can often figure out a variable's or expression's type on its own from how it's initialized - that's **inference**.
- **Annotation** is you explicitly writing the type (`: string`), overriding or supplementing what TS would infer.
- The skill isn't "always annotate" or "never annotate" - it's knowing which one gives better safety/readability for a given situation.

📖 **Plain-English definition**: Inference is TypeScript looking at `const x = 5` and deciding, without being told, that `x` is a `number`. Annotation is you writing `const x: number = 5` yourself. Both end up with the same type for `x` here - the real skill is knowing the cases where inference alone isn't good enough, and an explicit annotation catches a bug or clarifies intent that inference alone would miss.

### Why it exists
- ✍️ Requiring an annotation on every single variable would make TypeScript painfully verbose for no safety benefit in the common case, where the type is obvious from the initializer - inference exists so TypeScript stays productive to write, not just safe to read.
- 🧩 Some places genuinely have no initializer to infer from - function parameters, in particular, get no help from inference and must be annotated (or default to `any`/an error under `noImplicitAny`).
- 🎯 Annotations at the right boundary (function return types on public APIs, empty-collection declarations) catch a class of bugs inference alone would let slip through silently.

### How TypeScript actually does this (behind the scenes) 🧠
When you write `const x = 5`, the checker looks at the initializer expression, computes its type, and assigns that computed type to `x` - this is why `const` variables get inference is often narrower ("literal type" `5`, further widened to `number` for a `let` - see topic 4) than you might expect. Inference isn't limited to variable initializers, either:

- **Return-type inference**: if you don't annotate a function's return type, TS infers it from every `return` statement in the function body, unioning them together if there are multiple.
- **Contextual typing**: TypeScript can infer a parameter's type from the *context* it's used in, without you annotating the parameter at all - e.g., in `[1, 2, 3].map(x => x * 2)`, `x` is inferred as `number` because TS knows `.map` is being called on a `number[]`, and can work backward from the array's element type through `.map`'s own generic signature.
- **Best common type**: for something like `const arr = [1, "two", 3]`, TS infers `(string | number)[]` by finding a type all the elements are compatible with.

Function **parameters**, by contrast, get no inference help at all in isolation - `function greet(name) { ... }` has no initializer for TS to look at, so under `noImplicitAny` this is a compile error demanding an annotation (`name: string`), and without `noImplicitAny` it silently becomes `any` - one of the most common ways `any` creeps into a codebase unintentionally (see topic 2).

```ts
// Inference: TypeScript figures these out without help.
const count = 5;          // inferred: number
const label = "active";   // inferred: string
const list = [1, 2, 3];    // inferred: number[]

function double(n: number) {
  return n * 2;            // return type inferred as `number` - no need to write `: number` explicitly
}

// Contextual typing: `item` is inferred as `{ id: number; title: string }` from the array's element type,
// with zero annotation on the callback parameter itself.
const items = [{ id: 1, title: "First" }];
items.map(item => item.title.toUpperCase());

// Where inference needs help - function parameters have nothing to infer from.
function processOrder(order) { // Error under noImplicitAny: Parameter 'order' implicitly has an 'any' type.
  return order.total;
}
function processOrderFixed(order: { total: number }) { // annotation required
  return order.total;
}

// Where you SHOULD annotate even though TS could infer something: an empty collection.
let errorMessages = [];              // inferred as any[] - dangerously unhelpful
errorMessages.push("bad input");     // compiles, but with zero real checking on what goes in

let errorMessagesFixed: string[] = []; // explicit annotation - now every .push() is checked
```

### ✅ Best Practices
- Let inference handle local variables with obvious initializers (`const x = 5`) - an explicit `: number` here adds noise, not safety.
- Always annotate function **parameters** - inference can't help there, and skipping it invites silent `any`.
- Annotate function **return types** on public/exported functions specifically - it acts as a contract check: if the function body's actual returned value ever drifts from the intended return type, the annotation turns that into an error at the function itself, rather than only surfacing confusingly at every call site.
- Explicitly annotate empty collections (`let errors: string[] = []`) - inferred as `any[]` otherwise, silently losing all checking.

### ❌ Avoid
- Annotating everything reflexively out of habit from more verbose languages (`const name: string = "Asha";`) - it adds no safety when the initializer already makes the type obvious, and adds noise a reviewer has to read past.
- Relying on inference for function parameters - it doesn't happen; skipping the annotation just produces an implicit `any` (or a compile error under `noImplicitAny`).
- Leaving return types uninferred-and-unannotated on large/public functions, where a future edit could silently widen or narrow the inferred return type and break callers without any explicit signal at the function definition itself.

### 🎯 Interview insights
- "When would you write an explicit type annotation even though TypeScript could infer one?" is a good practical-experience question - strong answers mention return types on public APIs and empty-collection initializers specifically.
- Knowing that function parameters get *zero* inference help (unlike variables) is a common point of confusion worth clarifying confidently.
- Mentioning "contextual typing" by name (inferring a callback parameter's type from how the function itself is typed) signals you've read past surface-level tutorials.

### 🔄 SDLC Angle
This is a day-to-day *implementation*-time style decision, but it has real *code-review* weight: a missing return-type annotation on an exported function is a common, legitimate review comment, because it means a future edit that changes what the function returns won't be caught at the function itself - it'll surface later as a confusing type error at some unrelated call site, or (worse, if the change still happens to type-check) not at all. Over-annotating obvious locals, on the other hand, is a *readability* cost reviewers also flag, since it adds noise without adding safety.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "TypeScript can infer most types automatically - when do you still write explicit annotations?"
- **Strong answer:** "I let inference handle local variables with clear initializers, since annotating those adds noise without adding safety. I always annotate function parameters, because inference genuinely can't help there - there's no initializer to look at, so skipping it either errors or silently falls back to `any`. And I annotate return types on exported/public functions specifically, so that if a future change accidentally alters what the function returns, it's caught right there as a contract violation, instead of surfacing confusingly at some distant call site."
- **Level-up:** A junior answer treats annotation as a style preference; a senior answer frames the choice in terms of where a *drift* between intent and implementation would otherwise surface - at the source of the problem (with an annotation) versus far away from it (without one).

---

## 4) Literal Types and `as const`

### Concepts
- A **literal type** narrows a general type down to one exact value: not "a `string`," but specifically `"pending"`.
- Literal types are what make string-literal unions (`"pending" | "shipped" | "delivered"`) and discriminated unions (Phase 4) possible.
- `as const` tells TypeScript "infer the narrowest possible type here" - turning a mutable, widened inference into an exact, read-only one.

📖 **Plain-English definition**: Normally TypeScript widens a value like `"shipped"` up to the general category `string` when it infers a variable's type, because it assumes you might reassign it to some other string later. A literal type keeps it pinned to that exact value, `"shipped"`, and nothing else. `as const` is how you tell TypeScript "no, actually, treat this exactly as written - don't widen it, and don't let me mutate it either."

### Why it exists
- 🎯 Plain `string`/`number` types are too broad to model "one of these three specific statuses" - literal types (usually combined into a union) give you a compiler-checked finite menu of exact values, similar in spirit to an enum but without any runtime object.
- 🔒 `as const` exists because TypeScript's *default* inference behavior (widening a literal to its general type) is right for most mutable variables but wrong for values meant to be fixed, exact configuration or data - `as const` opts back into the precise, unwidened type.
- 🧩 This pairing (literal types + `as const`) is the mechanism underneath discriminated unions and exhaustiveness checking (Phase 4) - without literal types, a `kind: "circle" | "square"` discriminant field couldn't exist at all.

### How TypeScript actually does this (behind the scenes) 🧠
When TypeScript infers a type for a `let` variable initialized to a literal, it deliberately **widens** it - `let s = "shipped"` is inferred as `string`, not `"shipped"`, because a `let` binding is mutable and TS assumes you might assign it any other string later. For a `const` binding, TS is a bit more precise but still widens object/array literal *properties* by default - `const config = { mode: "production" }` infers `{ mode: string }` for the property type, not `{ mode: "production" }`, because object properties are mutable even inside a `const` object (only the *binding* `config` itself is prevented from being reassigned, not its properties).

`as const` changes this inference behavior at the syntax level: it tells the compiler "infer the narrowest literal type for everything in this expression, and additionally make array/object types `readonly`." Applied to a primitive, `"shipped" as const` has type `"shipped"` (redundant on its own, but useful in context). Applied to an object or array, it recursively locks every property/element down to its literal type and marks the whole structure `readonly`, which is why attempting to mutate a value after `as const` is a compile error - not because the array/object stopped existing at runtime (it's still a perfectly ordinary mutable JS array/object at runtime - `as const` is purely a compile-time signal, per Phase 0's erasure discussion), but because the *type* no longer permits the operation.

```ts
// Widening without as const
let statusA = "shipped";        // inferred type: string (widened) - statusA = "anything" compiles fine
const statusB = "shipped";      // inferred type: "shipped" (const bindings to a primitive DON'T widen)

// But object/array properties widen even inside a const binding:
const config = { mode: "production", retries: 3 };
// inferred type: { mode: string; retries: number }  <-- widened properties
config.mode = "literally anything"; // compiles - "mode" was widened to `string`

// as const locks it down: every property becomes its literal type, and the whole object becomes readonly.
const configLocked = { mode: "production", retries: 3 } as const;
// inferred type: { readonly mode: "production"; readonly retries: 3 }
// configLocked.mode = "development"; // Error: Cannot assign to 'mode' because it is a read-only property.

// The classic real-world use: literal-type unions for a fixed, exact set of allowed values.
type OrderStatus = "pending" | "shipped" | "delivered";

function updateStatus(status: OrderStatus): void {
  console.log(`New status: ${status}`);
}
updateStatus("shipped");   // OK - exact literal match
// updateStatus("shiped"); // Error: Argument of type '"shiped"' is not assignable to parameter of type 'OrderStatus'.

// as const on an array -> a readonly tuple of literal types, not a mutable string[]
const roles = ["admin", "member", "guest"] as const;
// inferred type: readonly ["admin", "member", "guest"]
type Role = (typeof roles)[number]; // "admin" | "member" | "guest" - deriving a union FROM the array values
```

### ✅ Best Practices
- Use string-literal unions (`"pending" | "shipped" | "delivered"`) for fixed sets of values instead of a bare `string` - this is usually preferable to `enum` in modern TS (topic 1).
- Reach for `as const` on configuration objects, route tables, or any array of fixed values you want to both lock down *and* derive a union type from (`(typeof arr)[number]`, as shown above) - a common, powerful pattern for keeping one source of truth instead of maintaining the array and the union type separately.
- Use literal types as the discriminant field in discriminated unions (Phase 4) - this is the pattern that unlocks exhaustiveness checking with `never`.

### ❌ Avoid
- Typing a fixed-choice field as plain `string` ("status can be any string") when it's really one of a known, small set - you lose all compiler protection against typos and invalid values.
- Forgetting `as const` and then being confused why `{ mode: "production" }`'s `mode` property isn't narrowed to the literal `"production"` - remember object/array properties widen by default, even inside a `const` binding.
- Assuming `as const` changes runtime behavior - it's purely compile-time (Phase 0); the object is still an ordinary, technically-mutable JS object at runtime, and only the type system stops you from writing to it.

### 🎯 Interview insights
- "What does `as const` actually do?" is a very common practical question - the strong answer covers both effects: it prevents widening to the general type, AND it makes the structure `readonly`.
- Deriving a union type from an array of literals (`(typeof arr)[number]`) is a favorite "do you actually use advanced TS day to day" interview probe.
- Explaining *why* `let x = "a"` widens to `string` but `const x = "a"` doesn't (mutability of the binding) shows real understanding, not memorized syntax.

### 🔄 SDLC Angle
Literal types and `as const` mostly matter at *design/implementation* time, when modeling a fixed set of states (order status, permission roles, config modes) - getting this right early prevents an entire bug class (typo'd magic strings) that would otherwise only surface in *testing* or *production* as a silent no-match (a `switch` or `if` chain quietly falling through because "shipped" was typo'd as "shiped" somewhere, with no compiler to catch it against a bare `string` type). It also plays into *code review*: seeing a fixed-choice field typed as a bare `string` instead of a literal union is a common, high-value review comment.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's the difference between typing a field as `string` and typing it as a union of string literals, and what does `as const` add on top?"
- **Strong answer:** "A bare `string` accepts any string at all, so a typo like `'shiped'` instead of `'shipped'` compiles fine and only fails at runtime, if it fails at all. A literal-type union like `'pending' | 'shipped' | 'delivered'` restricts it to an exact, closed set the compiler checks against, so that typo becomes a compile error immediately. `as const` is how you get TypeScript to infer those exact literal types in the first place, instead of widening them to `string`/`number` - and as a side effect it also makes the value read-only, so I often use it on config objects or fixed arrays I want to both lock down and derive a union type from."
- **Level-up:** A junior answer can define literal types; a senior answer demonstrates the `(typeof arr)[number]` pattern for deriving a union directly from a single array of values - a practical technique for keeping one source of truth instead of maintaining the array and its corresponding type separately.

---

## Hands-on (Do This)
- Model a small "order" domain: a tuple for `[latitude, longitude]`, a string-literal union for status, and a numeric enum for comparison - then compile all three and inspect (or reason through) what does and doesn't survive to JS.
- Write a function that accepts `unknown` (simulating an API response), and narrow it down to a specific shape before using it - notice every operation the compiler blocks until you've proven the shape.
- Write a discriminated union with three variants and a `switch` that handles all three, ending in a `default` branch assigned to a `never`-typed variable; then add a fourth variant and watch the compile error appear at that exact `switch`.
- Take an object literal, observe its widened inferred type, then add `as const` and compare the two inferred types side by side. Derive a union type from an `as const` array using `(typeof arr)[number]`.

## Exit Criteria
- You can explain, for a given value, whether it should be typed `any`, `unknown`, `never`, or `void` - and justify it by assignability rules, not vibes.
- You know when TypeScript can infer a type well enough that an annotation would just be noise, and when an annotation is actually load-bearing (parameters, public return types, empty collections).
- You can read `as const` in someone else's code and correctly state what changed about the inferred type versus the same code without it.

## Next
- Continue to `../PHASE 2 — Functions & Interfaces/Readme.md`
