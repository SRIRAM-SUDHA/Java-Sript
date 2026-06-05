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

### Why it exists ✅
- 🧩 Declarative templates must stay in sync with state.
- ⚡ Performance: a predictable CD model allows you to optimize at scale.

### How Angular uses it internally (zone + tick) 🧠
Angular 14 typically uses `zone.js` to trigger a CD "tick" after async events:
- DOM events (click, input)
- timers
- `HttpClient` responses
- promises/microtasks

On each tick, Angular:
1. walks the view tree
2. evaluates bindings
3. updates DOM when values changed

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

---

## 2) Performance Optimization Patterns

### `async` pipe pattern (default)
✅ Benefits:
- auto subscribe/unsubscribe
- triggers CD correctly (especially with OnPush)

❌ Avoid:
- subscribing in components just to assign to a field for the template

---

### `trackBy` for `*ngFor` ✅
#### Concept
Helps Angular reuse DOM nodes across list updates.

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

---

### Pure pipes + immutability ✅
#### Concept
Pure pipes run only when input references change - perfect with OnPush and immutable state.

Rule of thumb:
- If your pipe is heavy, keep it pure and feed it stable references.

---

### `ChangeDetectorRef` (advanced, but important) 🧰
Use when you *must* integrate imperative updates.

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

---

### `NgZone` and `runOutsideAngular` (advanced) ⚠️
Use for extremely frequent events (scroll/mousemove) when CD would be wasteful.

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

---

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

