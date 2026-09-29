# PHASE 5 - HTTP, APIs, and Side Effects

## Goal
Make production-grade API calls with `HttpClient`, centralized HTTP policies (interceptors), and robust error handling - while keeping components clean via services/facades.

## Topics
1. **HttpClient**
   - GET/POST/PUT/DELETE
   - Typed responses
   - Error handling
2. **HTTP Interceptors**
   - Auth tokens
   - Global error handling
   - Logging/metrics
   - Retry logic (carefully)

---

## 1) HttpClient

### Concepts
- `HttpClient` returns **cold** `Observable<T>`:
  - the request executes when you subscribe
  - unsubscribing cancels the in-flight request (useful for navigation/typeahead)
- Request options matter:
  - headers, params, observe, responseType
- `get<T>()` gives TypeScript typing, not runtime validation.

📖 **Plain-English definition**: `HttpClient` is Angular's built-in way of talking to a server over HTTP — think of it as a phone line the app uses to ask a backend for data (GET), send new data (POST), change it (PUT), or remove it (DELETE), and get the answer back as a stream you can react to.

🧪 **SDET / Test Automation Angle**: This is the same contract an SDET tests directly, just from a different angle — instead of clicking through the UI, you can point a REST client (Postman, RestAssured, `requests`) at the exact same `/items` endpoint `HttpClient` calls and assert on the JSON shape completely independently of the UI. That overlap is valuable: if both the API test suite and the UI rely on the same `ItemDto`, a backend contract change breaks both in the same predictable way. But remember `get<T>()` is a compile-time hint only — TypeScript will happily believe the response is an `ItemDto[]` even if the backend returns `null` or a differently-shaped object; that runtime contract gap is exactly what an API test (or an e2e test against a real/staging backend) is for, since the UI test alone won't catch it. On error handling specifically: bring the app to a 401, a 500, and a hung/never-responding request (mock or throttle the network) and verify the UI shows the right message via `toUserMessage()` rather than spinning forever or leaking a raw stack trace — "the loader spins forever" is one of the most common real-world bug reports, and it traces directly back to a facade whose `error` callback wasn't handled.

### Why it exists ✅
- 🌐 A standard HTTP layer integrated with RxJS and Angular DI.
- 🧪 Testable via `HttpClientTestingModule`.
- 🧩 Extensible via interceptors.

### How Angular uses it internally (pipeline) 🧠
For each request:
`HttpClient` -> `HttpHandler` -> [interceptor1 -> interceptor2 -> ...] -> backend (XHR)

Interceptors can:
- clone/modify requests (add headers, change URL)
- inspect/transform responses
- handle errors
- short-circuit for mocks

### Setup (NgModule)
`app.module.ts`:
```ts
import { HttpClientModule } from '@angular/common/http';
@NgModule({ imports: [HttpClientModule] })
export class AppModule {}
```

---

### Code example: a clean API service (DTO boundary)
`items.api.ts`:
```ts
export interface ItemDto {
  id: string;
  title: string;
  createdAt: string; // ISO string (backend contract)
}
```

`items-api.service.ts`:
```ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemDto } from './items.api';

@Injectable({ providedIn: 'root' })
export class ItemsApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject('API_BASE_URL') private readonly apiBaseUrl: string
  ) {}

  list(query?: string): Observable<ItemDto[]> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    return this.http.get<ItemDto[]>(`${this.apiBaseUrl}/items`, { params });
  }

  getItem(id: string): Observable<ItemDto> {
    return this.http.get<ItemDto>(`${this.apiBaseUrl}/items/${encodeURIComponent(id)}`);
  }
}
```

> ✅ Best practice: keep the API service as a "thin transport" layer. Mapping and UI state belong in a facade.

---

### Code example: facade consumes API and exposes UI-ready streams 🧰
`items.facade.ts`:
```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ItemsApiService } from './items-api.service';
import { ItemDto } from './items.api';

interface State {
  loading: boolean;
  items: ItemDto[];
  error: string | null;
}

const initial: State = { loading: false, items: [], error: null };

@Injectable({ providedIn: 'root' })
export class ItemsFacade {
  private readonly stateSubject = new BehaviorSubject<State>(initial);
  private readonly state$ = this.stateSubject.asObservable();

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

  load(query?: string): void {
    this.patch({ loading: true, error: null });
    this.api.list(query).subscribe({
      next: (items) => this.patch({ loading: false, items }),
      error: () => this.patch({ loading: false, error: 'Failed to load items' }),
    });
  }

  private patch(partial: Partial<State>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }
}
```

### Error handling (production-friendly)

#### Concept
- Decide your error strategy:
  - map HTTP errors to app errors (message codes)
  - handle auth errors globally
  - show user-friendly messages at the UI boundary

#### Example helper
```ts
import { HttpErrorResponse } from '@angular/common/http';

export function toUserMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Network error. Check your connection.';
    if (err.status === 401) return 'Please sign in again.';
    if (err.status >= 500) return 'Server error. Try again later.';
    return `Request failed (${err.status}).`;
  }
  return 'Unexpected error.';
}
```

### Caching HTTP Responses with `shareReplay` 🗄️

#### Concept
- By default, `HttpClient` Observables are **cold and unicast**: every single `subscribe()` call re-runs the whole pipeline, which means a brand-new HTTP request fires each time — even if three components subscribe to what is conceptually "the same data" at nearly the same moment.
- `shareReplay(1)` converts that cold stream into a **shared, cached** one: the source Observable is subscribed to exactly once, the last emitted value is buffered, and every subscriber (current or future) receives that same replayed value instead of triggering its own request.
- This is the standard fix for "reference data" that's read often and changes rarely — dropdown options, lookup tables, config, a user profile shown in a header and a sidebar.

📖 **Plain-English definition**: Think of a normal `HttpClient` call like everyone dialing the same phone number separately and asking the same question — the operator answers the call fresh, every time. `shareReplay(1)` is like putting one person on the phone to ask the question once, writing the answer on a whiteboard, and having everyone else just read the whiteboard — one call, many readers.

#### Code example: caching reference data in a service
`reference-data.api.ts`:
```ts
export interface RefDataDto {
  code: string;
  label: string;
}
```

`reference-data-api.service.ts`:
```ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { RefDataDto } from './reference-data.api';

@Injectable({ providedIn: 'root' })
export class ReferenceDataApiService {
  // Built ONCE as a class field - the pipe (and shareReplay) runs a single time,
  // not once per call to getReferenceData().
  private readonly refData$: Observable<RefDataDto[]> = this.http
    .get<RefDataDto[]>(`${this.apiBaseUrl}/reference-data`)
    .pipe(shareReplay(1));

  constructor(
    private readonly http: HttpClient,
    @Inject('API_BASE_URL') private readonly apiBaseUrl: string
  ) {}

  getReferenceData(): Observable<RefDataDto[]> {
    return this.refData$;
  }
}
```

Any component that injects `ReferenceDataApiService` and calls `getReferenceData()` gets the same underlying Observable. The first subscriber triggers the one and only HTTP GET; every subsequent subscriber (this component, or two other components on the same page) is replayed the cached array with no extra network call.

> ✅ Best practice: build the shared Observable **once** - as a class field (or a lazily-initialized getter that assigns it on first access) - so `shareReplay` actually has something persistent to share. A very common bug is writing:
> ```ts
> // ❌ Defeats the purpose: a fresh Observable (and a fresh shareReplay) is created
> // every time getReferenceData() is called, so nothing is ever actually shared.
> getReferenceData(): Observable<RefDataDto[]> {
>   return this.http.get<RefDataDto[]>(`${this.apiBaseUrl}/reference-data`).pipe(shareReplay(1));
> }
> ```
> Here the `.pipe(shareReplay(1))` re-runs on every call, producing a brand-new Observable (and a brand-new HTTP request) each time - the caching never kicks in because there's no shared instance to replay from.

### ❌ Avoid
- Using `shareReplay` for data that must always be fresh - a live balance, a real-time order status, anything where "the last cached value" could be actively wrong right now. Cache stable/slow-changing data, not volatile data.
- Forgetting that `shareReplay(1)` with no reset strategy keeps the last value cached for the lifetime of the service (which, for a `providedIn: 'root'` service, is the lifetime of the app). If the underlying resource changes server-side, subscribers keep getting the stale first-loaded value until a full page reload. If you need "cache, but refreshable," expose an explicit `refresh()` method that re-fetches and re-assigns `refData$`, or use `shareReplay({ bufferSize: 1, refCount: true })` so the cache clears once all subscribers unsubscribe (useful when the data should be re-fetched next time a feature area is revisited, not kept forever).

🧪 **SDET / Test Automation Angle**: `shareReplay` changes the very meaning of "how many network requests happened," which matters a lot if your tests assert on request counts. If a page renders the same reference-data dropdown in three components and your test uses `cy.intercept()` or Playwright's `page.route()` expecting three GET calls (one per component), you'll be surprised to see only **one** - because all three components subscribed to the same cached, shared Observable. This isn't a bug to "fix" in the test by forcing three requests; it's the intended behavior. Prefer asserting on the outcome ("all three components show the correct options") rather than a rigid request-count expectation, unless you've explicitly confirmed the caching behavior with the dev team and want to lock it in (in which case assert on exactly one request, on purpose, as a regression guard for the caching itself). The other trap is test isolation: because the shared Observable typically lives on a `providedIn: 'root'` singleton service, a value cached in one `TestBed` test can leak into the next test in the same file if the module/service instance isn't torn down - make sure your test setup (`TestBed.configureTestingModule` per test, or resetting the testing module) gives each test a fresh service instance rather than one carrying over cached data from a previous test case.

🎯 **Interview insight**: "Why did my API only get called once even though three different components use this service?" is a real debugging question you'll hit on the job and in interviews - `shareReplay(1)` is the direct answer, and being able to explain *why* (cold vs. shared Observables, and where the pipe must live to actually share) demonstrates real RxJS understanding rather than memorized syntax.

🔄 **SDLC Angle**: Deciding to cache reference data with `shareReplay` is typically a *design-phase* call (which data is "read-often, changes-rarely" enough to cache) that becomes an *implementation* detail (build the shared Observable once, as a class field) and a *code-review* checkpoint (is `shareReplay` piped inside a method - which defeats it - or on a persistent field). Getting the invalidation story wrong shows up in *maintenance*: stale cached data after a server-side change is a production bug report, not a compile error, so any cache without a `refresh()` path is worth flagging as a future support cost.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "You added `shareReplay(1)` to cache an API call, but users are still seeing three network requests instead of one - what went wrong?"
- **Strong answer:** "Most likely the `.pipe(shareReplay(1))` is inside the method that gets called, so a brand-new Observable - and a brand-new `shareReplay` - is created on every call, with nothing persistent to actually share. The fix is to build the piped Observable once, as a class field (or a lazily-assigned one), so every caller subscribes to the same instance."
- **Level-up:** A junior answer just adds `shareReplay(1)` and calls it done; a senior answer also addresses cache invalidation up front - either an explicit `refresh()` method, or `shareReplay({ bufferSize: 1, refCount: true })` - since "the cache never lines up with the latest server state" is the natural follow-up failure mode.

### ✅ Best Practices
- Keep `HttpClient` out of components; call a facade/service.
- Keep API base URL in one place (injection token or environment config).
- Use DTOs to document the backend contract; map to view models separately.
- Use `async` pipe in components so subscription cleanup is automatic.

### ❌ Avoid
- Subscribing in every component (side effects scattered everywhere).
- Throwing raw `HttpErrorResponse` into templates.
- Stringly-typed URLs spread throughout code.

### Common mistakes 🧯
- Forgetting `HttpClientModule` -> `NullInjectorError: No provider for HttpClient`.
- Assuming `get<T>()` validates JSON shape at runtime (it does not).
- Misusing `HttpParams` (it's immutable; `.set` returns a new instance).

### 🎯 Interview insights
- Explain cold observables and cancellation.
- Explain interceptor pipeline and why HTTP is observable-based in Angular.

### 🔄 SDLC Angle
`HttpClient` usage spans almost the whole SDLC: the *design* phase decides the API service/facade boundary and DTO shape (often driven by a backend contract doc or OpenAPI spec agreed with the API team); *implementation* is where the service/facade split above gets built; *code review* is where reviewers check that no component calls `HttpClient` directly, that errors are mapped to user messages, and that DTOs vs view models stay separate; and *maintenance* is where a backend contract change (a renamed field, a new required param) surfaces as a runtime bug that TypeScript's compile-time `get<T>()` typing never caught.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How would you structure the code that talks to a REST API in a mid-size Angular app, and why not just call `HttpClient` from the component?"
- **Strong answer:** "I'd put `HttpClient` calls behind a thin API service (one per domain) that only knows about DTOs and URLs, and a facade on top that exposes UI-ready `items$`/`loading$`/`error$` streams built from a `BehaviorSubject`. That keeps components dumb - they just bind to observables via the `async` pipe - and keeps the DTO-to-view-model mapping, error handling, and loading state in one testable place instead of scattered across every component that needs the data."
- **Level-up:** A junior answer stops at "put it in a service"; a senior answer also flags that `get<T>()` is a compile-time-only guarantee, so it's worth pairing runtime validation or defensive mapping at the DTO boundary for external/third-party APIs where the contract isn't fully trusted.

---

## 2) HTTP Interceptors

### Concepts
- Interceptors are middleware for all HTTP calls.
- Provide them via `HTTP_INTERCEPTORS` multi-provider.

📖 **Plain-English definition**: An interceptor is a checkpoint every outgoing request and incoming response passes through automatically — like airport security for your HTTP traffic — where you can attach things (an auth token), inspect things (log timing), or react to things (a failed response) without touching the code that made the original call.

🧪 **SDET / Test Automation Angle**: Interceptors are invisible in the UI, but they matter a lot for automation strategy. Because `AuthInterceptor` attaches the bearer token to every request, an E2E test usually doesn't need to automate the login form at all for the bulk of the suite — it can seed a valid token straight into `localStorage`/`sessionStorage` before the page loads and start the test already authenticated, which is faster and far less flaky than driving a real login UI on every run. A retry interceptor cuts the other way: adding retry-on-failure for flaky calls makes transient backend hiccups invisible to E2E tests (good for E2E stability), but that also means E2E will never exercise the retry logic itself — wrong backoff, retrying a non-idempotent POST, an infinite retry loop. That logic needs its own focused unit tests against a mocked `HttpTestingController`, because no UI-level test will deliberately trigger it. Logging/timing interceptors are also a convenient hook for a lightweight "API performance" smoke check: assert requests complete within an SLA during automated regression runs.

### Why it exists ✅
- 🔐 Auth token injection in one place.
- 🧾 Consistent error mapping and logging.
- 🧪 Easier testing and policy enforcement.

### How Angular uses it internally 🔍
- Angular composes interceptors into a chain once.
- For each request, the chain runs in order.

### Code examples

#### Auth interceptor (add Authorization header)
`auth.interceptor.ts`:
```ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthFacade } from './auth.facade';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthFacade) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.tokenSnapshot();
    if (!token) return next.handle(req);
    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
}
```

#### Logging interceptor (timing)
```ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class TimingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const started = Date.now();
    return next.handle(req).pipe(
      finalize(() => {
        const ms = Date.now() - started;
        console.log(`[HTTP] ${req.method} ${req.urlWithParams} (${ms}ms)`);
      })
    );
  }
}
```

#### Provide interceptors
```ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TimingInterceptor, multi: true },
]
```

### Retry logic (use carefully) ⚠️
- Retry can be useful for flaky networks, but dangerous for non-idempotent requests (POST/PUT).
- If you implement retry, scope it to safe GETs or explicitly idempotent operations.

### ✅ Best Practices
- Keep interceptors focused and composable.
- Always use `multi: true`.
- Avoid interceptor infinite loops (interceptor making HTTP calls can re-enter interceptors).

### ❌ Avoid
- Doing UI work in interceptors (toasts/dialogs) without a clear policy.
- Catching errors and returning success silently (hides problems).

### Common mistakes 🧯
- Forgetting `multi: true` -> you replace other interceptors.
- Trying to mutate `HttpRequest` instead of cloning (it's immutable).

### 🎯 Interview insights
- Explain multi-provider and chain order.
- Mention "interceptor is the right place for auth + logging + global error policy".

### 🔄 SDLC Angle
Interceptors are usually an *architecture/design-phase* decision - deciding up front that auth, retry, and logging are cross-cutting concerns handled centrally rather than per-call - which then becomes a concrete *code-review* checklist item: does every new HTTP call actually flow through the right interceptor chain, is `multi: true` present, and does the retry interceptor stay scoped to idempotent requests. In *maintenance*, a missing or misordered interceptor is a classic silent-bug source - auth suddenly failing on one new endpoint, or a retry interceptor quietly retrying a POST - that's hard to spot without deliberately tracing the interceptor chain.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Where would you put logic that needs to run on every single HTTP request in an Angular app, like attaching an auth token?"
- **Strong answer:** "An `HttpInterceptor` registered via the `HTTP_INTERCEPTORS` multi-provider token. Angular composes all registered interceptors into one chain per request, so an `AuthInterceptor` can clone the request and add the `Authorization` header without any component or service knowing that logic exists. I'd keep each interceptor focused on one concern - auth, logging, retry - rather than one interceptor doing everything."
- **Level-up:** A junior answer names the interceptor; a senior answer also calls out the retry-on-non-idempotent-request trap (retrying a POST can double-submit) and the `multi: true` gotcha (forgetting it silently replaces other interceptors instead of adding to the chain).

---

## Hands-on (Do This)
- Add an API layer:
  - One API service per domain (e.g., `UsersApiService`, `ItemsApiService`)
  - One facade per feature that exposes `items$`, `loading$`, `error$`
  - Add interceptors for auth + timing/logging

## Exit Criteria
- Your components do not directly "do HTTP"; they call services/facades.
- You can explain the interceptor pipeline and show clean error handling patterns.

## Next
- Continue to `../PHASE 6 — Change Detection & Performance/Readme.md`

