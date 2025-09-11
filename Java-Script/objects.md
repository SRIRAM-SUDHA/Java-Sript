Got it ✅ Let’s go deep into **JavaScript Objects** — they’re one of the most important and sometimes tricky parts of JS. I’ll cover **creation, access, methods, iteration, corner cases, pitfalls, and best practices**.

---

# 📘 JavaScript Objects – Complete Guide

---

## 🔹 1. What is an Object?

- Collection of **key–value pairs**.
- Keys are always **strings or symbols** (numbers are auto-converted to strings).
- Values can be anything (primitives, arrays, functions, other objects).

```js
let obj = {
	name: "Alice",
	age: 25,
	greet: function () {
		return "Hello";
	},
};
```

---

## 🔹 2. Creating Objects

```js
let o1 = {}; // literal ✅
let o2 = new Object(); // constructor
let o3 = Object.create(null); // no prototype (pure map)
let o4 = Object.create({ x: 10 }); // inherits x
let o5 = { a: 1, b: { c: 2 } }; // nested
```

⚠️ **Corner case**: `Object.create(null)` gives you an object with **no `toString`, no `hasOwnProperty`**. Useful for dictionaries but can break libraries that assume prototypes.

---

## 🔹 3. Accessing Properties

```js
obj.name; // dot notation
obj["name"]; // bracket notation
let key = "age";
obj[key]; // dynamic key
```

⚠️ **Pitfall**:

- Dot notation doesn’t work with dynamic keys.
- `obj.123` ❌ → invalid, must use `obj["123"]`.
- Reserved keywords (`default`, `class`) **can be keys**, but must use quotes.

---

## 🔹 4. Adding / Updating / Deleting

```js
obj.city = "Delhi"; // add
obj.age = 26; // update
delete obj.city; // delete
```

⚠️ **Delete only works on own properties** (not prototype).

```js
let proto = { x: 1 };
let o = Object.create(proto);
delete o.x; // ❌ false, still inherits x
```

---

## 🔹 5. Checking Keys

```js
"name" in obj; // true (checks prototype too)
obj.hasOwnProperty("name"); // true (own only)
Object.hasOwn(obj, "name"); // ✅ modern safe version
```

⚠️ **Corner case**: `in` returns true for inherited keys.

```js
"toString" in {}; // true
({}).hasOwnProperty("toString"); // false
```

---

## 🔹 6. Iterating

```js
for (let k in obj) console.log(k); // keys (incl. prototype, enumerable only)
Object.keys(obj); // ["name","age"]
Object.values(obj); // ["Alice",25]
Object.entries(obj); // [["name","Alice"],["age",25]]

for (let [k, v] of Object.entries(obj)) {
	console.log(k, v);
}
```

⚠️ **Order**:

- Integer-like keys (e.g., `"2"`, `"100"`) come first in ascending order.
- Then string keys in insertion order.
- Symbols come last.

```js
let o = { 2: "two", 1: "one", b: "bee", a: "ay" };
console.log(Object.keys(o)); // ["1","2","b","a"]
```

---

## 🔹 7. Copying & Merging

```js
Object.assign({}, obj, {city: "Paris"});  // shallow copy/merge
{...obj, country: "India"};               // spread (shallow)
```

⚠️ **Shallow only** → nested objects are still references.

```js
let o1 = { a: { x: 1 } };
let copy = { ...o1 };
copy.a.x = 99;
console.log(o1.a.x); // 99 ❌
```

✅ Use `structuredClone(obj)` (modern) or `JSON.parse(JSON.stringify(obj))` (loses functions, symbols) for **deep copy**.

---

## 🔹 8. Freezing & Sealing

```js
Object.freeze(obj); // no add/remove/update
Object.seal(obj); // no add/remove, but can update
Object.preventExtensions(obj); // no add
```

⚠️ **Silent fail in non-strict mode**, throws in strict mode:

```js
"use strict";
let o = {};
Object.freeze(o);
o.x = 10; // ❌ TypeError
```

---

## 🔹 9. Symbols as Keys

- Symbols create **hidden keys** (not enumerable by default).

```js
let id = Symbol("id");
let user = { name: "Bob", [id]: 123 };
Object.keys(user); // ["name"]
user[id]; // 123
```

⚠️ `JSON.stringify` ignores symbol keys.

---

## 🔹 10. Prototype & `this`

```js
let proto = {
	greet() {
		return "hi";
	},
};
let o = Object.create(proto);
o.greet(); // "hi"
```

⚠️ **Arrow functions don’t bind `this`**:

```js
let o = {
	val: 10,
	f: () => this.val,
};
o.f(); // undefined ❌
```

✅ Use normal function if you need object-bound `this`.

---

## 🔹 11. Object Methods

- `Object.keys(obj)` → array of keys
- `Object.values(obj)` → array of values
- `Object.entries(obj)` → array of \[key,value]
- `Object.fromEntries(iterable)` → object from pairs ✅
- `Object.assign(target, ...sources)` → copy/merge
- `Object.create(proto, descriptors?)` → new object
- `Object.getOwnPropertyNames(obj)` → keys incl. non-enum
- `Object.getOwnPropertySymbols(obj)` → symbols only
- `Object.getPrototypeOf(obj)` / `Object.setPrototypeOf(obj, proto)`
- `Object.defineProperty(obj, key, descriptor)` → fine-grained control

Example with `defineProperty`:

```js
let o = {};
Object.defineProperty(o, "x", {
	value: 10,
	writable: false,
	enumerable: true,
	configurable: false,
});
o.x = 20; // ❌ ignored
```

---

## 🔹 12. Serialization

```js
JSON.stringify(obj); // to JSON
JSON.parse('{"x":10}'); // back to object
```

⚠️ `JSON.stringify` drops:

- `undefined`
- functions
- symbols
- circular references (throws error)

✅ Use `structuredClone(obj)` for complex objects.

---

## 🔹 13. Common Pitfalls

- `NaN` as object key → `"NaN"` (stringified).
- Keys auto-convert to strings:

```js
let o = {};
o[1] = "a";
o["1"] = "b";
console.log(o); // { "1": "b" }
```

- Comparing objects compares **reference**, not content:

```js
{} === {}; // false
```

- Modifying object in const:

```js
const o = { a: 1 };
o.a = 2; // ✅ allowed
o = {}; // ❌ TypeError
```

---

## 🔹 14. Best Practices

✔ Use **`const` for objects** (prevents reassignment, not mutation).
✔ Use **`Object.hasOwn()`** instead of `hasOwnProperty` (safe).
✔ Use **spread (`...`)** for shallow copies.
✔ Use **`structuredClone()`** for deep copies.
✔ Avoid `for..in` unless you know about prototype pollution.
✔ Use **`Object.freeze`** for immutable configs.

---

👉 Do you want me to also prepare a **one-page `.md` cheat sheet** (like we did for Arrays) listing **all important Object methods + examples** for quick revision?
