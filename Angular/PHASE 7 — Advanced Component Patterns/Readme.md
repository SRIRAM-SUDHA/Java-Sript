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

📖 **Plain-English definition**: content projection is Angular's way of letting a component say "put whatever HTML the caller hands me, right here" instead of hardcoding every bit of markup itself — like a picture-frame component: you supply the picture, the frame component just wraps it in the right spot.

### ⚛️ How This Works in React (Your Mental Anchor)
- `<ng-content></ng-content>` ~ `{props.children}` in React — this is nearly a direct 1:1. A component that does `<div class="card"><ng-content></ng-content></div>` is doing exactly what `function Card({ children }) { return <div className="card">{children}</div>; }` does: "render whatever the caller put between my tags."
- Multi-slot projection (`<ng-content select="[modalTitle]">`) has no single matching React primitive — React doesn't have "named slots" baked into JSX. The idiomatic React equivalent is passing multiple named props that are themselves JSX elements instead of relying on one `children` slot:
```jsx
function Modal({ title, children, actions }) {
  return (
    <div className="modal">
      <header className="modal__header">{title}</header>
      <section className="modal__body">{children}</section>
      <footer className="modal__footer">{actions}</footer>
    </div>
  );
}

// usage
<Modal
  title={<h3>Delete item?</h3>}
  actions={<><button>Cancel</button><button className="danger">Delete</button></>}
>
  <p>This cannot be undone.</p>
</Modal>;
```
- Side-by-side takeaway: Angular's `select="[attr]"` matches on the *shape* of what's passed between the tags (an attribute on a node); React's version just uses more named props instead. Angular's single catch-all `<ng-content>` corresponds to React's one true `children` prop — everything else (`title`, `actions`) is modeled as ordinary extra props rather than extra slots.

🧪 **SDET / Test Automation Angle**: because a projecting component (card, modal, tabs) doesn't own the markup inside its slots, the same `<app-modal>` can render wildly different DOM depending on what's projected into it — one screen might project a `<form>`, another a `<table>`. Automation selectors should never assume a fixed structure "inside" the projecting component (e.g. `.modal > div:nth-child(2) > button`); instead, target stable attributes on the projected content itself, like `data-testid="confirm-delete-btn"` on the button the caller placed there. This also matters for Page Object Models: the modal's "shell" locators (header/body/footer regions) belong to the modal's own object, but the content inside a slot belongs to whatever component/page projected it in.

### Why it exists ✅
- 🧩 Build layout components (cards, modals, tabs) without inventing 20 input properties.
- 🧼 Keep UI composition flexible and readable at the call site.

### How Angular uses it internally 🧠
- Angular compiles `<ng-content>` placeholders at **compile time** into projection instructions on the component's generated view factory — the `select` attribute becomes a CSS-selector-like matcher baked into that factory, not something evaluated at runtime per click.
- At runtime, Angular walks the **top-level nodes** the parent passed between the component's tags and buckets each one into the first matching `<ng-content select="...">` slot; matching only looks at each node's own tag/attributes, not its descendants.
- Multi-slot projection is resolved in slot order: a node goes into the first slot whose selector matches; a plain `<ng-content></ng-content>` (no `select`) acts as the catch-all for anything left over. If there's no catch-all slot, unmatched projected nodes are simply not rendered.
- Projected content keeps the **parent's binding context** — expressions inside projected markup still resolve against the parent component's `this`, not the child's, since Angular never re-parents the template's data context during projection.

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

### 🔄 SDLC Angle
Content projection decisions mostly surface at **Design** time — when you're designing a shared component (a card, modal, or tabs component) that other teams will reuse, you decide up front what should be a projectable slot vs. a plain `@Input`. It resurfaces at **Code Review**: reviewers push back on components that keep growing new `@Input` properties for layout tweaks instead of exposing a slot, or on projection APIs so deeply nested that nobody can tell what goes where. It's rarely a Maintenance-phase concern on its own, unless the slot "contract" (e.g. which attributes like `modalTitle`/`modalActions` are expected) was never documented — then every new consumer has to reverse-engineer it from the component's HTML.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "How would you design a reusable Modal or Card component that other teams can use for very different content without you constantly adding new `@Input` properties?"
- **Strong answer:** Use `<ng-content>` for layout flexibility — a single catch-all slot for simple wrappers, multi-slot projection with `select="[attr]"` when the component has fixed regions (header/body/footer). Keep `@Input`s for actual configuration (size, disabled state) and projection for "arbitrary markup the caller controls." Mention that Angular projects raw DOM nodes matched at compile time, unlike React's more dynamic `children`/composition model.
- **Level-up:** A junior answer stops at "use `ng-content`." A senior answer adds the failure modes — unmatched projected nodes silently disappear if there's no catch-all slot, projected content keeps the *parent's* binding context (not the child's), and documents the slot contract so consumers don't have to guess.

---

## 2) View & Content Queries (`@ViewChild` / `@ContentChild`)

### Concepts
- `@ViewChild` queries things in **your view** (your template).
- `@ContentChild` queries things in **projected content** (inserted via `<ng-content>`).
- Common targets:
  - component instances (best case)
  - directives
  - `ElementRef` (last resort)

📖 **Plain-English definition**: `@ViewChild`/`@ContentChild` are how a component reaches out and grabs a handle to a piece of its own template (or to content someone projected into it) — similar in spirit to `document.querySelector`, except Angular decides *when* that handle becomes available based on its own rendering lifecycle, not the moment your code runs.

### ⚛️ How This Works in React (Your Mental Anchor)
- `@ViewChild` grabbing a raw DOM node ~ React's `useRef()` + the `ref` attribute: `const inputRef = useRef(); <input ref={inputRef} />; inputRef.current.focus();`. Both are "give me an imperative handle to something in my own rendered output, once it exists" — a close, honest mapping.
- `@ViewChild` grabbing a *child component's* instance (e.g. `this.toast.show()`) maps to React's `forwardRef` + `useImperativeHandle` pattern — the explicit, modern way a React function component exposes an imperative API to its parent:
```jsx
const Toast = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    show: () => { setOpen(true); setTimeout(() => setOpen(false), 1500); },
  }));
  return open ? <p>Saved!</p> : null;
});

function SettingsPage() {
  const toastRef = useRef();
  return (
    <>
      <button onClick={() => toastRef.current.show()}>Save</button>
      <Toast ref={toastRef} />
    </>
  );
}
```
  Both exist for the same reason: "just pass a prop" doesn't cover imperative calls like focus, play, open, or show.
- `@ContentChild` (reaching into *projected* content to find one specific child) is closer to React's older `React.Children.map` / `React.Children.only` pattern — walking `props.children` to find, inspect, or clone a particular element (e.g. a `<Tabs>` component locating each `<Tab/>` child). It's a real, still-used pattern in some component libraries, but it's considered a bit old-fashioned in modern React, where context or explicit render props are usually preferred over inspecting `children` directly.
- Lifecycle timing (`static: true`/`false`, `ngAfterViewInit` vs `ngAfterContentInit`) has no real React equivalent worth memorizing — React has no compile-time "static vs dynamic query" split. `useRef`/`useImperativeHandle` values are simply available once the DOM has committed (roughly comparable in spirit to `ngAfterViewInit`), without Angular's separate static-resolution machinery.

🧪 **SDET / Test Automation Angle**: these decorators are usually a sign that something happens **imperatively, outside the normal binding cycle** — an input autofocusing itself, a child component running its own validation, a toast appearing after a delay. For an SDET this is a flag that the element's "ready to interact with" moment may lag behind the DOM simply existing: a test that clicks an input the instant it appears in the DOM can flake if that input's focus/state is still being set via a `@ViewChild` call in `ngAfterViewInit`. When a bug report mentions "works most of the time but occasionally the focus/highlight doesn't happen," check whether a `@ViewChild`/`@ContentChild` timing issue (wrong lifecycle hook, or `static` mismatch) is the root cause before blaming the test.

### Lifecycle timing (this matters) 🧠
- View queries:
  - resolve after the view is created
  - use `ngAfterViewInit` (default `static: false`)
- Content queries:
  - resolve after content projection
  - use `ngAfterContentInit`
- **`static: true` vs `static: false` (why both exist)**:
  - `{ static: true }` resolves the query **before** the first change detection run, so it's already populated in `ngOnInit`. Angular can only do this when the queried node isn't inside a structural directive (`*ngIf`/`*ngFor`) — i.e. its presence can't change based on data.
  - `{ static: false }` (the default since Angular 8+) resolves **after** the view has been checked once, in `ngAfterViewInit`, because Angular must run change detection first to know whether structural directives actually rendered the node at all.
  - Content queries (`@ContentChild`/`@ContentChildren`) always resolve after `ngAfterContentInit`/`ngAfterContentChecked` — one tick later than view queries — because Angular has to finish projecting the parent's content into the component's slots before it can query inside that projected content.
  - Practical effect: reading a `@ViewChild` value inside `ngOnInit` when it needs `static: false` (or vice-versa) silently returns `undefined` — a very common source of "why is my ref null" bugs.

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

### 🔄 SDLC Angle
This concept is squarely an **Implementation-phase** decision (picking `static: true` vs `false`, `ViewChild` vs `ContentChild`) that turns into a **Maintenance/debugging** problem later. "Why is my ref undefined" and "the focus/highlight only sometimes works" are classic production bug reports that trace back to a lifecycle-timing mismatch (wrong hook, wrong `static` flag, or querying before content projection has run) rather than to "flaky" UI — so this is exactly the kind of thing an on-call developer needs to recognize fast instead of guessing at CSS or randomly adding `setTimeout`s.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "You inject a `@ViewChild` and it's `undefined` inside `ngOnInit` — walk me through why, and how you'd fix it."
- **Strong answer:** View queries populate after the view is created; with the default `static: false` Angular must run change detection once first (because a structural directive like `*ngIf` might mean the node doesn't exist yet), so the value is only guaranteed inside `ngAfterViewInit`. `static: true` can only be used when the node's presence can't depend on data (i.e. not inside `*ngIf`/`*ngFor`), letting Angular resolve it before `ngOnInit`. Content queries (`@ContentChild`) resolve one tick later still, in `ngAfterContentInit`, because projection has to finish first.
- **Level-up:** A junior answer names the two hooks. A senior answer explains *why* the timing exists mechanically (CD must run before Angular can know if a structural directive rendered the node), and connects it to a real debugging story — e.g. tracing an intermittent "focus doesn't happen" bug back to a `static`/hook mismatch instead of blaming the browser or the test.

---

## 3) Component Communication Patterns

### Concepts
Communication tools, in order of preference:
1. **Inputs** for parent -> child data
2. **Outputs** for child -> parent events
3. **Feature facade/service** for shared state and business logic
4. **Component-level providers** for scoped state (wizard/page instance)

📖 **Plain-English definition**: this is just "how do two parts of the UI talk to each other" — either directly, like passing a note from parent to child and back (`@Input`/`@Output`), or indirectly, like everyone reading and writing to the same shared whiteboard (a service that holds state).

### ⚛️ How This Works in React (Your Mental Anchor)
- `@Input()`/`@Output()` ~ props and callback props — the cleanest, most direct mapping in this entire roadmap. `@Input() label: string` is just `<Component label="..." />`; `@Output() saved = new EventEmitter<void>()` is just a callback prop (`<Component onSaved={() => ...} />`). Both are "parent owns the data, child receives it and reports back by calling a function."
- A shared Angular service (injected into multiple components via DI, holding shared state) ~ a React Context Provider wrapping a subtree (`<MyContext.Provider value={state}>`), or a lightweight external store like Zustand/Redux consumed by multiple components. Both answer the same question: "several components, not in a direct parent-child line, need the same state — where does it live?"
- "Prop drilling" is the *exact same named problem* in both ecosystems — passing a value down through several intermediate components that don't themselves need it, just to get it to a deeply nested one. Angular's fix is DI (inject the facade/service directly wherever it's needed, skipping the intermediate layers); React's fix is Context (or a store) for the identical reason — both let a deeply nested component "reach up" for shared state without every component in between forwarding it as a prop.
- One real difference: Angular's DI is hierarchical and structural (root injector vs. a lazy module's child injector vs. a component-level provider each give you a different, well-defined singleton scope for free), whereas React Context is purely a tree-position mechanism — "whichever Provider is the nearest ancestor wins" — with no separate notion of module-level injector scoping.

🧪 **SDET / Test Automation Angle**: apps that centralize state in a shared service/facade (instead of passing data down through five levels of `@Input`) are dramatically easier to drive in tests. In an integration test (e.g. Angular `TestBed` + component harness), you can often inject the facade/service directly and call `facade.setState(...)` or read `facade.data$` to seed or assert application state, instead of clicking through the UI just to get the app into the state under test. This is faster and far less flaky than pure end-to-end UI setup, and it's a strong reason to push for facade-based architecture even outside of "clean code" arguments — it directly lowers test cost and flakiness.

### How Angular uses it internally 🔍
- Inputs are compiled into property-binding instructions (`ɵɵproperty`) that Angular re-evaluates top-down on every change detection pass; when several bound inputs change in the same cycle, Angular batches them into a single `ngOnChanges` call with one `SimpleChanges` map rather than firing once per property.
- Outputs use `EventEmitter`, which is a thin wrapper around an RxJS `Subject` — the compiled template subscribes to it via a `ɵɵlistener` instruction, and Angular automatically unsubscribes when the component is destroyed, so you don't manage that subscription by hand.
- A shared service registered with `providedIn: 'root'` (or provided in `CoreModule`, imported once) becomes a true singleton in the root injector, so every component that injects it shares the exact same instance/state — this is the mechanical reason "service as store" works at all.

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

### 🔄 SDLC Angle
Choosing a communication pattern is a **Design-phase** call made when a feature is first sketched out (how many components will need this piece of state, will it cross feature boundaries), but it shows up constantly at **Code Review** too — "this should be an `@Output`, not a shared Subject" or "you're prop-drilling this through three components, pull it into a facade" are some of the most common review comments on Angular PRs. Get it wrong early and it becomes a **Maintenance** tax: prop-drilling and ad-hoc event buses are exactly the kind of thing that make a codebase progressively harder to change six months later.

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "Two sibling components need to share state that changes often — how do you wire that up, and why not just use a global event bus?"
- **Strong answer:** Reach for the least powerful tool that fits: `@Input`/`@Output` for direct parent-child, a feature facade/service (singleton via `providedIn: 'root'` or `CoreModule`) when several components across a feature need the same state, and component-level `providers` when the state should be scoped to one page/wizard instance rather than shared app-wide. Explain that a shared service works because Angular's DI gives every injector-scoped consumer the *same instance*.
- **Level-up:** A junior reaches for a shared service (or worse, a global Subject) for everything. A senior explains the trade-off — global event buses are hard to trace/debug because any consumer can emit or listen from anywhere — and can also explain how a facade-based design pays off in testability (inject the facade in `TestBed` and set state directly instead of driving the UI).

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
