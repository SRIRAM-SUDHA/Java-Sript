This is a complete **TypeScript learning roadmap**, built the same way as the `../Angular` folder next to it: ordered by mental dependency (not tutorial popularity), written for someone who already codes in JavaScript and wants to actually *understand* TypeScript — not just sprinkle `: string` on things — while also building material you can use for general SDE interview prep.

> 🧭 **Scope**: modern, stable TypeScript (5.x-era syntax and the type-system features that have been standard for years — generics, unions, mapped/conditional types, utility types, decorators as used by Angular/NestJS). No bleeding-edge proposal-stage features.

---

## How to Use This for Job Search 💼

Every phase folder's `Readme.md` follows the same pattern per topic:
- 📖 **Plain-English definition** — what it is, with zero jargon.
- 🧠 **How TypeScript actually does this (behind the scenes)** — compiler/type-checker internals, not just "how to use the syntax."
- Real code examples, ✅ **Best Practices**, ❌ **Avoid**.
- 🔄 **SDLC Angle** — which phase of the software development life cycle this decision/bug/pattern actually shows up in (design, code review, testing, production/maintenance).
- 💼 **SDE Interview & Job Search Angle** — a realistic interview question, a strong spoken-answer model, and a "level-up" line on what separates a junior answer from a senior one.

Treat Phase 0-3 as "technical screen" material (you should be instantly fluent here), and Phase 6-9 as "onsite / deep-dive round" material (generics, type manipulation, tooling, and production trade-offs are where senior-vs-junior gets decided).

---

## PHASE 0 — Why TypeScript (Mindset & Setup)
_(Very short — you already know JS; this is about the shift in thinking)_
1. What problem TypeScript actually solves (and doesn't)
2. Structural typing vs nominal typing (the biggest mental shift)
3. Compile-time types vs runtime JavaScript (type erasure)
4. Reading `tsconfig.json` well enough to not be scared of it

> Goal: understand *why* TypeScript code looks the way it does, before memorizing syntax.

---

## PHASE 1 — Core Types & Type System Fundamentals
1. Primitives, arrays, tuples, enums
2. `any` vs `unknown` vs `never` vs `void` (the four most-confused types)
3. Type annotations vs type inference — when to write types, when to let TS infer
4. Literal types and `as const`

---

## PHASE 2 — Functions & Interfaces
1. Function type signatures, optional/default/rest parameters, overloads
2. `interface` vs `type` alias (the recurring interview question)
3. Optional (`?`) and `readonly` properties
4. Structural compatibility ("duck typing" with a compiler)

---

## PHASE 3 — Classes & OOP in TypeScript
1. Access modifiers (`public`/`private`/`protected`) and parameter properties
2. Abstract classes vs interfaces
3. Static members, getters/setters
4. Implementing multiple interfaces vs single inheritance

---

## PHASE 4 — Unions, Intersections & Narrowing
1. Union types (`|`) and intersection types (`&`)
2. Type guards: `typeof`, `instanceof`, `in`, custom type predicates
3. Discriminated unions (the pattern senior devs reach for constantly)
4. Exhaustiveness checking with `never`

> This is where TypeScript stops feeling like "JS with type annotations" and starts feeling like a real type system.

---

## PHASE 5 — Generics
1. Generic functions, interfaces, and classes
2. Generic constraints (`extends`)
3. Default generic parameters
4. Why generics beat `any` (and beat copy-pasted near-duplicate functions)

---

## PHASE 6 — Utility & Advanced Types
1. Built-in utility types: `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `Exclude`, `Extract`, `ReturnType`, `Parameters`
2. Mapped types (how those utility types are actually built)
3. Conditional types (`T extends U ? X : Y`) and `infer`
4. Template literal types

---

## PHASE 7 — Modules, Namespaces & Declaration Files
1. `import`/`export`, module resolution strategies
2. Declaration files (`.d.ts`) — typing untyped JS libraries
3. Namespaces (legacy, but you'll meet them in older code)
4. `unknown` third-party packages: `@types/*`, `declare module`

---

## PHASE 8 — Async TypeScript & Decorators
1. Typing `Promise<T>`, `async`/`await`, typed `fetch`/HTTP responses
2. Typed error handling patterns (no more `catch (e: any)`)
3. Decorators — what they are at the type-system level (the mechanism behind Angular's `@Component`/`@Injectable`, NestJS's `@Controller`)
4. Experimental decorators vs the newer stage-3 decorator proposal (know both exist)

---

## PHASE 9 — Tooling, Testing & Production Readiness
1. `tsconfig.json` deep dive: `strict`, `noImplicitAny`, `strictNullChecks`, and why teams turn these on
2. Typing tests (Jest/`ts-jest`), typed mocks, type-only imports
3. Migrating a JS codebase to TS incrementally (`allowJs`, `checkJs`, `// @ts-expect-error`)
4. Common anti-patterns (`any`-itis, type assertions covering real bugs, `@ts-ignore` sprawl)

---

## How We Will Learn (Important)
For each topic, we build the mental model, see *why* TypeScript's compiler is designed this way, write real code, connect it to where it shows up in the SDLC, and rehearse how to talk about it in an interview. No shallow tutorials, no copy-paste learning.
