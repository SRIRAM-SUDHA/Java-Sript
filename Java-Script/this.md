Excellent set of questions 🙌.
Understanding `this` in JavaScript is **super important** (and one of the most confusing parts). Let me give you a **structured breakdown with examples** so you’ll never forget it.

---

## 🔹 1. What is `this`?

- `this` is a **special keyword** in JavaScript.
- It does **not point to the function itself**.
- It refers to the **object that is calling the function** (execution context).
- Value of `this` is determined at **runtime** (except in arrow functions).

---

## 🔹 2. `this` in Global Scope

### Browser:

```js
console.log(this);
```

👉 In the browser, `this` in the global scope refers to `window`.

```
Window { ... }
```

### Node.js:

```js
console.log(this);
```

👉 In Node.js, `this` in the global scope refers to an **empty object** `{}` (because Node wraps code inside a module).

---

## 🔹 3. `this` in Function Declarations

```js
function showThis() {
	console.log(this);
}

showThis();
```

- In **non–strict mode**:
  `this` → **global object** (`window` in browsers, `global` in Node).
- In **strict mode** (`"use strict";`):
  `this` → `undefined`.

---

## 🔹 4. `this` in Arrow Functions

Arrow functions **do not have their own `this`**.
Instead, they **lexically inherit `this`** from the surrounding scope.

```js
const obj = {
	name: "Satya",
	arrowFun: () => {
		console.log(this.name);
	},
};

obj.arrowFun();
```

👉 Output: `undefined`
(because arrow function’s `this` is taken from where it’s defined → the global scope, not `obj`).

Now compare with a normal function:

```js
const obj2 = {
	name: "Satya",
	normalFun: function () {
		console.log(this.name);
	},
};

obj2.normalFun(); // "Satya"
```

---

## 🔹 5. `this` with `call`, `apply`, `bind`

These methods **explicitly set `this`** for a function.

```js
function greet(greeting, mark) {
	console.log(greeting + " " + this.name + mark);
}

const user = { name: "Sriram" };

greet.call(user, "Hello", "!");
// Hello Sriram!

greet.apply(user, ["Hi", "!!"]);
// Hi Sriram!!

const boundGreet = greet.bind(user, "Hey");
boundGreet("?");
// Hey Sriram?
```

- **`call`** → calls function immediately, arguments passed **individually**.
- **`apply`** → calls function immediately, arguments passed **as an array**.
- **`bind`** → returns a **new function with `this` permanently bound**, but doesn’t call immediately.

---

## 🔑 Quick Recap

- **Global scope** → `window` (browser) / `{}` (Node).
- **Function declaration** → global object (non-strict) / `undefined` (strict).
- **Arrow function** → inherits `this` from enclosing scope.
- **call / apply / bind** → let you manually set `this`.

---

⚡Now, a common **interview question**:

```js
const obj = {
	name: "Sriram",
	say: function () {
		setTimeout(function () {
			console.log(this.name);
		}, 1000);
	},Q1. Get all project names across the organisation that have "In Progress" status.
};

obj.say();
```

👉 What do you think this will log after 1 second?

Absolutely 👍 — that’s a classic **JavaScript interview trap** around `this`, callbacks, and `bind`.
Let me walk you through it step by step.

---

# 🔹 Problem: Losing `this` in Callbacks

In JS, the value of `this` **depends on how a function is called**, not where it’s defined.

Example:

```js
const user = {
	name: "Alice",
	greet() {
		console.log(`Hi, I’m ${this.name}`);
	},
};

user.greet(); // ✅ Hi, I’m Alice
```

But if we pass `greet` as a callback:

```js
setTimeout(user.greet, 1000);
```

👉 Output after 1s:

```
Hi, I’m undefined
```

Why?

- `setTimeout` calls `greet` as a **regular function**, not as a method of `user`.
- In **strict mode** → `this` = `undefined`.
- In non-strict → `this` = `window` (or `global` in Node).

---

# 🔹 Fix with `bind`

We can lock the value of `this` using `.bind`.

```js
setTimeout(user.greet.bind(user), 1000);
// ✅ Hi, I’m Alice
```

`.bind(user)` → returns a new function where `this` is permanently bound to `user`.

---

# 🔹 Arrow Functions Save You

Arrow functions **don’t have their own `this`**; they use the `this` of their enclosing scope.

```js
const user = {
	name: "Alice",
	greet() {
		setTimeout(() => {
			console.log(`Hi, I’m ${this.name}`);
		}, 1000);
	},
};

user.greet(); // ✅ Hi, I’m Alice
```

Here the arrow function inherits `this` from `greet`, which is `user`.

---

# 🔹 Common Pitfalls

1. **Losing `this` in event listeners**

   ```js
   button.addEventListener("click", user.greet);
   // ❌ this = button, not user
   ```

   Fix:

   ```js
   button.addEventListener("click", user.greet.bind(user));
   ```

2. **Passing object methods around**

   ```js
   const greet = user.greet;
   greet(); // ❌ undefined
   ```

   Fix with:

   ```js
   const greet = user.greet.bind(user);
   greet(); // ✅ Alice
   ```

3. **Using bind incorrectly**
   `.bind` returns a new function → must be called:

   ```js
   user.greet.bind(user)(); // ✅ works
   ```

---

# 🔹 Interview Trick

They might ask:

```js
const obj = {
	name: "JS",
	say() {
		console.log(this.name);
	},
};

const f = obj.say;
f();
```

👉 Answer: `undefined` (not `"JS"`)
Because `f` is just a plain function, no longer bound to `obj`.

---

✅ **Summary:**

- `this` is dynamic → depends on _how_ you call the function.
- Callbacks often lose `this`.
- Fix with **`.bind`**, or use **arrow functions** to inherit `this`.

---

Would you like me to now also show you how **bind + currying** can be combined\*\* (like `bind` pre-setting arguments, not just `this`)? That’s another neat trick often asked.

✅ Correct! It will log `undefined`.

Here’s why:

```js
const obj = {
	name: "Sriram",
	say: function () {
		setTimeout(function () {
			console.log(this.name);
		}, 1000);
	},
};

obj.say();
```

- `say` is called on `obj`, so inside `say`, `this` → `obj`.
- But `setTimeout` receives a **callback function**. That callback is **just a normal function call**, not called as a method of `obj`.
- In a normal function call, `this` defaults to:

  - `window` (browser, non-strict mode), or
  - `undefined` (strict mode, or Node).

Since `window.name` (or `undefined.name`) isn’t `"Sriram"`, you get `undefined`.

---

### 🛠 Fix 1: Use an Arrow Function

```js
const obj = {
	name: "Sriram",
	say: function () {
		setTimeout(() => {
			console.log(this.name);
		}, 1000);
	},
};

obj.say(); // "Sriram"
```

👉 Arrow function inherits `this` from enclosing scope (`say` method), so it works.

---

### 🛠 Fix 2: Save `this` in a variable

```js
const obj = {
	name: "Sriram",
	say: function () {
		const self = this; // capture this
		setTimeout(function () {
			console.log(self.name);
		}, 1000);
	},
};

obj.say(); // "Sriram"
```

---

### 🛠 Fix 3: Use `bind`

```js
const obj = {
	name: "Sriram",
	say: function () {
		setTimeout(
			function () {
				console.log(this.name);
			}.bind(this),
			1000
		);
	},
};

obj.say(); // "Sriram"
```

---

👉 This is the **classic pitfall** interviewers love to test:
**Losing `this` in async callbacks (setTimeout, event handlers, etc.)**.

---

Do you want me to also show you **how `this` behaves differently in event listeners** (with `addEventListener`) vs arrow functions? That’s another common tricky case.
