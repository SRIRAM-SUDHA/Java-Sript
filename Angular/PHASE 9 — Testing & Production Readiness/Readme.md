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

#### 📖 Plain-English definition
- **`TestBed`**: a sandbox Angular builds just for your test — you tell it "for this test, treat this component/service as if it lived in a tiny NgModule with only these providers," so you don't have to boot your whole real app to test one piece.
- **`ComponentFixture`**: your remote control for a component during a test — it hands you the component instance, its actual rendered DOM (`fixture.nativeElement`/`fixture.debugElement`), and a button to trigger change detection (`detectChanges()`) whenever you want the view to update.

### ⚛️ How This Works in React (Your Mental Anchor)
This is one of the closer conceptual mappings you'll find between the two ecosystems:
- `TestBed.createComponent()` + `fixture.detectChanges()` ~ `render()` from React Testing Library — both mount a single component in a lightweight test environment (not the full app) and give you back something you can query and assert on.
- `fixture.debugElement.queryAll(By.css(...))` ~ `screen.getByText()` / `screen.getByRole()` — both let you find rendered nodes to assert against.
- **The real difference is philosophy, not mechanics**: RTL leans hard into "test like a user" — it nudges you toward `getByRole`/`getByLabelText` (accessible, user-facing queries) and actively makes it awkward to reach into implementation details. Angular's `debugElement` API is more implementation-visible by default — `By.css('li')` or `By.directive(SomeComponent)` are completely normal and idiomatic, even though they couple the test to markup/structure a bit more than an RTL-style query would. Neither is wrong, but if you're coming from an RTL-disciplined React codebase, expect Angular test suites to query more "by shape of the DOM" and less "by what a user would perceive."

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

#### 🔄 SDLC Angle
`TestBed`/`ComponentFixture` unit and component tests belong to the **Implementation** phase — they're written by the same developer, in the same PR, as the feature code, and are meant to run continuously (watch mode locally, then again in CI on every push). They also feed **Code Review**: a reviewer expects a component PR to arrive with its tests, and a red/missing test is a legitimate reason to request changes before merge — long before the change ever reaches an E2E or deployment gate.

#### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Walk me through how you'd unit test an Angular component that depends on a service."
- **Strong answer:** "I'd configure a `TestBed` testing module with the component in `declarations` and a fake for the dependency in `providers` — usually a plain object literal with `useValue`, not the real service. Then I'd create the component with `TestBed.createComponent`, call `fixture.detectChanges()` to run change detection and lifecycle hooks, and assert on the rendered DOM via `fixture.debugElement.queryAll(By.css(...))` rather than poking at private fields. That way the test proves what the user actually sees, and survives internal refactors."
- **Level-up:** A junior answer stops at "I mock the dependency and check the output." A senior answer also explains *why* — mocking at the facade/service boundary instead of deeper (e.g. not mocking `HttpClient` directly in a component test) keeps the test meaningful and resistant to churn.

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

#### 🔄 SDLC Angle
Service tests are also written in the **Implementation** phase, but they carry extra weight at **Code Review** time: a service typically holds the business logic (state transitions, error mapping, retries), so reviewers use "does this have a service test covering the edge cases" as a proxy for "is this logic actually correct," not just "does it compile."

#### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why are services generally easier — and higher-value — to unit test than components?"
- **Strong answer:** "Services have no template and no change detection, so a test is just: configure `TestBed` with the service and fakes for its dependencies via `providers`, inject it with `TestBed.inject(...)`, call a method, and assert on the result — often with `firstValueFrom` for an observable-returning method. Because there's no DOM to render, the test is faster and more focused on the actual business logic, which is usually where the risk lives."
- **Level-up:** A junior answer describes the mechanics. A senior answer connects it to design: keeping components "thin" (template + wiring) and pushing logic into well-tested, injectable services/facades is itself a testability decision made at design time, not an afterthought bolted on during testing.

---

### HTTP testing (the correct Angular way) ✅

#### Concepts
- Use `HttpClientTestingModule` and `HttpTestingController` to:
  - assert the request URL/method/params/headers
  - flush mock responses
  - avoid real network calls

##### 📖 Plain-English definition
**`HttpTestingController`** is a fake backend for your tests — it intercepts every HTTP call your service makes, lets you inspect what was requested (URL, method, headers, body), and lets you hand back whatever fake response you want (`req.flush(...)`), instead of hitting a real server.

### ⚛️ How This Works in React (Your Mental Anchor)
Same goal as what you already do in a React/Jest test suite, different mechanism:
- `HttpTestingController` ~ Mock Service Worker (MSW) or `jest.mock('axios')` / a manual `fetch` mock — all four exist so a unit/integration test can assert on outgoing requests and hand back canned responses without ever touching a real network.
- **Where they differ (a genuine trade-off, not just syntax):** Angular's approach is DI-based — it works by swapping out the injected `HttpClient` inside a special `TestingModule`, so it only intercepts calls that go through Angular's DI-provided client. MSW instead intercepts at the actual network-request level (it registers a service worker / node request interceptor), so it doesn't care *how* the request was made — `fetch`, `axios`, anything. That arguably makes MSW's mocking closer to how the deployed app really behaves (nothing framework-specific), whereas `HttpTestingController`'s realism is scoped to "as long as you went through Angular's `HttpClient`."
- Both still require you to explicitly expect/flush (Angular) or define handlers (MSW) — neither one lets a stray unexpected request through silently if you set it up right (`httpMock.verify()` is the Angular equivalent of MSW's "unhandled request" warnings).

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

#### 🔄 SDLC Angle
`HttpTestingController` tests sit in **Implementation**, but they exist because of a **Design** decision (the API contract: URL, method, params, response shape) — the test is really asserting "my code honors that contract." They also matter at **Deployment**: because no real backend is involved, these tests run identically and just as fast in a CI pipeline as they do on a laptop, with no dependency on a test environment being up.

#### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How do you test a service that calls a REST API in Angular, without hitting a real network in CI?"
- **Strong answer:** "I import `HttpClientTestingModule` and inject `HttpTestingController`. After calling the service method, I use `httpMock.expectOne(url)` to grab the pending request, assert its method/URL/body, then call `req.flush(mockResponse)` to resolve it synchronously — no real network round trip. I always finish with `httpMock.verify()` so any request I forgot to expect fails the test loudly instead of silently leaking."
- **Level-up:** A junior answer covers the happy path. A senior answer also tests the error path (`req.flush(errorBody, { status: 500, statusText: 'Server Error' })` and asserting the service maps it correctly) and explains why the test should assert *your* service's behavior, not re-verify that `HttpClient` itself works.

---

### Testing async behavior (`fakeAsync`, `tick`) 🧠
Use when your code uses timers/promises and you want deterministic tests.

#### 📖 Plain-English definition
`fakeAsync` wraps a test in a special zone where time doesn't really pass until you say so. `tick(ms)` then fast-forwards that fake clock by `ms` milliseconds, instantly running any pending `setTimeout`/`setInterval`/promise callbacks that were waiting on it — so a test for "something happens after 1 second" runs in real time of a few milliseconds, with no actual waiting and no flakiness.

```ts
import { fakeAsync, tick } from '@angular/core/testing';

it('waits for timeout', fakeAsync(() => {
  let done = false;
  setTimeout(() => (done = true), 1000);
  tick(1000);
  expect(done).toBeTrue();
}));
```

### ⚛️ How This Works in React (Your Mental Anchor)
- `fakeAsync` + `tick(ms)` ~ Jest's fake timers: `jest.useFakeTimers()` (sets up the fake clock, analogous to wrapping your test body in `fakeAsync(...)`) + `jest.advanceTimersByTime(ms)` (analogous to calling `tick(ms)`).
- Same underlying idea in both: instead of a test actually waiting 1000ms in real time (slow, and technically still a race), you get deterministic control — tell the fake clock to jump forward, and any pending timer/microtask callback that was waiting on that time runs synchronously, instantly.
- The API shape differs (`fakeAsync` wraps the whole test function; Jest's fake timers are toggled globally or per-test via `jest.useFakeTimers()`/`jest.useRealTimers()`), but if you've ever reached for `jest.advanceTimersByTime()` to test a debounce or a `setTimeout`-based retry in a React app, you already understand *why* `fakeAsync`/`tick` exist — it's the same problem being solved.

---

## 2) E2E & Best Practices (Production Readiness)

### E2E testing (high level) 🧪
- Tooling varies by team (Cypress/Playwright).
- Use E2E for critical flows:
  - login -> navigation -> create/edit -> refresh -> persists
- Angular's original E2E tool was **Protractor** — it hooked into zone.js's "stability" tracking to auto-wait for pending HTTP calls/timers before running the next command. **Protractor is deprecated** (Angular CLI dropped it as the default from v12 onward, and the Angular team formally stopped shipping/supporting it). Angular 14-era teams use **Cypress, Playwright, or WebdriverIO** instead — see the SDET section below for what that changes.

### ⚛️ How This Works in React (Your Mental Anchor)
No translation needed here — this is the rare case where the tooling is genuinely identical regardless of frontend framework. Cypress and Playwright don't know or care whether the app under test is Angular, React, Vue, or plain HTML; they drive a real (or headless) browser against whatever got rendered into the DOM. If you've already written Cypress/Playwright tests against a React app, that skill transfers 100% to an Angular app — same commands, same `data-testid` conventions, same intercept/mocking APIs. The only framework-specific wrinkle (covered just below) is *why* auto-waiting behaves differently than it did under Protractor, which is an Angular-vs-Angular difference, not a React-vs-Angular one.

### 🧪 The SDET's View: Unit/Integration Tests vs E2E

This whole file so far has been written from a **developer writing unit tests** angle. As an SDET, your job is different: you own the *strategy* — deciding what gets covered where, and pushing developers to make the app testable. Here's how to map it out for a real Angular 14 app.

#### The testing pyramid, mapped to Angular 14
| Layer | Tools | What it exercises | Speed | Runs where |
|---|---|---|---|---|
| **Unit** | Jasmine/Jest, plain TS | Pure logic: pipes, services with mocked deps, reducers/selectors, validators | Milliseconds, no DOM | Every commit, local + CI |
| **Component / integration** | `TestBed` + `ComponentFixture`, `HttpTestingController` | A real Angular component tree + change detection, DOM present, but **no real browser, no real network** | Fast (seconds for a whole suite) | Every commit, local + CI |
| **E2E** | Cypress / Playwright / WebdriverIO | A real (or headless) browser driving your app against a real or mocked backend, full routing, real auth | Slow (seconds-to-minutes per test) | On PR/merge, or a smaller smoke set on every deploy |

The higher up the pyramid, the more realistic — and the slower, flakier, and more expensive to maintain — a test is. An SDET's job is to keep the base wide and the top narrow.

#### What to push onto `TestBed`/`HttpTestingController` vs what genuinely needs E2E
- **Push down to unit/component tests** (fast, deterministic, cheap to run on every commit): form validation logic, a service's error-mapping/retry logic, a facade's state transitions, "does this component render the right thing given this input" — anything where you can fully control the inputs via mocks. If a developer says "we need an E2E test to check this button is disabled when the form is invalid," that's a `TestBed` test wearing an E2E costume — push back.
- **Reserve for E2E**: things that only exist when the *real* pieces are wired together — a login flow through a real (or realistically mocked) auth provider, navigation across multiple lazy-loaded routes, a multi-step create → refresh → data-persists journey, visual regressions, and anything that depends on real browser behavior (focus, keyboard nav, actual HTTP timing, cookies/local storage).
- Rule of thumb: **if a `TestBed` test can prove it without lying about reality, it belongs there.** E2E is for the handful of journeys where the interaction *between* real systems is the point.

#### Why E2E tools need explicit waits (and Protractor didn't)
Protractor could auto-wait because zone.js patches async APIs and tracks when Angular is "stable" (no pending timers/XHRs/promises) — Protractor asked zone.js "are you done yet?" before proceeding. Cypress, Playwright, and WebdriverIO know nothing about zone.js or Angular's change detection — they only know the DOM. That means:
- They **do not know** when your `OnPush` component has finished re-rendering after an async response.
- They rely on **auto-retrying assertions/locators** instead (Cypress retries a `cy.get(...).should(...)` chain; Playwright's `expect(locator).toBeVisible()` retries) — but only if you write the test to wait on the *right condition*, not a fixed delay.
- This is exactly the root cause of most E2E flakiness in Angular apps: a test asserts on the DOM before change detection has actually run for the new state. Connect this back to **Phase 6 (Change Detection)** — the same "when does Angular actually update the DOM" question that causes `ExpressionChangedAfterItHasBeenCheckedError` in dev also causes flaky E2E assertions in CI. The fix in both cases is the same instinct: don't assume synchronous, assert on the eventual state instead.

#### Mocking strategy for E2E
- **Network-level intercept** (`cy.intercept()` in Cypress, `page.route()` in Playwright): stub the API response at the HTTP layer so the test is deterministic and doesn't depend on a real backend being up/seeded. Best for most journeys — fast, no backend flakiness, easy to test error/empty/loading states.
- **Seed real data via API before the test**: call a real (test-environment) API to create the fixtures the test needs, then let the app hit the real backend during the test itself. Best for the small set of true end-to-end journeys where you specifically want to prove the frontend and backend integrate correctly (e.g. one "golden path" smoke test per critical flow), not for every test.
- Pick one deliberately per test — mixing "some real, some mocked" inside a single test without thinking about it is how E2E suites become unreliable.

#### Making the Angular app itself E2E-testable
- Add stable **`data-testid`** (or `data-cy` for Cypress-only shops) attributes to interactive elements and key state containers (loading spinner, empty state, error banner) — never let tests query by CSS class names (which change on every style refactor) or DOM position/`nth-child` (which breaks the moment markup order changes).
- Avoid auto-generated or index-based selectors entirely (`.mat-mdc-row:nth-child(2)`, generated Angular Material internal classes) — they are implementation details, not contracts.
- Expose a stable "ready" signal in the DOM for anything that loads asynchronously — e.g. a `data-testid="items-loaded"` marker or a `[attr.data-state]="loading ? 'loading' : 'ready'"` binding on a container — so E2E tests can assert on *that* instead of guessing with a delay.

#### Example: Cypress test against an "items list" page (data-testid, no arbitrary waits)
```ts
// cypress/e2e/items-list.cy.ts
describe('Items list page', () => {
  beforeEach(() => {
    // Network-level mock — deterministic, no real backend needed.
    cy.intercept('GET', '/api/items', {
      statusCode: 200,
      body: [
        { id: '1', title: 'Sample Item A' },
        { id: '2', title: 'Sample Item B' },
      ],
    }).as('getItems');

    cy.visit('/items');
  });

  it('shows items once loaded, with no arbitrary sleeps', () => {
    // Wait on the actual network call, not a fixed delay.
    cy.wait('@getItems');

    // Wait on a stable "ready" marker instead of guessing at CD timing.
    cy.get('[data-testid="items-loaded"]').should('exist');

    cy.get('[data-testid="item-row"]').should('have.length', 2);
    cy.get('[data-testid="item-row"]').first().should('contain.text', 'Sample Item A');
  });

  it('shows an empty state for zero items', () => {
    cy.intercept('GET', '/api/items', { statusCode: 200, body: [] }).as('getEmptyItems');
    cy.visit('/items');
    cy.wait('@getEmptyItems');

    cy.get('[data-testid="items-empty-state"]').should('be.visible');
  });
});
```
Note what's *absent*: no `cy.wait(3000)`, no manual `setTimeout`. Every wait is tied to something the app actually does (`cy.wait('@getItems')`) or an assertion that Cypress auto-retries (`.should(...)`) against a `data-testid` the app deliberately exposes.

### Accessibility (a11y) — Testing It Like a Real Requirement ♿

#### 📖 Plain-English definition
**Accessibility** means the app is actually usable by someone navigating with only a keyboard, someone using a screen reader, and someone with low vision relying on sufficient color contrast — not people using a mouse and good eyesight exclusively. It is not an optional nice-to-have bolted on at the end; it's a testable requirement like "the form validates correctly" or "the API call retries on failure," and it should be treated as a bug when it's missing, not a backlog wish.

#### Dev-side basics (Angular 14)
- **Semantic HTML over `<div onclick>` soup**: a `<button>` gets keyboard focus, `Enter`/`Space` activation, and a screen-reader-announced role for free. A `<div (click)="save()">` gets none of that — you'd have to hand-wire `tabindex`, a `keydown` handler, and an ARIA role just to claw back what a real `<button>` already does. Prefer `<button>`, `<a href>`, `<input>`, `<label for>`, `<nav>`, `<main>` over generic `<div>`/`<span>` wrappers with click handlers.
- **`aria-*` attributes and `role`**: use them to fill gaps semantic HTML can't cover — `aria-label`/`aria-labelledby` for controls with no visible text (an icon-only close button), `aria-live="polite"` on a region that updates asynchronously (a toast, an inline validation message) so screen readers announce the change, `aria-invalid`/`aria-describedby` on a form control paired with its error message. Don't reach for ARIA as a first resort — it's a patch for when semantic HTML genuinely can't express the intent, not a replacement for using the right element.
- **Angular CDK's `a11y` module** — *if your app already depends on Angular Material/CDK* (don't newly adopt Material just for this): `FocusTrap` keeps keyboard focus inside an open modal instead of tabbing out into the page behind it, `LiveAnnouncer` programmatically announces a message to screen readers (`liveAnnouncer.announce('3 items loaded')`) for updates that don't have an obvious DOM location, and `FocusMonitor` lets you observe/react to how an element received focus (mouse, keyboard, programmatic).
- **Managing focus after route changes and modal open/close** — this is a very common real bug: a route navigates, or a dialog closes, and keyboard/screen-reader focus is left on a now-detached or now-irrelevant element (often silently reset to `<body>`). The user has no idea where they are. Fix it deliberately: on route change, move focus to the new page's heading or main landmark; on dialog close, return focus to the element that opened it (the CDK's `FocusTrap`/dialog utilities can do this for you if you're already using them).

#### 🧪 SDET / Test Automation Angle
Manually auditing every PR with a screen reader doesn't scale — but a large class of a11y regressions (missing labels, bad contrast, missing landmarks, invalid ARIA usage) can be caught automatically, cheaply, on every CI run:
- **`axe-core`** (via `cypress-axe` for Cypress or `@axe-core/playwright` for Playwright) runs an automated accessibility scan against the rendered DOM of a page and reports rule violations, tagged by severity (`minor`/`moderate`/`serious`/`critical`). Wire it into your existing E2E suite so key pages get scanned as a side effect of tests you're already running, and fail the build on `serious`/`critical` violations.
- **Lighthouse's accessibility score** (via `lighthouse-ci` or a manual Chrome DevTools run) is a coarser, complementary check — good as a trend/regression signal across the whole app, but less precise than an axe scan for pinpointing exactly which element/rule failed.

##### Example: axe scan on the "items list" page (Cypress + `cypress-axe`)
```ts
// cypress/e2e/items-list.a11y.cy.ts
import 'cypress-axe';

describe('Items list page - accessibility', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/items', {
      statusCode: 200,
      body: [
        { id: '1', title: 'Sample Item A' },
        { id: '2', title: 'Sample Item B' },
      ],
    }).as('getItems');

    cy.visit('/items');
    cy.wait('@getItems');
    cy.injectAxe(); // injects axe-core into the page under test
  });

  it('has no serious or critical a11y violations', () => {
    cy.get('[data-testid="items-loaded"]').should('exist');

    cy.checkA11y('[data-testid="items-page"]', {
      includedImpacts: ['serious', 'critical'],
    });
  });
});
```

#### ✅ Best Practices
- Run automated a11y scans (`axe-core`) in CI on key pages/flows as a baseline, the same way you already run E2E smoke tests — treat a new `serious`/`critical` violation as a build-breaking regression, not a follow-up ticket.
- Manage focus explicitly on route change and modal open/close — don't assume the browser "just handles it."
- Prefer semantic HTML first, ARIA second, and only reach for CDK's `a11y` module if the app already pulls in Material/CDK.

#### ❌ Avoid
- Treating a passing automated axe scan as "fully accessible" — automated tools catch roughly 30-50% of real-world accessibility issues (missing labels, bad contrast, invalid ARIA). Manual keyboard-only navigation and screen-reader spot checks on critical flows (login, checkout, primary CRUD journey) still matter and aren't replaceable by tooling alone.
- `<div>`/`<span>` click targets with no keyboard support, no focus style, and no semantic role — a mouse-only user won't notice; a keyboard or screen-reader user is simply blocked.
- Reflexively silencing an axe violation (e.g. adding `aria-hidden` to make a warning disappear) instead of fixing the underlying markup — that hides the symptom for the tool and leaves the real user-facing problem in place.

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
- **Security** 🔒
  - treat HTML as untrusted; avoid bypassing sanitization — and if a `bypassSecurityTrust*` call genuinely exists in the codebase, it should be rare, deliberate, and reviewed (see the dedicated section below)
  - validate and encode IDs used in URLs
  - grep PR diffs for `bypassSecurityTrust` as a matter of course — each occurrence is a spot where Angular's default XSS protection was intentionally turned off and deserves a specific "is this input truly trusted?" question
- **Observability**
  - logging and metrics strategy (even if minimal)
- **Testability** 🧪
  - stable `data-testid` attributes on interactive elements and key state containers (loading/empty/error states), so E2E selectors survive style/markup refactors
  - unit + component (`TestBed`) tests run on every commit in CI; a smaller E2E smoke suite runs on merge/deploy — not the other way around

#### 🔄 SDLC Angle
This checklist is where the SDLC stops being abstract and becomes a literal gate: it's what a release manager or a senior engineer runs down before approving a **Deployment**. Unlike unit/component tests (Implementation phase, run on every commit), this list spans **Testing** (does the E2E smoke suite pass, does the a11y scan pass), **Deployment** (is lazy loading/OnPush in place, is the error-mapping strategy consistent), and **Maintenance** (the "Observability" line exists specifically so that when something does break in production, there are logs/metrics to diagnose it during on-call — without that, the anti-patterns further down in this file stop being style nitpicks and become 2am incidents).

#### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's your testing philosophy — how do you decide what to unit test versus E2E test, and can you tell me about a time a lack of tests caused a production bug?"
- **Strong answer:** "I think in terms of a pyramid: fast, deterministic `TestBed`/`ComponentFixture` and `HttpTestingController` tests for anything I can fully control with mocked inputs — form validation, a service's error-mapping logic, a facade's state transitions — because they run in milliseconds on every commit. I reserve E2E for the handful of journeys where the *integration* between real systems is the point, like login through a real auth provider or a multi-step create-and-refresh flow, because those are slow and comparatively flaky. For timing-dependent logic I also reach for `fakeAsync`/`tick` instead of real delays, so tests stay deterministic. On the production-bug question: I've seen a case where a component subscribed to an observable without unsubscribing, and a service method threw only for empty-string input — no unit test covered that edge case, so it shipped and only surfaced as an intermittent memory-leak/error report from users days later. Afterward, I added the missing service test for that input *and* added a lint rule/checklist step so it wasn't a one-off fix."
- **Level-up:** A junior answer recites "pyramid: lots of unit tests, few E2E tests" as memorized theory. A senior answer justifies the *shape* with concrete trade-offs (CI runtime, flakiness cost, maintenance cost of brittle selectors), ties it to a real incident with a genuine before/after fix, and treats the production-readiness checklist as a living gate they'd actually enforce, not a document they'd just nod at.

### Security Basics Every Angular Dev/SDET Should Know 🔒

#### 📖 Plain-English definition
Angular **auto-sanitizes** values it binds into the DOM. If a component binds `{{ userInput }}` into a template, or `[innerHTML]="userInput"`, and `userInput` contains something like `<script>...</script>` or an `onerror` handler, Angular strips or neutralizes the dangerous part before it ever reaches the real DOM. This isn't a minor convenience — it's a real, load-bearing safety net that prevents a huge class of Cross-Site Scripting (XSS) bugs by default, without you having to think about it on every binding.

#### `DomSanitizer` and `bypassSecurityTrust*` — the explicit escape hatch
Angular exposes `DomSanitizer` with methods like `bypassSecurityTrustHtml()`, `bypassSecurityTrustUrl()`, `bypassSecurityTrustResourceUrl()`, `bypassSecurityTrustScript()`, and `bypassSecurityTrustStyle()`. Calling one of these tells Angular: *"trust me, don't sanitize this specific value — render/use it exactly as given."* That's a deliberate, explicit opt-out of the protection described above, for one specific value.

This should be **rare and deliberate** — a legitimate use looks like rendering rich HTML that came from a trusted, server-controlled CMS/editor field, where you've already decided the source is safe. It should **never** be used just to make an "unsafe binding" console warning or a sanitization error go away for something derived from user input — that specific move (bypass the warning instead of understanding why it fired) is exactly how a codebase reintroduces the XSS hole Angular was protecting it from in the first place.

```ts
// Legitimate-looking use: rendering trusted, server-authored HTML from a CMS field.
// Still only safe if "cmsContent" truly cannot contain attacker-controlled input.
constructor(private sanitizer: DomSanitizer) {}

trustedHtml = this.sanitizer.bypassSecurityTrustHtml(cmsContent);
```

```ts
// ❌ Do NOT do this to silence a sanitization warning on user-controlled input:
// this.sanitizer.bypassSecurityTrustHtml(this.searchTermFromUrlQueryParam);
// This is the textbook way to reopen an XSS hole Angular's default sanitizer just closed.
```

#### 🧪 SDET / Test Automation Angle
- **Grep PR diffs for `bypassSecurityTrust`** (`grep -r bypassSecurityTrust src/`) as a standard part of review — treat every hit as a flag, not a failure by default. For each one, ask: *is the value passed in truly trusted (server/CMS-controlled), or does it ultimately trace back to user input (a form field, a URL/query param, a route param, an uploaded file)?* If you can't answer that confidently by reading the surrounding code, that's a finding worth raising.
- **A lightweight E2E/injection regression check**: type an obviously fake, synthetic marker payload — something *shaped* like an injection attempt but inert and clearly a test fixture, e.g. a string like `<img src=x data-test-marker="a11y-xss-check">` — into a text field that gets rendered back (a comment box, a search box that echoes the query, a profile "display name"), and assert it renders as **inert text** in the DOM (visible as literal characters, `<img>` not actually present as a real element) rather than as executed/rendered markup. This is a cheap regression guard for "did sanitization silently get bypassed somewhere in this flow" — never use a real working exploit payload; a descriptive, obviously-fake marker string is enough to prove the point.

#### ✅ Best Practices
- Let Angular's default sanitization do its job on every binding; don't reach for `DomSanitizer.bypassSecurityTrust*` reflexively.
- If a `bypassSecurityTrust*` call is genuinely needed, keep the trusted-input boundary as narrow and well-documented as possible (comment *why* the source is trusted, right at the call site).
- Grep for `bypassSecurityTrust` as a routine part of PR review/security checks.

#### ❌ Avoid
- Using `bypassSecurityTrust*` to silence a sanitization warning/error on anything that traces back to user input.
- Passing an entire object/response through `bypassSecurityTrustHtml` "to be safe" instead of narrowing to the one field that actually needs it.
- Assuming sanitization is someone else's problem because "Angular handles it" — it handles it only until a `bypassSecurityTrust*` call turns it off for a given value.

### Common anti-patterns ❌
- Mega modules and mega services.
- Components that do HTTP directly.
- Subscriptions everywhere with no cleanup.
- **No stable selectors** 🧪 — tests query by CSS classes that change with every style refactor, or by DOM position/index (`nth-child`, generated Material classes), instead of `data-testid`.
- **Fixing flaky E2E with arbitrary delays** 🧪 — reaching for `cy.wait(3000)`/`sleep()` instead of waiting on the actual network call or an auto-retrying assertion; it hides the real timing bug and just makes the suite slower and still occasionally flaky.

### 🎯 Interview insights
- Mention `HttpClientTestingModule` + `HttpTestingController` for HTTP tests.
- Mention `fixture.detectChanges()` and how Angular tests run CD.
- Mention mocking a facade for component tests (clean boundary).

### 💼 Talking About This in an SDE Interview / On Your Resume

You don't need to be an SDET to talk credibly about testing — as a general SDE, being able to describe *how* and *why* you tested something is often what separates a "yes, hire" from a "borderline" in the debrief. A few concrete ways to phrase it:

**Resume-bullet-style phrasings** (templates — swap in your own real numbers/scope, don't copy the numbers):
- "Wrote unit and integration tests for Angular components and services using `TestBed` and `HttpTestingController`, covering [X] critical user flows (e.g. checkout, auth) and catching regressions before code review."
- "Introduced `HttpTestingController`-based HTTP tests for an API service layer that previously had none, reducing [team's] reliance on manual QA for a recurring class of API-contract bugs."
- "Added `fakeAsync`/`tick` tests for timer-dependent UI logic (e.g. debounced search, auto-save), replacing flaky real-delay tests and cutting CI time for that suite by [Y]%."

**Talking about testing trade-offs in a system-design-adjacent round:** if asked "why isn't everything E2E-tested" or "what does your test pyramid look like for this design," the strong framing is: E2E tests are the most realistic but the slowest and most expensive to maintain (real browser, real timing, brittle selectors), so a deliberately pyramid-shaped suite — wide base of unit/component tests, a thin layer of E2E for the journeys where real-system integration is actually the point — keeps CI fast and signal high; a "100% E2E" suite sounds thorough but in practice becomes slow, flaky, and gets skipped/ignored under deadline pressure, which is a worse outcome than a smaller, trusted E2E set.

### ⚛️ Overall React Developer Takeaway on Angular Testing
Coming from React, expect real friction on the unit/component side specifically: `TestBed`'s setup — configuring a testing `NgModule` with declarations/imports/providers just to render one component — is genuinely more boilerplate than React Testing Library's `render(<Component />)`, and that's not you missing a shortcut; it's because Angular's DI and NgModule system have to be reconstructed (even in miniature) inside the test environment before anything can render, whereas a React component has no such container to rebuild. E2E (Cypress/Playwright) is the one place this friction disappears entirely, since that tooling doesn't know or care which framework rendered the DOM it's driving.

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

