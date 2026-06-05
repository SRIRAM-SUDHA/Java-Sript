# PHASE 9 - Testing & Production Readiness

## Goal
Be confident shipping Angular 14: write useful unit/integration tests with `TestBed`, test services and HTTP properly, and apply production readiness practices that prevent common failures.

## Topics
1. **Unit Testing**
   - TestBed
   - Component tests
   - Service tests
   - Mocking dependencies
2. **E2E & Best Practices**
   - Angular best practices
   - Common anti-patterns
   - Migration tips from React

---

## 1) Unit Testing (TestBed)

### Concepts
- Angular tests typically use:
  - `TestBed` to configure a testing NgModule (declarations/imports/providers)
  - `ComponentFixture<T>` to render a component and run change detection
  - DI to replace real dependencies with fakes/mocks

### Why it exists ✅
- 🧪 Makes refactoring safe.
- 🧠 Forces you to design testable seams (facades/services).
- 🧯 Catches regressions early (especially in forms, routing, HTTP).

### How Angular uses it internally 🧠
- `TestBed.compileComponents()` compiles templates (async).
- `fixture.detectChanges()` runs change detection and triggers lifecycle hooks.
  - Many tests fail because `detectChanges()` was not called.

---

### Component testing

#### Example: component renders list (facade mocked)
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ItemsPageComponent } from './items-page.component';
import { ItemsFacade } from '../data-access/items.facade';

describe('ItemsPageComponent', () => {
  let fixture: ComponentFixture<ItemsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemsPageComponent],
      providers: [
        {
          provide: ItemsFacade,
          useValue: {
            items$: of([{ id: '1', title: 'A' }]),
            loading$: of(false),
            error$: of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsPageComponent);
    fixture.detectChanges();
  });

  it('renders items', () => {
    const lis = fixture.debugElement.queryAll(By.css('li'));
    expect(lis.length).toBe(1);
    expect(lis[0].nativeElement.textContent).toContain('A');
  });
});
```

#### ✅ Best Practices
- Test behavior (DOM output, button clicks) more than internal fields.
- Mock at the right boundary: prefer mocking facades/services instead of mocking HttpClient in component tests.
- Keep tests stable: avoid relying on implementation details.

#### ❌ Avoid
- Snapshot tests for complex UIs (brittle).
- Over-mocking everything (tests become meaningless).

---

### Service testing

#### Concepts
- Services are easiest to test because they have no template.
- Replace dependencies via providers.

#### Example: API wrapper service
```ts
import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { ItemsFacade } from './items.facade';
import { ItemsApiService } from './items-api.service';

describe('ItemsFacade', () => {
  it('loads items', async () => {
    TestBed.configureTestingModule({
      providers: [
        ItemsFacade,
        { provide: ItemsApiService, useValue: { list: () => of([{ id: '1', title: 'A' }]) } },
      ],
    });

    const facade = TestBed.inject(ItemsFacade);
    facade.load();

    const items = await firstValueFrom(facade.items$);
    expect(items.length).toBe(1);
  });
});
```

---

### HTTP testing (the correct Angular way) ✅

#### Concepts
- Use `HttpClientTestingModule` and `HttpTestingController` to:
  - assert the request URL/method/params/headers
  - flush mock responses
  - avoid real network calls

#### Example
```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemsApiService } from './items-api.service';

describe('ItemsApiService', () => {
  it('GETs /items', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ItemsApiService,
        { provide: 'API_BASE_URL', useValue: 'http://test' },
      ],
    });

    const api = TestBed.inject(ItemsApiService);
    const httpMock = TestBed.inject(HttpTestingController);

    api.list().subscribe((items) => expect(items.length).toBe(1));

    const req = httpMock.expectOne('http://test/items');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', title: 'A', createdAt: '2020-01-01T00:00:00Z' }]);

    httpMock.verify();
  });
});
```

#### ✅ Best Practices
- Always call `httpMock.verify()` to ensure no unexpected requests remain.
- Assert method + URL + important headers/params (not everything).

#### ❌ Avoid
- Real HTTP calls in unit tests.
- Testing Angular's HttpClient instead of your behavior.

---

### Testing async behavior (`fakeAsync`, `tick`) 🧠
Use when your code uses timers/promises and you want deterministic tests.

```ts
import { fakeAsync, tick } from '@angular/core/testing';

it('waits for timeout', fakeAsync(() => {
  let done = false;
  setTimeout(() => (done = true), 1000);
  tick(1000);
  expect(done).toBeTrue();
}));
```

---

## 2) E2E & Best Practices (Production Readiness)

### E2E testing (high level) 🧪
- Tooling varies by team (Cypress/Playwright).
- Use E2E for critical flows:
  - login -> navigation -> create/edit -> refresh -> persists

### Production readiness checklist ✅
- **Architecture**
  - lazy load major features
  - core/shared/feature boundaries enforced
  - no feature-to-feature imports
- **Performance**
  - `OnPush` for presentational components
  - `async` pipe and `trackBy` for large lists
- **Error handling**
  - consistent error mapping
  - global auth policy (401/403)
- **Security**
  - treat HTML as untrusted; avoid bypassing sanitization
  - validate and encode IDs used in URLs
- **Observability**
  - logging and metrics strategy (even if minimal)

### Common anti-patterns ❌
- Mega modules and mega services.
- Components that do HTTP directly.
- Subscriptions everywhere with no cleanup.

### 🎯 Interview insights
- Mention `HttpClientTestingModule` + `HttpTestingController` for HTTP tests.
- Mention `fixture.detectChanges()` and how Angular tests run CD.
- Mention mocking a facade for component tests (clean boundary).

---

## Hands-on (Do This)
- Write unit tests for:
  - one facade/service
  - one smart/page component
  - one reusable UI component
- Add HTTP tests for one API service using `HttpTestingController`.
- Add one "happy path" E2E test for a core user journey.

## Exit Criteria
- You can write stable, high-signal tests without fighting the framework.
- You can ship features with confidence and debug failures quickly.

## Next
- Revisit `../README.md` and pick a capstone project to implement end-to-end.

