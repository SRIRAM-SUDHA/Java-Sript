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

---

## 2) Services (Business Logic Layer)

### Concepts
- Services are where you put:
  - API calls (via `HttpClient`)
  - state management (cache, store-ish state)
  - orchestration logic (combine streams, derive view models)
- Components should mostly orchestrate UI, not business rules.

### Why it exists
- Keeps components small and focused on rendering.
- Makes logic reusable and testable.
- Enables clear boundaries for team ownership (domain services).

### How Angular uses it internally 🔍
- Services are plain classes; Angular instantiates them via DI.
- A singleton service effectively becomes a shared runtime "module" for your app.

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

---

## 3) RxJS Essentials (Angular-Focused)

### Concepts (practical, not theory) 🧠
- **Observable**: a stream of values over time (0..N values).
- **Promise**: a single async value (1 value).
- Angular uses Observables everywhere:
  - `HttpClient` returns `Observable<T>`
  - router events are observables
  - many libs integrate via observables

### Why Angular leans on RxJS
- Streaming UI: user input + HTTP + websockets + time-based events all become composable.
- Cancelation: Observables can be canceled (unsubscribe), which matters for navigation and fast typing UIs.

### How Angular uses it internally 🔍
- The `async` pipe subscribes for you and:
  - updates the view when new values arrive
  - unsubscribes automatically when the component is destroyed

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
