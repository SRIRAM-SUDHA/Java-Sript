# PHASE 6 - Change Detection & Performance

## Goal
Understand how Angular 14 updates the UI, choose the right change detection strategy, and apply practical performance optimizations that show up in production and interviews.

## Topics
1. **Change Detection Strategy**
   - Default vs `OnPush`
   - How Angular detects changes
   - Performance pitfalls
   - When UI does NOT update (common bug)
2. **Performance Optimization Patterns**
   - `async` pipe patterns
   - `trackBy` for `*ngFor`
   - Pure pipes + immutability
   - `ChangeDetectorRef` (advanced)
   - `NgZone` and `runOutsideAngular` (advanced)

---

## 1) Change Detection Strategy

### Concepts
- Change detection (CD) is Angular checking template bindings and updating the DOM.
- Angular has two major strategies:
  - **Default**: checks the component whenever CD runs
  - **OnPush**: checks the component only when "something relevant" happens

📖 **Plain-English definition**: Change detection is Angular's way of asking, after something happens (a click, a timer, a network response), "did anything on screen need to change?" — and then repainting only the parts of the DOM that actually changed. Default mode checks broadly and often; OnPush mode checks a component only when Angular has a specific reason to believe that component's data changed.

### ⚛️ How This Works in React (Your Mental Anchor)
This is the single most important comparison in this whole phase, so slow down here.

**React's actual default behavior**: a component re-renders when (a) its own state changes (`useState`/`useReducer` setter called), or (b) its parent re-renders — and a parent re-rendering cascades to *every* child by default, regardless of whether that child's props actually changed. There is no global "check everything" sweep in React the way there is in Angular — React only walks the subtree rooted at whatever triggered the update (or the whole tree, if that's the root). But within that subtree, the default is "re-render everything under here," not "re-render only what changed."

**Angular's Default strategy, compared to that**: Default is *not* quite the same as bare React. It's closer to "React without `React.memo` anywhere, plus a global trigger mechanism you don't control." Concretely:
- Both share the "parent update cascades to children unless you opt out" behavior — an unmemoized React child re-renders whenever its parent does, exactly like a Default-strategy Angular component gets walked whenever a tick runs.
- But Angular's Default strategy is checked far more often than "whenever a parent updates" — `zone.js` monkey-patches *every* async API (`setTimeout`, `addEventListener`, promises, `fetch`/XHR), so literally any click anywhere, any timer anywhere, any HTTP response anywhere triggers `ApplicationRef.tick()`, which walks every Default component in the entire tree, not just ones downstream of whatever fired. React has nothing like this — a `setTimeout` in one unrelated part of the app does not cause components elsewhere to re-render just because a timer fired. Angular's Default strategy is genuinely broader than React's normal behavior, not just "the same as React with no memoization."

**`OnPush` is Angular's explicit opt-in to what `React.memo()` gives you by default in that narrower sense**: it skips re-checking a component unless one of a specific set of triggers fires — directly comparable to wrapping a component in `React.memo()`, which skips re-rendering unless its props changed by shallow (reference) comparison. Table it out:

| Angular OnPush trigger | React equivalent |
|---|---|
| new `@Input()` reference from parent | `React.memo()`'s shallow prop comparison — a new object/array reference on a prop causes re-render, same reference is skipped |
| DOM event bound in the component's own template | local `setState` from an event handler — always causes a re-render, in both frameworks |
| `async` pipe emits a new value | a subscribed value from a hook (`useState` fed by a subscription, or `useSyncExternalStore`) calling its setter |
| explicit `markForCheck()` / `detectChanges()` | calling `setState` (even to the same value, forcing a re-render) — React's "escape hatch" for the same situation |

**The "wake up" mechanism is the real difference worth being precise about**: in React, the *only* way anything ever re-renders is an explicit `setState`/reducer dispatch somewhere — there's no implicit background sweep, so "what causes this to update" is always traceable to a specific call. In Angular's Default strategy, that global zone.js-driven tick is implicit and invisible in your code — a component gets checked because *something, somewhere* touched a patched async API, not because of anything visible in that component's own file. Angular's `OnPush` makes updates explicit again (the four triggers above), bringing it back in line with React's "nothing updates unless something explicitly says so" model. So the honest framing is: React's default model is arguably *simpler and more explicit* than Angular's Default strategy, and `OnPush` is Angular deliberately trading its implicit-global-check convenience for React-like explicitness and performance.

**Reference equality is the exact same rule in both, including the exact same footgun**: `OnPush`'s dirty-check is a `===` comparison on the new `@Input()` value, identical in mechanism to `React.memo`'s shallow prop comparison and to a `useMemo`/`useCallback`/`useEffect` dependency array. Mutating an array in place (`items.push(x)`) breaks Angular's OnPush change detection for exactly the same underlying reason that it silently breaks a React `useEffect(() => {...}, [items])` or `useMemo(() => {...}, [items])` — the reference didn't change, so the framework's `===` check says "nothing to do here," even though the contents did change. This is not a coincidence or a loose analogy — it's the identical bug class (relying on reference identity to detect change) showing up in both frameworks, with the identical fix (replace immutably: `[...items, x]` in Angular, and the exact same `[...items, x]` in React).

🧪 **SDET / Test Automation Angle**: This is arguably the single most important Angular concept for anyone writing E2E tests, because it explains a huge class of "flaky" test failures. If a component fetches data asynchronously and is `OnPush`, the DOM does not update the instant the data arrives — it updates on the next CD tick, triggered by the async pipe emission (or a `markForCheck()` call). A test that triggers an action and immediately asserts on the resulting text can run in the gap between "data arrived" and "DOM repainted," and see stale or empty content — not because the app is broken, but because the test read the DOM before Angular repainted it. The fix is never `sleep(500)` (slow, and still occasionally flaky); it's to assert on the final state using your framework's built-in auto-retrying assertions — Cypress's `.should()`, Playwright's auto-waiting locators, WebdriverIO's `waitUntil` — which poll until the expected DOM state appears or a timeout is hit. Understanding OnPush turns "this test is flaky, add a wait" into "this test is racing a CD tick, assert correctly instead."

### Why it exists ✅
- 🧩 Declarative templates must stay in sync with state.
- ⚡ Performance: a predictable CD model allows you to optimize at scale.

### How Angular uses it internally (zone + tick) 🧠
Angular 14 uses `zone.js` to know **when** to run change detection, and Ivy (Angular's renderer/compiler) to know **what** to check once it runs.

**How zone.js decides "something happened":**
- On app bootstrap, `zone.js` **monkey-patches** (overwrites and wraps) the browser's async APIs: `setTimeout`/`setInterval`, `addEventListener`, `Promise.prototype.then`, `XMLHttpRequest`/`fetch` (what `HttpClient` ultimately rides on under the hood), and more.
- Each patched API is wrapped so that when its callback runs, `zone.js` knows a task started and finished inside Angular's `NgZone`.
- After the outermost such task finishes, `zone.js` fires an `onMicrotaskEmpty`/stability signal that Angular listens to, which calls `ApplicationRef.tick()` — Angular's cue to run a CD pass. This is why a click handler, a timer callback, a resolved `Promise`, or an `HttpClient` response all naturally trigger CD: they all pass through a monkey-patched API on their way back into your code.
- Code run via `NgZone.runOutsideAngular()` deliberately steps outside this patched zone, so its callbacks never trigger `tick()` at all — Angular has no idea that work happened.

**What a tick actually does (Ivy's view tree walk):**
1. `ApplicationRef.tick()` calls `detectChanges()` starting from each root component and walks down the component tree.
2. For a **Default**-strategy component, Ivy always walks into it and re-evaluates its template bindings on every tick.
3. For an **OnPush** component, Ivy checks a per-view internal "dirty" marker on that component's `LView` (Ivy's internal data structure per view instance). If the marker isn't set, Ivy skips re-evaluating that component's own bindings entirely — this is the actual mechanism behind "OnPush components are skipped."
4. That dirty marker gets set by exactly the four triggers listed below: a new `@Input()` reference arriving from a parent, a DOM event bound in that component's own template firing, an `async` pipe emitting a new value (the `AsyncPipe` implementation calls `ChangeDetectorRef.markForCheck()` internally on every emission), or an explicit `markForCheck()`/`detectChanges()` call.
5. For each binding Ivy does check, it does a simple `===` comparison between the newly computed value and the last-recorded value, and only touches the real DOM node if that comparison says "changed." This is *why* immutability matters mechanically, not just stylistically: mutating an array/object in place keeps the same reference, so `===` reports "unchanged" and Ivy won't touch the DOM — regardless of strategy, but especially fatal under OnPush where the dirty flag may never even get set in the first place.

### Default vs OnPush (practical rules) 🧠

#### Default strategy
Angular will check this component on most ticks (broader checking).

#### OnPush strategy
Angular checks an `OnPush` component when:
- an `@Input()` reference changes (new object/array reference)
- an event handler runs in the component (click/input/output)
- an observable used via `async` pipe emits
- you call `markForCheck()` / `detectChanges()`

### Example: OnPush + async pipe ✅
```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemsFacade } from './items.facade';
import { ItemDto } from './items.api';

@Component({
  selector: 'app-items-page',
  template: `
    <ng-container *ngIf="items$ | async as items">
      <ul>
        <li *ngFor="let item of items; trackBy: trackById">{{ item.title }}</li>
      </ul>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPageComponent {
  items$: Observable<ItemDto[]> = this.facade.items$;
  constructor(private readonly facade: ItemsFacade) {}
  trackById(_: number, item: ItemDto): string {
    return item.id;
  }
}
```

### Common "UI didn't update" cases 🧯
- Mutating in place with `OnPush`:
  - ❌ `items.push(x)` (same reference)
  - ✅ `items = [...items, x]` (new reference)
- Updating state outside Angular's zone (rare; custom integrations)
- Manual subscription updates in OnPush component without `markForCheck()`

### `ExpressionChangedAfterItHasBeenCheckedError` (what it means) 🔍
This error usually means:
- a bound value changed after Angular already checked it in the same CD cycle (commonly in `ngAfterViewInit` / `ngAfterContentInit`).

✅ Fixes:
- set the value earlier (e.g., `ngOnInit`)
- or schedule it (microtask/macro task)
- or use `ChangeDetectorRef` intentionally (see below)

### ✅ Best Practices
- Default to `OnPush` for presentational components and many pages.
- Push data into templates as streams and consume via `async` pipe.
- Favor immutable updates for anything bound to an OnPush template.

### ❌ Avoid
- Expensive functions in templates (they can run many times per tick).
- Impure pipes unless you have a strong reason.
- Many manual subscriptions in components (hard to maintain + leak-prone).

### 🎯 Interview insights
- The senior answer explains: "OnPush checks on input ref changes, events, async pipe emissions, or manual marks."
- Mention zone.js triggering ticks (Angular 14 reality).

### 🔄 SDLC Angle
Choosing Default vs `OnPush` is nominally an *implementation-phase* decision made per component, but the bugs it causes are overwhelmingly a *maintenance/production* concern: an `OnPush` component that stops updating almost never fails in the PR that introduced it - it fails weeks later when someone else adds a feature that mutates state in place instead of replacing it, and the resulting "why isn't the UI updating" ticket lands on whoever's on call, far from the original code-review conversation. That's also why it's worth a specific *code-review* checkpoint: for any `OnPush` component, does every path that updates its bound data go through one of the four real triggers (new `@Input()` reference, a DOM event in its own template, an `async` pipe emission, or an explicit `markForCheck()`)?

### 💼 SDE Interview & Job Search Angle
- **Likely question:** "A component isn't updating when its data changes - walk me through how you'd debug it."
- **Strong answer:** "First I'd check the component's change detection strategy. If it's `OnPush`, I'd check whether the update path actually hits one of the four triggers - is the input a genuinely new reference, is this coming through an `async` pipe, or is a manual subscription missing a `markForCheck()` call? I'd also check for in-place mutation, since pushing onto an array bound to an OnPush template keeps the same reference, so Ivy's `===` check says 'unchanged' and never touches the DOM. Angular DevTools' Profiler is the fastest way to confirm which of these it is - it shows exactly which components were checked on a given tick."
- **Level-up:** A junior answer says "add `markForCheck()` and see if it fixes it"; a senior answer diagnoses *why* the dirty marker was never set in the first place, and treats the fix as fixing the update path (immutability, or routing state through the async pipe) rather than sprinkling `markForCheck()` calls as a patch.

### Angular DevTools — Seeing Change Detection Happen 🔬

📖 **Plain-English definition**: Angular DevTools is the official browser extension (Chrome/Firefox) that adds an Angular-aware panel to your browser's devtools. It lets you inspect the live component tree, see each component's inputs/state, and — most relevantly to everything above — visually profile which components were checked during a change-detection cycle and how long each took, instead of reasoning about zone.js/OnPush purely in your head.

### ⚛️ How This Works in React (Your Mental Anchor)
This maps almost 1:1 onto **React DevTools' Profiler tab**. Both are "record an interaction, then show a flame graph / bar chart of what actually re-rendered (or, in Angular's case, was checked) and why":
- Angular DevTools' Profiler tick-by-tick view of "which components were checked, how long each took" ~ React DevTools Profiler's commit-by-commit flame graph of "which components rendered, how long each took."
- React DevTools Profiler can even highlight *why* a component re-rendered (props changed, state changed, parent re-rendered, hooks changed) — conceptually the same question Angular DevTools' Profiler answers by showing whether an `OnPush` component lit up as checked on a tick it shouldn't have (input ref changed unexpectedly, a stray `markForCheck()`, an impure pipe).
- The same debugging move applies in both: "this component is expensive and re-renders/gets-checked on every single interaction" is your cue to reach for `React.memo` + stable references in React, or `OnPush` + immutability in Angular — the profiler is what tells you *which* component deserves that treatment instead of guessing.
- The same production-vs-dev caveat applies to both tools too: profiling a React dev build (with the extra dev-mode checks/warnings React does) can make things look slower than a production build, exactly as this doc notes for Angular's dev mode.

It's most useful for two things:
- **Components tab**: browse the live component tree and inspect a component's current `@Input()` values and internal properties in real time, without sprinkling `console.log` statements through the codebase. Click a component in the tree and its state shows up directly in the panel.
- **Profiler tab**: click record, interact with the running app (click a button, type in a form, trigger a data load), then stop recording. You get a bar/flame-graph-style view of each change-detection cycle, showing exactly which components were checked (and which re-rendered) on that tick, and roughly how long each one took. This is the fastest way to answer two very concrete questions:
  - "Is my `OnPush` component actually being skipped the way I think it is?" — if it lights up as checked on every tick anyway, something is marking it dirty (a misbehaving `@Input()` reference, a manual `markForCheck()` call firing too often, an impure pipe).
  - "Which component is unexpectedly expensive to check on every tick?" — a component that takes disproportionately long in the profiler on every single cycle is a prime candidate for `OnPush`, a pure pipe, or moving work out of the template.

⚡ **Performance angle**: this ties directly back to the internals explained above. The Profiler is literally showing you, tick by tick, which `LView`s Ivy walked and re-checked. The "dirty marker" mechanism described earlier in this section (an `@Input()` reference changing, an event firing, an `async` pipe emitting, or a manual `markForCheck()`/`detectChanges()` call) is normally invisible — you have to reason about it. The Profiler makes it directly observable: you can watch, cycle by cycle, which components got walked and which got skipped, instead of just trusting that your mental model of OnPush is correct.

🧪 **SDET / Test Automation Angle**: when an SDET reports "this page feels slow" or "this element takes a while to become interactable," Angular DevTools' Profiler is the fastest way for a developer to confirm whether the cause is change-detection related (a component being checked far more often than it should, e.g., a missing `OnPush` or an accidentally-impure pipe) versus something else entirely (network latency, a genuinely heavy computation, a slow third-party script). It's useful context for an SDET filing a performance bug report to know what evidence to ask for: a screen recording of the Profiler timeline, or a note on which components lit up as "checked" far more often than expected, gives the developer a running start instead of a vague "it felt slow."

✅ **Best practice**: profile a *production build* (or at least a configuration with change detection representative of real usage), not just a dev-mode session watched casually. Dev-mode Angular runs extra checks (including checks that specifically look for `ExpressionChangedAfterItHasBeenCheckedError`) that can make the app look slower in the Profiler than it will actually be for users in production — don't chase a performance problem that's an artifact of dev mode itself.

🔄 **SDLC Angle**: Angular DevTools mostly earns its keep in *maintenance/debugging* - it's the tool you reach for after a performance ticket or a "why didn't this update" bug report, to get concrete evidence instead of guessing. It's also useful earlier, in *code review*, as a quick sanity check when reviewing a PR that adds `OnPush` to a component: run the profiler before and after to confirm the component is actually being skipped on ticks it shouldn't need to run on.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "How would you find out which component is causing a slow re-render in a production Angular app?"
- **Strong answer:** "I'd reach for Angular DevTools' Profiler, record while reproducing the slow interaction, and look at which components were checked on each change-detection tick and how long each took. That tells me whether it's a change-detection problem - a component being checked far more often than it should, from a missing `OnPush` or an impure pipe - versus something unrelated to CD, like a genuinely heavy computation or network latency."
- **Level-up:** A junior answer stops at "use the profiler"; a senior answer adds the caveat that dev-mode Angular runs extra checks that can make things look slower than they are in production, so you profile a production-like build before drawing conclusions.

---

## 2) Performance Optimization Patterns

### `async` pipe pattern (default)

📖 **Plain-English definition**: The `async` pipe lets your template subscribe to an Observable directly (`items$ | async`) and automatically unwraps the latest emitted value — and automatically unsubscribes when the component is destroyed, so you never manage that subscription by hand.

### ⚛️ How This Works in React (Your Mental Anchor)
There's no exact one-line equivalent in vanilla React, because React doesn't have Observables as a first-class primitive — but the shape of the problem it solves is very familiar:
- The manual approach the async pipe replaces (`this.sub = this.items$.subscribe(v => this.items = v)` and remembering to unsubscribe in `ngOnDestroy`) is exactly the shape of a `useEffect` that subscribes to something and returns a cleanup function: `useEffect(() => { const sub = items$.subscribe(setItems); return () => sub.unsubscribe(); }, [])`. The async pipe is Angular giving you that `useEffect`-with-cleanup pattern "for free," templated directly, without writing it out by hand every time.
- If you've used RxJS-in-React (rare, but it exists) or a hook like `useObservable` from a library, that hook is the closer 1:1 — it's doing exactly what the async pipe does: subscribe on mount, call the setter on each emission, unsubscribe on unmount.
- The `OnPush`-specific trigger behavior (async pipe calls `markForCheck()` internally on every emission) doesn't have a direct React parallel, because React has no separate "mark dirty vs. actually re-render" step — calling the setter *is* the trigger, there's no second implicit step that a manual subscription could forget. That's the sharpest difference: in React, "manually subscribing and calling setState in the callback" gets you the *entire* benefit an async pipe gives you automatically in Angular (no separate markForCheck to forget) — the bug class described below (data updates but DOM doesn't) is specifically an Angular/OnPush problem, not something that has a React equivalent in the same form.

🧪 **SDET / Test Automation Angle**: Because an async-pipe emission is one of the things that wakes up an OnPush component (see the internals above), using `| async` instead of a manual `subscribe()` that assigns a field is what makes the "data arrived -> DOM shows it" chain reliable and testable. A manual subscription that forgets `markForCheck()` in an OnPush component is a classic bug where the underlying data updates (you'd see it in a debugger) but the DOM silently never repaints — no amount of "wait longer" in an E2E test fixes that, because the DOM update was never scheduled at all. If you're debugging a "test times out waiting for text that never appears" failure in an Angular app, checking whether the component uses the async pipe vs. a raw `subscribe()` is a good first diagnostic step.

✅ Benefits:
- auto subscribe/unsubscribe
- triggers CD correctly (especially with OnPush)

❌ Avoid:
- subscribing in components just to assign to a field for the template

🔄 **SDLC Angle**: This is mostly an *implementation-phase* default (reach for `async` pipe first, manual `subscribe()` only when you have a specific reason) that also shows up in *code review* - a manual `subscribe()` assigning to a field is a common review comment, since it reintroduces manual unsubscribe/`markForCheck()` responsibility that the async pipe would have handled for free.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "Why prefer the `async` pipe over subscribing manually in the component class?"
- **Strong answer:** "It handles subscribe/unsubscribe automatically so I can't forget to clean up and leak a subscription, and it calls `markForCheck()` internally on every emission - which is exactly the trigger an `OnPush` component needs to know it should re-render. A manual `subscribe()` that just assigns to a field skips that trigger entirely under `OnPush`."
- **Level-up:** Noting that a manual subscription *silently* breaks under OnPush (data updates, DOM doesn't) rather than throwing an error is the senior-level detail - it's what makes this bug class hard to catch without knowing to look for it.

---

### `trackBy` for `*ngFor` ✅
#### Concept
Helps Angular reuse DOM nodes across list updates.

📖 **Plain-English definition**: `trackBy` tells `*ngFor` how to recognize "this is the same item as before, maybe just updated" versus "this is a brand-new item," using an identity (like an id) instead of the array position — so Angular can reuse existing DOM elements instead of tearing them down and rebuilding them on every list update.

### ⚛️ How This Works in React (Your Mental Anchor)
This maps almost 1:1 onto React's `key` prop on list items — same underlying problem, same rule, practically no translation needed:
```tsx
{items.map((item) => <li key={item.id}>{item.title}</li>)}
```
- `trackBy: trackById` ~ `key={item.id}` — both exist so the renderer's reconciler can match old list items to new ones by identity, and reuse/patch the existing DOM node instead of destroying and recreating it.
- The exact same rule applies in both: use a **stable id**, not the array index, whenever the list can reorder, have items inserted in the middle, or have items removed. Index-as-key in React causes the identical class of bug as index-based `trackBy` in Angular — items shift position but keep their old index/key, so the reconciler matches the wrong element to the wrong data (classic symptom in both: form inputs or focus/animation state "sticking" to the wrong row after a reorder).
- One difference: React's `key` is *mandatory* practice (React will warn in the console if it's missing on a list), whereas Angular's `trackBy` is opt-in and silent if you skip it (`*ngFor` just falls back to identity-by-object-reference, which is roughly equivalent to React's default "no key" behavior — also position-based and also prone to the same bug). So if you're used to always reaching for `key` in React out of habit, carry that same habit over to always adding `trackBy` in Angular — it's the same discipline.

🧪 **SDET / Test Automation Angle**: Without `trackBy`, Angular may destroy and recreate DOM nodes for a list even when the underlying data barely changed, and that matters a lot to automation. In Selenium-style tools, an element reference (`WebElement` handle) cached earlier becomes stale the moment its underlying DOM node is destroyed and recreated, throwing a stale-element-reference error on the next interaction — a well-known source of intermittent failures on list-heavy pages. It can also shift DOM ordering/identity in ways that throw off visual-regression diffing tools, flagging "changes" that are really just re-created nodes sitting in the same visual position. A correct `trackBy` (keyed by a stable id, not array index, for lists that can reorder) makes both problems go away.

```html
<li *ngFor="let item of items; trackBy: trackById">{{ item.title }}</li>
```
```ts
trackById(_: number, item: { id: string }): string {
  return item.id;
}
```

Common mistake:
- `trackBy` returning index for lists that can reorder (causes weird UI bugs).

🔄 **SDLC Angle**: `trackBy` is a small *implementation-phase* addition, but it's also a good *code-review* flag: any `*ngFor` over a list that can grow, reorder, or refresh from the server without it is worth a comment, since the cost (stale DOM node references, dropped focus/animation state, wasted re-renders) only shows up later as a UI-polish or performance complaint, not a compile error.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "What does `trackBy` actually do, and what happens if you use the array index instead of a real id?"
- **Strong answer:** "It tells `*ngFor` how to match old and new list items by identity instead of position, so Angular can reuse existing DOM nodes instead of destroying and recreating them on every update. Using index as the identity breaks down the moment the list reorders or an item is removed from the middle - items shift position but keep their old index, so Angular matches the wrong DOM node to the wrong data, causing visible glitches like inputs or animations attaching to the wrong row."
- **Level-up:** Junior answers know to "add trackBy"; senior answers know index-based trackBy is actually worse than no trackBy at all for reorderable lists, because it actively causes incorrect reuse rather than just missing an optimization.

---

### Pure pipes + immutability ✅
#### Concept
Pure pipes run only when input references change - perfect with OnPush and immutable state.

📖 **Plain-English definition**: A pure pipe only re-runs its transformation when its input reference actually changes, instead of on every CD cycle — so as long as you replace objects/arrays immutably rather than mutating them, Angular can skip re-running expensive pipe logic most of the time.

### ⚛️ How This Works in React (Your Mental Anchor)
A pure pipe is directly comparable to `useMemo(() => transform(value), [value])`:
```tsx
const formatted = useMemo(() => expensiveFormat(value), [value]);
```
- Both skip recomputing the transformation unless the input **reference** changes — a pure Angular pipe checks `===` on its arguments between calls; `useMemo` checks `===` on each dependency-array entry between renders. Identical mechanism, identical reason it exists (skip expensive recompute when the input didn't really change).
- An "impure pipe" (`pure: false`) is directly comparable to a `useMemo` with a broken or missing dependency array that just recomputes on every render — both give up the optimization entirely and re-run every single cycle regardless of whether the input actually changed. `pure: false` is Angular's explicit, named version of that; in React it's usually an *accidental* bug (an empty `[]` that should have deps, or no `useMemo` at all).
- The classic footgun is the same in both, too: marking a pipe pure (or wrapping something in `useMemo`) doesn't help at all if the caller keeps recreating a new array/object reference on every call/render anyway (e.g., an inline `.filter()` or `.map()` passed straight into the template/JSX) — the fix has to happen at the data layer (stabilize the reference), not at the memoization declaration.

🧪 **SDET / Test Automation Angle**: This one is less directly observable from the UI, but it matters for an SDET doing performance work: if a page feels laggy under scripted performance profiling (Lighthouse CI, scripted WebPageTest runs) and a heavy pipe (formatting, filtering, sorting) is marked pure but is fed a **new** array/object reference every CD cycle (a common bug — recreating an array in a getter or inline template expression), you lose the whole benefit of purity and the pipe re-runs constantly anyway. "Is this reference actually stable across ticks?" is a good performance-regression question to raise in a code review, not just a functional one.

Rule of thumb:
- If your pipe is heavy, keep it pure and feed it stable references.

🔄 **SDLC Angle**: Deciding a pipe should be pure (the default, and almost always correct) is an *implementation-phase* choice; catching a pipe that's pure in name but fed a freshly-recreated array/object every tick (defeating the purity) is a *code-review* and sometimes a *maintenance* issue - it often gets found later, during a performance investigation, rather than at review time, because the pipe still produces correct output, just slower than it should.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "What's the difference between a pure and impure pipe, and when would you use an impure one?"
- **Strong answer:** "A pure pipe only re-runs when its input reference changes, so it plays well with immutable state and OnPush - Angular can skip re-running it most ticks. An impure pipe re-runs on every CD cycle regardless, which is sometimes necessary (e.g., a pipe that needs to reflect a mutated array in place) but is expensive, so I'd only reach for `pure: false` deliberately, and would first ask whether the real fix is switching the underlying state to immutable updates."
- **Level-up:** The senior-level catch is recognizing that marking a pipe pure doesn't help at all if the caller keeps handing it a new reference every tick anyway - the fix has to happen at the data layer, not just the pipe declaration.

---

### `ChangeDetectorRef` (advanced, but important) 🧰
Use when you *must* integrate imperative updates.

📖 **Plain-English definition**: `ChangeDetectorRef` is an escape hatch that lets you manually tell Angular "check this component now" (`detectChanges()`) or "check it on the next tick" (`markForCheck()`) — for cases where data changed in a way Angular's normal triggers didn't notice, like a `setInterval` callback running outside the usual input/event/async-pipe paths.

### ⚛️ How This Works in React (Your Mental Anchor)
The closest React equivalent is calling `setState` — even with the same value — purely to force a re-render:
```tsx
const [, forceRender] = useReducer((x) => x + 1, 0);
// ...inside a setInterval callback that mutated a ref instead of state:
forceRender();
```
- Both are "the escape hatch for telling the framework something changed that it didn't detect on its own." `markForCheck()` says "re-check this component next tick"; a dummy `setState`/`forceRender` call says the same thing to React — "something changed, please re-render, even though nothing about my normal state/props triggers told you so."
- The `ClockComponent` example above (a `setInterval` callback updating `now` and calling `markForCheck()`) is functionally identical to the equally common React pattern of a `setInterval` callback calling `setState(new Date().toISOString())` directly — except in React, calling `setState` *is itself* both "update the value" and "the wake-up signal," there's no separate step to remember. Angular's version requires two separate actions (mutate the field, then separately call `markForCheck()`) because Ivy's dirty-checking and the actual field assignment are decoupled — which is exactly why forgetting the second call is such a common, silent bug in Angular OnPush components, in a way that doesn't really have a parallel failure mode in React (skip the `setState` call in React and nothing renders at all — obviously broken, not silently stale).
- The senior-level React parallel to "prefer async pipe/RxJS `interval()` over manual `ChangeDetectorRef` bookkeeping" is preferring a proper state update (`setState` in the interval callback) over reaching for imperative DOM/ref hacks — both are "don't fight the framework's normal update path unless you have a specific reason to."

🧪 **SDET / Test Automation Angle**: Code that mixes imperative timers/callbacks with `markForCheck()` (like the clock example below) tends to produce timing-sensitive UI, which is exactly the kind of thing that's hard to assert against reliably — a test reading `{{ now }}` or screenshotting it needs to tolerate that the displayed value is only ever as fresh as the last `markForCheck()` call, not real wall-clock time. When reviewing this pattern as an SDET, it's worth checking that `markForCheck()` is actually called after every state mutation; a missing call produces the same "data changed but DOM didn't" bug class as a forgotten async pipe, and it will show up as a flaky or failing UI assertion rather than an obvious code defect.

Common methods:
- `markForCheck()`: schedule this component to be checked in the next tick
- `detectChanges()`: run CD immediately for this component subtree

Example (manual subscription in OnPush):
```ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-clock',
  template: `{{ now }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockComponent implements OnDestroy {
  now = new Date().toISOString();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly cdr: ChangeDetectorRef) {
    const id = setInterval(() => {
      this.now = new Date().toISOString();
      this.cdr.markForCheck();
    }, 1000);

    this.destroy$.pipe(takeUntil(this.destroy$)).subscribe({
      complete: () => clearInterval(id),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

✅ Best practice: prefer async pipe; use `ChangeDetectorRef` when integrating with imperative APIs.

🔄 **SDLC Angle**: `ChangeDetectorRef` is an *implementation-phase* escape hatch reached for when integrating with something outside Angular's normal triggers (a `setInterval`, a third-party widget callback); in *code review* it's worth checking that every state mutation in that code path is actually followed by a `markForCheck()`/`detectChanges()` call, since a missed one produces a bug that only appears in *production* - data is correct in memory, the screen just never shows it.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "You have a component that updates its own state from a `setInterval` callback and it's `OnPush` - why might the UI never update, and how do you fix it?"
- **Strong answer:** "A `setInterval` callback isn't one of OnPush's four triggers, so even though the component's field changes, Ivy never marks the view dirty and the binding is never re-checked. The fix is to inject `ChangeDetectorRef` and call `markForCheck()` right after updating the state, so the component is queued for the next tick."
- **Level-up:** A senior answer also mentions the alternative of routing the interval through an Observable (e.g., RxJS `interval()`) consumed via the `async` pipe, since that gets the same result without manual `ChangeDetectorRef` bookkeeping.

---

### `NgZone` and `runOutsideAngular` (advanced) ⚠️
Use for extremely frequent events (scroll/mousemove) when CD would be wasteful.

📖 **Plain-English definition**: `NgZone.runOutsideAngular()` lets you run some code (e.g., a high-frequency scroll/mousemove handler) **without** `zone.js` watching it, so Angular doesn't attempt a full change-detection cycle on every single event — useful when events fire far more often than the UI actually needs to repaint.

### ⚛️ How This Works in React (Your Mental Anchor)
The closest React equivalent is a high-frequency event handler that mutates a ref/DOM node directly instead of calling `setState` on every event:
```tsx
function DragTarget() {
  const boxRef = useRef<HTMLDivElement>(null);
  const onMouseMove = (e: React.MouseEvent) => {
    // Direct DOM mutation, no setState — no re-render triggered per pixel
    if (boxRef.current) {
      boxRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  };
  return <div ref={boxRef} onMouseMove={onMouseMove}>drag me</div>;
}
```
- Both are "opt out of the render/CD cycle for a very hot path," for the identical reason: a `mousemove`/`scroll` handler can fire dozens of times per second, and calling `setState` (React) or leaving the handler inside the zone (Angular) on every single event means a full re-render/CD tick per event — wasteful when only a DOM style/transform needs to update, not the whole component tree.
- The mechanism differs, which is worth being precise about: `runOutsideAngular()` opts a whole block of code out of zone.js's "something happened" tracking, so nothing inside it can trigger a tick unless you explicitly call `ngZone.run(...)` to step back in. React has no equivalent "zone" to step outside of — you opt out simply by *not calling `setState`* in the hot handler and mutating a ref/DOM node directly instead. In React, "in the render cycle" vs. "outside it" is just "did you call a setter," whereas in Angular it's a genuine separate execution context (zone.js) that any code can be run inside or outside of, independent of whether that code happens to update Angular-bound state.
- The zone.js-and-test-tooling caveat this doc raises for legacy Protractor doesn't really have a React parallel, since React never had an equivalent "app is idle" signal in the first place — Cypress/Playwright/WebdriverIO wait explicitly in both ecosystems, so this is one place where Angular apps (pre-`runOutsideAngular` adoption) had something React apps never did, rather than the two being comparable.

🧪 **SDET / Test Automation Angle**: This is worth flagging explicitly when assessing an app for E2E testability. Historically, Protractor (Angular's old, now-deprecated E2E tool) waited for `zone.js` to report "stability" — no pending timers/promises/event callbacks — before running its next command, which gave Protractor free, reliable auto-waiting. Work done inside `runOutsideAngular` never touches `zone.js`, so it never contributes to that stability signal; a component using this pattern for something like a live chart or an infinite-scroll handler is a known, documented source of E2E flakiness/timeouts in legacy Protractor-based suites. Modern tools (Cypress, Playwright, WebdriverIO) don't hook into `zone.js` at all, so they're immune to this specific failure mode — but that also means they never got the free auto-wait either, so testers moving from a Protractor-era Angular app to one of these tools need to add explicit waits (`cy.get(...).should(...)`, Playwright's built-in auto-retrying locators) instead of relying on any framework-level "app is idle" signal.

```ts
import { NgZone } from '@angular/core';

constructor(private readonly zone: NgZone) {}

setupScroll(): void {
  this.zone.runOutsideAngular(() => {
    window.addEventListener('scroll', () => {
      // do lightweight work without triggering CD
    });
  });
}
```

✅ Best practice: only use this when you measure performance problems.

🔄 **SDLC Angle**: This is a *maintenance-driven* optimization almost by definition - the instructions above say "use for extremely frequent events" and "only use this when you measure performance problems," meaning it's typically applied after a real performance issue is found in production or profiling, not designed in up front. When it is used, it's worth a specific *code-review* note, since code inside `runOutsideAngular` needs its own discipline (don't accidentally read/write Angular-bound state without re-entering the zone) that's easy to get subtly wrong.

💼 **SDE Interview & Job Search Angle**
- **Likely question:** "You have a scroll or mousemove handler causing performance problems - what would you do?"
- **Strong answer:** "First I'd confirm with profiling that change detection is actually the bottleneck, not something else. If it is, I'd move the handler's work inside `NgZone.runOutsideAngular()` so it doesn't trigger a full CD tick on every single event, and only re-enter the zone (via `ngZone.run()`) for the specific, infrequent update that actually needs to repaint the UI."
- **Level-up:** The senior-level caveat is knowing this trades away framework-level "app is idle" signals - code here is invisible to zone.js, which matters for anything (including some E2E tooling) that relies on zone stability to know the app has settled.

---

## ⚡ Performance Checklist
- Default new components to `OnPush`; reach for Default strategy only when you have a specific reason.
- Treat bound state as immutable — replace objects/arrays, never mutate in place (`{...obj}`, `[...arr, x]`).
- Add `trackBy` to every `*ngFor` over a non-trivial list (a real id, not index, if items can reorder).
- Prefer the `async` pipe over manual `subscribe()` + field assignment — correct CD triggering and automatic cleanup, for free.
- Keep pipes pure and feed them stable references so they don't silently re-run every tick.
- Never call functions directly in templates (`{{ getTotal() }}`) — they re-run on every CD check; use a pipe or a precomputed property instead.
- Reach for `NgZone.runOutsideAngular()` only after profiling shows a real hot path (e.g., scroll/mousemove/high-frequency chart updates) — and remember it's invisible to zone.js-based test tooling (see topic 2 above).
- Think about load time, not just runtime CD: lazy-load feature modules (`Phase 3`) and cache/dedupe HTTP calls at the facade/service layer (`Phase 5`) so heavy screens aren't paying for code or data they don't need yet.
- Use Angular DevTools' Profiler to *verify* the items above are actually working — confirm your OnPush components are actually being skipped (not just checked and no-opped), and spot any component that's unexpectedly expensive to check on every tick.

> 💼 **SDE Interview & Job Search callout**: "How would you make this Angular app faster?" is a common open-ended SDE interview question, and this checklist — OnPush by default, immutability, trackBy, async pipe, pure pipes, no template function calls, NgZone only after profiling, load-time optimizations, and profiling to verify — is a genuinely good structure to talk through live, in roughly this order, rather than free-associating.

## Hands-on (Do This)
- Convert at least one feature area to `OnPush`.
- Identify and remove one unnecessary re-render cause:
  - template functions
  - missing `trackBy`
  - impure pipe
- Add `trackBy` to your longest list.

## Exit Criteria
- You can choose `OnPush` deliberately and debug update issues.
- You can explain what triggers CD and how to fix UI update bugs.

## Next
- Continue to `../PHASE 7 — Advanced Component Patterns/Readme.md`

