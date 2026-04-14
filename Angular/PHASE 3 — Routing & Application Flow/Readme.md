# PHASE 3 — Routing & Application Flow

## Goal
Build multi-page Angular apps with correct navigation, lazy loading, and route-level control (guards/resolvers).

## Topics
1. **Angular Router**
   - Router config
   - Route params + query params
   - Child routes
   - Lazy loading
2. **Route Guards**
   - `CanActivate`, `CanDeactivate`
   - Authentication/authorization patterns
3. **Route Resolvers**
   - Fetching data before navigation
   - Resolver vs component fetching tradeoffs

## Hands-on (Do This)
- Turn your app into a routed app:
  - `/login`, `/dashboard`, `/items/:id`
  - Lazy-load a feature route
  - Add a guard + a can-deactivate guard for unsaved changes
  - Add a resolver for detail routes

## Exit Criteria
- You can design routes, protect them, and control data-fetching timing for UX.

## Next
- Continue to `../PHASE 4 — Forms (Angular’s Power Area)/Readme.md`

