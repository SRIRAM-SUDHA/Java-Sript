# PHASE 8 - Async TypeScript & Decorators

## Goal
Type asynchronous code correctly — `Promise<T>`, `async`/`await`, and HTTP responses — without lying to the compiler; handle errors the way TypeScript's stricter `catch` typing actually wants; and understand decorators deeply enough to know what `@Component`, `@Injectable`, and `@Controller` are really doing under the hood, plus why Angular 14 uses a different decorator mechanism than the one TS 5+ ships by default.

## Topics
1. **Typed Async Code**
   - `Promise<T>` typing
   - `async`/`await` typing rules
   - Typing `fetch`/HTTP responses (and the gap the compiler can't close)
2. **Typed Error Handling**
   - `unknown` in `catch` clauses
   - Narrowing errors safely
   - Custom error types
3. **Decorators (the mechanism)**
   - What a decorator actually is at runtime
   - Class, method, property, and parameter decorators
   - How Angular/NestJS use them for metadata
4. **Legacy vs Stage-3 Decorators**
   - `experimentalDecorators` (Angular 14-era)
   - TC39 stage-3 decorators (TS 5+ default)
   - What actually differs between them

---

## 1) Typing `Promise<T>`, `async`/`await`, and HTTP responses

### Concepts
- Every `async function` returns a `Promise`, whether you write `Promise<T>` in the signature or not.
- `await` only makes sense on a `Promise<T>` (or anything "thenable"); it unwraps it to `T` at the type level.
- `fetch()` typing stops being trustworthy at the exact moment you call `.json()`.

📖 **Plain-English definition**: Typing async code is telling the compiler "this function doesn't hand you the value right away — it hands you a claim ticket (`Promise<T>`), and when you `await` it, you get the actual `T`." Typing an HTTP response, though, is different — it's not a fact the compiler checked, it's a promise *you* made to the compiler about what a server will send back.

### Why it exists
- 🧾 Async code (network calls, timers, file I/O) is everywhere in real apps — without types on it, `await` results become silent `any`, defeating the entire point of TypeScript at the exact boundary where bugs are most expensive (production API contracts).
- 🔁 `Promise<T>` composes with generics, so the same typing rules that work for arrays and objects work identically for "a value that arrives later."
- 🧯 Making the gap between "the server actually sent this" and "TypeScript believes this" visible and explicit is more valuable than pretending the compiler validated it.

### How TypeScript actually does this (behind the scenes) 🧠
- When you write `async function getUser(): Promise<User> { ... }`, TypeScript checks that whatever you `return` inside the function body is assignable to `User` — but the *declared return type of the function itself*, as seen by callers, is automatically wrapped in `Promise<User>`. If you write `async function f() { return 5; }` with no annotation, TS infers `Promise<number>`, not `number` — the compiler knows `async` functions always produce a Promise and wraps the inferred type for you.
- `await expr` is a compile-time unwrap operation: if `expr` has type `Promise<T>`, then `await expr` has type `T`. If `expr` is not a Promise (a plain `number`, say), `await` is still legal in JS/TS — it just resolves to the value immediately — and the type is simply `T` unchanged. TS also unwraps *nested* promises correctly: `await` on a `Promise<Promise<T>>`-shaped value still ultimately yields `T`, matching real JS Promise-flattening behavior.
- Here's the load-bearing nuance for interviews: **`fetch()` itself is well-typed** — `fetch(url)` returns `Promise<Response>`, and `Response` is a real, correctly-typed interface (`.status`, `.ok`, `.headers`, etc., from the DOM lib typings). The typing falls apart specifically at `response.json()`. That method's signature is `json(): Promise<any>` — by design, because the DOM spec has no way of knowing what shape of JSON a given endpoint returns. So the moment you write `const data = await response.json()`, `data` is `any`, and TypeScript will let you access `data.foo.bar.baz` on it without complaint, correct or not.
- The common fix — `const data = await response.json() as User` or `const data: User = await response.json()` — does **not** ask the compiler to verify anything against the real network response. It's a type assertion: you are telling the compiler "trust me, this is a `User`," and the compiler takes your word for it at compile time with zero runtime check. If the backend actually returns `{ userId: string }` instead of `{ id: string }`, your code compiles cleanly and then throws (or worse, silently produces `undefined`) the first time it runs against the real API. This is arguably the single most common source of "but TypeScript said this was fine!" bugs in production — the type system's soundness guarantee stops exactly at the network boundary, because nothing on the other side of that boundary was ever type-checked by *this* compiler.
- Real runtime validation of an HTTP response (matching the asserted shape against the actual JSON) requires a separate runtime library (`zod`, `io-ts`, `superstruct`, or hand-written guards) — TypeScript's type system is erased at runtime (Phase 0's type-erasure point resurfaces here directly) and simply cannot perform that check itself.

### Typing async code and generics together
```ts
// A generic typed fetch helper — still just a promise you make to the compiler at the `as T` line.
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // response.json(): Promise<any> — this line is where compile-time typing
  // and runtime reality can silently diverge. TS checks nothing here.
  const data = (await response.json()) as T;
  return data;
}

interface SampleUser {
  id: string;
  displayName: string;
  createdAt: string; // ISO date string, per the (assumed) API contract
}

async function loadSampleUser(userId: string): Promise<SampleUser> {
  // Caller decides the shape; getJson<T> never verified it against the wire.
  const user = await getJson<SampleUser>(`https://api.example.test/users/${userId}`);
  console.log(user.displayName); // compiles fine — correct only if the server actually agrees
  return user;
}
```

### Narrowing the gap: a lightweight runtime check
```ts
interface SampleUser {
  id: string;
  displayName: string;
}

function isSampleUser(value: unknown): value is SampleUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    typeof (value as Record<string, unknown>).displayName === 'string'
  );
}

async function loadUserSafely(url: string): Promise<SampleUser> {
  const response = await fetch(url);
  const data: unknown = await response.json(); // stays `unknown`, not `any`, until proven

  if (!isSampleUser(data)) {
    throw new Error('Unexpected response shape from server');
  }

  return data; // TS now knows this really is SampleUser, because you proved it, not asserted it
}
```

### ✅ Best Practices
- Prefer `Promise<T>` on the function signature explicitly for anything public/exported — it documents the contract even though TS would infer it.
- Treat `response.json()` output as `unknown` first, and narrow it with a type guard (or a runtime validator like `zod`) before trusting it as `T` — especially for external/third-party APIs you don't control.
- Reserve `as T` type assertions on network data for internal APIs you trust and version together with the frontend, and even then, treat a contract change as a known risk.

### ❌ Avoid
- Asserting (`as T`) a network response shape and treating that as equivalent to validation — it is not, and the compiler cannot warn you when reality drifts.
- Forgetting `await` inside an `async` function and returning a raw `Promise<Promise<T>>`-shaped value by accident — TS often still lets this compile because Promises auto-flatten, hiding a bug that only shows up as unexpected timing.
- Writing `async` functions that never actually `await` anything meaningful — a signal the function probably didn't need to be `async` at all.

### 🎯 Interview insights
- Be ready to explain, precisely, why `response.json()` returns `Promise<any>` and not `Promise<T>` — it is a real API design decision (the DOM spec can't know your backend's schema), not an oversight.
- "TypeScript checked this" and "TypeScript verified this against reality" are different claims — interviewers listen for whether you conflate them.
- Know that `await` unwraps one level of `Promise<T>` to `T`, and that an `async function`'s return type is always implicitly `Promise`-wrapped by the compiler.

### 🔄 SDLC Angle
Deciding *how* HTTP responses get typed (raw assertions vs. a runtime validator layer) is a **design-phase** call about how much you trust a given API boundary — internal microservice you own vs. third-party integration. It becomes an **implementation** detail at the DTO boundary, and a **code-review** flag: a reviewer who sees `as SomeType` immediately after `await res.json()` should ask "is this from a trusted, versioned-together backend, or should this be validated?" In **maintenance**, an un-validated `as T` assertion is exactly the kind of bug that survives every unit test (which use mocked, correctly-shaped data) and only surfaces in production the day the backend team ships an unannounced field rename.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "If `fetch` and `async`/`await` are both properly typed in TypeScript, why do people still get runtime type errors from API calls?"
- **Strong answer:** "Because `response.json()` is typed as `Promise<any>` by design — the DOM typings can't know your backend's schema — so any type I put on the parsed result, whether via a generic or an `as` assertion, is a promise I'm making to the compiler, not something it checked against the real response. If the backend changes shape, my code still compiles and still fails at runtime. For anything I don't fully control, I add a runtime type guard or a schema validator like `zod` at the network boundary so an actual mismatch throws a clear error instead of silently producing `undefined` three calls deep."
- **Level-up:** A junior answer stops at "you have to type the response." A senior answer distinguishes compile-time type safety from runtime validation, names a concrete tool for closing that gap, and scopes *when* it's worth the overhead (external/untrusted APIs) versus when a straightforward assertion is a reasonable trade-off (an internal API versioned in lockstep with the frontend).

---

## 2) Typed error handling patterns (no more `catch (e: any)`)

### Concepts
- In modern strict-enough TypeScript, the variable bound in a `catch` clause is typed `unknown`, not `any`.
- `unknown` forces narrowing before you can use the caught value for anything.
- JavaScript lets you `throw` literally anything — a string, a number, `undefined`, a plain object — not just `Error` instances, which is exactly why `catch` can't safely assume `Error`.

📖 **Plain-English definition**: Typed error handling means the compiler refuses to let you blindly call `.message` on whatever you caught, because it genuinely doesn't know what got thrown — it makes you prove what you're holding before you're allowed to use it, the same way `unknown` works everywhere else in the type system.

### Why it exists
- 🧨 Real JS code (yours, a library's, a browser API's) can `throw` non-`Error` values — a rejected fetch, a third-party SDK, or `throw "failed"` in someone else's code are all legal JS.
- 🛡️ Typing `catch` as `any` (the old TS default) silently let bugs like `err.mesage` (typo) or `err.response.data.error` (wrong shape) compile cleanly and blow up at runtime.
- 🎯 `unknown` in `catch` is a direct, deliberate application of the same "prove it before you use it" philosophy `unknown` brings everywhere else — it's not a special case, it's consistency.

### How TypeScript actually does this (behind the scenes) 🧠
- Historically (before TS 4.4), `catch (e)` implicitly typed `e` as `any`, matching plain JS's total lack of guarantees about thrown values. This was consistent with old TS defaults but dangerous: `any` disables type checking entirely, so `e.message.toUpperCase()` compiled even if `e` was a plain string.
- TS 4.4 introduced the `useUnknownInCatchVariables` compiler option, and it is bundled into `strict: true` from that version onward. With it on, `catch (e)` (no annotation) types `e` as `unknown`. This isn't TypeScript guessing more conservatively for style points — it's a correctness fix: because `throw` in JavaScript accepts *any* value (`throw new Error(...)`, `throw 'oops'`, `throw 42`, `throw { code: 500 }` are all valid), the only honest static type for "the thing that was thrown" is `unknown`. `any` was always a lie of omission; `unknown` makes the real uncertainty visible in the type system.
- You are still legally allowed to write `catch (e: any)` explicitly — TypeScript never forbids widening a type on purpose, it only stops defaulting to it silently. But choosing that explicitly is now a visible, deliberate opt-out, which is exactly the kind of thing a code reviewer should catch.
- Because `unknown` supports no operations until narrowed, TS forces you to use a type guard — `instanceof Error`, `typeof e === 'string'`, or a custom predicate — before accessing any property. This is the same narrowing mechanic from Phase 4 (union/`unknown` narrowing), just applied at a boundary (error handling) where it matters enormously in practice.

### Example: safe error narrowing
```ts
class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return `Request failed (${err.statusCode}): ${err.message}`;
  }
  if (err instanceof Error) {
    return `Unexpected error: ${err.message}`;
  }
  if (typeof err === 'string') {
    return `Unexpected error: ${err}`;
  }
  return 'Something went wrong.';
}

async function fetchSampleData(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(`Server responded with ${response.status}`, response.status);
    }
    return await response.json();
  } catch (err: unknown) {
    // err is `unknown` here — must be narrowed before use.
    console.error(toUserMessage(err));
    throw err; // re-throw after logging, or map/return a typed result — your call
  }
}
```

### Example: a `Result<T, E>`-style alternative to throwing
```ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function safeFetchJson<T>(url: string): Promise<Result<T, Error>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { ok: false, error: new Error(`HTTP ${response.status}`) };
    }
    const value = (await response.json()) as T;
    return { ok: true, value };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { ok: false, error };
  }
}

// Caller is forced by the discriminated union to check `.ok` before touching `.value`.
async function loadThenPrint(url: string): Promise<void> {
  const result = await safeFetchJson<{ id: string }>(url);
  if (result.ok) {
    console.log(result.value.id);
  } else {
    console.error(result.error.message);
  }
}
```

### ✅ Best Practices
- Let `catch` variables stay `unknown` (the strict default) — don't reflexively annotate `catch (e: any)` just to make old-style code compile without changes.
- Always narrow with `instanceof Error` (or a custom type guard) before touching `.message`/`.stack`.
- Define custom `Error` subclasses (like `ApiError` above) for domain-specific failures so `instanceof` checks stay meaningful and specific.

### ❌ Avoid
- `catch (e: any)` as a habitual override — it silences exactly the safety `unknown` exists to provide.
- Assuming every caught value is an `Error` — a rejected `fetch` from certain environments, a thrown string, or a thrown plain object are all real possibilities you'll eventually hit.
- Swallowing errors silently (`catch { }` with no logging/rethrow) just to make a red squiggly line go away.

### 🎯 Interview insights
- Know the specific compiler flag name: `useUnknownInCatchVariables` (bundled under `strict`), and that it shipped in TS 4.4.
- Be able to explain *why* JS's "throw anything" behavior is the root cause, not just recite "catch is unknown now."
- Mention the `Result<T, E>` pattern as an alternative to exceptions for expected/recoverable failures — a common senior-level talking point about not using exceptions for control flow.

### 🔄 SDLC Angle
Which error-handling style a team standardizes on — throw-and-catch with narrowing vs. a `Result<T, E>` return-value style — is a **design-phase** decision usually baked into a shared utility (a `toUserMessage`-style mapper, or a `safeFetchJson` helper) so every feature team follows it consistently. It surfaces heavily at **code review** time: an unguarded `err.message` inside a `catch` block, or an explicit `catch (e: any)`, are exactly the kind of one-line findings that prevent a real production incident (an unhandled non-`Error` throw crashing a request handler) from ever reaching **deployment**.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why does TypeScript type the variable in a `catch` block as `unknown` instead of `Error`?"
- **Strong answer:** "Because JavaScript's `throw` statement doesn't enforce that you throw an `Error` — you can throw a string, a number, or a plain object, and all of that is completely legal at runtime. If TypeScript assumed `Error`, you'd get a false sense of safety and crash the moment something threw a string. `unknown` is the honest type — it forces me to narrow with `instanceof Error` or a custom guard before I touch `.message`, which is the same discipline `unknown` enforces everywhere else in the type system."
- **Level-up:** A junior answer memorizes "catch variables are unknown now." A senior answer connects it back to *why* (JS's throw semantics), names the actual compiler flag (`useUnknownInCatchVariables`), and can describe an alternative pattern (`Result<T, E>`) for cases where exceptions aren't the right control-flow tool at all.

---

## 3) Decorators — the mechanism behind `@Component`, `@Injectable`, `@Controller`

### Concepts
- A decorator is a function, applied with `@decoratorName` syntax, that TypeScript (or the JS runtime, post-compilation) calls automatically at class-definition time.
- Decorators can target a class, a method, an accessor, a property, or a parameter.
- Unlike everything else covered in this TypeScript curriculum so far, decorators are **not erased** at compile time — they produce real function calls in the emitted JavaScript.

📖 **Plain-English definition**: A decorator is a label you stick on a class (or a piece of it) that actually *does something* — it's a function the compiler quietly calls for you, handing it the thing you labeled, so that function can read it, wrap it, or attach hidden extra information to it, all before your code ever runs.

### Why it exists
- 🏷️ Frameworks need a clean way to attach metadata to a class ("this class is a component," "this class is injectable," "this route handler belongs to this controller") without polluting the class body itself with boilerplate registration calls.
- 🔌 It gives framework authors (Angular, NestJS) a single, consistent hook to intercept class/method/property definition and wire up their own runtime behavior (dependency injection, routing tables, validation) around ordinary-looking classes.
- 🧩 It replaces older, uglier patterns (manually calling `SomeFramework.register(MyClass, { ...config })` after every class) with declarative syntax that reads top-to-bottom with the class it describes.

### How TypeScript actually does this (behind the scenes) 🧠
- This is the single most important thing to internalize about decorators, and it's a direct contrast to everything else in Phases 0-7: type annotations, generics, interfaces — all of that is **erased** at compile time, producing plain JS with zero trace of the types. Decorators are different. A decorator is a **real function call that survives compilation** and executes at class-definition time (when the JS engine defines the class, which happens once, as the module loads — not once per instance).
- Mechanically (legacy/experimental model, which is what Angular 14 uses): a class decorator is a function that receives the class constructor itself as its argument. A method decorator receives three arguments — the target (the class prototype for an instance method, or the constructor for a static one), the method's name, and a `PropertyDescriptor` (the same object `Object.defineProperty` uses — it has `value`, `writable`, `enumerable`, `configurable`). Because the decorator receives the actual descriptor, it can **read** the original method/value and then **return a new descriptor**, effectively replacing or wrapping the thing it decorated — this is exactly how libraries build a `@memoize` or `@debounce`-style decorator: wrap the original function, return a new descriptor whose `value` is the wrapped version.
- This is precisely why `@Component({ selector: 'app-root', template: '...' })` works: `Component(...)` is a **decorator factory** — a plain function that takes your config object and *returns* the actual decorator function. That returned function, when Angular's compiler and the emitted JS both run it against your class, doesn't just note the config and discard it — it uses the `reflect-metadata` library (a polyfill for a metadata-reflection API) to literally attach that config object to the class as metadata, retrievable later at runtime via `Reflect.getMetadata('...', YourClass)`. Angular's own internals then read that metadata when it needs to know your component's selector, template, and providers. `@Injectable()` does something structurally identical but for DI: it marks the class as constructible by Angular's injector and records what needs to be injected into its constructor.
- Concretely, a class decorator compiles (under `experimentalDecorators`) into something functionally like:
  ```js
  class Greeter { /* ... */ }
  Greeter = __decorate([SomeDecorator(config)], Greeter);
  ```
  — a genuine function call, executed once, immediately after the class is defined, that can replace `Greeter` with a modified version. This is why decorators can do things type annotations fundamentally cannot: they run code, at a real point in program execution, with the power to observe and alter the class.

### Example: a small custom decorator (method decorator, legacy model)
```ts
// tsconfig.json needs: "experimentalDecorators": true (Angular 14's default mode)

function logCall(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]) {
    console.log(`[call] ${propertyKey}(${JSON.stringify(args)})`);
    const result = originalMethod.apply(this, args);
    console.log(`[return] ${propertyKey} ->`, result);
    return result;
  };

  return descriptor;
}

class SamplePricingService {
  @logCall
  calculateTotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }
}

new SamplePricingService().calculateTotal(19.99, 3);
// logs the call and the return value — the decorator wrapped the real method.
```

### Example: how this maps to Angular's `@Injectable`
```ts
// This is conceptually what @Injectable()/@Component() do — attach retrievable
// metadata to a class via a class decorator factory, using reflect-metadata.
import 'reflect-metadata';

function SampleService(config: { scope: 'singleton' | 'transient' }) {
  return function (target: new (...args: unknown[]) => unknown): void {
    Reflect.defineMetadata('sample:service-config', config, target);
  };
}

@SampleService({ scope: 'singleton' })
class SampleOrdersService {
  placeOrder(orderId: string): void {
    console.log(`Order ${orderId} placed.`);
  }
}

// A framework's internals could later do:
const config = Reflect.getMetadata('sample:service-config', SampleOrdersService);
console.log(config); // { scope: 'singleton' } — retrieved at runtime, not compile time
```

### ✅ Best Practices
- Keep custom decorators narrow and single-purpose (logging, memoization, metadata) — don't build a decorator that silently changes a method's behavior in a surprising way.
- Remember decorators execute once, at class-definition time (for class/method/property decorators) — don't put per-call-expensive logic directly in the decorator factory itself, only in the wrapper it returns.
- When reading Angular/NestJS code, mentally translate `@Something({...})` to "a function ran, attached metadata, and possibly wrapped this" — it de-mystifies a huge amount of "magic" framework behavior.

### ❌ Avoid
- Assuming decorators are compile-time-only sugar like type annotations — they are not, and treating them that way leads to real confusion about *when* code in a decorator actually executes.
- Writing decorators that mutate shared/global state as a side effect of merely being applied — makes module load order matter in ways that are hard to debug.
- Stacking many decorators on one target without understanding their application order (they apply bottom-up for the same declaration in the legacy model) — order can matter and is easy to get backwards.

### 🎯 Interview insights
- The line that shows real understanding: "decorators are not erased — they're real function calls that run at class-definition time," directly contrasted with types being erased.
- Be able to name the actual arguments a legacy method decorator receives: target, property key, `PropertyDescriptor`.
- Know that `@Component`/`@Injectable` rely on `reflect-metadata` to attach and later retrieve metadata — this is *the* mechanism question interviewers use to separate "used Angular" from "understands Angular."

### 🔄 SDLC Angle
Whether to reach for a custom decorator at all is usually an **architecture/design-phase** decision (is this cross-cutting behavior — logging, caching, validation — common enough across many classes to justify a decorator, versus just writing it inline once). Using framework-provided decorators correctly (`@Component`, `@Injectable`, `@Controller`) is mostly an **implementation** and **code-review** concern — a reviewer checks that the metadata passed to the decorator (selectors, providers, DI tokens) is correct and complete, since a subtly wrong decorator config (a missing `providedIn`, a wrong selector) tends to fail at runtime in ways TypeScript's type checker cannot catch, showing up as a **testing**-phase or even **production** surprise.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What is a decorator actually doing under the hood when you write `@Injectable()` above an Angular service class?"
- **Strong answer:** "`Injectable(...)` is a decorator factory — a function that takes a config object and returns the real decorator function. That returned function receives the class itself and, using `reflect-metadata`, attaches metadata to it — marking it as constructible by Angular's DI system and recording its dependencies. This isn't a compile-time-only annotation like a type; it's a real function call that the compiled JavaScript actually executes once, when the class is defined, which is why decorators can modify or wrap what they're applied to."
- **Level-up:** A junior answer says "it registers the service with Angular." A senior answer explains the actual mechanism — decorator factories, the arguments a decorator receives, `reflect-metadata`, and the fact that this is a runtime mechanism unlike type erasure — and can point to a concrete custom decorator they've written or read.

---

## 4) Legacy (experimental) decorators vs. TC39 stage-3 decorators

### Concepts
- TypeScript originally shipped decorators years before they were a real, standardized JavaScript proposal — that original implementation is the "legacy" or "experimental" model, gated behind `experimentalDecorators: true`.
- JavaScript's own standards body (TC39) later designed and advanced its own decorator proposal, which reached **stage 3** and is now what TypeScript 5.0+ supports **by default**, with a different runtime shape.
- Angular 14 (and most frameworks built before ~2023) is built on the legacy model — this matters directly for anyone learning Angular 14 alongside TypeScript today.

📖 **Plain-English definition**: There are two, not fully compatible, versions of "decorators" in the TypeScript/JavaScript world — an older one TypeScript invented on its own before JS officially had decorators (which Angular is built on), and a newer, official one that JavaScript itself now defines and that modern TypeScript defaults to.

### Why it exists
- 📜 TypeScript needed decorators for Angular (and other early adopters) years before TC39 finished standardizing anything — so TS shipped its own experimental version, clearly labeled "experimental" from the start, knowing the real spec might differ.
- 🏛️ TC39's stage-3 proposal was designed to be usable by plain JavaScript (no compiler required, works with Babel or native runtimes), with a cleaner, more restricted API — a goal the older, TS-specific model was never designed around.
- 🔄 TypeScript couldn't silently switch everyone over — the two models have different calling conventions and semantics, so both had to be supported, with an explicit flag choosing between them.

### How TypeScript actually does this (behind the scenes) 🧠
- **Legacy/experimental decorators** (`"experimentalDecorators": true` in `tsconfig.json`, the mode Angular 14-era apps use): a method decorator receives `(target, propertyKey, descriptor)` as covered in the previous topic, and relies heavily on the separate `reflect-metadata` package/polyfill for attaching and reading arbitrary metadata (this is *not* part of the ECMAScript spec at all — it's a TypeScript-era convention plus a userland library). Class decorators receive the constructor and may return a new constructor to replace it. This model was never an official part of JavaScript — it only ever existed because TypeScript (and Babel, via a plugin) implemented it directly, ahead of any real standard.
- **Stage-3 decorators** (the ECMAScript-standardized proposal, which is what TypeScript 5.0+ implements when `experimentalDecorators` is left off/false): the API is different and more restrictive by design. A class member decorator receives `(value, context)` — not `(target, propertyKey, descriptor)` — where `context` is a plain object carrying `{ kind, name, addInitializer, ... }` describing what's being decorated, rather than a raw `PropertyDescriptor`. Class decorators can now also use `addInitializer` to register logic that runs once an instance is constructed. Crucially, this version has **no dependency on `reflect-metadata`** and no dependency on TypeScript's compiler at all — it's implementable by plain JS engines and by Babel independently, because it's a real part of the language now (stage 3 means "the spec is stable, implementations are landing, and it's expected to reach stage 4/final").
- The practical consequence for anyone learning Angular 14 specifically: **Angular 14 uses `experimentalDecorators: true`** (it's set in the Angular CLI's generated `tsconfig.json` automatically) and relies on `reflect-metadata`. Newer TypeScript projects that don't need Angular's specific decorator model (a fresh non-Angular TS 5+ project, for instance) get stage-3 decorators by default with no flag needed and no `reflect-metadata` dependency. The two are not source-compatible — a decorator written against one model's calling convention will not "just work" if a project's config assumes the other, which is why frameworks migrate deliberately and slowly (as of TS 5.x, Angular has not fully migrated off the legacy model app-wide, precisely because of how deeply `reflect-metadata`-based DI metadata is baked into its architecture).
- Interview-relevant nuance: this is *not* "one is right and one is deprecated garbage." The legacy model is explicitly labeled experimental and was always understood as a stepping stone; the stage-3 model is the real, converged standard. But "standard" doesn't mean "what your Angular 14 codebase uses today" — a very large amount of real, currently-shipping enterprise code (Angular, older NestJS setups) is legacy-model code, so both are worth knowing cold.

### Example: the same idea, two calling conventions
```ts
// --- Legacy / experimentalDecorators: true (Angular 14's model) ---
function LegacyLog(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (this: unknown, ...args: unknown[]) {
    console.log(`[legacy] calling ${propertyKey}`);
    return original.apply(this, args);
  };
}

class LegacyExample {
  @LegacyLog
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}
```

```ts
// --- Stage-3 decorators (TS 5+ default, no experimentalDecorators flag) ---
function StageThreeLog<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const methodName = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`[stage-3] calling ${methodName}`);
    return target.call(this, ...args);
  };
}

class StageThreeExample {
  @StageThreeLog
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}
```
Notice the shape difference: legacy receives `(target, propertyKey, descriptor)` and mutates/returns a `PropertyDescriptor`; stage-3 receives `(originalFunction, context)` and simply returns a replacement function directly — no `PropertyDescriptor` object at all, and `context` carries structured info (`context.name`, `context.kind`) instead of separate positional arguments.

### ✅ Best Practices
- Check a project's `tsconfig.json` for `experimentalDecorators` before writing any decorator — writing stage-3-shaped code against a legacy-configured project (or vice versa) simply won't compile/behave correctly.
- When working in Angular 14, assume the legacy model and `reflect-metadata` conventions everywhere; don't try to "modernize" decorator syntax mid-project without understanding this is a breaking, framework-wide change.
- If starting a brand-new, non-Angular TypeScript 5+ project that wants decorators, prefer leaving `experimentalDecorators` off and using the standardized stage-3 model — it's the actual JavaScript standard going forward.

### ❌ Avoid
- Assuming "decorators" is one single, universal API — copy-pasting a decorator snippet from a stage-3-oriented blog post into an Angular 14 codebase (or the reverse) will fail confusingly.
- Calling the legacy model "deprecated" dismissively in an interview — it's experimental/pre-standard, but it's what most currently-deployed Angular and older NestJS code runs on; both are current, real-world knowledge.
- Forgetting that `reflect-metadata` must be imported once, globally (usually at the very top of `main.ts` in an Angular app), for legacy metadata-reading decorators to work at all — a missing import here causes confusing "metadata is undefined" runtime errors.

### 🎯 Interview insights
- Know the flag name cold: `experimentalDecorators` in `tsconfig.json`, and that it's `true` in Angular's default generated config.
- Be able to state the one-line distinguishing fact: legacy decorators use `(target, key, descriptor)` and `reflect-metadata`; stage-3 decorators use `(value, context)` and need neither a compiler flag nor `reflect-metadata`.
- Mentioning that this is a live, ongoing transition in the JS ecosystem (not ancient history) signals you're tracking the language's evolution, not just one framework's API surface.

### 🔄 SDLC Angle
Which decorator model a codebase uses is fundamentally a **project-setup/design-phase** decision baked into `tsconfig.json` at the very start of a project's life (or inherited wholesale from a framework's CLI, as with Angular) — it is exceptionally disruptive to change mid-project because so much framework internals (DI, routing metadata) depend on it, so it's not a decision revisited casually later. In **code review**, the practical concern is consistency: a decorator written against the wrong model's calling convention is usually a compile error, not a subtle bug, so this mostly self-enforces — the real review value is making sure new team members understand *which* model they're in before they try to write custom decorators from a tutorial that assumes the other one.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Angular uses decorators like `@Component`. Are those the same decorators that plain modern JavaScript now has?"
- **Strong answer:** "Not exactly — Angular is built on TypeScript's original, pre-standard decorator implementation, enabled by `experimentalDecorators: true`, which relies on a separate `reflect-metadata` library and passes a method decorator `(target, propertyKey, descriptor)`. Actual standardized JavaScript decorators — the TC39 stage-3 proposal, which TypeScript 5+ supports by default — have a different shape, `(value, context)`, don't need `reflect-metadata`, and work in plain JS engines without a compiler. Angular hasn't fully migrated to the new model because its DI system is deeply built around the old metadata-reflection approach."
- **Level-up:** A junior answer says "decorators are decorators." A senior answer names both models explicitly, states the actual calling-convention difference, and explains *why* a large framework like Angular can't casually swap one for the other — showing they understand this as an ecosystem-level migration, not a syntax detail.

---

## Hands-on (Do This)
- Write a `getJson<T>(url)` helper, then deliberately break the assumed shape (rename a field) and observe TypeScript stay silent while the code fails at runtime — feel the gap firsthand.
- Add a runtime type guard (or `zod` schema) in front of one of your own `fetch` calls and confirm it now throws a clear, early error instead of an `undefined`-deep-in-the-UI bug.
- Write a `toUserMessage(err: unknown)` helper with `instanceof Error` narrowing, and a custom `Error` subclass to narrow against.
- Write one custom legacy-style method decorator (`experimentalDecorators: true`) that logs calls, and (separately, in a project without that flag) the stage-3 equivalent — compare the two signatures side by side.

## Exit Criteria
- You can explain, without hedging, why `response.json()` is `Promise<any>` and what an `as T` assertion does and does not guarantee.
- You can write and correctly narrow a `catch (e: unknown)` block without reflexively typing it `any`.
- You can describe what a decorator actually receives and does at runtime, and state the concrete API difference between legacy (`experimentalDecorators`) and stage-3 decorators.

## Next
- Continue to `../PHASE 9 — Tooling, Testing & Production Readiness/Readme.md`
