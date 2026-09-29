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

📖 **Plain-English definition**: Angular is a complete "batteries included" toolkit for building web apps — instead of picking a router, a state pattern, and an HTTP client separately (like you might in React), Angular ships all of it together with one opinionated way of wiring things up.

### ⚛️ How This Works in React (Your Mental Anchor)
React itself is just a rendering library — it has no built-in router, DI system, forms library, or HTTP client. You're used to assembling your own stack: `react-router-dom` for routing, `redux`/`zustand`/Context for state, `axios` for HTTP, `react-hook-form` for forms — and you choose each piece yourself. Angular hands you all of that pre-integrated as one opinionated framework, so the mental shift isn't "learn a new library," it's "you're no longer choosing your own stack — you're learning Angular's pre-made one."

```jsx
// React: you pick and wire each of these yourself
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
```

🧪 **SDET / Test Automation Angle**: Because Angular is opinionated about structure (modules → components → services), the app's architecture itself tells you where to draw your test boundaries. Component-level logic and small UI pieces are cheap to test with `TestBed`/`ComponentFixture` (fast, no browser needed), while cross-cutting concerns like routing, guards, and full page flows are better covered by E2E tools (Playwright/Cypress). Knowing "Angular's way" of doing things means you can predict, just from reading a component's decorator and constructor, whether a behavior belongs in a unit/integration test or needs a full browser-driven E2E test.

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
- Concretely, Ivy's compiler turns each template into a `template()` **instruction function** (create + update blocks) attached to the component's static `ɵcmp` definition, rather than the older ViewEngine approach of shipping a generic runtime that dynamically interpreted a template's metadata at runtime. This is why Ivy apps tree-shake unused Angular features and produce smaller bundles — the instructions are just function calls the JS engine can optimize like any other code.

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

### 🔄 SDLC Angle
This is fundamentally a **Requirements/Design-phase** decision — before a single component is written, someone commits to "we're building this as an Angular NgModule app," and that choice shapes how work splits across teams, how the build pipeline is configured, and how new hires onboard. It resurfaces at **Code Review** time when reviewers check whether new code follows "the Angular way" (services for logic, components for UI) instead of fighting the framework, and it matters again at **Maintenance**: architectural choices made here are the difference between a codebase that's easy to extend two years later and one that needs a rewrite.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why would a team choose Angular over a more minimal framework like React for a large enterprise application?"
- **Strong answer:** Angular bundles DI, routing, forms, HTTP, and a CLI-driven build pipeline into one opinionated framework, so large teams get consistent patterns without assembling their own stack from separate libraries. Ivy compiles templates into efficient instruction functions attached to each component, which keeps bundles tree-shakable despite the framework's size. That built-in consistency reduces onboarding time and code-review friction across many contributors, at the cost of some flexibility and a steeper initial learning curve.
- **Level-up:** A junior answer stops at "it has more built-in stuff"; a senior answer weighs the actual trade-off — opinionated structure lowers coordination cost on big teams but raises the hiring bar (need Angular-specific skills) and can feel heavy for a small, fast-moving app.

---

## 2) Modules vs Standalone Components (Modern Angular)

> ✅ For Angular 14 teams, NgModules are still the dominant pattern and the one you must be fluent in.

### Concepts
- An **NgModule** is a compilation + configuration boundary:
  - **declarations**: what this module owns (components, directives, pipes)
  - **imports**: what this module uses (other modules)
  - **exports**: what it shares outward
  - **providers**: services this module contributes to DI

📖 **Plain-English definition**: An NgModule is like a labeled box that groups related components/pipes/directives together and says two things: "here's what's inside this box" (declarations) and "here's what other boxes I'm borrowing from" (imports).

### ⚛️ How This Works in React (Your Mental Anchor)
Honestly, there isn't a strong React equivalent here — React has no compile-time module/scope system that governs which components are "visible" where; every component is just a plain JS export you import wherever you need it, and nothing checks that at build time. The closest thing is a convention like a barrel `index.ts` that re-exports a folder's components for tidier imports, but that's organizational sugar only, not an enforced boundary — there's no Angular-style compiler error for "this component isn't in your module's scope" because React has no such scope to violate.

```ts
// React "barrel" file — just a convention, nothing enforces it
export { Card } from './Card';
export { Button } from './Button';
```

🧪 **SDET / Test Automation Angle**: `TestBed.configureTestingModule({...})` mirrors `@NgModule` exactly — the `declarations`/`imports`/`providers` you pass into a test module determine exactly what a component under test can "see" (which child components render for real vs. need stubbing, which pipes resolve, which services get injected). If a test fails with "'app-x' is not a known element" or "the pipe 'y' could not be found," that's the same module-scope resolution failing in your test module as would fail in the real app — a strong signal to check imports/declarations rather than assume a framework bug.

### Why it exists
- To organize large apps into feature slices.
- To control what is visible where (templates can only use declarations in scope).
- To support lazy loading with the router (load a module only when needed).

### How Angular uses it internally 🔍
- Template compilation builds a "scope" for each component based on its module:
  - what directives/pipes are available in the template
  - what providers are available through injectors created for modules
- Concretely, the Angular compiler (AOT in production builds) generates a `ɵmod` (NgModule definition) and a `ɵinj` (injector definition) for each `@NgModule`. The `ɵmod` records the module's transitive "compilation scope" (all declarables visible to its components' templates), computed once at compile time by walking `imports`/`exports`. This is why an unimported module produces a compile-time-ish template error ("is not a known element") instead of a silent runtime failure — Ivy resolves template scope ahead of time, not by searching the DOM at runtime.

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

### 🔄 SDLC Angle
Slicing an app into feature modules is a **Design-phase** call that goes into the architecture doc early, because module boundaries define lazy-loading chunks and bundle splits — hard to redraw once dozens of features depend on them. It also surfaces constantly in **Code Review**: reviewers check declarations/imports/exports (and provider placement) on every new component's home module. Get providers scoping wrong and it usually isn't caught until **Maintenance**, when someone debugs "why do I have two instances of this singleton?" in production.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's the difference between declarations, imports, and providers in an NgModule, and what goes wrong if provider scoping is wrong?"
- **Strong answer:** Declarations register what a module owns (its components/directives/pipes), imports bring in other modules' exports so their declarables and providers become available, and providers register services on that module's injector. Putting a singleton service's provider in a lazily-loaded feature module instead of root creates a second instance of that service, which silently breaks any state the app assumed was shared.
- **Level-up:** A junior answer recites the three definitions; a senior answer describes the lazy-module duplicate-instance symptom concretely (state not shared between two pages) and explains why `providedIn: 'root'` avoids it by design.

---

## 3) Components (Core Building Block)

### Concepts
- A component = **TypeScript class** + **template** + **styles** + **metadata**.
- Inputs/outputs provide a stable public API for parent/child communication.

📖 **Plain-English definition**: A component is just a small, self-contained piece of UI — its own HTML, its own logic, and its own styles — that you can reuse like a Lego brick.

### ⚛️ How This Works in React (Your Mental Anchor)
A `@Component` class plus its separate template is structurally like a React class component whose `render()` method returns HTML instead of JSX — except the Angular template is compiled ahead of time into instructions, rather than being JS that literally re-runs on every render. `@Input()`/`@Output()` map directly onto React props: `@Input() user` is just `props.user`, and `@Output() selected = new EventEmitter<string>()` is a callback prop like `props.onSelect(id)` — this one maps cleanly, no hand-waving needed.

```jsx
// React
function Counter({ count, onIncrement }) {
  return <button onClick={onIncrement}>{count}</button>;
}
```
```ts
// Angular — same shape, template instead of JSX
@Component({
  selector: 'app-counter',
  template: `<button (click)="onIncrement()">{{ count }}</button>`,
})
export class CounterComponent {
  @Input() count!: number;
  @Output() increment = new EventEmitter<void>();
  onIncrement(): void { this.increment.emit(); }
}
```

🧪 **SDET / Test Automation Angle**: `@Input()`/`@Output()` are the most testable surface in Angular because they're plain properties and event emitters, not DOM details. In a component test, you set `fixture.componentInstance.user = mockUser` and call `component.onSelect()` directly, or spy on the `selected` EventEmitter — no DOM query, no click simulation needed. This is dramatically faster and more deterministic than driving the same interaction through an E2E tool, which has to render the real DOM, wait for it to settle, and simulate a real click. Save full-DOM-driven E2E for verifying the wiring end-to-end, not for exhaustively testing every input/output combination.

### Why it exists
- Separates UI into reusable, testable pieces with clear boundaries.

### How Angular uses it internally 🔍
- Angular creates components through DI, then creates an associated **view**.
- The template compiles to instructions that:
  - read component fields
  - attach event listeners
  - create and update DOM nodes
- Change detection runs, comparing binding values and updating the DOM when needed.
- Concretely, Ivy compiles a component's template into a create-mode function (runs once, builds DOM nodes and binding "slots" via instructions like `ɵɵelementStart`/`ɵɵtext`) and an update-mode function (runs on every change detection pass, re-evaluating bindings and patching only the slots whose values changed). This create/update split — instead of ViewEngine's single dynamically-interpreted template — is why Ivy change detection is close to hand-written imperative DOM code in performance.

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

### 🔄 SDLC Angle
Deciding the smart/dumb component split is an **Implementation-phase** decision, but the real risk here spans **Code Review AND Production/Maintenance**: a missing `OnPush` or a mutated `@Input()` object rarely breaks anything visibly while you're writing it — it surfaces months later as a "the UI feels laggy" or "this list doesn't update" ticket that's hard to trace back to its root cause without knowing the change-detection mental model.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How does Angular decide when to re-render a component, and what's the risk with `OnPush`?"
- **Strong answer:** Default change detection checks every component on every tick, triggered by async events like clicks, timers, or HTTP callbacks running inside zone.js. `OnPush` tells Angular to skip a component's subtree unless an `@Input()` *reference* changes, an event fires inside it, or `markForCheck()` is called explicitly — so mutating an `@Input()` object in place, instead of replacing it with a new reference, means an `OnPush` component silently stops updating.
- **Level-up:** A junior answer says "`OnPush` makes it faster"; a senior answer flags the mutation trap directly and describes the fix — immutable update patterns (spread/copy instead of mutate) or an explicit `markForCheck()` call when a genuinely non-reference-changing update needs to be reflected.

---

## 4) Templates & Data Binding

### Concepts
- **Interpolation**: `{{ value }}`
- **Property binding**: `[disabled]="isSaving"`
- **Event binding**: `(click)="save()"`
- **Two-way binding**: `[(ngModel)]="name"` (requires `FormsModule`)
- **Template reference variables**: `#inputEl`

📖 **Plain-English definition**: Data binding is just Angular keeping your HTML in sync with your TypeScript class automatically — you say "show this value here" or "call this method when clicked," and Angular wires the plumbing so you don't have to manually query the DOM and update it yourself.

### ⚛️ How This Works in React (Your Mental Anchor)
Each binding form maps to something you already write explicitly in JSX: `{{ value }}` interpolation is `{value}`; `[disabled]="isSaving"` property binding is `disabled={isSaving}`; `(click)="save()"` event binding is `onClick={save}`. Two-way binding `[(ngModel)]="name"` is the one worth pausing on — it's Angular collapsing exactly what you write by hand as a controlled input, so nothing is conceptually new, it's just hidden behind syntax.

```jsx
// React controlled input — this is what [(ngModel)] does for you under the hood
<input value={name} onChange={(e) => setName(e.target.value)} />
```

🧪 **SDET / Test Automation Angle**: Because bindings update asynchronously during change detection (not the instant you set a property), a value you just set in a test might not be reflected in the DOM until you call `fixture.detectChanges()` — the same "not-yet-rendered" gap that causes flaky E2E assertions if you check the DOM immediately after an action instead of using `waitFor`/`should('have.text', ...)`. Treat "the DOM hasn't updated yet" as expected async behavior, not a bug, in both unit tests and E2E scripts.

### Why it exists
- Declarative UI + predictable data flow.

### How Angular uses it internally 🔍
- Templates compile to binding instructions. During change detection Angular:
  - evaluates binding expressions
  - updates DOM properties/attributes only if values changed
- Event bindings attach listeners that call component methods in the correct context.
- Each binding gets its own numbered "slot" in the component's `LView` data structure. On every change detection pass, Angular's update instructions re-read the expression and compare it (by identity for most bindings) against the value cached in that slot — only writing to the real DOM when it differs. This is why the framework can afford to re-check bindings frequently: it's cheap slot comparisons, not DOM writes, that happen every tick.

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

### 🔄 SDLC Angle
This is mostly an **Implementation/Code-Review** concern — reviewers should catch expensive method calls or non-trivial logic embedded directly in template expressions, since those re-run on every change-detection pass rather than once. It also touches **Testing**: async binding timing (needing `fixture.detectChanges()`) has to be understood correctly, or a real "not-yet-rendered" gap gets misdiagnosed as a flaky test or a framework bug.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Why would calling a method directly in a template hurt performance, and what would you do instead?"
- **Strong answer:** Template expressions are re-evaluated on every change-detection pass, not once, so a call like `{{ getTotal() }}` recomputes every tick instead of only when its inputs actually change. It's better to bind to a precomputed property that's updated only when the underlying data changes, or move the computation into a pure pipe so Angular can skip recomputation via its identity check.
- **Level-up:** A junior answer just says "it's slow"; a senior answer explains *why* — binding slots are cheap to compare by identity, but an arbitrary function call bypasses that optimization entirely — and proposes a concrete fix (precomputed property, pure pipe, or memoization) rather than just "avoid it."

---

## 5) Directives (Structural & Attribute)

### Concepts
- **Attribute directive**: changes appearance/behavior of an element (e.g., `[ngClass]`).
- **Structural directive**: changes DOM layout by adding/removing templates (e.g., `*ngIf`, `*ngFor`).

📖 **Plain-English definition**: An attribute directive tweaks something that's already on the page (like adding a CSS class or auto-focusing a field); a structural directive decides whether something exists on the page at all, or how many times it repeats (like showing/hiding a block, or looping to render a list).

### ⚛️ How This Works in React (Your Mental Anchor)
`*ngIf="cond"` is the same idea as `{cond && <div>...</div>}` in JSX, and `*ngFor="let x of items"` is `{items.map(x => <li key={x.id}>...</li>)}` — Angular's `trackBy` function solves exactly the problem React's `key` prop solves: telling the framework how to match list items across re-renders instead of destroying and recreating everything. Custom attribute/structural directives, though, have no strong React equivalent — JSX has no separate "directive" concept you attach to an element; the closest analogue is a custom hook that grabs a DOM ref and imperatively manipulates it (e.g., `useRef` + `useEffect` calling `.focus()`), which solves a similar problem through a structurally different mechanism (no reusable "attach this to any element" syntax).

```jsx
// React equivalent of a custom "autofocus" directive
function useAutofocus() {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return ref;
}
// usage: <input ref={useAutofocus()} />
```

🧪 **SDET / Test Automation Angle**: Structural directives are the #1 reason elements "appear/disappear" from the DOM asynchronously — `*ngIf` doesn't hide an element with CSS, it destroys and recreates the actual DOM node (see below), and `*ngFor` re-renders list items as data streams in. This is exactly why Playwright/Cypress selectors should use `waitFor`/`should('exist')` instead of asserting immediately after a trigger — the element genuinely may not exist yet at the moment the test checks. It's also why `data-testid` should always go on the real host element being shown/hidden (e.g., `<div *ngIf="loaded" data-testid="user-card">`) rather than trying to target the structural directive itself — `*ngIf`/`*ngFor` don't render as elements at all; they're compiler sugar with no DOM node of their own.

### Why `*` exists (desugaring) 🧠
`*ngIf="condition"` is syntax sugar for an `<ng-template>`:
```html
<ng-template [ngIf]="condition">
  <div>Shown</div>
</ng-template>
```

### How Angular uses it internally 🔍
- Structural directives receive a `TemplateRef` and a `ViewContainerRef` and decide when/how to create embedded views.
- In the compiled/rendered DOM, `*ngIf`/`*ngFor` leave behind an HTML **comment node** (an anchor, e.g. `<!--ng-container-->` / `<!--bindings={...}-->`) marking where `ViewContainerRef.createEmbeddedView()`/`.clear()` insert or remove the real content. When the condition is false, the entire subtree — including any `data-testid` that lived only on child elements — is gone from the DOM, not just visually hidden; querying for it will legitimately return null/empty until the condition flips.

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

### 🔄 SDLC Angle
Directive-vs-component is mostly an **Implementation** call, but the actual risk lives in **Code Review** — e.g., catching a `data-testid` or analytics hook placed on a structural directive itself instead of the real host element it renders. It also surfaces in **Testing**: an element that's genuinely destroyed (not just visually hidden) needs correct async waits, or tests become flaky for reasons that have nothing to do with the app's actual correctness.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How does `*ngIf` actually work under the hood, and why does that matter when you query the DOM?"
- **Strong answer:** `*ngIf` desugars to an `<ng-template>` wrapped by a structural directive that uses `TemplateRef` and `ViewContainerRef` to create or clear an embedded view. When the condition is false, Angular actually destroys the DOM subtree — leaving only a comment anchor — rather than hiding it with `display: none`, so querying for a hidden element returns null/empty, not an invisible node.
- **Level-up:** A junior answer says "it hides the element"; a senior answer distinguishes create/destroy from CSS visibility and calls out the state-loss implication — a component inside a falsy `*ngIf` is fully destroyed and recreated when the condition flips back, resetting any internal state it held.

---

## 6) Pipes

### Concepts
- Pipes transform values in templates: `{{ amount | currency }}`.
- **Pure pipes** run only when input references change.
- **Impure pipes** run very frequently (almost every change detection) - use sparingly.

📖 **Plain-English definition**: A pipe is a small, reusable formatter you drop into a template with a `|` symbol — like telling Angular "take this raw value and show it prettified" (a date, a currency amount, a truncated string) without writing that formatting logic by hand every time.

### ⚛️ How This Works in React (Your Mental Anchor)
A pipe is the same idea as a plain JS formatting function called inline in JSX — `{{ amount | currency }}` is just `{formatCurrency(amount)}`. React has no pipe operator or template syntax for this, so there's nothing hidden to learn here: you just call the function directly (or wrap it in a tiny formatting component) exactly where you'd otherwise write the piped expression.

```jsx
// React: no pipe syntax — just call the function inline
<p>{formatCurrency(amount)}</p>
```

🧪 **SDET / Test Automation Angle**: Impure pipes (e.g., a "time ago" pipe recalculating `Date.now() - timestamp` on every change-detection tick) are a classic source of **non-deterministic** output for visual-regression/DOM-snapshot testing — the same page can render a different string on every test run depending on wall-clock timing. For test fixtures, prefer pure pipes with stable, explicitly-passed inputs, or freeze/mock the clock (e.g., fake timers, or injecting a fixed "now" value) so the impure pipe's output is reproducible across CI runs.

### Why it exists
- Keeps templates readable by moving formatting/transforms into reusable units.

### How Angular uses it internally 🔍
- Pipe instances are created and cached per view.
- Pure pipes are optimized by reference checks.
- Concretely, Ivy stores a pure pipe's last input(s) and last output alongside the binding slot; on each change detection pass it does a cheap `===` identity check against the previous input(s), and only re-invokes `transform()` if they differ (this is the same mechanism `OnPush` components rely on). An impure pipe (`pure: false`) skips that check entirely and calls `transform()` on every single change detection run, which is why it's both more flexible (can react to non-input changes, like the clock ticking) and more expensive.

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

### 🔄 SDLC Angle
This is almost entirely an **Implementation/Code-Review** concern — reviewers should flag impure pipes (or a pure pipe that secretly does I/O or mutates its input) on sight, since the problem rarely shows up as a functional bug at design time. It typically resurfaces as a **Production/Maintenance** performance complaint once data volume or traffic grows and the pipe is running its `transform()` far more often than anyone expected.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "What's the difference between pure and impure pipes, and why should you be careful with impure ones?"
- **Strong answer:** A pure pipe only recomputes when Angular's identity (`===`) check on its input(s) detects a change, so it's cheap to check on every change-detection pass. An impure pipe (`pure: false`) skips that check and re-invokes `transform()` on every single change-detection run — necessary for something like a live clock, but expensive if used for filtering or sorting arrays.
- **Level-up:** A junior answer says "impure pipes are more flexible"; a senior answer adds the real production caveat — an impure pipe filtering/sorting a large array on every tick becomes a measurable perf bottleneck at scale, and the fix is usually to move that logic into the component/service and bind to a precomputed, reference-stable array instead.

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
