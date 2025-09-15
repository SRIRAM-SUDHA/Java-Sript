Absolutely 💯 — let’s make clean **notes on Array & Object Destructuring, Rest Operator, and Renaming Variables** with examples.

---

# 📘 JavaScript Destructuring, Rest, and Renaming Notes

---

## 1. 🔹 What is Destructuring?

Destructuring is a **syntax to unpack values** from arrays or properties from objects into distinct variables.

---

## 2. 🔹 Array Destructuring

```js
const arr = [10, 20, 30, 40];

// Basic
const [a, b] = arr;
console.log(a, b); // 10 20

// Skipping elements
const [x, , y] = arr;
console.log(x, y); // 10 30

// With Rest operator (...)
const [first, ...rest] = arr;
console.log(first); // 10
console.log(rest); // [20, 30, 40]

// naming
const { [1]: first, ...rest } = arr;
console.log(first); // 20
console.log(rest); // [20, 30, 40]

// Default values
const [p, q, r = 99] = [1, 2];
console.log(p, q, r); // 1 2 99
```

---

## 3. 🔹 Object Destructuring

```js
const person = {
	name: "Alice",
	age: 25,
	country: "USA",
};

// Basic
const { name, age } = person;
console.log(name, age); // Alice 25

// Renaming
const { name: fullName, country: location } = person;
console.log(fullName, location); // Alice USA

// Default values
const { job = "Engineer" } = person;
console.log(job); // Engineer

// Nested Destructuring
const user = {
	id: 101,
	profile: {
		username: "alice101",
		email: "alice@example.com",
	},
};

const {
	profile: { username, email },
} = user;
console.log(username, email); // alice101 alice@example.com
```

---

## 4. 🔹 Mixing Array & Object Destructuring

```js
const users = [
	{ id: 1, name: "Bob" },
	{ id: 2, name: "Carol" },
];

const [{ name: firstUser }, { name: secondUser }] = users;
console.log(firstUser, secondUser); // Bob Carol
```

---

## 5. 🔹 Rest Operator (`...`)

- Used to collect remaining values into an array/object.
- Works in both array and object destructuring.

### Array Rest

```js
const nums = [1, 2, 3, 4];
const [first, ...others] = nums;
console.log(first); // 1
console.log(others); // [2, 3, 4]
```

### Object Rest

```js
const student = { id: 1, name: "Sam", grade: "A", age: 20 };
const { name, ...restDetails } = student;
console.log(name); // Sam
console.log(restDetails); // { id: 1, grade: 'A', age: 20 }
```

---

## 6. 🔹 Function Parameters with Destructuring

### Array

```js
function sum([a, b]) {
	return a + b;
}
console.log(sum([5, 10])); // 15
```

### Object

```js
function greet({ name, age }) {
	return `Hello ${name}, you are ${age}`;
}
console.log(greet({ name: "Maya", age: 22 }));
// Hello Maya, you are 22
```

### With Renaming + Default

```js
function showUser({ username: name = "Guest" }) {
	console.log(name);
}
showUser({ username: "Ravi" }); // Ravi
showUser({}); // Guest
```

---

# ✅ Summary (Quick Revision)

- **Array Destructuring:** `[a, b] = arr`
- **Object Destructuring:** `{key} = obj`
- **Skipping Values:** `[a, , b]`
- **Default Values:** `const [a=1] = []`
- **Renaming:** `{oldKey: newName}`
- **Nested:** `{nested: {prop}}`
- **Rest Operator:** `...rest` → collects remaining values

---

👉 This is a **very common interview topic** because it touches **ES6 features, readability, and function parameters**.

---

Do you want me to also prepare a **practice exercise set with solutions** (like tricky nested destructuring questions with default + rename + rest combined)? That’s usually the part that trips candidates in interviews.
