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

---

## 2) HTTP Interceptors

### Concepts
- Interceptors are middleware for all HTTP calls.
- Provide them via `HTTP_INTERCEPTORS` multi-provider.

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

