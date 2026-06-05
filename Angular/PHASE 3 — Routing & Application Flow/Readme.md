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

---

## 2) Route Guards

### Concepts
- Guards are gatekeepers for navigation and/or lazy module loading.
- Common guard types (Angular 14):
  - `CanActivate`, `CanActivateChild`
  - `CanDeactivate<T>`
  - `CanLoad` (block lazy module loading)

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

---

## 3) Route Resolvers

### Concepts
- Resolvers fetch required data before a route activates and attach it to `ActivatedRoute.data`.

### Why it exists ✅
- 🧊 Prevents UI flash: you can render the page with data already available.
- 🧾 Declares data dependencies at the routing layer.

### How Angular uses it internally 🔍
- Resolvers run after guards succeed, before activation.
- If the resolver errors, navigation can be canceled unless handled.

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

