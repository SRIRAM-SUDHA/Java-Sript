# PHASE 7 - Advanced Component Patterns

## Goal
Master advanced composition patterns (projection, queries), lifecycle timing, and scalable communication patterns that stay maintainable in large Angular 14 apps.

## Topics
1. **Content Projection**
   - `ng-content`
   - Multi-slot projection
   - React children vs Angular projection
2. **View & Content Queries**
   - `@ViewChild`
   - `@ContentChild`
   - Lifecycle timing
   - DOM access patterns
3. **Component Communication Patterns**
   - Input/Output
   - Shared services
   - Store-like patterns / facades
   - Avoiding prop-drilling equivalents

---

## 1) Content Projection

### Concepts
- Content projection lets a component accept and render child content inside its template using `<ng-content>`.
- Angular projects **DOM nodes** into slots. This is not the same as React's element composition.

### Why it exists ✅
- 🧩 Build layout components (cards, modals, tabs) without inventing 20 input properties.
- 🧼 Keep UI composition flexible and readable at the call site.

### How Angular uses it internally 🧠
- Angular compiles `<ng-content>` placeholders.
- At runtime, it distributes the parent's projected nodes into those placeholders.
- Multi-slot projection uses CSS selectors to decide which nodes go where.

### Code examples

#### Single-slot projection (card)
`card.component.html`:
```html
<div class="card">
  <ng-content></ng-content>
</div>
```

Usage:
```html
<app-card>
  <h3>Title</h3>
  <p>Body</p>
</app-card>
```

#### Multi-slot projection (modal)
`modal.component.html`:
```html
<div class="modal">
  <header class="modal__header">
    <ng-content select="[modalTitle]"></ng-content>
  </header>

  <section class="modal__body">
    <ng-content></ng-content>
  </section>

  <footer class="modal__footer">
    <ng-content select="[modalActions]"></ng-content>
  </footer>
</div>
```

Usage:
```html
<app-modal>
  <h3 modalTitle>Delete item?</h3>
  <p>This cannot be undone.</p>
  <div modalActions>
    <button type="button">Cancel</button>
    <button type="button" class="danger">Delete</button>
  </div>
</app-modal>
```

### ✅ Best Practices
- Document your projection "slots" (attributes like `modalTitle`, `modalActions`).
- Use projection for layout; use inputs for simple configuration.

### ❌ Avoid
- Overusing projection when it makes usage unclear.
- Deeply nested projection chains that are hard to debug.

### Common mistakes 🧯
- Assuming projected content belongs to the child component's scope for styling (encapsulation can affect this).
- Trying to "reach into" projected content with DOM queries instead of using content queries (next section).

### 🎯 Interview insights
- Strong answer: "Angular projects DOM nodes into `<ng-content>`; multi-slot uses selectors."

---

## 2) View & Content Queries (`@ViewChild` / `@ContentChild`)

### Concepts
- `@ViewChild` queries things in **your view** (your template).
- `@ContentChild` queries things in **projected content** (inserted via `<ng-content>`).
- Common targets:
  - component instances (best case)
  - directives
  - `ElementRef` (last resort)

### Why it exists ✅
- 🧰 Sometimes you need imperative coordination:
  - focus management
  - measuring element size
  - calling a child component API

### Lifecycle timing (this matters) 🧠
- View queries:
  - resolve after the view is created
  - use `ngAfterViewInit` (default `static: false`)
- Content queries:
  - resolve after content projection
  - use `ngAfterContentInit`

### Code examples

#### `@ViewChild` to call a child component API ✅
`toast.component.ts`:
```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-toast', template: `<p *ngIf="open">Saved!</p>` })
export class ToastComponent {
  open = false;
  show(): void {
    this.open = true;
    setTimeout(() => (this.open = false), 1500);
  }
}
```

Parent:
```ts
import { Component, ViewChild } from '@angular/core';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-settings-page',
  template: `
    <button type="button" (click)="save()">Save</button>
    <app-toast></app-toast>
  `,
})
export class SettingsPageComponent {
  @ViewChild(ToastComponent) private toast!: ToastComponent;

  save(): void {
    // save logic...
    this.toast.show();
  }
}
```

#### `@ContentChild` for projected header component
If your modal expects a projected title component/directive, query it:
```ts
import { Component, ContentChild, AfterContentInit } from '@angular/core';

@Component({ selector: 'app-modal-title', template: `<ng-content></ng-content>` })
export class ModalTitleComponent {}

@Component({ selector: 'app-modal', templateUrl: './modal.component.html' })
export class ModalComponent implements AfterContentInit {
  @ContentChild(ModalTitleComponent) titleComp: ModalTitleComponent | null = null;

  ngAfterContentInit(): void {
    // now titleComp is available (if provided)
  }
}
```

### ✅ Best Practices
- Prefer querying component/directive instances, not raw elements.
- Keep queries for integration needs (focus, calling child API), not for general state sharing.
- If you need to imperatively update UI in an `OnPush` component, use `ChangeDetectorRef` intentionally.

### ❌ Avoid
- Direct DOM mutation via `ElementRef.nativeElement` (SSR/tests break; use `Renderer2` if needed).
- Using `@ViewChild` as an excuse to violate component boundaries.

### Common mistakes 🧯
- Query is `undefined` because you used it before the correct lifecycle hook.
- Confusing `@ViewChild` with `@ContentChild` (view vs projected content).

### 🎯 Interview insights
- Mention lifecycle timing and why `static` exists (compile-time query timing).

---

## 3) Component Communication Patterns

### Concepts
Communication tools, in order of preference:
1. **Inputs** for parent -> child data
2. **Outputs** for child -> parent events
3. **Feature facade/service** for shared state and business logic
4. **Component-level providers** for scoped state (wizard/page instance)

### Why it exists ✅
- 🧱 Keeps your component tree maintainable.
- 🧪 Keeps state and side effects testable (services).

### How Angular uses it internally 🔍
- Inputs update during change detection.
- Outputs use `EventEmitter` (a Subject) to emit values on events.

### Real-world patterns 🧰

#### A) Smart vs dumb components (default scalable pattern) ✅
- Smart/container/page:
  - fetch and orchestrate via a facade
  - builds `vm$` stream
- Dumb/presentational:
  - renders inputs
  - emits output events
  - typically `OnPush`

#### B) Facade pattern (feature state)
- Facade exposes:
  - `loading$`, `data$`, `error$` or `vm$`
  - commands: `load()`, `save()`, `select(id)`

#### C) Scoped state via component providers
Use when you need a state instance per page instance:
```ts
@Component({
  selector: 'app-wizard-page',
  templateUrl: './wizard-page.component.html',
  providers: [WizardFacade],
})
export class WizardPageComponent {}
```

### ✅ Best Practices
- Keep presentational components pure and predictable (`OnPush`, immutable inputs).
- Prefer `async` pipe over manual subscriptions in components.
- Use facade for side effects and state.

### ❌ Avoid
- Global event-bus Subjects as a shortcut (hard to trace).
- Two-way binding of complex objects between many components.

### Common mistakes 🧯
- Prop drilling: passing too many inputs through intermediate components.
  - Fix: introduce a feature facade at the right boundary or redesign components.
- "Output spam": emitting complex objects for every keypress without throttling/debouncing.

### 🎯 Interview insights
- A senior answer compares options and chooses the simplest:
  - "Inputs/outputs locally; facade for feature state; component providers for scoped state."

---

## Hands-on (Do This)
- Build a reusable Modal using multi-slot projection.
- Use `@ViewChild` to call a child API (toast/focus), not to mutate internals.
- Refactor one feature to smart/dumb components + facade.

## Exit Criteria
- You can design reusable components and choose communication patterns deliberately.
- You can explain query timing and projection mechanics.

## Next
- Continue to `../PHASE 8 — Project Structure & Scalability/Readme.md`
