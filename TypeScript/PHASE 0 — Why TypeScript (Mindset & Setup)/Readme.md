# PHASE 0 - Why TypeScript (Mindset & Setup)

## Goal
Before writing a single generic or interface, build the right mental model: what problem TypeScript actually solves (and where it gives up), how its type system fundamentally differs from languages like Java/C#, what happens to all those types the instant `tsc` finishes, and enough comfort reading `tsconfig.json` that it stops looking like a wall of unexplained flags.

## Topics
1. **What problem TypeScript actually solves (and doesn't)**
   - Where JavaScript bugs actually come from
   - What a type checker can and cannot catch
   - The "documentation you can't ignore" framing
2. **Structural typing vs nominal typing**
   - How TS compares shapes, not names
   - Why this feels different coming from Java/C#
   - Where it helps and where it surprises you
3. **Compile-time types vs runtime JavaScript (type erasure)**
   - What `tsc` actually does to your code
   - What survives compilation and what doesn't
   - Why you can't `typeof` an interface
4. **Reading `tsconfig.json` well enough to not be scared of it**
   - The handful of options that matter day-to-day
   - `strict` and what it actually turns on
   - Module/target settings vs type-checking settings

---

## 1) What Problem TypeScript Actually Solves (and Doesn't)

### Concepts
- TypeScript is a **static type checker** that runs at build time, not a new language runtime.
- It catches an entire *class* of bugs (wrong shape, wrong argument, typo'd property) before the code ever runs.
- It does **not** catch logic errors, does not make your code faster, and does not exist at runtime.

📖 **Plain-English definition**: TypeScript is JavaScript plus a tool that reads your code before it runs and asks, "given what you told me about the shapes of your data, does this code make sense?" If it doesn't - passing a string where a number is expected, calling a method that doesn't exist on this object, forgetting to handle `null` - it tells you at your keyboard, in your editor, instead of letting your user find out in production.

### Why it exists
- 🐛 A huge share of real-world JS bugs are shape mismatches: `undefined is not a function`, `cannot read property 'x' of undefined`, passing an object missing a field a function assumed was there. These are exactly what a type checker is built to catch, and JS itself has no mechanism to catch them before runtime.
- 📈 As codebases and teams grow, the "just remember what shape everything is" approach that works for a 200-line script stops working at 200 files and ten engineers who didn't write each other's code.
- 🛠️ Editor tooling (autocomplete, "go to definition," inline signature hints, safe renames) needs types to work well. TypeScript is what makes VS Code's IntelliSense for a large JS-derived codebase actually reliable instead of guesswork.

### What TypeScript actually catches - and doesn't 🧠
TypeScript's checker works by building up a model of every value's *type* as it reads your code, then flagging any operation that model says is unsafe. Concretely, it catches:
- Calling a function with the wrong number/type of arguments.
- Accessing a property that doesn't exist on a given type (a very common source of the classic `undefined is not a function`).
- Forgetting to narrow a value that might be `null`/`undefined` before using it (under `strictNullChecks`).
- Typos in property names and string literal values (`status: "compelte"` instead of `"complete"`), because the checker compares against the known type/union, not a magic string.

It does **not** catch:
- Logic errors where the types line up but the behavior is wrong (e.g., you compute `price * quantity` when you meant `price + shippingFee` - both are `number`, TS has no opinion).
- Runtime failures unrelated to shape: a network call timing out, a race condition, a third-party API changing its response format without you updating the type that describes it.
- Anything hidden behind `any` - the type checker deliberately stops checking wherever `any` appears (see Phase 1, topic 2).
- Performance problems. Types are erased before runtime (see topic 3 below), so they have zero effect on how fast your code runs.

### Example: the bug class TypeScript is built for
```ts
// Plain JavaScript - this compiles and runs, then blows up at 2am in production.
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

calculateTotal([{ price: 10, qty: 2 }, { price: 5, quntity: 3 }]);
// typo: "quntity" instead of "qty" -> item.qty is undefined -> NaN silently propagates
// JavaScript never complains. The bug ships.
```

```ts
// Same code in TypeScript
interface LineItem {
  price: number;
  qty: number;
}

function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

calculateTotal([
  { price: 10, qty: 2 },
  { price: 5, quntity: 3 }, // Compile error: Object literal may only specify known properties,
                            // and 'quntity' does not exist in type 'LineItem'.
]);
```
The bug is identical in both snippets. Only one of them tells you about it before it ships.

### ✅ Best Practices
- Reach for TypeScript to eliminate *shape* bugs (wrong argument, missing field, typo'd key), not as a substitute for tests, code review, or thinking through logic.
- Treat a compile error as free information - it's a bug you didn't have to find in QA or production.
- Pair TypeScript with runtime validation (e.g., `zod`) at true boundaries (API responses, user input, `JSON.parse`) - TS cannot verify data that arrives at runtime (see topic 3).

### ❌ Avoid
- Assuming "it compiles" means "it's correct." TypeScript proves internal consistency, not business correctness.
- Using TypeScript as a reason to skip unit tests - types and tests catch different bug classes.
- Expecting TypeScript to validate data crossing a runtime boundary (an HTTP response, `localStorage`, a form) without an actual runtime check.

### 🎯 Interview insights
- "What does TypeScript actually give you over JavaScript?" is a warm-up question - the strong answer names the *specific bug class* (shape/argument mismatches caught at compile time) rather than a vague "it's safer."
- Be ready to name what it does *not* solve - interviewers use this to filter out candidates who've only heard the marketing pitch.
- Mentioning editor tooling (autocomplete, safe rename, inline docs) as a concrete team-productivity benefit, not just "type safety," signals real production experience.

### 🔄 SDLC Angle
This shows up earliest at *design/requirements* time - deciding a project uses TypeScript is itself an architectural decision, usually justified by team size and expected codebase lifespan. Day to day, it front-loads bug-catching into *implementation* (the editor flags the bug as you type) and *code review* (a PR that doesn't compile never reaches a human reviewer for that class of bug), which is exactly why teams see fewer "silly" bugs reach *testing* or *production* once they adopt it - not because logic bugs disappeared, but because an entire category of bugs got moved earlier in the pipeline.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why would you choose TypeScript for a new project instead of plain JavaScript?"
- **Strong answer:** "TypeScript moves a specific, common class of bugs - wrong argument types, missing or misspelled object properties, unhandled null/undefined - from runtime discovery to compile-time discovery, right in the editor. That matters most as a codebase and team grow, because you can no longer rely on everyone remembering every function's exact expected shape. It also unlocks much better tooling - reliable autocomplete and safe refactors - which compounds over the life of a project."
- **Level-up:** A junior answer stops at "it catches bugs"; a senior answer can name what it *doesn't* catch (logic errors, runtime/network failures, anything under `any`) and explains that TS is complementary to tests and runtime validation, not a replacement for either.

---

## 2) Structural Typing vs Nominal Typing

### Concepts
- **Nominal typing** (Java, C#, most OOP languages): two types are compatible only if one is declared to be, or extend/implement, the other - the *name*/declaration matters.
- **Structural typing** (TypeScript): two types are compatible if they have the same *shape* - matching property names and types - regardless of how (or whether) they're declared to relate to each other.
- This is the single biggest mental adjustment for someone coming from a nominally-typed language, and a common source of "wait, why did that compile?" moments.

📖 **Plain-English definition**: TypeScript doesn't care what you *named* a type or where you declared it - it only cares whether a value *looks like* what's expected. If two completely unrelated interfaces happen to describe objects with the same properties, TypeScript treats them as interchangeable. It's often summarized as "if it walks like a duck and quacks like a duck, TypeScript treats it as a duck" - literally checking shape, not pedigree.

### Why it exists
- 🌐 TypeScript was designed to describe *existing* JavaScript, where objects are duck-typed at runtime already - there's no concept of "this object implements that interface" baked into the language. Structural typing is the natural fit for a language layered on top of that reality.
- 🔌 It makes gradual adoption possible: you can write an interface describing a shape and any pre-existing plain object literal that happens to match it is automatically compatible, with zero `implements` boilerplate.
- 🧩 It matches how JS code is actually used in practice - functions are routinely called with "some object that has these fields," not "an instance of this specific class."

### How TypeScript actually does this (behind the scenes) 🧠
When TypeScript checks whether a value of type `A` can be used where type `B` is expected, it does **not** look at how `A` and `B` were declared or whether one extends the other by name. Instead, for each property required by `B`, it checks whether `A` has a compatible property of the same name and type. If every required property lines up, `A` is assignable to `B` - full stop, regardless of the type names involved. This is sometimes called "duck typing with a compiler," and it's exactly the compatibility check demonstrated in Phase 2's `interface` vs `type` discussion.

Contrast this with Java/C#: there, `class Dog implements Animal` is what makes `Dog` an `Animal` - the compiler checks the *declaration*, not the members, first. Two classes with identical fields and methods but no shared interface/base class are completely incompatible in Java. In TypeScript, two `interface`s with no declared relationship whatsoever are freely interchangeable if their shapes match.

```ts
// Two completely unrelated interfaces - never declared to relate to each other.
interface Point2D {
  x: number;
  y: number;
}

interface Coordinates {
  x: number;
  y: number;
}

function printPoint(p: Point2D): void {
  console.log(`(${p.x}, ${p.y})`);
}

const coord: Coordinates = { x: 3, y: 4 };

// This compiles! Coordinates was never declared as a Point2D,
// but its shape matches, so TypeScript accepts it.
printPoint(coord);

// Even a plain object literal with no declared type at all works,
// as long as the shape matches (and it has no EXTRA unexpected properties
// when passed as a literal - see the "excess property check" note below).
printPoint({ x: 1, y: 2 });
```

An important wrinkle: TypeScript's structural check is normally "at least these properties, compatible types" (extra properties on the *variable* are fine), but when you pass an **object literal directly**, TS runs an extra "excess property check" that flags fields the target type doesn't know about:
```ts
interface Point2D { x: number; y: number; }

function printPoint(p: Point2D): void { /* ... */ }

printPoint({ x: 1, y: 2, z: 3 });
// Error: Object literal may only specify known properties,
// and 'z' does not exist in type 'Point2D'.

const p3d = { x: 1, y: 2, z: 3 };
printPoint(p3d); // OK - p3d isn't a fresh literal at the call site, so no excess-property check.
```

### ✅ Best Practices
- Design shared shapes (API response types, config objects) as `interface`/`type` and let unrelated parts of the codebase satisfy them structurally - you don't need every object to explicitly `implements` something.
- Use structural typing deliberately for flexible function parameters - accept "anything with these fields" instead of requiring a specific class instance.
- Remember the excess-property-check exception when literals mysteriously fail to compile even though a variable holding the "same" object would have worked.

### ❌ Avoid
- Assuming TypeScript enforces nominal identity like Java/C# - two differently-named types with the same shape are NOT distinguished by the type checker by default.
- Relying on structural compatibility for types that are conceptually different but happen to share a shape (e.g., `UserId: string` and `ProductId: string` - see "branded types" as the fix, covered in later phases) - this is a real source of bugs, passing a product ID where a user ID was expected, because both are just `string` shapes.
- Being surprised when a function accepts "too much" - that's not a bug in your interface, it's structural typing working as designed.

### 🎯 Interview insights
- This is the single most common "do you actually understand TypeScript, or did you just add annotations to JS" screening question.
- Being able to produce the "two unrelated interfaces, same shape, fully interchangeable" example on a whiteboard is a strong signal.
- Mentioning the excess-property-check nuance (why a literal fails but an equivalent variable doesn't) separates genuine experience from memorized definitions.

### 🔄 SDLC Angle
This matters most at *design* time: when you're deciding whether two conceptually different things (a `UserId` and a `ProductId`, a `DraftOrder` and a `SubmittedOrder`) should be distinct types, structural typing means "same shape" is not automatically "safe to mix up" - you may need nominal-style workarounds (branded/tagged types) to get the safety a Java/C# developer would take for granted. In *code review*, it explains why a reviewer might accept an object that was never explicitly typed as the expected interface - and why "does the shape actually match on purpose, or by coincidence" is a legitimate review question.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How is TypeScript's type system different from Java's or C#'s?"
- **Strong answer:** "TypeScript uses structural typing - it checks whether a value's shape matches what's expected, not whether it was explicitly declared to implement a particular interface. Two unrelated interfaces with identical properties are fully interchangeable. Java and C# are nominally typed - a class has to explicitly `implements` an interface to be considered compatible with it, regardless of whether its shape matches. It's a deliberate design choice, because TypeScript is modeling JavaScript, where objects are already duck-typed at runtime."
- **Level-up:** Junior answers stop at "TypeScript checks shapes"; a senior answer adds the practical consequence - that structurally-identical-but-conceptually-different types (like two different kinds of ID that are both `string`) can be accidentally interchanged, and that branded/nominal-style types are the escape hatch when that's a real risk.

---

## 3) Compile-Time Types vs Runtime JavaScript (Type Erasure)

### Concepts
- TypeScript's types exist **only** during compilation - the type checker uses them, and then `tsc` deletes them.
- The JavaScript that actually runs in Node or the browser has **zero** knowledge that TypeScript ever existed.
- Not everything TS-flavored disappears, though - some constructs generate real runtime JS (classes, enums by default), which is a common point of confusion.

📖 **Plain-English definition**: When you run `tsc` (or a bundler using TypeScript under the hood), it reads your annotated code, checks it for type errors, and then strips every type annotation, interface, and type alias away, emitting plain JavaScript as if the types had never been written. By the time your code actually runs, there is no such thing as a "type" anymore - it's a compile-time-only concept, similar to how comments never affect runtime behavior.

### Why it exists
- 🌐 JavaScript engines (V8, SpiderMonkey, etc.) have no native concept of static types - TypeScript has to compile down to something they can run, and that something is ordinary JS.
- ⚡ Because types are erased, they impose **zero runtime cost** - TypeScript's safety is entirely a development-time/build-time benefit, with no performance penalty in production.
- 🔁 Erasure is what makes TypeScript a strict *superset* of JavaScript - any valid JS is (almost) valid TS, and the compiled output is recognizable, idiomatic JS, not some parallel runtime.

### How TypeScript actually does this (behind the scenes) 🧠
`tsc` runs two largely separate jobs on your code: **type-checking** (walk the AST, build up types for every expression, flag incompatibilities) and **emit** (transform the AST into JavaScript of your target version, e.g. ES2017). Emit does not need type-checking to succeed to run (you can compile with type errors present, by default - `tsc` still emits JS unless `noEmitOnError` is set) - which is a strong hint that types are a side-channel bolted onto JS, not something the runtime output depends on.

During emit, `tsc` deletes anything that is purely a type-level construct:
- `interface` declarations - gone entirely, no trace in the output.
- `type` aliases - gone entirely.
- Type annotations on parameters/variables/return types (`: string`, `: number`) - the annotation is stripped, the underlying JS expression remains.
- Generic type parameters (`<T>`) - erased; there is no runtime representation of `T` at all (this is *why* you can't do `typeof T` or `new T()` inside a generic function).
- `as` type assertions - purely a compile-time instruction to the checker; erased with zero runtime effect (unlike a real cast in a language like Java, it performs no runtime check or conversion).

But a few TS-specific constructs generate **real, runtime-existing JavaScript**, because they're not purely type-level - they describe actual values or behavior:
- `class` - always was a real JS runtime construct (ES2015 classes exist in plain JS too); TS just adds compile-time-only decorations on top (access modifiers, parameter properties) that get erased, while the class itself compiles to a real JS class/function.
- `enum` (non-`const`) - by default, TS **generates a real JavaScript object** at runtime mapping names to values (and values back to names, for numeric enums). This is the most commonly cited "wait, this isn't erased?!" surprise. (`const enum` is inlined at usage sites and produces no object, but is discouraged in modern TS - see the note below.)

```ts
// input.ts
interface User {
  id: number;
  name: string;
}

enum Role {
  Admin,
  Member,
}

function greet(user: User, role: Role): string {
  return `${user.name} (${Role[role]})`;
}

const u: User = { id: 1, name: "Asha" };
console.log(greet(u, Role.Admin));
```

Compiled output (roughly what `tsc --target es2017` produces):
```js
// input.js
"use strict";
var Role;
(function (Role) {
    Role[Role["Admin"] = 0] = "Admin";
    Role[Role["Member"] = 1] = "Member";
})(Role || (Role = {}));
function greet(user, role) {
    return `${user.name} (${Role[role]})`;
}
const u = { id: 1, name: "Asha" };
console.log(greet(u, Role.Admin));
```
Notice: `interface User` vanished completely - there is no trace of it anywhere in the output, not even a comment. Every `: User`, `: Role`, `: string` annotation is gone. But `enum Role` turned into a real, runtime-existing JS object (an IIFE building a bidirectional lookup) - because an enum isn't purely describing a type, it's also defining actual values your code uses at runtime.

### The practical consequence: you cannot inspect types at runtime
```ts
interface Shape { kind: string; }

function isShape(x: unknown): x is Shape {
  return typeof x === "object"; // Cannot check "does this satisfy the Shape interface" -
}                               // Shape doesn't exist at runtime to check against.

// This has no meaning and won't compile:
// if (x instanceof Shape) { ... }   // Error: 'Shape' only refers to a type, but is being used as a value here.
```
`instanceof` only works against real runtime values - classes and constructor functions - never `interface`s or `type` aliases, precisely because interfaces/type aliases don't exist after compilation.

### ✅ Best Practices
- For anything you need to check at **runtime** (validating an API response, checking a discriminant at runtime), use a real runtime construct: a `class` you can `instanceof`, a string-literal `kind` field you can compare with `===`, or a runtime validation library (`zod`) - never assume an `interface` can be checked against at runtime.
- Use `class` when you need both a type *and* runtime behavior/identity; use `interface`/`type` when you only need to describe a shape at compile time.
- Prefer plain `enum` (or, more often in modern codebases, a union of string literals) over `const enum` - `const enum` requires whole-program knowledge at compile time and is incompatible with some build tools (isolated-modules bundlers), which is why many style guides discourage it.

### ❌ Avoid
- Writing `if (typeof x === "MyInterface")` or `x instanceof MyInterface` - neither means anything; interfaces have no runtime representation.
- Assuming a `type`/`interface` provides any runtime safety net for data that didn't go through the type checker (JSON from `fetch`, `JSON.parse`, user input) - types make zero runtime promises about data that TypeScript never actually checked.
- Forgetting that non-const `enum` has a real runtime cost (however small) - for a "just types" mental model, that's a surprising exception worth remembering explicitly.

### 🎯 Interview insights
- "Do TypeScript types exist at runtime?" is a very common gotcha question - the crisp answer is "no, they're fully erased, with the specific exception of `enum`, which compiles to a real object."
- Being asked to explain why `x instanceof SomeInterface` doesn't compile is a good test of whether erasure is understood concretely, not just as a slogan.
- Bring up the API-boundary implication unprompted: "TypeScript can't verify data it never actually checked, like a raw `fetch` response" - this is the detail that shows real production experience.

### 🔄 SDLC Angle
Type erasure is mostly invisible during *implementation*, but it becomes directly relevant at *integration/testing* time, specifically at any boundary where data enters the program from *outside* TypeScript's view - an HTTP response, `JSON.parse`, environment variables, a message queue payload. A type annotation on that data (`const data: User = await res.json()`) is a compile-time assertion the compiler takes on faith; the moment the actual runtime shape drifts from what the type promises (a backend API changes a field), the bug shows up in *production*, not in a compile error, because there was never a runtime check backing the type. This is exactly why teams pair TypeScript with a runtime-validation layer (`zod`, `io-ts`) at real I/O boundaries.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "If TypeScript types are erased at compile time, how would you validate the shape of data coming back from an API call?"
- **Strong answer:** "A type annotation on a `fetch` response is just telling the compiler 'trust me, this is what it looks like' - it performs no actual check, because the type doesn't exist once the code is compiled and running. To actually validate untrusted data at runtime, I'd use a schema-validation library like `zod`, parse the raw response through it, and derive the TypeScript type from that same schema, so the compile-time type and the runtime check can never drift apart."
- **Level-up:** A junior answer treats `: ResponseType` on a fetch call as if it were a safety guarantee; a senior answer immediately flags that it's not, and reaches for real runtime validation at the boundary instead - and can explain that this is a direct consequence of erasure, not just "best practice for its own sake."

---

## 4) Reading `tsconfig.json` Well Enough to Not Be Scared of It

### Concepts
- `tsconfig.json` configures **how `tsc` checks and compiles your code** - not your app's runtime behavior.
- Options split into roughly two buckets: **type-checking strictness** (`strict`, `noImplicitAny`, `strictNullChecks`, ...) and **compilation/output** (`target`, `module`, `outDir`, `lib`, ...).
- Most of a real-world `tsconfig.json` is boilerplate you can safely skim past once you know which handful of fields actually change day-to-day behavior.

📖 **Plain-English definition**: `tsconfig.json` is a settings file that tells the TypeScript compiler two separate things: how picky to be when checking your code for errors, and what kind of JavaScript to actually produce (which JS version to target, which module format, where files go). It looks intimidating mostly because most projects generate one with every option listed and commented, not because every option matters equally.

### Why it exists
- 🎛️ Different projects need different strictness levels and output targets - a brand-new strict codebase and a JS file being migrated incrementally (Phase 9) need very different settings, and a single config file is how that's controlled project-wide.
- 🧱 `tsc` needs to know what JS environment it's targeting (browser vs Node, which ECMAScript version, which module system) to emit correct, runnable output - this isn't optional metadata, it changes the actual generated code.
- 🔒 Centralizing strictness flags in one file means the whole team (and CI) enforces the same rules, instead of every file being "as strict as whoever wrote it felt like being."

### How TypeScript actually does this (behind the scenes) 🧠
`tsc` reads `tsconfig.json` once at the start of a compile and uses it to configure two independent phases: the **checker** (which options like `strict` turn on/off) and the **emitter** (which options like `target`/`module`/`outDir` control). This is why some options can be changed without ever affecting your emitted JS at all (tightening `strictNullChecks` only produces more compile errors, it never changes what `tsc` outputs for code that already passes), while others change the actual bytes of output (`target: "es5"` vs `target: "es2020"` genuinely changes how, say, an arrow function or `async`/`await` gets compiled down).

The options worth actually knowing, grouped by what they do:

**Type-checking strictness (the ones that catch real bugs):**
- `"strict": true` - the single most important flag. It's actually a bundle switch that turns on a whole family of stricter checks at once, including `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, and `alwaysStrict`. Modern TypeScript projects should default this to `true`; turning it on for an old JS-derived codebase is usually where most early "migration pain" (Phase 9) comes from.
- `"noImplicitAny": true` (implied by `strict`) - without it, a parameter/variable TypeScript can't infer a type for silently becomes `any` (see Phase 1, topic 2) instead of raising an error - which quietly defeats the entire point of using TypeScript for that code.
- `"strictNullChecks": true` (implied by `strict`) - without it, `null` and `undefined` are assignable to *every* type, meaning the compiler can never actually catch a "forgot to handle null" bug - arguably the single highest-value flag on its own.

**Compilation/output (what JS actually comes out):**
- `"target"` - which ECMAScript version to compile *down to* (e.g. `"es2020"`). Determines whether modern syntax (optional chaining, `async`/`await`) is emitted as-is or transformed into older equivalents for compatibility.
- `"module"` - which module system the emitted JS uses (`"commonjs"` for older Node, `"esnext"`/`"nodenext"` for native ES modules). Mismatching this against your runtime is a very common source of "works in the compiler, crashes when I actually run it" confusion.
- `"lib"` - which built-in type declarations to include (e.g. `"DOM"` for browser globals like `window`, `"ES2020"` for the standard library at that version). This is why `document` is a type error in a Node-only project that omits `"DOM"`.
- `"outDir"` / `"rootDir"` - where compiled `.js` files land relative to your `.ts` source tree.

**Project shape:**
- `"include"` / `"exclude"` - which files `tsc` actually looks at (commonly excluding `node_modules`, `dist`).
- `"esModuleInterop": true` - smooths over a long-standing mismatch between CommonJS's and ES modules' default-export conventions, so `import express from "express"` works even for a package that doesn't use true ES module exports.

### Example: a real-world minimal config, annotated
```jsonc
{
  "compilerOptions": {
    "target": "es2020",          // emit modern JS syntax as-is (assumes a modern Node/browser)
    "module": "commonjs",         // emit require()/module.exports (Node.js style)
    "lib": ["ES2020"],            // standard library types only - no DOM globals (this is a backend project)
    "strict": true,               // turn on the full strict-mode bundle (noImplicitAny, strictNullChecks, etc.)
    "esModuleInterop": true,      // allow default-import syntax against CommonJS packages
    "skipLibCheck": true,         // don't re-typecheck .d.ts files inside node_modules (faster builds)
    "outDir": "./dist",           // compiled .js goes here
    "rootDir": "./src"            // source .ts lives here
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ✅ Best Practices
- Start every new project with `"strict": true` - it's far easier to be strict from day one than to retrofit strictness onto a large existing codebase later (Phase 9 covers the incremental-migration story for when you can't).
- Match `"module"`/`"target"` to your actual runtime (Node version, browser support matrix) rather than copy-pasting a config from an unrelated project.
- Use `"skipLibCheck": true` in most projects - re-type-checking every third-party `.d.ts` file rarely catches real bugs in your own code and meaningfully slows down builds.

### ❌ Avoid
- Turning off `strict` (or individual strict-family flags) just to make errors go away - this doesn't fix the underlying issue, it just stops TypeScript from telling you about it.
- Treating every option in a generated `tsconfig.json` as equally important to understand - most are boilerplate/defaults; the strictness family and `target`/`module`/`lib` are the ones that actually change behavior day to day.
- Guessing at `module`/`target` and fixing mismatches by trial and error - mismatches here produce confusing runtime errors far from the actual misconfiguration.

### 🎯 Interview insights
- Being able to explain what `"strict": true` actually expands into (not just "it makes things stricter") signals real hands-on experience versus copy-pasted config.
- A common follow-up: "what's the very first thing that breaks when you turn `strict` on in an existing JS-derived project?" - the honest answer is almost always implicit `any` and unhandled `null`/`undefined`.
- Knowing the difference between a checking option (no effect on output JS) and an emit option (changes the actual output) shows you understand `tsc` has two separate jobs.

### 🔄 SDLC Angle
`tsconfig.json` is set up once at project *design/setup* time but reviewed again at real inflection points: adopting `strict` on an existing codebase is a *maintenance*-phase decision usually driven by a bug post-mortem ("we would have caught this with strictNullChecks"), and `target`/`module`/`lib` mismatches tend to surface at *deployment* time as environment-specific runtime errors (code that type-checked fine locally but throws in a runtime that doesn't support the emitted syntax or module format). It's also a legitimate, if infrequent, *code-review* topic - a PR that quietly loosens a strictness flag to make a personal file compile is a red flag that should be caught by a reviewer, not shipped.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What does `strict: true` in `tsconfig.json` actually do?"
- **Strong answer:** "It's a single switch that enables a whole family of stricter checks at once - most importantly `noImplicitAny`, which stops parameters from silently becoming `any` when TypeScript can't infer a type, and `strictNullChecks`, which makes `null` and `undefined` distinct from every other type so the compiler can actually flag a missed null check. Without `strict`, you're paying for TypeScript tooling but getting a much smaller fraction of its actual bug-catching power."
- **Level-up:** A junior answer says "it makes TypeScript stricter"; a senior answer names the specific sub-flags and can describe what breaks first when you flip `strict` on for an existing loosely-typed codebase - which signals they've actually done a migration, not just read about the flag.

---

## Hands-on (Do This)
- Take a small existing JS file (or write one) and add TypeScript types to it; intentionally introduce a shape bug (typo a property name, pass the wrong argument type) and confirm `tsc` catches it.
- Write two unrelated `interface`s with an identical shape and pass a value of one where the other is expected - confirm it compiles, then add an extra property via an object literal and watch the excess-property check fire.
- Compile a small file containing an `interface`, a `type` alias, and an `enum` with `tsc --target es2017`, and diff the input against the emitted `.js` - confirm the interface/type vanish and the enum does not.
- Create a minimal `tsconfig.json` from scratch (not generated via `--init`) with only the fields that matter (`target`, `module`, `lib`, `strict`, `outDir`, `rootDir`, `include`/`exclude`) and get a real project compiling with it.

## Exit Criteria
- You can explain, without hedging, what class of bugs TypeScript catches and what it explicitly does not.
- You can predict whether two given types are structurally compatible without needing to run `tsc` to check.
- You can point to a piece of TS code and say confidently what will and won't exist in the compiled JS output.
- You can read an unfamiliar `tsconfig.json` and identify which fields affect type-checking strictness versus which affect emitted output.

## Next
- Continue to `../PHASE 1 — Core Types & Type System Fundamentals/Readme.md`
