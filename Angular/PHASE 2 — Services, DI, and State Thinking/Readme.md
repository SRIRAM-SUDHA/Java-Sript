# PHASE 2 - Services, DI, and State Thinking

## Goal
Learn Angular's Dependency Injection (DI) deeply, adopt service-first architecture, and use RxJS the "Angular way" (async pipe + facades + predictable streams) for production apps and interviews.

> 🧭 Constraint reminder: Angular 14, NgModule-based. No standalone APIs, no signals, no Angular 16+ features.

## Topics
1. **Dependency Injection (Very Important)**
   - Providers + injection scopes
   - `providedIn: 'root'`
   - Avoiding common DI anti-patterns
2. **Services (Business Logic Layer)**
   - Singleton services and app-wide state
   - Data sharing patterns
   - Facade pattern (Angular style)
3. **RxJS Essentials (Angular-Focused)**
   - Observable vs Promise (practically)
   - Operators: `map`, `switchMap`, `mergeMap`
   - `Subject`, `BehaviorSubject`
   - `async` pipe usage
   - Memory leak prevention (unsubscribe patterns)

---

## 1) Dependency Injection (Very Important)

### Concepts
- **DI** means you *declare* what you need (constructor params), and Angular *provides* it.
- A **provider** tells Angular: "when someone asks for token X, create/return Y."
- A **token** is usually a class (e.g., `HttpClient`), but can also be an `InjectionToken<T>`.

📖 **Plain-English definition**: Dependency Injection means a component/service doesn't build the things it needs itself — it just says "I need a Logger" in its constructor, and Angular hands it a ready-made one, the way a hotel front desk hands you a room key instead of you building your own room.

### ⚛️ How This Works in React (Your Mental Anchor)
React's rough equivalent is Context (`useContext`) for handing an instance down a tree without prop-drilling — but that's where the similarity ends. Context is entirely manual: you create the context, you wrap a `<Provider>` yourself somewhere in the tree, and every consumer must sit inside that provider or it gets the default (or nothing). Angular's DI is automatic once a service is registered (`providedIn: 'root'`): any class anywhere just declares the dependency and Angular resolves it by walking the injector hierarchy — there's no provider tree you have to wire by hand, and no real React parallel to that automatic, hierarchy-based resolution.

```jsx
// React: you build and wire the provider yourself
const LoggerContext = createContext(null);
function App() {
  return (
    <LoggerContext.Provider value={new ConsoleLogger()}>
      <Page />
    </LoggerContext.Provider>
  );
}
function Page() {
  const logger = useContext(LoggerContext); // only works because App wrapped it manually
}
```

🧪 **SDET / Test Automation Angle**: DI is the single most important concept for writing fast, deterministic tests instead of always reaching for full E2E. Because components/services declare *what* they need rather than *how* to construct it, you can override any provider in `TestBed.configureTestingModule({ providers: [{ provide: UsersService, useValue: mockUsersService }] })` and the component under test never knows the difference. This lets you replace real `HttpClient` calls, real auth services, or real date/clock providers with test doubles — no real network calls, no flaky backend dependency, no waiting on a real server in your unit/integration test suite. Save the real service wiring for a smaller number of true E2E tests.

### Why it exists
- ✅ Testability: you can swap implementations with mocks/fakes.
- ✅ Separation of concerns: components don't construct services.
- ✅ Lifecycle + scoping: you can have singleton services or per-component/per-module services.

### How Angular uses it internally (mental model) 🧠
Think of DI as a tree of injectors:
- **Root injector**: created when the app bootstraps (`AppModule`).
- **Module injectors**: especially relevant with lazy loaded modules (they can have their own provider scope).
- **Element injectors**: created per component node when you use `providers`/`viewProviders` on a component.

When Angular creates a component/service:
1. It looks at the constructor parameter types/tokens.
2. It searches the injector hierarchy (closest first).
3. It creates the dependency if needed (respecting provider strategy).
4. It caches it according to scope.

Key consequence:
- A provider on a **component** usually means **new instance per component instance** (scoped service).
- A provider on a **module/root** usually means **singleton for that injector scope**.

Concretely, Ivy implements this hierarchy as a chain of **injector records** attached to internal data structures: a component with its own `providers` gets a **NodeInjector** entry stored on that component's `LView`/`TView`, while root/module-level services live in the **ModuleInjector** (formed from `providedIn: 'root'` or `NgModule.providers`). Token resolution walks the NodeInjector chain outward (child component → parent component → ... ) before falling back to the ModuleInjector chain, and whichever injector first satisfies the token **creates the instance once and caches it on itself** — that's why the same token can resolve to different instances depending on where in the tree you ask from, and why caching is scoped per-injector, not global.

### Code examples

#### Basic service injection
`users.service.ts`:
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UsersService {
  getUserDisplayName(id: string): string {
    return `User(${id})`;
  }
}
```

`user-page.component.ts`:
```ts
import { Component } from '@angular/core';
import { UsersService } from './users.service';

@Component({
  selector: 'app-user-page',
  template: `<h1>{{ name }}</h1>`,
})
export class UserPageComponent {
  name = this.users.getUserDisplayName('42');
  constructor(private readonly users: UsersService) {}
}
```

#### Provider strategies: `useClass`, `useValue`, `useFactory`
`logger.ts`:
```ts
import { InjectionToken } from '@angular/core';

export interface Logger {
  log(message: string): void;
}

export const LOGGER = new InjectionToken<Logger>('LOGGER');
```

`app.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LOGGER, Logger } from './logger';

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [
    { provide: LOGGER, useClass: ConsoleLogger },
    { provide: 'API_BASE_URL', useValue: 'https://api.example.com' },
    {
      provide: 'FEATURE_FLAGS',
      useFactory: () => ({ enableNewCheckout: false }),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

`some.component.ts`:
```ts
import { Component, Inject } from '@angular/core';
import { LOGGER, Logger } from './logger';

@Component({ selector: 'app-some', template: `...` })
export class SomeComponent {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {
    this.logger.log('hello');
  }
}
```

#### Scoping: module vs component providers
`counter.service.ts`:
```ts
import { Injectable } from '@angular/core';

@Injectable()
export class CounterService {
  value = 0;
  inc(): void {
    this.value++;
  }
}
```

`counter-a.component.ts`:
```ts
import { Component } from '@angular/core';
import { CounterService } from './counter.service';

@Component({
  selector: 'app-counter-a',
  template: `A: {{ counter.value }} <button (click)="counter.inc()">+</button>`,
  providers: [CounterService], // ⚠️ new instance per component instance
})
export class CounterAComponent {
  constructor(public readonly counter: CounterService) {}
}
```

### ✅ Best Practices
- Prefer `@Injectable({ providedIn: 'root' })` for true singletons (tree-shakable).
- Use `InjectionToken<T>` for non-class dependencies (config, feature flags, adapters).
- Use component `providers` intentionally for *scoped state* (e.g., wizard state per page instance).
- Learn injection modifiers for debugging scope issues:
  - `@Optional()`, `@Self()`, `@SkipSelf()`, `@Host()`

### ❌ Avoid
- Newing up services (`new UsersService()`) inside components. DI exists so you don't do this.
- Putting app-wide singletons in `SharedModule` providers (can duplicate with lazy loaded modules).
- Using `any` tokens or string tokens for most things (prefer `InjectionToken`).

### Common mistakes
- "Why do I have two instances of my service?" Usually:
  - service provided in a lazy-loaded module vs root, OR
  - service provided at component level unintentionally.
- "Provider not found" errors:
  - you forgot to import a module that provides it (e.g., `HttpClientModule`), OR
  - you injected an interface (TypeScript interface is erased at runtime) instead of an `InjectionToken`.

### 🎯 Interview insights
- Explain injector hierarchy clearly. A senior answer mentions *component providers* and *lazy module boundaries*.
- Explain why `providedIn: 'root'` is preferred: tree-shakable + one clear singleton scope.

### `inject()` — the Angular 14 alternative to constructor injection 🆕

📖 **Plain-English definition**: `inject()` is a standalone function (from `@angular/core`) that fetches a dependency from the current injector *right where you call it*, instead of declaring it as a constructor parameter. It's the same DI system underneath — same tokens, same injector hierarchy, same scoping rules — just a different syntax for *asking* for the dependency, one that works in places a constructor doesn't fit naturally (field initializers, factory functions, and other non-class or non-constructor contexts).

### ⚛️ How This Works in React (Your Mental Anchor)
There's no real React equivalent to `inject()` — React has no dependency injection system to hook into in the first place. The closest mental match is calling a custom hook (`const logger = useLogger()`) to grab something inside a function body instead of receiving it as a parameter/prop, but that hook is just reading from React Context under the hood, not resolving a token from an injector hierarchy — treat the analogy as "a function call instead of a parameter," not as "React secretly has DI too."

```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Field-initializer style: no constructor needed at all.
@Injectable({ providedIn: 'root' })
export class ItemsApiService {
  private readonly http = inject(HttpClient);

  listItems() {
    return this.http.get('/api/items');
  }
}
```

```ts
// A useFactory provider is a plain function — there's no constructor to inject into,
// so inject() is the natural fit here (this still runs inside Angular's injection context).
import { LOGGER } from './logger';

export function loggerFactory() {
  const isProd = inject('IS_PRODUCTION' as any);
  return isProd ? new SilentLogger() : new ConsoleLogger();
}
```

⚠️ **When to still prefer constructor injection**: for ordinary components and services, constructor injection remains the clearer, more idiomatic default in Angular 14 — the dependency list is visible in one place, and it reads the way most Angular code in this codebase (and most tutorials/interview expectations) already does. Reach for `inject()` specifically when a constructor isn't available or isn't natural: field initializers that need a dependency before the constructor body runs, `useFactory` provider functions, route guard/resolver functions, or small reusable helper functions that need to grab a service without becoming a full injectable class. Don't rewrite existing constructor-injected services just to look "modern" — both forms resolve from the exact same injector tree.

🧪 **SDET / Test Automation Angle**: `inject()` doesn't change how you test DI-based code at all — it still resolves from whatever injector is active, so `TestBed.configureTestingModule({ providers: [{ provide: HttpClient, useValue: mockHttpClient }] })` overrides it exactly the same way it overrides a constructor-injected dependency. One thing to know: `inject()` only works inside an active "injection context" (constructor, field initializer, factory function run by Angular, etc.) — if you ever see `NG0203` in a test, it usually means a helper using `inject()` was called manually outside that context rather than being resolved by Angular/TestBed itself.

### 🔄 SDLC Angle
DI scoping is the concept most likely to be a **Design-phase** decision that outlives the sprint it was made in — deciding what's a root singleton vs. a component-scoped service gets baked into the architecture early (which services own shared state, which need per-instance isolation) and is expensive to change later because consumers throughout the app come to assume a given scope. It also resurfaces at **Code Review** (is a new provider accidentally re-scoped inside a lazy module?) and at **Maintenance/on-call** — the classic "why are there two instances of this service" bug is usually a production symptom of a scoping decision made much earlier.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Walk me through what happens when Angular resolves a constructor dependency, and describe a real bug that comes from misunderstanding injector scope."
- **Strong answer:** Angular walks the injector hierarchy outward from the closest injector (the component's own NodeInjector, if it has `providers`, then up through parent components, then the module/root ModuleInjector), and whichever injector first satisfies the token creates and caches the instance on itself. A service provided in both a lazy-loaded feature module and root ends up with two separate cached instances, which explains the classic "state isn't shared between these two pages" bug that only shows up once a feature module goes live.
- **Level-up:** A junior answer treats DI as "constructor injection lets you swap in mocks for tests"; a senior answer explains the injector-hierarchy caching mechanics well enough to diagnose a duplicate-instance bug from first principles, and knows when `inject()` is the pragmatic choice (field initializers, factory providers, guard/resolver functions) without treating it as a wholesale replacement for constructor injection.

---

## 2) Services (Business Logic Layer)

### Concepts
- Services are where you put:
  - API calls (via `HttpClient`)
  - state management (cache, store-ish state)
  - orchestration logic (combine streams, derive view models)
- Components should mostly orchestrate UI, not business rules.

📖 **Plain-English definition**: A service is just a plain class that holds logic or data that isn't tied to any one screen — think of it as the "backend of your frontend," where the actual rules and API calls live, separate from the buttons and templates that display them.

### ⚛️ How This Works in React (Your Mental Anchor)
The closest React pattern is a plain module-level singleton — a non-component file that exports functions and/or mutable state, imported directly wherever it's needed — or a Context-provided object shared down the tree. Put simply: an Angular service is basically "a Context value that also happens to have DI-managed lifecycle" — Angular creates it once and caches it for you (`providedIn: 'root'`), whereas in React you either rely on module-scope caching yourself or wire the singleton into a provider by hand.

```ts
// React: plain module-level singleton, no framework involved
let cachedService = null;
export function getUsersService() {
  if (!cachedService) cachedService = createUsersService();
  return cachedService;
}
```

🧪 **SDET / Test Automation Angle**: Because business logic and API calls live in a service (not scattered across components), you can unit-test that logic in complete isolation — instantiate the service directly or via `TestBed`, inject a mocked `HttpClient`/`ItemsApiService`, and assert on the service's outputs without ever rendering a component or touching the DOM. For component tests, you go one level up: mock the *facade* (e.g., `{ provide: ItemsFacade, useValue: fakeFacade }`) so the component test only verifies "does this component render/react correctly to `loading$`/`items$`/`error$`," which is faster and far less brittle than driving the same scenario through a full E2E flow hitting a real backend.

### Why it exists
- Keeps components small and focused on rendering.
- Makes logic reusable and testable.
- Enables clear boundaries for team ownership (domain services).

### How Angular uses it internally 🔍
- Services are plain classes; Angular instantiates them via DI.
- A singleton service effectively becomes a shared runtime "module" for your app.
- Instantiation is **lazy**: a `providedIn: 'root'` service isn't created at app bootstrap — it's constructed the first time some component/service actually injects it, and the resulting instance is cached on the root injector's provider record for the rest of the app's lifetime. This lazy-and-cached behavior is also what makes a facade's `BehaviorSubject` state effectively act like a lightweight in-memory store: every consumer that injects the same singleton facade shares the exact same subject instance.

### Real-world patterns 🧰

#### A) Data service (talks to backend)
`items.api.ts`:
```ts
export interface ItemDto {
  id: string;
  title: string;
}
```

`items-api.service.ts`:
```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemDto } from './items.api';

@Injectable({ providedIn: 'root' })
export class ItemsApiService {
  constructor(private readonly http: HttpClient) {}

  listItems(): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>('/api/items');
  }
}
```

#### B) Facade service (component-friendly API + state)
Goal: components consume a *stable Observable API* and call methods for actions.

`items.facade.ts`:
```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ItemsApiService } from './items-api.service';
import { ItemDto } from './items.api';

interface ItemsState {
  loading: boolean;
  items: ItemDto[];
  error: string | null;
}

const initialState: ItemsState = { loading: false, items: [], error: null };

@Injectable({ providedIn: 'root' })
export class ItemsFacade {
  private readonly stateSubject = new BehaviorSubject<ItemsState>(initialState);
  readonly state$ = this.stateSubject.asObservable();

  readonly items$: Observable<ItemDto[]> = this.state$.pipe(
    map((s) => s.items),
    distinctUntilChanged()
  );

  readonly loading$: Observable<boolean> = this.state$.pipe(
    map((s) => s.loading),
    distinctUntilChanged()
  );

  readonly error$: Observable<string | null> = this.state$.pipe(
    map((s) => s.error),
    distinctUntilChanged()
  );

  constructor(private readonly api: ItemsApiService) {}

  load(): void {
    this.patch({ loading: true, error: null });
    this.api.listItems().subscribe({
      next: (items) => this.patch({ loading: false, items }),
      error: () => this.patch({ loading: false, error: 'Failed to load items' }),
    });
  }

  private patch(partial: Partial<ItemsState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }
}
```

> ✅ In production, you typically push the subscription down into a service/facade (like above) so components stay "reactive" and dumb.

### ✅ Best Practices
- Expose **Observables**, not Subjects: keep state writable only inside the service.
- Use facades to keep components free of RxJS complexity.
- Keep your state shape explicit (interfaces + initialState).

### ❌ Avoid
- "God services" that own multiple domains (users + orders + auth + ui).
- Passing Subjects around between services/components (it becomes untraceable).

### Common mistakes
- Forgetting to handle error and loading state consistently.
- Storing derived state redundantly (compute view models from source state instead).

### 🎯 Interview insights
- Strong answers include patterns like "facade exposes `vm$` / selectors, methods for commands."

### 🔄 SDLC Angle
Deciding what belongs in a service vs. a component is a day-to-day **Implementation** decision, but it's **Code Review** where the real damage gets caught (or missed) — reviewers are the ones who should flag a "god service" that's quietly grown to own multiple unrelated domains (users + orders + auth). Left unchecked, that mistake compounds into a **Maintenance** headache: a service that's hard to test, hard to reason about, and too entangled to split apart later without a risky refactor.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why put a facade in front of a data service instead of having components call the API service directly?"
- **Strong answer:** A facade exposes a stable Observable API (`loading$`/`items$`/`error$`) plus command methods, so components stay "dumb" and purely reactive instead of managing subscriptions and state themselves. The facade centralizes state in one `BehaviorSubject`, so every component that injects the same singleton facade shares the exact same live state rather than each one re-fetching or duplicating logic.
- **Level-up:** A junior answer says "it's cleaner separation of concerns"; a senior answer explains the lazy-singleton-instantiation nuance — a `providedIn: 'root'` facade is only constructed the first time something injects it, and its `BehaviorSubject` is then shared by every subsequent consumer, which is exactly what makes it behave like a lightweight in-memory store.

---

## 3) RxJS Essentials (Angular-Focused)

### Concepts (practical, not theory) 🧠
- **Observable**: a stream of values over time (0..N values).
- **Promise**: a single async value (1 value).
- Angular uses Observables everywhere:
  - `HttpClient` returns `Observable<T>`
  - router events are observables
  - many libs integrate via observables

📖 **Plain-English definition**: A Promise is a delivery receipt for exactly one future value ("your pizza will arrive once, eventually"); an Observable is a subscription to a stream that can deliver zero, one, or many values over time ("a live news feed you can tune into and tune out of whenever you want").

### ⚛️ How This Works in React (Your Mental Anchor)
You already know the underlying problem from React: a `useEffect` that fires on every keystroke, a hand-rolled `setTimeout`-based debounce with a cleanup function, or a library like `use-debounce`/`react-query` managing cancellation and stale-response races for you. RxJS Observables solve that same class of problems — values over time, cancellation, composition — but as chainable, reusable operators (`switchMap`, `debounceTime`, `distinctUntilChanged`) instead of imperative `useEffect` cleanup logic and manual "is this still the latest request" ref-tracking.

```jsx
// React: hand-rolled debounce + cancellation via useEffect cleanup
useEffect(() => {
  const id = setTimeout(() => search(query), 300);
  return () => clearTimeout(id); // you write the cancellation yourself
}, [query]);
```

🧪 **SDET / Test Automation Angle**: A `BehaviorSubject`/`async pipe`-driven element that "shows up eventually" in the UI is not a flaky bug — it's a stream emission arriving asynchronously (e.g., after an HTTP response resolves and `loading$` flips to `false`). Testers should avoid fixed `sleep(2000)` calls, which are both slow and unreliable; instead, assert against the underlying stream/service state directly in integration tests (e.g., `facade.loading$` value, or trigger `stateSubject.next(...)` manually to drive the component into a known state), or use explicit condition-based waits (`waitFor`/`should('not.exist')`) in E2E tests that wait for the actual DOM consequence of the emission rather than a guessed time delay.

### Why Angular leans on RxJS
- Streaming UI: user input + HTTP + websockets + time-based events all become composable.
- Cancelation: Observables can be canceled (unsubscribe), which matters for navigation and fast typing UIs.

### How Angular uses it internally 🔍
- The `async` pipe subscribes for you and:
  - updates the view when new values arrive
  - unsubscribes automatically when the component is destroyed
- Concretely, the `AsyncPipe` is an **impure pipe** under the hood: on `ngOnInit`/whenever it receives a new Observable input it calls `.subscribe()`, and on each emission it stores the latest value and calls `ChangeDetectorRef.markForCheck()` — which is exactly the hook that lets `OnPush` components re-render even though nothing "outside" told them to. On `ngOnDestroy` the pipe automatically calls `.unsubscribe()` on the last subscription, which is why `async` pipe is the recommended default over manual `.subscribe()` calls: it ties subscription lifetime directly to the view's lifetime with no extra code.

### Operator mental models

#### `map` - transform values
```ts
items$ = this.api.listItems().pipe(map((items) => items.filter((x) => x.title)));
```

#### `switchMap` - "latest wins" (cancel previous)
Use for typeahead/search, route param changes, anything where old results should be ignored.
```ts
searchResults$ = this.query$.pipe(
  switchMap((q) => this.api.search(q)) // cancels previous request when q changes
);
```

#### `mergeMap` - run in parallel (all results matter)
Use for fan-out tasks where you want concurrency.
```ts
saveAll$ = from(items).pipe(mergeMap((i) => this.api.save(i)));
```

### `debounceTime` + `distinctUntilChanged` — Taming Rapid-Fire Input ⌨️

📖 **Plain-English definition**: `debounceTime(ms)` waits for a pause of at least `ms` milliseconds in emissions before letting one value through — so instead of reacting to every single keystroke, it reacts only once the user has stopped typing for a moment. `distinctUntilChanged()` compares each new value to the last one it emitted and skips it if nothing actually changed — so pressing a key that doesn't change the value (or re-focusing a field) doesn't trigger duplicate work.

### ⚛️ How This Works in React (Your Mental Anchor)
This is exactly the `useEffect` + `setTimeout` debounce pattern (or the `use-debounce` library) you already reach for in React — `debounceTime(300)` is the RxJS operator doing what your `setTimeout(..., 300)` plus a cleanup function does by hand, and `distinctUntilChanged()` is the equivalent of an early-return guard like `if (value === lastValue) return;` before firing a request. The real difference is composability: in RxJS these are chainable, reusable operators you `pipe()` together, rather than imperative logic you re-write inside every component's `useEffect`.

Realistic search/typeahead pipeline, using this file's `ItemsApiService`/`ItemsFacade` naming style:

```ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ItemsApiService } from './items-api.service';
import { ItemDto } from './items.api';

@Injectable({ providedIn: 'root' })
export class ItemsSearchFacade {
  private readonly querySubject = new Subject<string>();

  readonly results$: Observable<ItemDto[]> = this.querySubject.pipe(
    debounceTime(300),          // wait for a pause in typing before doing anything
    distinctUntilChanged(),     // skip re-searching the same term twice in a row
    switchMap((q) => this.api.search(q)) // cancel any in-flight search when a new one starts
  );

  constructor(private readonly api: ItemsApiService) {}

  search(query: string): void {
    this.querySubject.next(query);
  }
}
```

`search-box.component.ts` (component just calls `search()` on each keystroke — no RxJS in the template layer):
```ts
@Component({
  selector: 'app-search-box',
  template: `<input (input)="onInput($any($event.target).value)" />`,
})
export class SearchBoxComponent {
  constructor(private readonly searchFacade: ItemsSearchFacade) {}

  onInput(value: string): void {
    this.searchFacade.search(value);
  }
}
```

✅ **Best practice**: always pair `debounceTime` with `distinctUntilChanged()` for typed input — without it, retyping the same word (e.g., typing "cat", deleting to "ca", then retyping "cat") fires a redundant, identical API call.
✅ **Best practice**: pick a debounce window that reflects real typing speed (250–400ms is a common range) — long enough to skip most keystrokes, short enough to still feel responsive.
❌ **Avoid** skipping `distinctUntilChanged()` "to keep it simple" — it's what prevents duplicate calls for a value that hasn't actually changed.
❌ **Avoid** debounce times so short (e.g., 10-20ms) that they don't meaningfully reduce call volume — at that point you're barely debouncing at all.

🧪 **SDET / Test Automation Angle**: debounced search inputs are a classic, well-documented source of E2E flakiness. A test that types into the search box and *immediately* asserts on filtered results can run before the debounce window elapses — sometimes before the API call has even fired — and fail intermittently depending on machine speed and test runner timing. The fix is **not** a fixed `cy.wait(300)`: that's fragile because it silently breaks (or wastes time) the moment the debounce value in code changes. Instead, assert on the *eventual* result using an auto-retrying assertion (e.g., Cypress's built-in retry-until-timeout on `.should(...)`, or Testing Library's `findBy*`/`waitFor`), which naturally tolerates the debounce delay without hardcoding it. If a test needs tighter determinism — e.g., a critical-path smoke test — it's often better to trigger the search via an explicit, non-debounced action (pressing Enter, or clicking a "Search" button) rather than relying purely on typed-character debounce timing, so the test isn't racing an implementation detail of the input stream.

### `Subject` vs `BehaviorSubject`
- `Subject`: no current value; subscribers only see future emissions.
- `BehaviorSubject`: has a current value; new subscribers immediately receive latest.

✅ Use `BehaviorSubject` for UI state that must always have a value (loading flags, cached data, form wizard state).

### Code example: async pipe + view model stream
`items-page.component.ts`:
```ts
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemsFacade } from './items.facade';
import { ItemDto } from './items.api';

interface ItemsVm {
  loading: boolean;
  items: ItemDto[];
  error: string | null;
}

@Component({
  selector: 'app-items-page',
  templateUrl: './items-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPageComponent implements OnInit {
  vm$: Observable<ItemsVm> = combineLatest([
    this.facade.loading$,
    this.facade.items$,
    this.facade.error$,
  ]).pipe(map(([loading, items, error]) => ({ loading, items, error })));

  constructor(private readonly facade: ItemsFacade) {}

  ngOnInit(): void {
    this.facade.load();
  }
}
```

`items-page.component.html`:
```html
<ng-container *ngIf="vm$ | async as vm">
  <p *ngIf="vm.loading">Loading...</p>
  <p *ngIf="vm.error" class="error">{{ vm.error }}</p>

  <ul>
    <li *ngFor="let item of vm.items">{{ item.title }}</li>
  </ul>
</ng-container>
```

### Memory leak prevention (unsubscribe patterns) 🧼

#### ✅ Best practice: prefer `async` pipe
- Lets Angular manage subscription lifecycle.
- Works especially well with `OnPush`.

#### When you must subscribe manually
Examples: imperative side effects, bridging to non-observable APIs.

Use a destroy subject:
```ts
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

export class ExampleComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.some$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### ✅ Best Practices
- Prefer a **single stream** per page: `vm$` (view model) rather than many subscriptions.
- Use `switchMap` for "cancel previous" cases (route param changes, search).
- Keep side effects in services/facades when possible.

### ❌ Avoid
- Nested subscriptions:
  - ❌ `a$.subscribe(a => b$.subscribe(...))`
  - ✅ use `switchMap/mergeMap/concatMap`
- Calling `.subscribe()` in many components for data fetch (spreads side effects everywhere).
- Storing subscriptions in arrays without consistent cleanup.

### Common mistakes
- Using `mergeMap` where `switchMap` is required (stale results show up).
- Using `BehaviorSubject` as a dumping ground (no state shape, no selectors).
- Forgetting `distinctUntilChanged()` and spamming change detection with repeated identical values.

### 🎯 Interview insights
- Good answers mention `async` pipe and view-model streams.
- A senior answer differentiates `switchMap` vs `mergeMap` with a real example (typeahead vs batch save).

### 🔄 SDLC Angle
RxJS choices touch nearly every phase, but show up most concretely at **Implementation** (picking the right operator: `switchMap` vs `mergeMap`) and **Testing** (async emissions need condition-based waits, not fixed sleeps, or tests become flaky for reasons unrelated to correctness). It also becomes a **Maintenance/on-call** concern when a leaked subscription (missing `takeUntil`/`async` pipe) causes a slow memory leak that only shows up in production hours into a session, not during a quick manual smoke test.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "When would you use `switchMap` over `mergeMap`, and what breaks if you pick the wrong one?"
- **Strong answer:** `switchMap` cancels the previous inner observable the moment a new source value arrives, which is correct for typeahead search or route-param-driven requests where only the latest result matters. `mergeMap` runs all inner observables concurrently, which is correct for fan-out operations like saving a batch of items where every result matters — using `mergeMap` for search can let an older, slower request resolve *after* a newer one, overwriting the correct results with stale ones.
- **Level-up:** A junior answer can name both operators; a senior answer describes the concrete failure mode (stale results/race condition) and ties it back to the `async` pipe + `OnPush` lifecycle, and also knows `debounceTime` should always be paired with `distinctUntilChanged()` to avoid firing duplicate calls for input that hasn't actually changed.

---

## Hands-on (Do This)
- Add a service layer to your Phase 1 app:
  - A data service that returns `Observable<T>` (from `HttpClient` or mock in-memory)
  - A "store-ish" facade using `BehaviorSubject` for state
  - Components consume state via `async` pipe (avoid manual subscriptions where possible)

## Exit Criteria
- You can reason about DI scopes and why a service is the default home for business logic.
- You can implement a facade that exposes `loading$`, `data$`, `error$` and keep components clean.
- You can use `switchMap/mergeMap` correctly and prevent leaks.

## Next
- Continue to `../PHASE 3 — Routing & Application Flow/Readme.md`
