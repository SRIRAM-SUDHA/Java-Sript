## ⚙️ **Chapter 3 — Asynchronous JavaScript in Node.js**

### 🎯 **Goal**

Understand:

- What asynchronous code means
- How Node.js executes tasks
- How to handle async code using:

  1. Callbacks
  2. Promises
  3. `async` / `await`

- The **Event Loop** that powers it all

---

## 🧠 1. Synchronous vs Asynchronous

### 🧩 **Synchronous code** (blocking)

Executes **line by line**.
The next line runs **only after** the previous one finishes.

```js
console.log("Start");

function wait() {
	for (let i = 0; i < 3e9; i++) {} // simulate heavy task
	console.log("Done waiting");
}

wait();
console.log("End");
```

🖥 Output:

```
Start
Done waiting
End
```

👉 The main thread is **blocked** during `wait()` — nothing else runs.

---

### ⚡ **Asynchronous code** (non-blocking)

Node can start a task and **continue executing** other code while waiting for results.

Example:

```js
console.log("Start");

setTimeout(() => {
	console.log("Inside setTimeout");
}, 2000);

console.log("End");
```

🖥 Output:

```
Start
End
Inside setTimeout
```

🧩 Explanation:

- Node schedules the timeout task in the background.
- The event loop checks back later and executes it after 2 seconds.

---

## 🔁 2. The Event Loop (Heart of Node.js)

Think of Node.js as a **single chef** in a kitchen who can:

- Take orders quickly (asynchronous)
- Cook dishes (tasks)
- Keep track of timers, file reads, DB queries
- Once ready → Serve results (via callbacks)

🔹 Event loop phases (simplified):

1. **Timers** → Executes `setTimeout` / `setInterval` callbacks
2. **I/O callbacks** → File, network, etc.
3. **Poll** → Waits for new events
4. **Check** → `setImmediate()` callbacks
5. **Close callbacks**

So even though Node is _single-threaded_, it manages **many concurrent operations** through this system.

---

## ⚙️ 3. Callbacks

### 🧩 Basic callback:

A function passed **as an argument** to another function, executed later.

```js
function greet(name, callback) {
	console.log("Hello " + name);
	callback();
}

function bye() {
	console.log("Goodbye!");
}

greet("Sriram", bye);
```

🖥 Output:

```
Hello Sriram
Goodbye!
```

---

### 📁 Async example with callback:

Let’s use the `fs` module to read a file asynchronously:

```js
const fs = require("fs");

fs.readFile("test.txt", "utf8", (err, data) => {
	if (err) {
		console.error("Error:", err);
		return;
	}
	console.log("File content:", data);
});

console.log("Reading file...");
```

🖥 Output:

```
Reading file...
File content: Hello Node.js
```

👉 The callback runs **after** the file is read.
But the rest of your code keeps running meanwhile — that’s **non-blocking I/O**.

---

### 😖 Callback Hell Problem

As apps grow, multiple callbacks cause _nested pyramids_ of doom:

```js
fs.readFile("file1.txt", "utf8", (err, data1) => {
	fs.readFile("file2.txt", "utf8", (err, data2) => {
		fs.readFile("file3.txt", "utf8", (err, data3) => {
			console.log(data1, data2, data3);
		});
	});
});
```

👉 Hard to read, debug, and handle errors.

---

## 🌈 4. Promises — Cleaner Async Code

A **Promise** is an object representing the eventual completion (or failure) of an async operation.

### 🧩 Basic Example:

```js
const myPromise = new Promise((resolve, reject) => {
	setTimeout(() => {
		resolve("Task completed!");
	}, 2000);
});

myPromise.then((msg) => {
	console.log(msg);
});
```

🖥 Output after 2s:

```
Task completed!
```

---

### ❌ Handling errors:

```js
const myPromise = new Promise((resolve, reject) => {
	const success = false;
	if (success) resolve("Success!");
	else reject("Something went wrong!");
});

myPromise
	.then((msg) => console.log("✅", msg))
	.catch((err) => console.log("❌", err));
```

---

### 📂 Promisifying a callback (example with `fs.promises`)

Modern Node.js provides a promise-based version of `fs`:

```js
const fs = require("fs").promises;

async function readFile() {
	const data = await fs.readFile("test.txt", "utf8");
	console.log(data);
}

readFile();
```

🧠 You just used **async/await** — let’s go deeper on that next.

---

## ⚙️ 5. Async / Await (Syntactic Sugar for Promises)

### 🧩 Example:

```js
function getData() {
	return new Promise((resolve) => {
		setTimeout(() => resolve("Data loaded!"), 2000);
	});
}

async function fetchData() {
	console.log("Fetching...");
	const result = await getData();
	console.log(result);
}

fetchData();
```

🖥 Output:

```
Fetching...
Data loaded!
```

🧠

- `async` marks a function as asynchronous.
- `await` pauses the execution until the Promise resolves.
- Cleaner than `.then()` chaining.

---

### ⚠️ Handling errors in async/await:

```js
async function getData() {
	throw new Error("Network error!");
}

async function run() {
	try {
		await getData();
	} catch (err) {
		console.log("Caught:", err.message);
	}
}

run();
```

🧠 Always wrap async code in `try...catch`.

---

## 🔄 6. Combining it all — Real Example

Let’s mix everything in a real-world Node.js file reading example 👇

### ✅ **Callback way**

```js
const fs = require("fs");

fs.readFile("data.txt", "utf8", (err, data) => {
	if (err) return console.error(err);
	console.log("Data:", data);
});
```

### ✅ **Promise way**

```js
const fs = require("fs").promises;

fs.readFile("data.txt", "utf8")
	.then((data) => console.log("Data:", data))
	.catch((err) => console.error(err));
```

### ✅ **Async/Await way**

```js
const fs = require("fs").promises;

async function readData() {
	try {
		const data = await fs.readFile("data.txt", "utf8");
		console.log("Data:", data);
	} catch (err) {
		console.error(err);
	}
}

readData();
```

All three achieve the same thing — the last one is cleanest and modern.

---

## 🚀 7. Microtasks vs Macrotasks (Advanced)

Node schedules tasks in two queues:

| Type          | Example                       | Runs                                |
| ------------- | ----------------------------- | ----------------------------------- |
| **Macrotask** | `setTimeout`, `setInterval`   | Next event loop tick                |
| **Microtask** | Promises (`.then()`, `await`) | Immediately after current operation |

Example:

```js
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("end");
```

🖥 Output:

```
end
promise
timeout
```

👉 Promises (microtasks) run **before** timers (macrotasks).

---

## 🧩 **Chapter Summary**

| Concept           | Purpose                         | Example                   |
| ----------------- | ------------------------------- | ------------------------- |
| **Callbacks**     | Run code after async operations | `fs.readFile('file', cb)` |
| **Callback Hell** | Nested callbacks hard to manage | Multiple file reads       |
| **Promises**      | Handle async more cleanly       | `.then()` / `.catch()`    |
| **Async/Await**   | Cleaner syntax for Promises     | `await readFile()`        |
| **Event Loop**    | Manages async tasks efficiently | `setTimeout`, I/O         |
| **Microtasks**    | Run before timers               | Promises resolve          |

---
