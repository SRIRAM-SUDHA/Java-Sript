# PHASE 2 — Services, DI, and State Thinking

## Goal
Learn Angular’s Dependency Injection and service-first architecture, and get comfortable with RxJS patterns used in real apps.

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

## Hands-on (Do This)
- Add a service layer to your Phase 1 app:
  - A data service that returns `Observable<T>`
  - A “store-ish” service using `BehaviorSubject` for state
  - Components consume state via `async` pipe (avoid manual subscriptions where possible)

## Exit Criteria
- You can reason about DI scopes and why a service is the default home for business logic.
- You can safely use RxJS without leaking subscriptions.

## Next
- Continue to `../PHASE 3 — Routing & Application Flow/Readme.md`

