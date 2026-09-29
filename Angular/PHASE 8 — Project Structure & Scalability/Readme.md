# PHASE 8 - Project Structure & Scalability

## Goal
Structure Angular 14 projects like real teams do: clear module boundaries, scalable folder architecture, and predictable dependency rules (Core/Shared/Feature). This phase is where many Angular devs "level up" to senior.

## Topics
1. **Angular Folder Architecture**
   - Core / Shared / Feature modules
   - Smart vs dumb components
   - Feature isolation
   - Monorepo mindset
2. **State Management (Optional but Useful)**
   - Service-based state
   - NgRx overview (conceptual)

---

## 1) Angular Folder Architecture

### Concepts
- Think in **features** first, not "components folder" first.
- A good structure makes it hard to do the wrong thing:
  - feature-to-feature imports are discouraged
  - shared UI is reusable
  - singletons are not duplicated by lazy modules

📖 **Plain-English definition**: this is organizing your code by **feature** (e.g. "orders", "profile", "billing") instead of by **type** (one giant folder of components, another of services) — each feature folder becomes a self-contained mini-app with its own pages, components, and data logic, so nothing about it is scattered across the codebase.

### ⚛️ How This Works in React (Your Mental Anchor)
- Smart vs. dumb (container vs. presentational) components map almost 1:1 to a well-known React pattern of the same name — it predates hooks (it comes out of the early Redux/Flux era, popularized by Dan Abramov), but the vocabulary and the split still hold: one component fetches/orchestrates data, another just renders props and emits events. Angular's "smart component builds a `vm$`, dumb component renders it" is the same idea with `@Input`/`@Output` standing in for props/callback props.
- The literal `core/shared/feature` folder convention doesn't have one canonical React equivalent, because React app structure is far less standardized — Create React App, Vite, and Next.js all ship with no strong opinion on this. That said, the common React convention of feature-based folders (`features/orders/`, `features/users/`, each with its own colocated components, hooks, and API calls) is solving exactly the same problem as Angular's `features/<name>/` slices: keep everything about one feature physically together instead of splitting it across global `components/`, `services/`, `hooks/` folders organized by file type.
- The real difference is *enforcement*, not vocabulary. Angular's NgModules give you compiler-level boundaries — a feature module's own lazy-loaded child injector, restricted template compilation scope, and explicit `imports`/`exports` mean a stray "feature A imports feature B directly" mistake is visible, and sometimes outright blocked, at compile time. React has no compiler concept of a module boundary — a `features/orders/` file importing directly from deep inside `features/users/` compiles and runs just fine; nothing stops it except team discipline, lint rules (e.g. `eslint-plugin-boundaries`), or code review catching it. So the folder shapes can look identical between an Angular and a React codebase, but Angular enforces the isolation mechanically while React relies entirely on convention.

🧪 **SDET / Test Automation Angle**: this structure predicts where things live when you write Page Object Models / Component Objects for E2E tests. If the app consistently follows "a feature owns its own UI + logic + data" (e.g. `src/app/features/items/...`), your E2E test suite can mirror it 1:1 (e.g. `e2e/features/items/items.page.ts`), so when a dev adds a new page under `features/items/pages/`, the tester instinctively knows to add a matching page object in the same relative spot. A codebase that instead dumps everything into one flat `components/` folder makes this mapping impossible to keep consistent, and test suites for such apps tend to rot into an unmaintainable pile as the app grows — so folder discipline in the app is really a testability property, not just a "clean code" one.

### How Angular uses it internally 🧠
- NgModules define:
  - template compilation scope (what directives/pipes are visible)
  - DI scope boundaries (especially with lazy loaded modules)
  - routing boundaries (`forRoot` vs `forChild`, `loadChildren`)
- Concretely, each lazy-loaded feature module gets its **own child injector**, created the first time its route is activated, forming a hierarchical injector tree rooted at the `AppModule`'s injector. A service provided inside a lazy module's `providers` array is scoped to that module's child injector — if two different lazy modules both list the same service in `providers`, each gets its **own separate instance**, which is the classic "why did my singleton reset" bug.
- This is exactly why `CoreModule` (imported once, only in `AppModule`) or `providedIn: 'root'` are the reliable ways to guarantee one true singleton instance app-wide — both attach the provider to the **root** injector rather than to a lazily-created child injector.

---

### A production-friendly structure (example)
```
src/app/
  app.module.ts
  app-routing.module.ts
  app.component.ts

  core/
    core.module.ts
    services/
      auth.facade.ts
      logger.service.ts
    guards/
    interceptors/
    layout/
      shell.component.ts

  shared/
    shared.module.ts
    ui/
    directives/
    pipes/

  features/
    items/
      items.module.ts
      items-routing.module.ts
      pages/
      components/
      data-access/
        items-api.service.ts
        items.facade.ts
        items.models.ts
    users/
      ...
```

---

### CoreModule pattern (singletons + shell)

#### Concepts
- `CoreModule` contains:
  - app shell/layout
  - singleton services (auth, analytics, error handling)
  - guards/interceptors
- Import `CoreModule` **once** in `AppModule` to avoid duplicate singletons.

#### Code example (import guard) ✅
`core.module.ts`:
```ts
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule | null) {
    if (parent) throw new Error('CoreModule should only be imported in AppModule');
  }
}
```

#### ✅ Best Practices
- Put interceptors/guards in core.
- Keep core small; it should not "own" feature UI.

#### ❌ Avoid
- Importing `CoreModule` into lazy loaded feature modules.

---

### SharedModule pattern (UI primitives)

#### Concepts
- Shared should contain reusable UI primitives and utilities:
  - buttons, cards, input wrappers, directives, pipes
- Shared should not usually provide singleton services.

#### Code example
`shared.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardComponent } from './ui/card.component';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [CardComponent, TruncatePipe],
  imports: [CommonModule],
  exports: [CommonModule, CardComponent, TruncatePipe],
})
export class SharedModule {}
```

#### ✅ Best Practices
- Shared exports reusable declarations + `CommonModule`.
- Keep shared stable and boring (it is used everywhere).

#### ❌ Avoid
- "Shared junk drawer" with random feature-specific code.
- Providing singletons in shared (risk of duplicate instances with lazy modules).

---

### Feature modules (domain slices)

#### Concepts
- Each feature module should own:
  - pages (route components)
  - presentational components
  - feature routing module
  - data-access services/facades/models

#### Code example (module + routing)
```ts
@NgModule({
  declarations: [ItemsPageComponent, ItemDetailsPageComponent],
  imports: [SharedModule, ItemsRoutingModule],
})
export class ItemsModule {}
```

#### ✅ Best Practices
- Lazy load major features using `loadChildren`.
- Keep feature APIs narrow (avoid exporting everything).

#### ❌ Avoid
- Feature-to-feature imports (creates tight coupling).
- Putting too much in `AppModule`.

---

### The `forRoot` pattern (when needed)

#### Concept
Some libraries need a "configure once" module:
- `SomeLibModule.forRoot(config)` in `AppModule`
- `SomeLibModule` (or `forChild`) in feature modules

This prevents multiple singleton instances and centralizes config.

### Common mistakes 🧯
- Duplicate singletons due to wrong provider location.
- Circular dependencies from features importing each other.
- `SharedModule` importing feature modules (the worst possible direction).

### 🎯 Interview insights
- Senior-level: "Core for singletons/shell, Shared for UI primitives, Feature for domain slices + lazy loading."
- Mention DI boundaries and lazy loaded module injectors.

### 🔄 SDLC Angle
Folder architecture is almost entirely a **Design-phase** decision — it gets made early, often in an architecture review before a single feature is built, precisely because it's expensive to change once dozens of features exist. It resurfaces constantly at **Code Review** time ("this belongs in `shared/`, not in this feature module", "why is a feature importing another feature directly?"), and poor choices here become a slow-burning **Maintenance** cost — circular dependencies and duplicated singletons (from services accidentally provided in a lazy module instead of `CoreModule`/root) are the kind of bugs that get rediscovered painfully months later, often during an on-call incident where "why did my singleton reset" turns into a DI-injector-tree investigation.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How would you structure a large Angular application so it stays maintainable as more teams and features get added?" (a system-design-adjacent question, common for mid/senior SDE roles even outside "Angular experts.")
- **Strong answer:** Organize by feature, not by file type: `core/` for app-wide singletons, shell, guards, and interceptors (imported once in `AppModule`); `shared/` for reusable, stateless UI primitives (no singleton providers); `features/<name>/` for self-contained domain slices with their own pages, components, routing, and data-access layer, lazy-loaded via `loadChildren`. Explicitly forbid feature-to-feature imports to avoid tight coupling, and rely on `providedIn: 'root'` (or a guarded `CoreModule`) rather than a lazy module's own `providers` array to guarantee true singletons.
- **Level-up:** A junior answer names the three folders. A senior answer explains *why* — each lazy-loaded feature module gets its own child injector, so a service listed in a lazy module's `providers` is duplicated per module (the classic "singleton isn't a singleton" bug) — and can describe how this structure scales to multiple teams working in parallel without stepping on each other's code.

---

## 2) State Management (Optional but Useful)

### Concepts
Typical progression:
1. Local component state (small)
2. Feature facade + `BehaviorSubject` (often enough)
3. NgRx (actions/reducers/effects) when complexity demands it

📖 **Plain-English definition**: state management is just deciding **where the "single source of truth" for a piece of data lives** and how the UI finds out when it changes — anywhere from "it lives in one component's field" up to "it lives in one central store that the whole app reads from and dispatches changes to."

### ⚛️ How This Works in React (Your Mental Anchor)
This is one of the cleanest 1:1 mappings in the whole Angular-to-React roadmap, worth saying plainly: **NgRx was explicitly inspired by Redux**, so the concepts transfer almost without translation.
- A `BehaviorSubject`-based Angular service (a facade holding `state$`, mutated via `.next(...)`) ~ a simple Zustand store, or a `Context` + `useReducer` setup — a single place holding state that multiple components subscribe to, without the ceremony of actions/reducers/dispatch.
- NgRx ~ Redux (+ Redux Toolkit), feature-by-feature:
  - NgRx **Store** (single state tree) ~ Redux **store** (single state tree).
  - NgRx **actions** ~ Redux **actions** — the only way to describe "something happened."
  - NgRx **reducers** (pure `(state, action) => state`) ~ Redux **reducers** — identical concept, same purity rule.
  - NgRx `store.select(selectSomething)` ~ Redux `useSelector(selectSomething)` — both are memoized, composable reads over the store.
  - NgRx `store.dispatch(loadItems())` ~ Redux `dispatch(loadItems())` — same call shape, same unidirectional flow.
  - NgRx **Effects** (side effects triggered by dispatched actions, e.g. calling an API after `loadItems` fires) ~ `redux-thunk`/`redux-saga` — both exist to keep reducers pure by pushing async work (API calls, timers) into a separate layer that listens for actions and dispatches new ones when the async work resolves.
- Both ecosystems earn the same debugging payoff for the same reason: because every state change is forced through a dispatched action and a pure reducer, NgRx DevTools and Redux DevTools both support time-travel debugging and a full action-by-action audit trail — that isn't a coincidence, it's the direct consequence of the architecture the two libraries share.

🧪 **SDET / Test Automation Angle**: centralized, inspectable state is a huge win for testers. With a facade backed by a `BehaviorSubject`, or with NgRx's store, you can often set application state directly — e.g. inject the store/facade in a test and dispatch an action or call `.next(mockState)` — to jump straight to the UI state you actually want to test (e.g. "cart with 3 items and a shipping error"), instead of performing a long, brittle sequence of UI clicks to arrive there. It also gives you a single place to assert against: instead of scraping several DOM elements to confirm the app "knows" something happened, you can assert on the emitted state/selector value directly, which is faster and less prone to breaking when the UI is restyled.

### How Angular uses it internally 🧠
- A **`BehaviorSubject`-based service store** is mechanically simple: the service holds a `BehaviorSubject<State>`, exposes it as `state$` (often via `.asObservable()`), and mutates it by calling `.next(newState)` from methods like `load()`/`save()`. Every component that injects the service and subscribes (usually via the `async` pipe) gets notified on the next `.next()` call. There's no enforced pattern for *how* the state is allowed to change — any injected consumer with a reference to the subject (or a mutation method you expose) can update it directly.
- **NgRx** is the same underlying idea (an observable stream of state) but with structure enforced around it: **one single store** for (an often app-wide) state tree, **actions** as the only way to describe "something happened," **reducers** as pure functions that compute the next state from `(state, action)`, and **selectors** as memoized, composable read queries over the store. Components dispatch actions and select slices via selectors; they never mutate state directly.
- Mechanically, NgRx's store is *itself* built on a `BehaviorSubject`-like mechanism under the hood (an RxJS-based observable state container) — so the leap from "facade + `BehaviorSubject`" to "NgRx" is less about the underlying reactivity primitive and more about NgRx forcing all writes through actions/reducers (giving you a full audit trail, replayable state, and strict unidirectional data flow) instead of allowing any consumer to call `.next()` freely.

### Real-world guidance 🧭
- Use NgRx when:
  - state is large and shared across many features
  - you have complex side effects and need strict flow
  - the team benefits from enforced patterns and tooling
- Otherwise, a facade-based approach is typically faster and simpler.

### ✅ Best Practices
- Expose `vm$`/selectors and command methods from a facade (works with or without NgRx).

### ❌ Avoid
- Picking a heavy state library just because it's popular.

### 🎯 Interview insights
- Compare options rather than declaring a winner: "Local state and a facade over `BehaviorSubject` cover most apps; NgRx earns its cost once state is large, shared across many features, and side effects get complex."

### 🔄 SDLC Angle
This is a **Design-phase** trade-off decision, usually made early based on team size and expected app complexity, but its consequences land squarely in **Maintenance**: NgRx's actions/reducers/selectors add real boilerplate up front, but that structure pays off during production incident triage — Redux/NgRx devtools give you time-travel debugging and a full audit trail of "what action fired, in what order, with what state before/after," which is invaluable when diagnosing a state bug reported days after the fact. Service-based state (a facade over `BehaviorSubject`) is faster to build and reason about short-term, but as an app grows, "any consumer can call `.next()`" can get tangled and harder to trace — a cost that shows up gradually rather than immediately, which is exactly why it's easy to underestimate at design time.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "When would you reach for NgRx instead of just a service with a `BehaviorSubject`?"
- **Strong answer:** Start local (component state), move to a feature facade backed by a `BehaviorSubject` when a few components need to share state — this covers most apps. Introduce NgRx once state is large and shared across many features, side effects are complex, or the team specifically benefits from enforced unidirectional data flow (actions as the only way to change state, pure reducers, memoized selectors) and tooling like time-travel debugging. Note that NgRx's store is mechanically still an RxJS-based observable state container — the real difference is that it forces all writes through actions/reducers instead of letting any consumer call `.next()` directly.
- **Level-up:** A junior treats this as "NgRx is always better" or "NgRx is always overkill." A senior gives concrete criteria (team size, state sharing surface, side-effect complexity) and can talk about the real maintenance trade-off: BehaviorSubject-based state is simple until an app grows and untracked mutations get hard to trace, while NgRx's boilerplate buys a debuggable audit trail that matters most in production incident response, not in day-to-day feature building.

---

## Hands-on (Do This)
- Restructure your app into Core/Shared/Feature modules.
- Lazy load one feature module.
- Move API + state logic into feature `data-access` + facade.

## Exit Criteria
- You can explain boundaries and prevent accidental singleton duplication.
- Your codebase makes feature ownership and module scope obvious.

## Next
- Continue to `../PHASE 9 — Testing & Production Readiness/Readme.md`

