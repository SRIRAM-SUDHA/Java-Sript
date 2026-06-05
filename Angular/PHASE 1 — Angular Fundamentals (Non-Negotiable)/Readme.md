# PHASE 1 - Angular Fundamentals (Non-Negotiable)

## Goal
Become productive with Angular's core building blocks (NgModules, components, templates) and understand how Angular 14 apps are structured and executed in production.

> 🧭 Constraint reminder: these notes stick to Angular 14, NgModule-based apps (no standalone APIs, no Angular 16+ features).

## Topics
1. **Angular Architecture Overview**
   - What Angular is/is not (framework mindset)
   - How Angular apps boot
   - Angular CLI philosophy
2. **Modules vs Standalone Components (Modern Angular)**
   - `NgModule` basics (essential for Angular 14 teams)
   - How Angular resolves dependencies
   - (FYI) Standalone exists, but is out-of-scope here
3. **Components (Core Building Block)**
   - `@Component` decorator + metadata
   - Component class vs template
   - Change detection basics
   - Component communication: `@Input()` / `@Output()`
4. **Templates & Data Binding**
   - Interpolation, property binding, event binding
   - Two-way binding
   - Template reference variables
5. **Directives (Structural & Attribute)**
   - Built-ins: `*ngIf`, `*ngFor`
   - Why `*` exists (desugaring)
   - Writing custom directives
   - Directive vs component decision
6. **Pipes**
   - Built-in vs custom pipes
   - Pure vs impure pipes
   - Performance implications

---

## 1) Angular Architecture Overview

### Concepts
- Angular is a full framework: rendering + DI + routing + forms + HTTP + build tooling conventions.
- Your UI is a tree of components, but Angular's superpower is the platform around it: dependency injection, compiler/runtime, and standardized patterns.

### Why it exists
- Large teams need consistency: predictable structure, testability, and clear seams (services, modules, templates).
- Angular optimizes for long-lived enterprise apps (tooling + patterns > minimal API surface).

### How Angular uses it internally (mental model) 🧠
At runtime, Angular does three key things repeatedly:
1. **Create** component instances (via DI) and render their views.
2. **Check** bindings during change detection (update DOM if values changed).
3. **Destroy** views and clean up when routes/components are removed.

Under the hood (Angular 14):
- Angular uses **Ivy** (the default rendering/compiler engine). Templates compile into efficient instructions.
- Components render as **views** with binding slots, and change detection updates those slots.
- DI works through a hierarchy of **injectors** (deep dive in Phase 2).

### Code example: how an Angular app boots
`main.ts`:
```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

`app.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### ✅ Best Practices
- Keep UI logic in components and business logic in services.
- Prefer Angular CLI conventions for predictable builds and structure.
- Treat `AppModule` as the composition root: keep it small; push features into feature modules.

### ❌ Avoid
- Putting API calls and state mutation directly in components.
- "Mega modules" that declare everything and import everything.

### 🎯 Interview insights
- "What is Angular?" A framework with compiler/runtime + DI; components are the UI surface, but DI and modules drive architecture.
- "How does Angular update the DOM?" Through change detection that checks bindings and applies updates.

---

## 2) Modules vs Standalone Components (Modern Angular)

> ✅ For Angular 14 teams, NgModules are still the dominant pattern and the one you must be fluent in.

### Concepts
- An **NgModule** is a compilation + configuration boundary:
  - **declarations**: what this module owns (components, directives, pipes)
  - **imports**: what this module uses (other modules)
  - **exports**: what it shares outward
  - **providers**: services this module contributes to DI

### Why it exists
- To organize large apps into feature slices.
- To control what is visible where (templates can only use declarations in scope).
- To support lazy loading with the router (load a module only when needed).

### How Angular uses it internally 🔍
- Template compilation builds a "scope" for each component based on its module:
  - what directives/pipes are available in the template
  - what providers are available through injectors created for modules

### Example: SharedModule and FeatureModule
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

`items.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ItemsPageComponent } from './items-page.component';

@NgModule({
  declarations: [ItemsPageComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([{ path: '', component: ItemsPageComponent }]),
  ],
})
export class ItemsModule {}
```

### ✅ Best Practices
- Create **feature modules** per domain area (e.g., `UsersModule`, `OrdersModule`).
- Keep `SharedModule` focused on reusable UI (components/directives/pipes), not singleton services.
- Prefer `CommonModule` in feature modules; only `BrowserModule` goes in `AppModule`.

### ❌ Avoid
- Importing `BrowserModule` anywhere except `AppModule`.
- Providing singleton services in `SharedModule` (can accidentally create multiple instances in lazy-loaded graphs).

### 🎯 Interview insights
- "Why NgModule?" Compilation scope + organization + lazy loading boundary.
- "What's in declarations vs imports?" Declarations are owned; imports bring in other modules' exports.

---

## 3) Components (Core Building Block)

### Concepts
- A component = **TypeScript class** + **template** + **styles** + **metadata**.
- Inputs/outputs provide a stable public API for parent/child communication.

### Why it exists
- Separates UI into reusable, testable pieces with clear boundaries.

### How Angular uses it internally 🔍
- Angular creates components through DI, then creates an associated **view**.
- The template compiles to instructions that:
  - read component fields
  - attach event listeners
  - create and update DOM nodes
- Change detection runs, comparing binding values and updating the DOM when needed.

### Example: "dumb" presentational component API
`user-card.component.ts`:
```ts
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface UserVm {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @Input() user!: UserVm;
  @Output() selected = new EventEmitter<string>();

  onSelect(): void {
    this.selected.emit(this.user.id);
  }
}
```

`user-card.component.html`:
```html
<button type="button" (click)="onSelect()">
  {{ user.name }} ({{ user.role }})
</button>
```

### ✅ Best Practices
- Keep inputs immutable-ish (create new objects rather than mutating in-place), especially with `OnPush`.
- Prefer "smart vs dumb" architecture:
  - **Smart**: container/page components fetch data + orchestrate.
  - **Dumb**: presentational components render + emit events.
- Use `ChangeDetectionStrategy.OnPush` on presentational components by default.

### ❌ Avoid
- Mutating `@Input()` objects inside child components.
- Emitting complex event payloads when a simple id/action is enough.

### 🎯 Interview insights
- "What triggers change detection?" Async events (clicks, timers, HTTP), input reference changes, and explicit triggers like `markForCheck()`.

---

## 4) Templates & Data Binding

### Concepts
- **Interpolation**: `{{ value }}`
- **Property binding**: `[disabled]="isSaving"`
- **Event binding**: `(click)="save()"`
- **Two-way binding**: `[(ngModel)]="name"` (requires `FormsModule`)
- **Template reference variables**: `#inputEl`

### Why it exists
- Declarative UI + predictable data flow.

### How Angular uses it internally 🔍
- Templates compile to binding instructions. During change detection Angular:
  - evaluates binding expressions
  - updates DOM properties/attributes only if values changed
- Event bindings attach listeners that call component methods in the correct context.

### Example: bindings and template refs
`profile.component.html`:
```html
<input #nameInput [value]="name" (input)="name = nameInput.value" />
<button type="button" [disabled]="name.length < 3" (click)="save()">
  Save
</button>
<p>Hello, {{ name }}!</p>
```

### ✅ Best Practices
- Keep template expressions simple (property reads, cheap/stable method calls).
- Prefer `async` pipe for observable values (Phase 2).
- If a computed value is non-trivial, compute it in TS and bind to a property.

### ❌ Avoid
- Calling expensive functions in the template (they run often during change detection).
- Complex logic in `*ngIf`/`*ngFor` expressions.

### 🎯 Interview insights
- "Why does my method run many times?" Because change detection checks bindings frequently; templates are not "called once".

---

## 5) Directives (Structural & Attribute)

### Concepts
- **Attribute directive**: changes appearance/behavior of an element (e.g., `[ngClass]`).
- **Structural directive**: changes DOM layout by adding/removing templates (e.g., `*ngIf`, `*ngFor`).

### Why `*` exists (desugaring) 🧠
`*ngIf="condition"` is syntax sugar for an `<ng-template>`:
```html
<ng-template [ngIf]="condition">
  <div>Shown</div>
</ng-template>
```

### How Angular uses it internally 🔍
- Structural directives receive a `TemplateRef` and a `ViewContainerRef` and decide when/how to create embedded views.

### Example: custom attribute directive
`autofocus.directive.ts`:
```ts
import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.focus();
  }
}
```

### ✅ Best Practices
- Prefer directives for cross-cutting UI behavior (focus, permissions, analytics hooks).
- Keep directives small and reusable; avoid making them mini components.

### ❌ Avoid
- Heavy DOM manipulation (prefer bindings; use `Renderer2` if needed).
- Accessing global DOM directly (breaks SSR/tests).

### 🎯 Interview insights
- "Directive vs component?" Component when you need a template + UI; directive when you're attaching behavior to an existing element/template.

---

## 6) Pipes

### Concepts
- Pipes transform values in templates: `{{ amount | currency }}`.
- **Pure pipes** run only when input references change.
- **Impure pipes** run very frequently (almost every change detection) - use sparingly.

### Why it exists
- Keeps templates readable by moving formatting/transforms into reusable units.

### How Angular uses it internally 🔍
- Pipe instances are created and cached per view.
- Pure pipes are optimized by reference checks.

### Example: pure custom pipe
`truncate.pipe.ts`:
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, max = 20): string {
    const v = value ?? '';
    return v.length > max ? v.slice(0, max - 1) + '...' : v;
  }
}
```

### ✅ Best Practices
- Use pipes for formatting and small transforms.
- Keep pure pipes pure: no hidden state, no side effects.

### ❌ Avoid
- Impure pipes for fetching data or running heavy computations.
- Pipes that mutate their inputs.

### 🎯 Interview insights
- "Why is my pipe slow?" It may be impure or the input reference changes too often; prefer memoized TS or `OnPush` + immutability.

---

## Hands-on (Do This)
- Build a small "Dashboard" app with 3-5 components and reusable UI pieces.
- Must use:
  - `*ngIf`, `*ngFor`
  - `@Input()`, `@Output()`
  - 1 custom pipe
  - 1 custom directive
- Add at least 1 presentational component with `OnPush`.

## Exit Criteria
- You can explain and implement: component <-> template, bindings, directives, pipes, and basic NgModule structure.
- You can debug basic template scope issues ("pipe not found", "directive not known") by reasoning about module imports/exports.

## Next
- Continue to `../PHASE 2 — Services, DI, and State Thinking/Readme.md`
