# PHASE 8 - Project Structure & Scalability

## Goal
Structure Angular 14 projects like real teams do: clear module boundaries, scalable folder architecture, and predictable dependency rules (Core/Shared/Feature). This phase is where many Angular devs "level up" to senior.

## Topics
1. **Angular Folder Architecture**
   - Core / Shared / Feature modules
   - Smart vs dumb components
   - Feature isolation
   - Monorepo mindset
2. **State Management (Optional but Useful)**
   - Service-based state
   - NgRx overview (conceptual)

---

## 1) Angular Folder Architecture

### Concepts
- Think in **features** first, not "components folder" first.
- A good structure makes it hard to do the wrong thing:
  - feature-to-feature imports are discouraged
  - shared UI is reusable
  - singletons are not duplicated by lazy modules

### Why it exists ✅
- 🧠 Cognitive load reduction: you always know where code belongs.
- 🧩 Lazy loading boundaries: features can be loaded independently.
- 👥 Team scale: different teams can own different feature modules.

### How Angular uses it internally 🧠
- NgModules define:
  - template compilation scope (what directives/pipes are visible)
  - DI scope boundaries (especially with lazy loaded modules)
  - routing boundaries (`forRoot` vs `forChild`, `loadChildren`)

---

### A production-friendly structure (example)
```
src/app/
  app.module.ts
  app-routing.module.ts
  app.component.ts

  core/
    core.module.ts
    services/
      auth.facade.ts
      logger.service.ts
    guards/
    interceptors/
    layout/
      shell.component.ts

  shared/
    shared.module.ts
    ui/
    directives/
    pipes/

  features/
    items/
      items.module.ts
      items-routing.module.ts
      pages/
      components/
      data-access/
        items-api.service.ts
        items.facade.ts
        items.models.ts
    users/
      ...
```

---

### CoreModule pattern (singletons + shell)

#### Concepts
- `CoreModule` contains:
  - app shell/layout
  - singleton services (auth, analytics, error handling)
  - guards/interceptors
- Import `CoreModule` **once** in `AppModule` to avoid duplicate singletons.

#### Code example (import guard) ✅
`core.module.ts`:
```ts
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule | null) {
    if (parent) throw new Error('CoreModule should only be imported in AppModule');
  }
}
```

#### ✅ Best Practices
- Put interceptors/guards in core.
- Keep core small; it should not "own" feature UI.

#### ❌ Avoid
- Importing `CoreModule` into lazy loaded feature modules.

---

### SharedModule pattern (UI primitives)

#### Concepts
- Shared should contain reusable UI primitives and utilities:
  - buttons, cards, input wrappers, directives, pipes
- Shared should not usually provide singleton services.

#### Code example
`shared.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardComponent } from './ui/card.component';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [CardComponent, TruncatePipe],
  imports: [CommonModule],
  exports: [CommonModule, CardComponent, TruncatePipe],
})
export class SharedModule {}
```

#### ✅ Best Practices
- Shared exports reusable declarations + `CommonModule`.
- Keep shared stable and boring (it is used everywhere).

#### ❌ Avoid
- "Shared junk drawer" with random feature-specific code.
- Providing singletons in shared (risk of duplicate instances with lazy modules).

---

### Feature modules (domain slices)

#### Concepts
- Each feature module should own:
  - pages (route components)
  - presentational components
  - feature routing module
  - data-access services/facades/models

#### Code example (module + routing)
```ts
@NgModule({
  declarations: [ItemsPageComponent, ItemDetailsPageComponent],
  imports: [SharedModule, ItemsRoutingModule],
})
export class ItemsModule {}
```

#### ✅ Best Practices
- Lazy load major features using `loadChildren`.
- Keep feature APIs narrow (avoid exporting everything).

#### ❌ Avoid
- Feature-to-feature imports (creates tight coupling).
- Putting too much in `AppModule`.

---

### The `forRoot` pattern (when needed)

#### Concept
Some libraries need a "configure once" module:
- `SomeLibModule.forRoot(config)` in `AppModule`
- `SomeLibModule` (or `forChild`) in feature modules

This prevents multiple singleton instances and centralizes config.

### Common mistakes 🧯
- Duplicate singletons due to wrong provider location.
- Circular dependencies from features importing each other.
- `SharedModule` importing feature modules (the worst possible direction).

### 🎯 Interview insights
- Senior-level: "Core for singletons/shell, Shared for UI primitives, Feature for domain slices + lazy loading."
- Mention DI boundaries and lazy loaded module injectors.

---

## 2) State Management (Optional but Useful)

### Concepts
Typical progression:
1. Local component state (small)
2. Feature facade + `BehaviorSubject` (often enough)
3. NgRx (actions/reducers/effects) when complexity demands it

### Why it exists ✅
- 🧠 Prevents state sprawl across components.
- 🧪 Improves testability of complex flows.

### Real-world guidance 🧭
- Use NgRx when:
  - state is large and shared across many features
  - you have complex side effects and need strict flow
  - the team benefits from enforced patterns and tooling
- Otherwise, a facade-based approach is typically faster and simpler.

### ✅ Best Practices
- Expose `vm$`/selectors and command methods from a facade (works with or without NgRx).

### ❌ Avoid
- Picking a heavy state library just because it's popular.

---

## Hands-on (Do This)
- Restructure your app into Core/Shared/Feature modules.
- Lazy load one feature module.
- Move API + state logic into feature `data-access` + facade.

## Exit Criteria
- You can explain boundaries and prevent accidental singleton duplication.
- Your codebase makes feature ownership and module scope obvious.

## Next
- Continue to `../PHASE 9 — Testing & Production Readiness/Readme.md`

