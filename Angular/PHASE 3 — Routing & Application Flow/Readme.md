# PHASE 3 - Routing & Application Flow

## Goal
Build multi-page Angular 14 apps with correct navigation, lazy loading, and route-level control (guards/resolvers) the way production teams do it - and be able to explain Router internals in interviews.

## Topics
1. **Angular Router**
   - Router configuration
   - Route parameters
   - Query params
   - Child routes
   - Lazy loading
2. **Route Guards**
   - `CanActivate`
   - `CanDeactivate`
   - Authentication flows
   - Authorization patterns
3. **Route Resolvers**
   - Data before navigation
   - UX improvement
   - Resolver vs component fetching

---

## 1) Angular Router

### Concepts
- The router maps **URL -> activated route tree -> components rendered into outlets**.
- Core building blocks:
  - `Routes`: configuration array
  - `<router-outlet>`: where the active component is rendered
  - `RouterLink`: declarative navigation in templates
  - `ActivatedRoute`: params/query/data streams for the current route
  - `Router`: imperative navigation + events

📖 **Plain-English definition**: The router is Angular's built-in traffic controller. It watches the browser's address bar, figures out which "page" that URL means, and swaps the right component(s) into view — all without a full page reload.

### ⚛️ How This Works in React (Your Mental Anchor)
This one genuinely maps almost 1:1 onto `react-router-dom` — say that plainly, because a lot of other Angular concepts don't map this cleanly, but route config, params, query params, and nested routes really do.

| Angular | React Router (v6) |
|---|---|
| `Routes` config array | `<Routes>` / `<Route path="...">` |
| `ActivatedRoute.paramMap` | `useParams()` |
| `ActivatedRoute.queryParamMap` | `useSearchParams()` |
| `children: [...]` (nested routes) | nested `<Route>` elements + an `<Outlet />` |
| `<router-outlet>` | `<Outlet />` |

Side-by-side:
```ts
// Angular route config
const routes: Routes = [
  { path: 'items', children: [
      { path: '', component: ItemsPageComponent },
      { path: ':id', component: ItemDetailsPageComponent },
    ] },
];
```
```jsx
// React Router v6 equivalent
<Routes>
  <Route path="items" element={<ItemsLayout />}>
    <Route index element={<ItemsPage />} />
    <Route path=":id" element={<ItemDetailsPage />} />
  </Route>
</Routes>
```
Reading params/query params:
```jsx
function ItemDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'details';
  // ...
}
```

Lazy loading (also part of this topic) maps almost 1:1 too — both use dynamic `import()` under the hood:
```ts
// Angular: wired at the router-config level
loadChildren: () => import('./items/items.module').then(m => m.ItemsModule)
```
```jsx
// React: wired at the component level, with an explicit Suspense boundary
const ItemsPage = React.lazy(() => import('./ItemsPage'));
<Suspense fallback={<Spinner />}>
  <ItemsPage />
</Suspense>
```
The real difference: Angular's router owns "when to fetch the chunk" as part of navigation itself; in React you have to remember to wrap the lazy component in `<Suspense>` yourself, and there's no router-level "module" concept — it's just a lazily-imported component tree.

One genuine gap: Angular's `ActivatedRoute.data` (static route metadata like `{ title: 'Item details' }`) has no built-in equivalent in React Router before the v6.4+ `loader`/`handle` APIs — you'd typically just hardcode it as a prop on the route's `element` or in a config object you build yourself.

🧪 **SDET / Test Automation Angle**: Deep-linking is one of the most common and cheapest E2E patterns — instead of clicking through five screens to reach a detail page, you `page.goto('/items/42?tab=history')` or `cy.visit('/items/42?tab=history')` directly and assert the right view/data loaded. This only works because the router treats every URL as a valid entry point, not just a result of in-app clicks. Lazy loading (covered below) also matters for tests: the first visit to a lazy route fetches a JS chunk over the network, so an E2E test may briefly see a spinner or blank outlet — assert on a stable DOM state (e.g., `waitFor` a specific element), never on a fixed `sleep()`. Route-level code splitting is also what bundle-size/performance budgets (e.g., Lighthouse CI gates) actually measure per chunk, so it's worth knowing which routes are lazy when debugging a failed perf budget in CI.

### Why it exists ✅
- 🧭 Deep links: load the app directly at `/items/42?tab=history`.
- ⏪⏩ History integration: back/forward just works.
- 🧩 Architecture: lazy loaded modules become *real* feature boundaries.

### How Angular uses it internally (mental model) 🧠
Navigation is a pipeline:
1. **Parse URL** into an `UrlTree`.
2. **Recognize routes**: match the tree against `Routes` -> build `RouterStateSnapshot`.
3. **Run guards**: can we navigate?
4. **Load lazy modules** (if `loadChildren` matched).
5. **Run resolvers**: fetch required data.
6. **Activate routes**: update outlets and create components.

> 🔍 Key insight: routing is not "render component X". It is "build and activate a route state".

Under the hood, `Router.navigateByUrl()` kicks off a single **RxJS observable chain** (Angular's source calls this a `NavigationTransition`) that pipes the URL through operators roughly named `applyRedirects` -> `recognize` -> `runGuards` -> `resolveData` -> `activateRoutes`. Route *matching* itself is a recursive segment-by-segment comparison: the router walks the `UrlSegmentGroup` produced from the URL against each `Route` in order and takes the **first** config whose `path` segments (and `pathMatch`) match — which is exactly why route order matters and why a greedy `**` route must be declared last. A successful match builds a `RouterStateSnapshot`, a tree of `ActivatedRouteSnapshot`s that mirrors your nested `children`/lazy module structure.

### Code examples (Angular 14, NgModule-based)

#### Root routes (AppRoutingModule)
`app-routing.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundPageComponent } from './not-found-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'items',
    loadChildren: () =>
      import('./items/items.module').then((m) => m.ItemsModule),
  },
  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

#### Feature routes (ItemsRoutingModule)
`items-routing.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemsPageComponent } from './pages/items-page.component';
import { ItemDetailsPageComponent } from './pages/item-details-page.component';

const routes: Routes = [
  { path: '', component: ItemsPageComponent },
  { path: ':id', component: ItemDetailsPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemsRoutingModule {}
```

#### Params, query params, and route data (observable-first)
`item-details-page.component.ts`:
```ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-item-details-page',
  template: `
    <h2>Item {{ id$ | async }}</h2>
    <p>tab: {{ tab$ | async }}</p>
    <p>title: {{ title$ | async }}</p>
  `,
})
export class ItemDetailsPageComponent {
  id$: Observable<string> = this.route.paramMap.pipe(
    map((p) => p.get('id') ?? ''),
    distinctUntilChanged()
  );

  tab$: Observable<string> = this.route.queryParamMap.pipe(
    map((q) => q.get('tab') ?? 'details'),
    distinctUntilChanged()
  );

  title$: Observable<string> = this.route.data.pipe(
    map((d) => (d['title'] as string) ?? 'Item')
  );

  constructor(private readonly route: ActivatedRoute) {}
}
```

Route config:
```ts
{ path: ':id', component: ItemDetailsPageComponent, data: { title: 'Item details' } }
```

#### Child routes + nested outlets (common in dashboards)
Template:
```html
<!-- dashboard-shell.component.html -->
<nav>
  <a routerLink="overview" routerLinkActive="active">Overview</a>
  <a routerLink="settings" routerLinkActive="active">Settings</a>
</nav>
<router-outlet></router-outlet>
```

Routes:
```ts
{
  path: 'dashboard',
  component: DashboardShellComponent,
  children: [
    { path: 'overview', component: DashboardOverviewComponent },
    { path: 'settings', component: DashboardSettingsComponent },
    { path: '', pathMatch: 'full', redirectTo: 'overview' },
  ],
}
```

### Real-world usage patterns 🧰
- ✅ Route `data` for:
  - titles/breadcrumbs
  - permission metadata (e.g., `data: { requiredRole: 'admin' }`)
  - feature flags
- ✅ Query params for UI state you want shareable:
  - table filters, tabs, pagination (when appropriate)
- ✅ Lazy loading for:
  - major sections (admin, billing, reports)
  - routes behind permissions

### ✅ Best Practices
- Prefer feature modules with routing (`XxxModule` + `XxxRoutingModule`).
- Prefer lazy loaded feature modules for major areas (performance + ownership).
- Prefer `paramMap`/`queryParamMap`/`data` streams when components can be reused.
- Use `routerLink` and `routerLinkActive` for templates (keeps navigation declarative).

### ❌ Avoid
- Putting all routes in `AppRoutingModule` (it grows into a mess).
- Using `snapshot` everywhere (works until it doesn't).
- Encoding complex objects into query params (hard to maintain; use ids/primitive state).

### Common mistakes (and fixes) 🧯
- "Cannot match any routes":
  - wrong path, missing module lazy import, or missing `RouterModule.forChild`.
- Redirect loops:
  - missing `pathMatch: 'full'` for empty path redirect.
- RouterLink surprises:
  - `routerLink="settings"` is relative; use `['/dashboard', 'settings']` for absolute.

### 🎯 Interview insights
- Explain the pipeline: URL parse -> recognition -> guards -> resolvers -> activation.
- Mention that Router builds a route tree (`RouterState`) and activates outlets accordingly.

### Preloading Strategies — Fixing the First-Navigation Lag ⚡

📖 **Plain-English definition**: Lazy loading (above) defers a route's JS chunk until the user actually visits it — great for initial bundle size, but it means the *first* click on a lazy route triggers a network fetch the user can feel. Preloading is the fix: once the initial app has finished loading, Angular quietly fetches the lazy chunks *in the background*, before the user ever clicks. By the time they navigate there, the code is already sitting in the browser — best of both worlds: small initial bundle, no click-time lag.

### ⚛️ How This Works in React (Your Mental Anchor)
This is the one place in Angular Router where React Router has no first-class equivalent — say so plainly rather than forcing a mapping. Classic React Router doesn't ship a "fetch the next likely route's chunk in the background, automatically" feature at all.

The closest DIY equivalent is manually calling the same dynamic `import()` function early, before the user actually clicks:
```jsx
const loadItemsPage = () => import('./ItemsPage');
const ItemsPage = React.lazy(loadItemsPage);

// prefetch on hover/focus, ahead of navigation
<Link to="/items" onMouseEnter={() => loadItemsPage()}>Items</Link>
```
Because bundlers memoize dynamic `import()` calls, calling `loadItemsPage()` on hover "warms" the exact same chunk `React.lazy` will later mount — so by the time the click happens, the network request is already done or in flight.

React Router's newer data-router APIs (v6.4+, `createBrowserRouter` + route `loader`s) get a bit closer, since a `loader` can in principle be invoked ahead of navigation, but even that isn't a real equivalent of `PreloadAllModules` — you'd have to hand-roll your own "preload every route after mount" logic. There's no built-in `PreloadingStrategy` interface to implement in React; it's a genuinely Angular-specific, first-class router feature.

- Lazy loading controls **what's in the initial bundle**.
- Preloading controls **when the rest arrives** — on Angular's own schedule, independent of user clicks.

#### Code example (Angular 14, NgModule-based)
`app-routing.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'items',
    loadChildren: () =>
      import('./items/items.module').then((m) => m.ItemsModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

`PreloadAllModules` preloads *every* lazy route after the initial navigation completes. For larger apps, that can waste bandwidth on routes almost nobody visits (e.g., an admin section, a rarely-used settings page). In that case, write a **custom preloading strategy** by implementing `PreloadingStrategy` and checking route `data`:

```ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null);
  }
}
```

```ts
{
  path: 'items',
  data: { preload: true },
  loadChildren: () => import('./items/items.module').then((m) => m.ItemsModule),
}
```

```ts
RouterModule.forRoot(routes, { preloadingStrategy: SelectivePreloadingStrategy })
```

Only routes flagged `{ data: { preload: true } }` get fetched early; everything else stays lazy-only.

### ✅ Best Practices (Preloading)
- Use `PreloadAllModules` as a reasonable default for small/medium apps — simple, and the background fetches rarely hurt.
- Use a **custom preloading strategy** for large apps, so you don't spend bandwidth preloading routes most users will never open.

### ❌ Avoid (Preloading)
- Preloading routes gated behind auth/roles that most users will never reach (e.g., an admin-only module for a user base that's 99% non-admin) — it wastes bandwidth for no benefit.

⚡ **Performance note**: Phase 6's performance checklist already calls for "lazy-load feature modules (Phase 3)." Preloading is the natural next step after that: once you've split the bundle, preloading trades a little background bandwidth (fetched during idle time, after the initial load) for a faster *perceived* navigation later — the chunk is already there when the user clicks.

🧪 **SDET / Test Automation Angle**: Preloading changes the *timing profile* of the app, and that matters for E2E test design. In a lazy-loading-only app, a route's first navigation is reliably a bit slow (network fetch on click). Add `PreloadAllModules`, and that same route can become consistently fast — but only once the background preload requests have actually finished. If an E2E test navigates immediately after app bootstrap (before those background fetches complete), it can hit the same "first click is slow" symptom intermittently — a flaky failure that looks like a bug but is really the test racing the preloader. The fix is the same principle as elsewhere in this file: wait for the actual expected DOM state to appear rather than asserting immediately or sleeping a fixed duration; don't assume "app loaded" means "all lazy chunks preloaded."

🎯 **Interview insight**: "Lazy load vs preload" is a very common follow-up after explaining lazy loading. The senior-level answer: lazy loading controls what's in the initial bundle; preloading controls *when* the rest arrives, independently of user clicks — and the two are meant to be used together, not as alternatives.

### 🔄 SDLC Angle
Route structure and the lazy/preload split are usually settled at **requirements/design** time — someone maps app sections to feature modules and decides an initial-bundle-size budget before a line of routing code is written. Wiring `Routes`, `loadChildren`, and a preloading strategy is straightforward **implementation**. At **code review**, the useful questions are "should this new section be its own lazy module?" and "does this route's `data` duplicate logic that belongs in a guard/resolver?" At **deployment/release**, CI bundle-size or Lighthouse budgets are literally measuring per-route chunks, so a failing budget gate traces straight back to routing decisions. In **maintenance**, "cannot match any routes" and redirect-loop bugs are the recurring production/debugging pattern, almost always route-order or `pathMatch` mistakes.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Walk me through what happens end-to-end when a user clicks a link to a lazy-loaded route."
- **Strong answer:** The router parses the URL into a `UrlTree`, recognizes it against the `Routes` config to build a `RouterStateSnapshot`, runs guards, loads the lazy chunk if the module hasn't been fetched yet (skipped entirely if a preloading strategy already fetched it in the background), runs resolvers to get required data, then activates the route and renders components into the outlets. It's a single RxJS pipeline under the hood, not an isolated "swap component" call.
- **Level-up:** A junior answer stops at "it loads the component." A senior answer distinguishes lazy loading (what's in the initial bundle) from preloading (when the rest arrives), explains that a custom `PreloadingStrategy` reading route `data` avoids wasting bandwidth on rarely-visited sections, and knows route order/`pathMatch` affects which config actually matches.

---

## 2) Route Guards

### Concepts
- Guards are gatekeepers for navigation and/or lazy module loading.
- Common guard types (Angular 14):
  - `CanActivate`, `CanActivateChild`
  - `CanDeactivate<T>`
  - `CanLoad` (block lazy module loading)

📖 **Plain-English definition**: A guard is a yes/no (or "redirect instead") check that runs *before* Angular lets you enter or leave a route — like a bouncer checking ID before you walk through a door, or a gate agent asking if you're really allowed to skip this exit.

### ⚛️ How This Works in React (Your Mental Anchor)
There's no router-config equivalent of `canActivate` in React Router — no `guards: [...]` option you attach to a route. The idiomatic React pattern does the same job as a wrapper/higher-order component, usually called something like `<PrivateRoute>` or `<RequireAuth>`:
```jsx
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// usage
<Route path="/dashboard" element={
  <RequireAuth><DashboardPage /></RequireAuth>
} />
```
Conceptually identical job: check some auth/permission state, then either render the page or redirect (`<Navigate>` ~ returning a `UrlTree` from `canActivate`). The difference is *where* the check lives: Angular treats it as a router-config concern (a class attached to the route), React treats it as a component-tree concern (a wrapper component you nest around the route's `element`). That also gives the "does a guard on the parent protect a nested child route" question from below a React parallel — if you only wrap the parent route's element and a nested `<Route>` renders independently through its own `<Outlet>`, you must wrap `RequireAuth` at every level that needs protection, same gap as Angular's `CanActivateChild`.

`CanDeactivate` (unsaved-changes guard) has no clean React Router v6 built-in either — the common approach is a `useBlocker`/`unstable_useBlocker` hook or a manual `beforeunload` listener plus your own confirm-dialog state, noticeably less turnkey than Angular's `CanDeactivate<T>` interface.

🧪 **SDET / Test Automation Angle**: `CanActivate` is exactly the mechanism behind auth-gated pages, and it's also the reason E2E suites don't need to automate a full login UI on every single test. The two common bypass strategies are: (1) mock the guard's dependency (the auth service / token store) so `canActivate()` always resolves `true` in test builds, or (2) seed `localStorage`/`sessionStorage`/cookies with a valid token directly via the test framework (`page.addInitScript`, `cy.window()`, etc.) before navigating, so the real guard logic runs but sees an already-authenticated user. Both are far faster and less flaky than clicking through a login form for every spec, and they isolate "does the auth guard work" tests (a handful) from "does this feature work" tests (which shouldn't care about login at all).

### Why it exists ✅
- 🔐 Centralized authorization (no scattered checks).
- 🧼 Cleaner components: pages render assuming access is already validated.

### How Angular uses it internally 🔍
- Guards run *before* activation.
- Guard return values:
  - `true` -> proceed
  - `false` -> cancel
  - `UrlTree` -> redirect (recommended)
- Guards can be async (observable/promise).
- Order matters and is fixed: `CanLoad`/`CanMatch`-style checks gate whether a lazy module is even **fetched**, then for the matched route tree, `CanActivateChild` runs top-down for each parent, and finally `CanActivate` runs for the leaf route being activated. Angular resolves each guard through the **dependency injector** (which is why `@Injectable({ providedIn: 'root' })` is enough — no manual registration), then normalizes whatever the guard returns (`boolean`, `Promise`, `Observable`) into an observable via an internal `wrapIntoObservable` helper so all guards can be composed with the same RxJS operators (`concatMap`/`every`-style short-circuiting). The first guard that resolves `false` or a `UrlTree` short-circuits the whole chain — later guards and resolvers never run.

### Code examples

#### Auth guard (redirect using UrlTree) ✅
`auth.guard.ts`:
```ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthFacade, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isLoggedIn$.pipe(
      take(1),
      map((ok) => (ok ? true : this.router.parseUrl('/login')))
    );
  }
}
```

#### Role guard (route data driven)
```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: AuthFacade, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const required = route.data['role'] as string | undefined;
    return this.auth.role$.pipe(
      take(1),
      map((role) => (!required || role === required ? true : this.router.parseUrl('/forbidden')))
    );
  }
}
```

Route:
```ts
{ path: 'admin', canActivate: [RoleGuard], data: { role: 'admin' }, component: AdminPageComponent }
```

#### CanDeactivate (unsaved changes)
`pending-changes.guard.ts`:
```ts
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export interface CanLeave {
  canLeave(): boolean;
}

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<CanLeave> {
  canDeactivate(component: CanLeave): boolean {
    return component.canLeave();
  }
}
```

### ✅ Best Practices
- Prefer `UrlTree` redirects (pure + testable).
- Ensure guard observables complete (use `take(1)`).
- Keep guard logic thin: delegate to an auth/permissions service.

### ❌ Avoid
- Calling `subscribe()` inside guards (race conditions).
- Doing long async work in guards (navigation feels "stuck").

### Common mistakes 🧯
- Guard never completes -> navigation hangs. Fix: `take(1)` or ensure observable completes.
- Using `CanLoad` with preloading strategies incorrectly (depends on app strategy).

### 🎯 Interview insights
- Mention `UrlTree` return and guard completion (`take(1)`).
- Explain "component renders only if guards pass".

### 🔄 SDLC Angle
Guards start as a **requirements/design** decision — what's the app's auth model (roles? feature flags? ownership checks?), and which routes need which checks — before any `CanActivate` class exists. Writing the guard classes is routine **implementation**. Guards matter most at **code review**: the classic review question is "is this actually enforced everywhere, or can a user bypass it by deep-linking straight into a child/lazy route that isn't itself guarded?" — a guard on the parent route doesn't automatically protect every nested path. In **testing**, guards are usually mocked or bypassed with a seeded token rather than exercised through a real login UI. In **production/maintenance**, a guard whose observable never completes is a "stuck navigation" bug report, and a guard that only checks client-side state (no server-side enforcement) is a security incident waiting to happen.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How would you protect an admin-only route in Angular, and what's a common way that protection ends up broken in practice?"
- **Strong answer:** Implement `CanActivate` (and `CanActivateChild` for nested routes) returning `true`, `false`, or preferably a `UrlTree` redirect to `/login` or `/forbidden`, resolved via DI so no manual registration is needed. A common way this breaks is guarding only the top-level route while a child or lazy-loaded route underneath it has no guard of its own, so a direct URL still gets in — or relying on the guard alone with no server-side authorization check, since a client-side guard is a UX convenience, not a real security boundary.
- **Level-up:** A junior answer treats the guard as "the" security control. A senior answer explicitly separates client-side guards (better UX, avoid showing UI the user can't use) from server-side authorization (the actual security enforcement), and knows guard order is fixed (`CanLoad`/`CanMatch` → `CanActivateChild` top-down → `CanActivate`) so a single `false`/`UrlTree` short-circuits the rest of the chain.

---

## 3) Route Resolvers

### Concepts
- Resolvers fetch required data before a route activates and attach it to `ActivatedRoute.data`.

📖 **Plain-English definition**: A resolver is a "fetch this data first" step Angular runs automatically before it shows you the page, so the page never renders in a half-ready, empty-then-populated state.

### ⚛️ How This Works in React (Your Mental Anchor)
This is the one Angular Router concept with a genuinely close, direct React Router equivalent — if you're on React Router v6.4+. Its data APIs added `loader` functions on route definitions that fetch data *before* the route renders, exactly like a resolver:
```jsx
// React Router v6.4+ (createBrowserRouter)
const router = createBrowserRouter([
  {
    path: '/items/:id',
    element: <ItemDetailsPage />,
    loader: async ({ params }) => {
      const item = await fetchItem(params.id);
      return item; // available via useLoaderData()
    },
  },
]);

function ItemDetailsPage() {
  const item = useLoaderData();
  return <h2>{item.title}</h2>;
}
```
`resolve: { item: ItemResolver }` ~ `loader`, `ActivatedRoute.data` ~ `useLoaderData()`. Both block navigation until the data (or an error) is settled, so neither leaves a flash of an empty page.

If you're on an older React Router version (v5, or v6 without the data router), there's no router-level equivalent at all — the DIY fallback is fetching inside a wrapping component (`useEffect` + `useState`) and rendering a spinner until it resolves. That's exactly the "fetch-in-component" alternative the Angular docs below contrast resolvers against — except in that older-React world, it's the *only* option, not a deliberate trade-off.

🧪 **SDET / Test Automation Angle**: Because navigation is *blocked* until the resolver's data arrives, "the page is ready" means something different than on a component that fetches its own data after rendering. For a resolver-backed route, waiting for a specific, data-dependent DOM element (e.g., the item title text, not a generic spinner) to appear is a reliable readiness signal — there's no in-between state where the route is active but the data hasn't arrived yet. This is more robust than a fixed `sleep()`/`cy.wait(ms)`, and it also means flaky "sometimes the detail page is blank" bugs are more likely a resolver error-handling gap (see the `catchError` pattern below) than a timing issue in the test.

### Why it exists ✅
- 🧊 Prevents UI flash: you can render the page with data already available.
- 🧾 Declares data dependencies at the routing layer.

### How Angular uses it internally 🔍
- Resolvers run after guards succeed, before activation.
- If the resolver errors, navigation can be canceled unless handled.
- Internally this is the `resolveData` step of the navigation pipeline. If a route declares multiple resolvers (`resolve: { item: ItemResolver, perms: PermsResolver }`), Angular runs them **concurrently** (conceptually a `forkJoin` over each resolver's observable) rather than one after another, then merges all results into a single object on `ActivatedRouteSnapshot.data` once every resolver has emitted. An observable that never completes (e.g., a `Subject` with no terminal value) leaves the whole navigation hanging forever — the same class of bug as an async validator or guard that never completes, and it's why the example below always funnels errors through `catchError` instead of letting them propagate.

### Code example
`item.resolver.ts`:
```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ItemsApiService } from './items-api.service';
import { ItemDto } from './items.api';

@Injectable({ providedIn: 'root' })
export class ItemResolver implements Resolve<ItemDto> {
  constructor(private readonly api: ItemsApiService, private readonly router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ItemDto> {
    const id = route.paramMap.get('id') ?? '';
    return this.api.getItem(id).pipe(
      catchError(() => {
        this.router.navigate(['/items']);
        return of({ id: 'unknown', title: 'Unknown' } as ItemDto);
      })
    );
  }
}
```

Route:
```ts
{ path: ':id', component: ItemDetailsPageComponent, resolve: { item: ItemResolver } }
```

Consume:
```ts
item$ = this.route.data.pipe(map((d) => d['item'] as ItemDto));
```

### ✅ Best Practices
- Use resolvers for required data on detail pages.
- Handle errors (redirect/fallback) so navigation doesn't break.
- Keep resolvers thin: call API services and return observables.

### ❌ Avoid
- Using resolvers for optional data (slows navigation unnecessarily).

### 🎯 Interview insights
- Strong answer: "resolvers can improve UX, but overuse can delay navigation; choose wisely."

### 🔄 SDLC Angle
"Resolver vs fetch-in-component" is a **design/implementation** trade-off made per feature: does this page need its data before it can render meaningfully, or is a loading skeleton acceptable? That decision belongs early, not as an afterthought. At **code review**, the thing to check is error handling — a resolver without a `catchError` can leave a navigation hanging forever, which is a much worse failure mode than a component that fails to fetch after rendering. In **testing**, resolver-backed routes have a cleaner readiness signal (data-dependent DOM appears, no in-between empty state), which is why they're easier to test reliably. In **production/maintenance**, "the detail page is sometimes blank" is a classic resolver-error-handling gap, not a flaky-test problem.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "When would you use a resolver instead of just fetching data in `ngOnInit`?"
- **Strong answer:** Use a resolver when the page can't render anything meaningful without the data — it blocks navigation until the data (or a fallback) is ready, so there's no flash of an empty state. Fetch in the component itself when the data is optional, slow, or non-blocking, since a resolver on a slow API directly delays navigation and can make the whole app feel unresponsive.
- **Level-up:** A junior answer says "resolvers pre-fetch data." A senior answer adds that resolvers with multiple entries run concurrently (like a `forkJoin`), that an observable which never completes hangs the navigation exactly like a guard that never completes, and that resolver errors must be funneled through `catchError` with an explicit redirect/fallback rather than left to propagate.

---

## Hands-on (Do This)
- Turn your app into a routed app:
  - `/login`, `/dashboard`, `/items/:id`
  - Lazy-load a feature route module
  - Add a guard + a can-deactivate guard
  - Add a resolver for detail routes

## Exit Criteria
- You can design routes, protect them, and control data-fetching timing for UX.
- You can debug route matching, redirect loops, and guard completion issues.

## Next
- Continue to `../PHASE 4 — Forms (Angular’s Power Area)/Readme.md`

