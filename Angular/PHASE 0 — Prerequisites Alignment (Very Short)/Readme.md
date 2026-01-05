# PHASE 0 — Prerequisites Alignment (Angular-Ready)

This phase answers one question only:

> “Why does Angular code look the way it does?”

---

## 1. TypeScript — How Angular _Actually_ Uses It

Angular does **not** use TypeScript as “typed JavaScript”.
It uses TypeScript as a **design and metadata language**.

### 1.1 Classes (Not Optional in Angular)

In React, classes are legacy.
In Angular, **classes are the foundation**.

```ts
export class UserComponent {
	name: string = "Sri";
}
```

Why classes matter:

- DI relies on class constructors
- Decorators attach metadata to classes
- Lifecycle hooks are class methods

**Angular thinking:**

> A component is an object with a lifecycle, not a function.

---

### 1.2 Access Modifiers (Very Important)

Angular uses access modifiers **intentionally**, not stylistically.

```ts
export class UserComponent {
	public title = "Users";
	private cache = new Map();
	protected config = {};
}
```

How Angular treats them:

- `public` → accessible in template
- `private` → **NOT accessible in template**
- `protected` → subclass only

```html
<!-- This works -->
<h1>{{ title }}</h1>

<!-- This FAILS -->
{{ cache }}
```

**Rule you must remember:**
👉 If the template needs it, it must be `public`.

---

### 1.3 Generics (Angular Uses Them Everywhere)

You already know generics, but Angular uses them aggressively.

```ts
http.get<User[]>("/api/users");
```

Why this matters:

- Strongly typed APIs
- Compile-time template safety
- Better refactoring

This is **not optional typing** — Angular expects it.

---

## 2. ES Decorators — Angular’s Backbone

Decorators are **not syntax sugar** in Angular.
They are **instructions to the Angular compiler**.

---

### 2.1 What a Decorator Really Is

```ts
@Component({
	selector: "app-user",
	templateUrl: "./user.component.html",
})
export class UserComponent {}
```

Think of it as:

> “Attach metadata to this class so Angular knows how to use it.”

Angular **reads decorators at compile time**, not runtime.

---

### 2.2 `@Component`

Defines:

- How the class becomes UI
- How it connects to HTML
- How change detection works

Without `@Component`, the class is meaningless to Angular.

---

### 2.3 `@Injectable`

```ts
@Injectable({ providedIn: "root" })
export class AuthService {}
```

This tells Angular:

- This class can be injected
- Its lifetime is managed by DI
- Where it should live (root, feature, etc.)

**Important:**
You do **not** instantiate services yourself.

```ts
// ❌ Never do this
const auth = new AuthService();

// ✅ Angular does this
constructor(private auth: AuthService) {}
```

---

### 2.4 Decorators vs React

| React                  | Angular                   |
| ---------------------- | ------------------------- |
| Functions              | Decorated classes         |
| Runtime interpretation | Compile-time metadata     |
| Manual wiring          | Declarative configuration |

**Angular mindset:**

> “Describe intent, let the framework execute.”

---

## 3. RxJS Mental Model (This Is the Biggest Shift)

This is where most React devs struggle.

Angular is built on **RxJS**.

---

### 3.1 Promise vs Observable (Correct Mental Model)

#### Promise

- One value
- Executes immediately
- Cannot be cancelled

```ts
fetch('/api').then(...)
```

#### Observable

- Multiple values over time
- Lazy (does nothing until subscribed)
- Can be cancelled
- Composable

```ts
this.http.get("/api"); // nothing happens yet
```

**Angular rule:**
👉 HTTP, events, routing, forms → all Observables.

---

### 3.2 Observable as a Stream (Key Insight)

Think of an Observable as:

> “A pipeline where data flows over time”

```ts
user$ = this.http.get<User>("/api/user");
```

In template:

```html
<div>{{ user$ | async }}</div>
```

What happens:

1. Template subscribes automatically
2. Angular updates UI when value arrives
3. Angular unsubscribes automatically

No `useEffect`. No cleanup code.

---

### 3.3 Operators Replace Hooks Logic

React:

```js
useEffect(() => {
	fetchUser(id);
}, [id]);
```

Angular:

```ts
this.route.params.pipe(switchMap((params) => this.api.getUser(params["id"])));
```

**Mental shift:**
👉 Stop reacting to events.
👉 Start transforming streams.

---

### 3.4 Subjects (When You Need State)

```ts
private userSubject = new BehaviorSubject<User | null>(null);
user$ = this.userSubject.asObservable();
```

This replaces:

- React Context
- Global stores (in small apps)
- Prop drilling

---

## Phase 0 Summary (Lock This In)

### If you remember only this:

1. Angular is **class-first**
2. Decorators = compiler instructions
3. Templates access only `public` members
4. Observables are **default**, not advanced
5. You describe flows, not steps

---
