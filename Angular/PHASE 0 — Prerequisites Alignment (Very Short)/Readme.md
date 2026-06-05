# PHASE 0 - Prerequisites Alignment (Angular-Ready)

This phase answers one question only:

> "Why does Angular code look the way it does?"

---

## 1) TypeScript - How Angular Actually Uses It

Angular does not use TypeScript as "typed JavaScript".
It uses TypeScript as a **design + metadata** language.

### 1.1 Classes (Not Optional in Angular) 🧠
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
Angular APIs use generics heavily:

```ts
http.get<User[]>('/api/users');
```

Why it matters:
- better refactoring
- safer API usage
- clearer contracts

---

## 2) ES Decorators - Angular's Backbone 🧩

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

---

## 3) RxJS Mental Model (Biggest Shift) 🌊

Angular leans heavily on RxJS:
- HTTP (`HttpClient`)
- Router params/events
- Forms `valueChanges`
- Many libraries and UI patterns

### 3.1 Promise vs Observable (correct mental model)
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

## Phase 0 Summary (Lock This In) ✅
If you remember only this:
1. Angular is class-first
2. Decorators are compiler-visible metadata
3. Templates can only access public members
4. Observables are default, not advanced
5. You describe flows, not steps

