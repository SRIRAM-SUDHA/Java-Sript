# PHASE 0 - Prerequisites Alignment (Angular-Ready)

This phase answers one question only:

> "Why does Angular code look the way it does?"

---

## 1) TypeScript - How Angular Actually Uses It

Angular does not use TypeScript as "typed JavaScript".
It uses TypeScript as a **design + metadata** language.

### 1.1 Classes (Not Optional in Angular) 🧠

📖 **Plain-English definition:** A class is a blueprint for creating objects that bundle related data (properties) and behavior (methods) together. Angular uses a class as the blueprint for literally everything — every component, service, directive, and pipe.

### ⚛️ How This Works in React (Your Mental Anchor)

React devs mostly write function components today, but classes aren't foreign — pre-hooks React was built entirely on `class extends React.Component`, with `this.state`, `this.props`, and lifecycle methods like `componentDidMount`. The difference is that React treated classes as one option among several and mostly moved away from them after hooks landed (2019), while Angular never moved away — classes remain mandatory for every component, service, directive, and pipe, because DI and decorators are built around class constructors and class-level metadata.

```js
// React class component (pre-hooks / legacy) — this is what you already know
class UserComponent extends React.Component {
  state = { name: 'Sri' };
  render() {
    return <h1>{this.state.name}</h1>;
  }
}
```

```ts
// Angular — this is still the ONLY way to write a component, no function-component option exists
export class UserComponent {
  name: string = 'Sri';
}
```

In React, classes are legacy. In Angular, **classes are the foundation**.

```ts
export class UserComponent {
  name: string = 'Sri';
}
```

Why classes matter:
- ✅ DI relies on class constructors
- ✅ Decorators attach metadata to classes
- ✅ Lifecycle hooks are class methods

Angular thinking:
> A component is an object with a lifecycle, not a function.

---

### 1.2 Access Modifiers (Very Important) 🔐

📖 **Plain-English definition:** Access modifiers (`public`, `private`, `protected`) control which parts of your code are allowed to see or touch a class member. `public` means "anyone can access this," `private` means "only this class can," and `protected` means "this class and any class that extends it can."

### ⚛️ How This Works in React (Your Mental Anchor)

Plain JS/React has no compile-time-enforced privacy in this sense — until native `#private` class fields, "private" in a React function component just meant "a variable declared in the closure that isn't returned or exposed to the caller." There is no template-visibility concept at all in JSX, because JSX has direct closure access to everything in scope: you can reference any local variable, state, or helper function directly in the JSX you return, nothing is "walled off" the way a template is. Angular's template is a separate compiled artifact, not a closure over the class body, which is exactly why it needs an explicit `public`/`private` contract to know what's reachable from it.

```js
// React — "cache" is simply not returned/exposed; there's no enforced privacy,
// JSX could reference it directly if it wanted to, nothing stops it
function UserComponent() {
  const cache = new Map();
  const title = 'Users';
  return <h1>{title}</h1>;
}
```

Angular uses access modifiers intentionally:

```ts
export class UserComponent {
  public title = 'Users';
  private cache = new Map();
  protected config = {};
}
```

Template visibility:
- `public` -> accessible in template
- `private` -> not accessible in template
- `protected` -> not accessible in template (template is not a subclass)

```html
<!-- ✅ Works -->
<h1>{{ title }}</h1>

<!-- ❌ Fails -->
{{ cache }}
```

Rule:
> 👉 If the template needs it, it must be `public`.

---

### 1.3 Generics (Angular Uses Them Everywhere) 🧰

### ⚛️ How This Works in React (Your Mental Anchor)

This one maps cleanly if you've used TypeScript with React — generics work identically, Angular just leans on them more pervasively. You've almost certainly already typed `useState<User | null>(null)` or a generic `fetch<T>` wrapper; `http.get<User[]>('/api/users')` is the exact same pattern applied to Angular's `HttpClient` instead of `fetch`. This isn't an Angular-specific concept at all — it's plain TypeScript generics — Angular's APIs (Router, Forms, HttpClient) just expose typed generic signatures everywhere instead of leaving you to cast or type responses manually.

```ts
// React + TS — you already do this
const [user, setUser] = useState<User | null>(null);

// Angular — same generic-typing instinct, different API surface
http.get<User[]>('/api/users');
```

Angular APIs use generics heavily:

```ts
http.get<User[]>('/api/users');
```

Why it matters:
- better refactoring
- safer API usage
- clearer contracts

---

### 1.4 SDLC & Interview Angle for TypeScript in Angular 💼

🔄 **SDLC Angle:** TypeScript's role in Angular is most visible at **Implementation** and **Code Review** time. During implementation, generics and access modifiers push design decisions earlier — you decide what a service's public contract looks like (what's `public` vs `private`) before you write the template that consumes it, instead of discovering the contract by trial and error at runtime. During code review, a reviewer can catch a whole class of bugs (wrong type passed to a service, a typo'd property name, a template trying to read a private field) at compile time or in the IDE, before the change ever reaches a test environment — which is exactly why TypeScript-heavy PRs tend to generate fewer "it broke in QA" surprises than loosely-typed JS PRs.

💼 **SDE Interview & Job Search Angle:**
- **Likely question:** "Angular requires TypeScript and leans on it heavily with classes and generics — why do you think that design choice was made, versus JavaScript's more flexible style?"
- **Strong answer:** "Angular uses TypeScript as more than 'JS with types' — classes are the foundation that decorators attach metadata to, and DI relies on constructor parameter types to know what to inject. Generics like `http.get<User[]>()` give you compile-time safety on API responses so a typo or shape mismatch is caught before runtime. For a framework meant to scale across large teams and long-lived codebases, catching errors at compile time instead of in production is a deliberate trade-off in favor of safety over flexibility."
- **Level-up:** A junior answer says "TypeScript catches typos." A senior answer explains *why* Angular specifically needs it — DI's reflection-based wiring and decorator metadata don't work the same way in plain JS — and can also name the honest cost: stricter typing slows down quick prototyping, which is why Angular is a better fit for long-lived apps than for a weekend MVP.

---

## 2) ES Decorators - Angular's Backbone 🧩

📖 **Plain-English definition:** A decorator is a special function, written as `@SomethingLikeThis` directly above a class, that attaches extra information (metadata) to that class without changing the code inside it — think of it as a label that tells Angular "treat this class as a component" or "this class is allowed to be injected elsewhere."

### ⚛️ How This Works in React (Your Mental Anchor)

There's genuinely no 1:1 React equivalent here — decorators are compiler/metadata-level constructs, not a runtime wrapper. The closest React concept is a Higher-Order Component (`withAuth(MyComponent)`) or a custom hook that "wraps" behavior around a component, but those execute at runtime and return a new function/component; `@Component` and `@Injectable` instead attach static metadata that Angular's compiler reads ahead of time to generate code, before anything is rendered or instantiated. Honestly, the closer real-world comparison isn't React at all — it's something like NestJS decorators (`@Controller`, `@Injectable` — not a coincidence, Angular and NestJS share the same DI philosophy) or TypeORM's `@Entity`/`@Column`. Those are the same "declarative metadata, not a wrapper" pattern, and none of them have a true React parallel either.

```js
// React HOC — the *closest* analogy, but still fundamentally different:
// this runs at render time and returns a new component
function withAuth(Component) {
  return function Wrapped(props) {
    return <Component {...props} />;
  };
}
```

```ts
// Angular — no function is "called" to wrap anything; this is metadata
// the compiler reads ahead of time to generate rendering/DI code
@Component({ selector: 'app-user', templateUrl: './user.component.html' })
export class UserComponent {}
```

Decorators are not just syntax sugar in Angular.
They are compiler-visible metadata.

### 2.1 What a Decorator Really Is
```ts
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent {}
```

Mental model:
> "Attach metadata to this class so Angular knows how to compile and use it."

---

### 2.2 `@Component`
Defines:
- how the class becomes UI
- how it connects to template/styles
- how it participates in change detection

---

### 2.3 `@Injectable` (Services)
```ts
@Injectable({ providedIn: 'root' })
export class AuthService {}
```

This tells Angular:
- this class can be injected
- its lifetime is managed by DI
- its scope is defined (`root`, module providers, component providers, etc.)

Important:
```ts
// ❌ Never do this
const auth = new AuthService();

// ✅ Angular does this (via DI)
constructor(private readonly auth: AuthService) {}
```

---

### 2.4 Decorators vs React (quick comparison)
| React | Angular |
|------|---------|
| Mostly functions | Decorated classes |
| Runtime composition | Compiler-visible metadata |
| Manual wiring | Declarative configuration |

Angular mindset:
> "Describe intent, let the framework execute."

🔄 **SDLC Angle:** Decorators matter most during **Design/Implementation** and **Maintenance**. At design time, deciding a class is a `@Component` vs `@Injectable` vs `@Directive` is deciding its *role* in the system up front — the decorator is effectively a piece of self-documenting architecture that a new engineer (or a reviewer) can read without opening the class body. During maintenance, decorator metadata is often the first thing you check when debugging a "why isn't this being injected / rendered" production issue — e.g., confirming a service's `providedIn` scope actually covers the module that's failing to resolve it, or that a component's `selector` matches what a parent template is using.

💼 **SDE Interview & Job Search Angle:**
- **Likely question:** "Why does Angular use decorators like `@Component` and `@Injectable` instead of just plain classes or functions?"
- **Strong answer:** "Decorators attach compiler-visible metadata to a class without changing its logic — `@Component` tells Angular's compiler how to turn this class into UI, and `@Injectable` tells the DI system this class can be constructed and handed to whoever asks for it. It's a declarative style: instead of manually wiring up rendering or instantiation like you might in vanilla JS, you describe the class's role and Angular's compiler and injector do the wiring for you at build/runtime."
- **Level-up:** A junior answer says "decorators add metadata." A senior answer can explain the practical debugging implication — a missing or misconfigured decorator (e.g., forgetting `providedIn`, or a `NgModule` not declaring a component) is one of the most common "it compiles but doesn't work" bug classes in Angular, and knowing to check decorator metadata first is a real time-saver in production incident triage.

---

## 3) RxJS Mental Model (Biggest Shift) 🌊

📖 **Plain-English definition:** RxJS is a library for working with values that arrive over time — clicks, HTTP responses, timers — as "streams" you can transform and combine. Instead of getting one value once, you subscribe to a stream and your code reacts every time a new value shows up.

### ⚛️ How This Works in React (Your Mental Anchor)

React has no built-in equivalent to a multi-value, cancelable stream — the closest native tool is a Promise (`fetch().then()`), which gives you exactly one value and no cancellation. Since hooks, React devs handle "things that happen over time" (clicks, timers, async fetches) with inline logic inside `useEffect` plus a manual cleanup function, rather than a dedicated streams library. This isn't a "React can never do this" situation, though — RxJS is a plain JS library, and plenty of React codebases do import `rxjs` and use Observables inside `useEffect` for the same reasons Angular does (cancellable search-as-you-type, combining multiple event sources); Angular is just unusual in making that pattern the default everywhere instead of an occasional import.

```js
// React — the "no RxJS" default: a manual cancelled-flag replaces unsubscribe
useEffect(() => {
  let cancelled = false;
  fetchUser(id).then((data) => {
    if (!cancelled) setUser(data);
  });
  return () => { cancelled = true; }; // your hand-rolled "unsubscribe"
}, [id]);
```

Angular leans heavily on RxJS:
- HTTP (`HttpClient`)
- Router params/events
- Forms `valueChanges`
- Many libraries and UI patterns

### 3.1 Promise vs Observable (correct mental model)

📖 **Plain-English definition:** A Promise represents a single future value that starts computing immediately and can't be cancelled. An Observable represents zero-to-many future values that don't start doing anything until something subscribes, and that subscription can be cancelled (unsubscribed) at any time.

### ⚛️ How This Works in React (Your Mental Anchor)

React devs are fluent in Promises — `fetch(url).then(res => res.json())` — because that's the only async primitive the browser/React ecosystem hands you natively. A Promise's "eager, single-value, uncancellable" behavior is so normalized in React that the Observable's opposite behavior (lazy, multi-value, cancellable) can feel like the "extra" concept, when really it's just a more general tool solving the same problem. Concretely: in React you cancel an in-flight `fetch` by wiring up an `AbortController` yourself; in Angular, cancelling is just `subscription.unsubscribe()` — same end goal, but Observables make cancellation the default posture instead of a manual opt-in.

```js
// React — manual cancellation via AbortController
const controller = new AbortController();
fetch('/api/user', { signal: controller.signal }).then((res) => res.json());
controller.abort(); // you have to remember to wire this up

// Angular — cancellation is a first-class, built-in operation
const sub = this.http.get('/api/user').subscribe();
sub.unsubscribe();
```

Promise:
- one value
- eager (starts immediately)
- not cancelable

Observable:
- 0..N values over time
- lazy (does nothing until subscribed)
- cancelable (unsubscribe)
- composable (operators)

```ts
this.http.get('/api'); // nothing happens until subscribed
```

Rule of thumb:
> 👉 HTTP, routing, forms, events -> think Observables.

---

### 3.2 `async` pipe = subscription management ✅
```ts
user$ = this.http.get<User>('/api/user');
```

Template:
```html
<div>{{ user$ | async | json }}</div>
```

What happens:
1. Angular subscribes for you
2. UI updates when values arrive
3. Angular unsubscribes automatically on destroy

---

### 3.3 Operators replace a lot of "hook logic" 🧠
React mental model:
```js
useEffect(() => {
  fetchUser(id);
}, [id]);
```

Angular mental model (stream composition):
```ts
this.route.paramMap.pipe(
  map((p) => p.get('id') ?? ''),
  switchMap((id) => this.api.getUser(id))
);
```

Shift:
> 👉 Stop reacting to events with imperative steps. Start transforming streams.

---

### 3.4 Subjects (when you need state)
```ts
private readonly userSubject = new BehaviorSubject<User | null>(null);
readonly user$ = this.userSubject.asObservable();
```

This replaces small-app patterns like:
- prop drilling
- ad-hoc global variables
- overusing context-like patterns

---

### 3.5 Why This Matters for Testing 🧪

### ⚛️ How This Works in React (Your Mental Anchor)

This flakiness pattern isn't Angular-exclusive — it's really "async UI timing," and React devs hit the same class of bug when a component reads state that's still `null` until a `useEffect`'s fetch resolves and calls `setState`; a test that asserts immediately after a click, before that re-render happens, is flaky for the identical underlying reason. The tooling differs — the React/Testing Library world reaches for `waitFor`/`findBy*` and mocks the network with MSW instead of `HttpTestingController` — but the rule of thumb is the same: wait for observable evidence that data arrived, not a fixed timeout. Worth calling out directly: RxJS is sometimes pulled into React codebases too (inside `useEffect`, or via libraries like `redux-observable`), so this stream-timing mental model isn't purely "an Angular thing" — it's the same idea applied in a framework that makes it opt-in rather than default.

🧪 **SDET / Test Automation Angle:** Understanding Observables — not just "how to use the syntax" — directly explains a lot of E2E flakiness. A UI element bound to `user$ | async` does not exist in the DOM the instant the HTTP call is *fired* — it appears only when the Observable actually *emits*. If a test clicks something and immediately asserts on the result without accounting for that emission, you get a flaky "element not found" failure that looks random but is actually deterministic once you understand stream timing.

This is also exactly why network mocking in tests is shaped the way it is:
- **Unit tests:** `HttpTestingController` lets you intercept the Observable-based HTTP call Angular's `HttpClient` makes and manually "flush" a fake response, so you control precisely when the stream emits.
- **E2E tests:** `cy.intercept()` (Cypress) and Playwright's route mocking sit at the same conceptual layer — they let you control *when* and *what* the app's Observable-based HTTP layer receives, instead of depending on a real backend's timing.

Rule of thumb:
> 👉 If you understand "Observables are lazy and emit over time, not instantly," you understand *why* an E2E wait should target "the data has arrived" (an element appearing, a request resolving, a spinner disappearing) rather than a fixed `sleep(2000)`.

🔄 **SDLC Angle:** RxJS's biggest SDLC footprint is in **Implementation** and **Maintenance/On-call**. During implementation, choosing to model a data flow as a stream (`switchMap`, `combineLatest`, `debounceTime`) is a design decision about *how the feature reacts to change over time* — e.g., "should a new search keystroke cancel the previous in-flight request?" is answered by `switchMap` vs `mergeMap`, not by writing more imperative cancellation code. During on-call/maintenance, memory leaks and race conditions from unmanaged subscriptions are a classic production bug class — a service that subscribes but never unsubscribes keeps doing work (and holding references) long after the component that needed it is gone, which shows up as a slow memory creep or a "why did this callback fire twice" bug reported days after deploy.

💼 **SDE Interview & Job Search Angle:**
- **Likely question:** "Can you explain the difference between a Promise and an Observable, and why Angular is built so heavily around RxJS?"
- **Strong answer:** "A Promise represents one future value, starts eagerly, and can't be cancelled. An Observable represents zero-to-many values over time, is lazy — nothing happens until you subscribe — and is cancellable via unsubscribe. Angular uses Observables for HTTP, router events, and form value changes because those are naturally recurring or cancellable things: you might want to cancel an in-flight HTTP request if the user navigates away, which a Promise simply can't do."
- **Level-up:** A junior answer stops at "Observables can be cancelled, Promises can't." A senior answer brings up the operator choice that actually matters in production — e.g., `switchMap` cancels the previous inner Observable on a new emission (right for type-ahead search), while `mergeMap` runs them concurrently (right for independent parallel requests) and `concatMap` queues them sequentially — and can explain that picking the wrong one is a common source of race-condition bugs, like a stale API response overwriting a newer one on screen.

---

## Phase 0 Summary (Lock This In) ✅
If you remember only this:
1. Angular is class-first
2. Decorators are compiler-visible metadata
3. Templates can only access public members
4. Observables are default, not advanced
5. You describe flows, not steps

