Perfect 👍 Let’s take it slowly and make this **super easy**.
We’ll cover:

1. `call`
2. `apply`
3. `bind`
4. **Function currying** (different ways)

Each with **examples + real-world analogy**.

---

# 1. **`call`**

👉 Allows you to call a function **with a specific `this`** and arguments one by one.

```js
function greet(greeting, punctuation) {
	console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Alice" };

greet.call(user, "Hello", "!");
// Output: Hello, Alice!
```

💡 Think of `call` like **borrowing a function** and saying:
_"Run this function, but pretend `this` is Alice, and here are arguments one by one."_

---

# 2. **`apply`**

👉 Same as `call`, but arguments are passed as an **array**.

```js
greet.apply(user, ["Hi", "!!!"]);
// Output: Hi, Alice!!!
```

💡 Use `apply` when you already have arguments in an array.

Example:

```js
const numbers = [5, 6, 2, 3];
console.log(Math.max.apply(null, numbers)); // 6
```

---

# 3. **`bind`**

👉 Creates a **new function** with `this` fixed.
It does not call immediately — you can call later.

```js
const greetAlice = greet.bind(user, "Hey");
greetAlice("?");
// Output: Hey, Alice?
```

💡 Think of `bind` like:
_"Pre-book this function for Alice. I’ll call it later."_

---

# 4. **Function Currying**

👉 Breaking down a function that takes multiple arguments into **multiple functions that take one argument at a time**.

---

### (a) **Manual Currying**

```js
function multiply(a) {
	return function (b) {
		return function (c) {
			return a * b * c;
		};
	};
}

console.log(multiply(2)(3)(4)); // 24
```

---

### (b) **Using `bind`**

```js
function multiply(a, b) {
	return a * b;
}

const double = multiply.bind(null, 2); // fixes 'a' = 2
console.log(double(5)); // 10
```

---

### (c) **Arrow Functions (cleaner syntax)**

```js
const multiplyArrow = (a) => (b) => (c) => a * b * c;

console.log(multiplyArrow(2)(3)(4)); // 24
```

---

# 📝 Types Recap

- **call** → call immediately, args one by one.
- **apply** → call immediately, args as array.
- **bind** → don’t call now, return new function with fixed `this`.
- **Currying** → transform multi-arg function → sequence of functions (used in functional programming & reusability).

---

# 🎯 Real-World Analogy

- `call`: “Chef, cook this dish **now** with ingredients one by one.”
- `apply`: “Chef, cook this dish **now** with this list of ingredients.”
- `bind`: “Chef, here’s the recipe already set for Alice, but cook it **later**.”
- Currying: “Instead of giving all ingredients at once, I’ll give them one by one (flour → sugar → butter). You’ll still bake the cake at the end.”

---

Great question 🚀 — now let’s dive into **infinite function currying**.

---

## 🔹 What is Infinite Currying?

It means we can **keep passing arguments indefinitely** (without knowing in advance how many arguments there will be)
and when we stop passing arguments → we get the final result.

---

## Example 1: Infinite Sum

```js
function sum(a) {
	return function (b) {
		if (b !== undefined) {
			return sum(a + b); // keep returning a function
		}
		return a; // stop condition → return final result
	};
}

console.log(sum(1)(2)(3)(4)()); // 10
console.log(sum(5)(10)(15)()); // 30
```

👉 Here:

- Each call adds to `a`.
- When we call with **no argument `()`**, it returns the accumulated sum.

---

## Example 2: Using ES6 Arrow Functions

Cleaner with arrow functions:

```js
const currySum = (a) => (b) => b !== undefined ? currySum(a + b) : a;

console.log(currySum(1)(2)(3)(4)()); // 10
console.log(currySum(10)(20)(30)()); // 60
```

---

## Example 3: Infinite Multiplication

```js
function multiply(a) {
	return function (b) {
		if (b !== undefined) {
			return multiply(a * b);
		}
		return a;
	};
}

console.log(multiply(2)(3)(4)()); // 24
console.log(multiply(5)(5)(2)()); // 50
```

---

## Example 4: Trick with `.toString()` / `.valueOf()`

We can avoid the extra `()` at the end by overriding how JS converts the function to string/number:

```js
function sum(a) {
	const inner = (b) => {
		return b !== undefined ? sum(a + b) : a;
	};

	inner.toString = () => a; // when coerced, return value
	inner.valueOf = () => a;

	return inner;
}

console.log(sum(1)(2)(3)(4)); // 10
console.log(sum(10)(20)(30)); // 60
```

💡 Here, `console.log` tries to print the function, so it calls `.toString()` → returns the number.

---

## 📝 Use Cases

- Functional programming (like **compose**, **pipe**)
- Dynamic configs (apply options step by step)
- Flexible API design

---

✅ So:

- **Normal currying** → fixed number of arguments.
- **Infinite currying** → can take arguments endlessly until you “stop”.

---

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
