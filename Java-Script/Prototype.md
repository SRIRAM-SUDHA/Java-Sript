Great question 🚀 — **Prototypes** are one of the most fundamental concepts in JavaScript’s object system, and they often confuse people. Let’s break it down step by step in a structured way.

---

# 🔹 What is a Prototype?

- In **JavaScript**, every object has an internal hidden property called `[[Prototype]]`.
- This property points to another object, which is known as its **prototype**.
- The prototype itself can also have its own prototype, forming a chain → **Prototype Chain**.

👉 This is how JavaScript implements **inheritance**.

---

# 🔹 Example

```js
const person = {
	greet: function () {
		console.log("Hello!");
	},
};

const user = {
	name: "Sriram",
};

// Link user’s prototype to person
Object.setPrototypeOf(user, person);

console.log(user.name); // "Sriram" (own property)
user.greet(); // "Hello!" (inherited from prototype)
```

- `user` object doesn’t have `greet`, so JS looks in its **prototype** (`person`).
- If not found there, it keeps climbing the **prototype chain** until it reaches `null`.

---

# 🔹 Default Prototypes

- Functions in JS have a special property: **`prototype`** (used when creating objects via `new`).
- Every object created with `new` has its internal `[[Prototype]]` linked to that function’s `prototype`.

```js
function Person(name) {
	this.name = name;
}
Person.prototype.sayName = function () {
	console.log(this.name);
};

const p1 = new Person("Sriram");
p1.sayName(); // "Sriram"
```

👉 Here, `p1.__proto__ === Person.prototype`.

---

# 🔹 Prototype Methods

JavaScript provides **built-in methods** to work with prototypes:

### 1. **Object.getPrototypeOf(obj)**

Returns the prototype (`[[Prototype]]`) of the given object.

```js
const proto = Object.getPrototypeOf(p1);
console.log(proto === Person.prototype); // true
```

---

### 2. **Object.setPrototypeOf(obj, prototype)**

Sets the prototype of a given object.

```js
const dog = {};
const animal = { eat: () => console.log("eating...") };

Object.setPrototypeOf(dog, animal);
dog.eat(); // "eating..."
```

⚠️ Use carefully → can affect performance.

---

### 3. **Object.create(proto, propertiesObject?)**

Creates a new object with the given prototype.

```js
const animal = { speak: () => console.log("Sound...") };
const cat = Object.create(animal);
cat.speak(); // "Sound..."
```

---

### 4. **hasOwnProperty(key)**

Checks if a property belongs to the object itself (not inherited).

```js
console.log(cat.hasOwnProperty("speak")); // false
```

---

### 5. **isPrototypeOf(obj)**

Checks if an object exists in another object’s prototype chain.

```js
console.log(animal.isPrototypeOf(cat)); // true
```

---

### 6. **Object.prototype.**proto\*\*\*\* (legacy)

- Every object has `__proto__` (a getter/setter for `[[Prototype]]`).
- Not recommended for production, but used a lot for quick checks.

```js
console.log(cat.__proto__ === animal); // true
```

---

# 🔹 Prototype Chain Example (with built-ins)

```js
let arr = [1, 2, 3];

console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null
```

Chain looks like:
`arr → Array.prototype → Object.prototype → null`

---

# 🔹 Common Interview Traps

1. Difference between `.prototype` and `__proto__`.

   - `.prototype`: property of **functions** (used by `new`).
   - `__proto__`: actual prototype link of an **object**.

2. Prototype chain lookup: If property not found → climbs chain → ends at `null`.

3. Built-in prototypes (e.g., `Array.prototype`, `Function.prototype`, `Object.prototype`) can be extended — but it’s usually a bad idea.

---

✅ **Summary**

- **Prototype**: Object’s inheritance mechanism.
- **Methods**: `getPrototypeOf`, `setPrototypeOf`, `create`, `hasOwnProperty`, `isPrototypeOf`.
- **Prototype Chain**: Object → Constructor.prototype → Object.prototype → null.

---

Do you want me to also **draw you a diagram** of prototype chain (like `obj → Object.prototype → null`, `arr → Array.prototype → Object.prototype → null`) so it clicks visually?

Perfect, let’s do a **custom `filter` implementation** using **prototypes** step by step.

---

# 🔹 Goal

We’ll create a method called `myFilter` on `Array.prototype` so that every array in JS can use it just like the built-in `filter`.

---

# 🔹 Implementation

```js
// Add custom filter to Array prototype
Array.prototype.myFilter = function (callback, thisArg) {
	// 'this' refers to the array on which myFilter is called
	if (typeof callback !== "function") {
		throw new TypeError(callback + " is not a function");
	}

	const result = [];

	for (let i = 0; i < this.length; i++) {
		if (i in this) {
			// skip empty slots in sparse arrays
			// Call the callback with element, index, and array
			if (callback.call(thisArg, this[i], i, this)) {
				result.push(this[i]);
			}
		}
	}
	return result;
};
```

---

# 🔹 Example Usage

```js
const numbers = [1, 2, 3, 4, 5, 6];

const evenNumbers = numbers.myFilter(function (num) {
	return num % 2 === 0;
});

console.log(evenNumbers); // [2, 4, 6]
```

---

# 🔹 With `thisArg` Example

```js
const obj = { min: 3 };

const filtered = [1, 2, 3, 4, 5].myFilter(function (num) {
	return num >= this.min; // here "this" refers to obj
}, obj);

console.log(filtered); // [3, 4, 5]
```

---

# 🔹 Differences from Built-in `filter`

✅ Works almost the same way:

- Passes `(element, index, array)` to the callback.
- Supports `thisArg`.
- Returns a new array, doesn’t mutate original.

⚠️ Doesn’t handle all edge cases exactly like spec (e.g., proxies, exotic objects), but good enough for interviews or real use.

---

✅ **Summary**:
We just extended `Array.prototype` with a custom `myFilter`. Now every array can use it.

---

Would you like me to also show you **how to implement `map` and `reduce` from scratch using prototypes**, so you have a full set for interview prep?
