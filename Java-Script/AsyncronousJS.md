# 🔹 1. Synchronous JavaScript

- JS is **single-threaded** → it runs **one line at a time** on the **Call Stack**.
- **Synchronous code** means each line must **finish execution before the next starts**.

✅ Example:

```js
console.log("Start");
console.log("Middle");
console.log("End");
```

Output:

```
Start
Middle
End
```

👉 Each line **blocks** the next.

⚠️ Problem: If a task takes too long (e.g., reading a large file, network request), it **blocks everything else**.

```js
function longTask() {
	for (let i = 0; i < 1e9; i++) {} // heavy loop
	console.log("Done with task");
}

console.log("Start");
longTask(); // blocks
console.log("End");
```

Output:

```
Start
Done with task
End
```

The UI (or Node.js event loop) **freezes** until the task ends. 😬

---

# 🔹 2. Asynchronous JavaScript

- Lets JS **delegate long tasks** (like file I/O, network, timers) to the **browser APIs / Node APIs**.
- JS continues executing other code while the async task finishes.
- Once the task is done, a **callback is queued in the Event Loop** → executed later.

✅ Example:

```js
console.log("Start");

setTimeout(() => {
	console.log("Async Task Finished");
}, 2000);

console.log("End");
```

Output:

```
Start
End
Async Task Finished
```

👉 The timer was handled outside the call stack (in Web APIs), then callback returned later.

---

# 🔹 3. Callbacks

A **callback** = a function passed as an argument to another function, to be **called later**.

✅ Example (sync callback):

```js
function greet(name, callback) {
	console.log("Hello " + name);
	callback();
}

greet("Alice", () => {
	console.log("Welcome to the system!");
});
```

✅ Example (async callback):

```js
setTimeout(() => {
	console.log("This runs later");
}, 1000);
```

---

# 🔹 4. Why Callbacks Exist?

Before **Promises** and **async/await**, callbacks were the **only way** to handle async tasks (like AJAX requests, timers, reading files).

They allow **non-blocking code**.
Instead of waiting, we say:
👉 “Hey JS, when you’re done with this task, **call this function back**.”

---

# 🔹 5. Drawbacks of Callbacks

⚠️ **Callback Hell**
Nested callbacks make code unreadable.

Example:

```js
getUser(1, (user) => {
	getPosts(user.id, (posts) => {
		getComments(posts[0].id, (comments) => {
			console.log(comments);
		});
	});
});
```

This looks like a **pyramid of doom**. Hard to read, maintain, and debug.

---

⚠️ **Inversion of Control**
When you pass a callback to someone else’s function, you **lose control** of _when_ and _how_ it gets called.

- It could be called multiple times.
- It could be called too early/too late.
- It could be forgotten entirely.

Example:

```js
function unreliableAPI(success, fail) {
	// may call both, or neither 😬
	success("OK");
	fail("Error");
}
```

---

⚠️ **Error Handling** is messy
Callbacks often require the **error-first convention**:

```js
fs.readFile("file.txt", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}
	console.log(data.toString());
});
```

This mixes error and success handling in the same nested block.

---

# 🔹 6. Callback Pitfalls

1. **Multiple Calls**

   ```js
   function fakeAPI(callback) {
   	callback("First");
   	callback("Second"); // Oops! Called twice
   }
   fakeAPI(console.log);
   ```

2. **Never Called**

   ```js
   function fakeAPI(callback) {
   	// forgot to call callback
   }
   fakeAPI(console.log); // nothing happens
   ```

3. **Error Swallowing**

   ```js
   setTimeout(() => {
   	throw new Error("Boom!"); // not caught in try/catch outside
   }, 1000);
   ```

4. **Readability Issues** (callback hell)

---

# 🔹 7. How We Fixed This → Promises & async/await

👉 Callbacks → hard to manage
👉 Promises → better chaining
👉 async/await → looks like synchronous code, easy to read

✅ Example (Promise instead of callback hell):

```js
getUser(1)
	.then((user) => getPosts(user.id))
	.then((posts) => getComments(posts[0].id))
	.then((comments) => console.log(comments))
	.catch((err) => console.error(err));
```

✅ Example (async/await → cleanest):

```js
async function main() {
	try {
		const user = await getUser(1);
		const posts = await getPosts(user.id);
		const comments = await getComments(posts[0].id);
		console.log(comments);
	} catch (err) {
		console.error(err);
	}
}
main();
```

---

# 🔑 Summary

- **Synchronous JS**: Runs line by line, blocking.
- **Asynchronous JS**: Delegates tasks, uses event loop.
- **Callbacks**: Functions passed to run later.
- **Why exist**: Handle async before Promises existed.
- **Drawbacks**: Callback hell, inversion of control, error handling, readability.
- **Pitfalls**: Multiple calls, never called, hard debugging.
- **Fix**: Promises + async/await.

---

👉 Would you like me to also explain this with a **diagram of the Event Loop (Call Stack, Web APIs, Callback Queue, Event Loop)**? That’s usually the “aha!” moment for async JS.

Good question 👌 — let’s clear this up, because it’s a common confusion when learning callbacks.

---

### 🔎 What a **callback** is

A **callback** is a function you _pass as an argument_ to another function, so that the other function can “call you back” later.

Classic example:

```js
function doSomething(x, callback) {
	setTimeout(() => {
		callback(null, x * 2); // callback is called later
	}, 1000);
}

doSomething(5, (err, result) => {
	console.log(result); // 10
});
```

Here:

- `doSomething` is just a **regular function**.
- `(err, result) => { ... }` is the **callback function**.

---

### In your code (Problem 6)

```js
getBoard(boardId, (err, board) => { ... });
getLists(boardId, (err, lists) => { ... });
getCards(list.id, (err, cards) => { ... });
```

- **`getBoard`, `getLists`, `getCards`** → are **asynchronous functions** you wrote earlier (they each expect a callback as their last argument).
- **The `(err, board) => { ... }`, `(err, lists) => { ... }`, `(err, cards) => { ... }`** → these are the actual **callbacks**.

So:

- `getBoard` itself is **not** a callback.
- It’s a function that **takes a callback**.

---

### ✅ How to phrase it

- `getBoard`, `getLists`, `getCards` → async functions (they _use_ callbacks).
- The functions you pass _into them_ → actual callbacks.

---

👉 Want me to draw this as a little diagram (arrows showing who calls whom), so you can “see” the flow of callbacks between these functions?

Excellent question 👌 — this shows you’re thinking about the **categories of functions** in JavaScript. Let’s carefully separate them:

---

### 1. **Higher-Order Function (HOF)**

A function is called a **HOF** if it does _either_ of these:

- Takes another function as an argument
- Returns a function

Examples:

```js
// Takes another function → HOF
function repeatTwice(action) {
	action();
	action();
}

// Returns a function → HOF
function multiplier(x) {
	return function (y) {
		return x * y;
	};
}
```

So **HOF is about function relationships**.

---

### 2. **Asynchronous Function**

“Async” just means it **doesn’t finish right away** — it schedules work for later.
In JavaScript, async is handled by:

- **Callbacks** (your examples)
- **Promises** (`.then`)
- **async/await** syntax

Example with a callback:

```js
function waitAndSay(msg, callback) {
	setTimeout(() => {
		callback(msg); // runs later
	}, 1000);
}
```

Here, `waitAndSay` is an **asynchronous function** because it doesn’t give results immediately — it waits 1 second.

---

### ⚡ Key Point

- A function can be **both** asynchronous **and** a higher-order function.

Example:

```js
function getData(callback) {
	// HOF (takes function as arg)
	setTimeout(() => {
		// async (delayed work)
		callback("Here’s your data");
	}, 1000);
}
```

So:

- `getData` is **asynchronous** (uses `setTimeout`).
- `getData` is also a **higher-order function** (because it accepts a function argument).

---

### ✅ In your code

- `getBoard`, `getLists`, `getCards` are **asynchronous higher-order functions**.

  - Asynchronous → they use `setTimeout` with random delays.
  - Higher-order → they accept a callback function.

---

Would you like me to show you a little **table comparing normal function vs HOF vs async vs async+HOF** with code examples, so you can lock this idea in clearly?

Compare side by side
// ❌ Using throw in async code = crashes
const bad = new Promise((resolve, reject) => {
setTimeout(() => {
throw new Error("Bad async throw"); // uncaught, Node crashes
}, 1000);
});

// ✅ Using reject in async code = handled
const good = new Promise((resolve, reject) => {
setTimeout(() => {
reject(new Error("Proper rejection"));
}, 1000);
});

good.catch((err) => console.log("Handled:", err.message));

✅ Rule of Thumb

Use throw new Error(...) → inside synchronous code of the executor or a .then callback.

Use reject(new Error(...)) → inside asynchronous callbacks (e.g., setTimeout, event handlers, file I/O).

Perfect, this is one of the **core interview topics** today. Let’s go step by step and create a clear, structured set of notes with **concepts, internal working, examples, pitfalls, and comparisons**.

---

Great question 👍 — promises are **the foundation of modern async JavaScript**, and in interviews they almost always come up.
Let me make you a **structured, documented set of notes** (like a cheat sheet + guide) so you can revise quickly.

---

# 📘 JavaScript Promises — Complete Notes

---

## 🔹 1. What is a Promise?

A **Promise** in JavaScript is an object that represents the **eventual completion (or failure)** of an asynchronous operation and its resulting value.

- It’s like a **placeholder** for a future value.
- Instead of using callbacks (callback hell 😵), we wrap async tasks in promises.
- Promises make async code **more readable, chainable, and manageable**.

---

## 🔹 2. How to Create a New Promise?

We use the **Promise constructor**:

```js
const myPromise = new Promise((resolve, reject) => {
	// Async work here
	setTimeout(() => {
		const success = true;
		if (success) {
			resolve("✅ Data fetched successfully");
		} else {
			reject("❌ Error while fetching data");
		}
	}, 1000);
});
```

- `resolve(value)` → when operation succeeds.
- `reject(error)` → when operation fails.

---

## 🔹 3. States of a Promise

A Promise has **3 states**:

1. **Pending** → Initial state (neither fulfilled nor rejected).
2. **Fulfilled** → Operation completed successfully (`resolve`).
3. **Rejected** → Operation failed (`reject`).

⚡ Once a promise is **settled** (fulfilled/rejected), it cannot change state.

Example:

```js
let p = new Promise((res, rej) => res("Done!"));
console.log(p); // Promise {<fulfilled>: "Done!"}
```

---

## 🔹 4. Consuming an Existing Promise

We use **`.then()`, `.catch()`, `.finally()`**:

```js
myPromise
	.then((result) => console.log("Success:", result)) // if resolved
	.catch((error) => console.log("Error:", error)) // if rejected
	.finally(() => console.log("Always runs")); // always
```

---

## 🔹 5. Promise Chaining

We can chain multiple async steps:

```js
fetch("https://jsonplaceholder.typicode.com/todos/1")
	.then((res) => res.json())
	.then((data) => console.log("Todo:", data))
	.catch((err) => console.error("Failed:", err));
```

---

## 🔹 6. Common Static Methods

- **Promise.all(\[...])**
  Wait for all promises to resolve → fails fast if one rejects.

```js
Promise.all([p1, p2, p3])
	.then((values) => console.log(values))
	.catch((err) => console.error(err));
```

- **Promise.race(\[...])**
  Returns the result of the first settled promise.

```js
Promise.race([p1, p2]).then((val) => console.log("First done:", val));
```

- **Promise.allSettled(\[...])**
  Wait for all promises → returns both fulfilled + rejected results.

```js
Promise.allSettled([p1, p2]).then((results) => console.log(results));
```

- **Promise.any(\[...])** (ES2021)
  Resolves with the **first fulfilled** promise (ignores rejections).

```js
Promise.any([p1, p2]).then((val) => console.log("First success:", val));
```

---

## 🔹 7. Async/Await (Promise sugar)

```js
async function getTodo() {
	try {
		const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
		const data = await res.json();
		console.log("Todo:", data);
	} catch (err) {
		console.error("Error:", err);
	} finally {
		console.log("Finished");
	}
}
getTodo();
```

---

## 🔹 8. Common Interview Questions on Promises

1. **What is a promise? Why was it introduced?**

   - To avoid callback hell, provide better async flow.

2. **What are promise states?**

   - Pending, Fulfilled, Rejected.

3. **How do `.then()`, `.catch()`, `.finally()` differ?**

4. **Difference between `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`.**

5. **What happens if you return a promise inside `.then()`?**

   - It chains, waits for resolution.

6. **What happens if you `throw` inside `.then()` or `async` function?**

   - It’s caught by `.catch()`.

7. **Can you cancel a promise?**

   - Natively no, but patterns like `AbortController` exist.

8. **How do microtasks (promise callbacks) differ from macrotasks (setTimeout)?**

---

# ✅ Example Summary

```js
console.log("Start");

const promise = new Promise((resolve, reject) => {
	setTimeout(() => resolve("Async Done!"), 1000);
});

promise
	.then((val) => {
		console.log("Resolved:", val);
		return "Chained Value";
	})
	.then((val) => console.log("Second Then:", val))
	.catch((err) => console.log("Error:", err))
	.finally(() => console.log("Cleanup"));

console.log("End");
```

**Output:**

```
Start
End
Resolved: Async Done!
Second Then: Chained Value
Cleanup
```

---

⚡ Would you like me to now **make you a diagram comparing Promises vs Callbacks vs Async/Await** (like execution flows side by side)? That’s a favorite **tricky interview topic**.

Perfect 👌 this is basically the **“all you need to know about Promises”** module for interviews.
Let’s go **deep but structured** so it feels like reference notes you can revise quickly.

---

# 📘 JavaScript Promises – Advanced Notes

---

## 1. 🔗 Chaining Promises using `.then`

- `.then()` always returns a **new promise**.
- If you return a value → it gets wrapped in a resolved promise.
- If you return another promise → the next `.then()` waits for it.

```js
fetch("https://jsonplaceholder.typicode.com/todos/1")
	.then((res) => res.json()) // returns a Promise
	.then((data) => {
		console.log("Data:", data);
		return data.title; // wrapped in Promise.resolve
	})
	.then((title) => console.log("Title:", title))
	.catch((err) => console.error("Error:", err));
```

---

## 2. ❌ Error Handling with `.catch`

- If **any** promise in the chain rejects (or an error is thrown), control jumps to the nearest `.catch`.
- This prevents the chain from breaking.

```js
Promise.resolve("Step 1")
	.then((val) => {
		console.log(val);
		throw new Error("Boom 💥");
	})
	.then((val) => console.log("Will not run"))
	.catch((err) => console.error("Caught:", err.message))
	.then(() => console.log("Chain continues"));
```

Output:

```
Step 1
Caught: Boom 💥
Chain continues
```

---

## 3. ✅ The `.finally()` block

- Runs **always**, regardless of success/failure.
- Useful for cleanup: closing DB, hiding loader, etc.

```js
fetch("/data.json")
	.then((res) => res.json())
	.catch((err) => console.error(err))
	.finally(() => console.log("Done with fetch"));
```

---

## 4. 🚨 Error inside `.then()`

### Case A: With `.catch`

```js
Promise.resolve(42)
	.then((val) => {
		throw new Error("Error in then!");
	})
	.catch((err) => console.log("Caught:", err.message));
```

👉 Error handled.

### Case B: Without `.catch`

```js
Promise.resolve(42).then((val) => {
	throw new Error("Uncaught error!");
});
```

👉 Error bubbles to the **global handler** → `UnhandledPromiseRejectionWarning` in Node, or console error in browsers.

⚠️ **Why `.catch` must be at the end:**
So the entire chain is covered. If placed early, later errors won’t be caught.

---

## 5. 🤝 Consuming Multiple Promises

### (a) By chaining:

```js
fetch("/api/user")
	.then((res) => res.json())
	.then((user) => fetch(`/api/posts/${user.id}`))
	.then((res) => res.json())
	.then((posts) => console.log("User’s posts:", posts))
	.catch((err) => console.error("Error:", err));
```

### (b) By `Promise.all`

```js
Promise.all([
	fetch("/api/user").then((r) => r.json()),
	fetch("/api/settings").then((r) => r.json()),
])
	.then(([user, settings]) => {
		console.log("User:", user);
		console.log("Settings:", settings);
	})
	.catch((err) => console.error("Error:", err));
```

⚡ Runs in parallel instead of sequentially.

---

## 6. 🛡 Error Handling is Critical

- Async failures are common: network down, server error, bad JSON.
- Without proper `.catch`, you’ll have **unhandled rejections** → can crash Node.js processes.
- Best practice: **always end promise chains with `.catch`** or use `try/catch` in `async/await`.

---

## 7. 🔄 Promisify Callback-based Functions

Old callback style:

```js
setTimeout(() => console.log("Done!"), 1000);
```

Promisified:

```js
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

wait(1000).then(() => console.log("Done with Promise"));
```

Example with Node’s `fs.readFile`:

```js
const fs = require("fs");

function readFilePromise(file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, "utf8", (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});
}

readFilePromise("test.txt")
	.then((data) => console.log(data))
	.catch((err) => console.error(err));
```

---

## 8. 🧰 Promise Utility Methods

### `Promise.resolve(value)`

Returns a resolved promise immediately.

```js
Promise.resolve(42).then((v) => console.log(v)); // 42
```

### `Promise.reject(error)`

Returns a rejected promise immediately.

```js
Promise.reject("Oops!").catch((e) => console.log(e));
```

### `Promise.all(iterable)`

- Resolves when **all succeed**.
- Rejects immediately if **one fails**.

```js
Promise.all([Promise.resolve(1), Promise.resolve(2)]).then((values) =>
	console.log(values)
); // [1, 2]
```

### `Promise.allSettled(iterable)` (ES2020)

- Waits for all, regardless of success/failure.
- Returns array of `{status, value}` or `{status, reason}`.

```js
Promise.allSettled([Promise.resolve(1), Promise.reject("Err")]).then(
	(results) => console.log(results)
);
```

Output:

```js
[
	{ status: "fulfilled", value: 1 },
	{ status: "rejected", reason: "Err" },
];
```

### `Promise.any(iterable)` (ES2021)

- Resolves with **first fulfilled** promise.
- If all reject → returns `AggregateError`.

```js
Promise.any([Promise.reject("Fail"), Promise.resolve("Win")]).then((val) =>
	console.log(val)
); // "Win"
```

### `Promise.race(iterable)`

- Resolves/rejects as soon as **first settles** (doesn’t wait for others).

```js
Promise.race([
	new Promise((res) => setTimeout(() => res("Fast"), 500)),
	new Promise((res) => setTimeout(() => res("Slow"), 1000)),
]).then((val) => console.log(val)); // "Fast"
```

---

# 🔑 Key Takeaways

1. `.then()` chains, `.catch()` handles errors, `.finally()` cleans up.
2. Always put `.catch()` at the **end**.
3. Multiple promises → use `Promise.all` for parallel, chain for sequential.
4. Always handle errors, otherwise → **unhandled rejection**.
5. Old callbacks → can be wrapped with **Promisify**.
6. Learn utility methods: `resolve`, `reject`, `all`, `allSettled`, `any`, `race`.

---

⚡ Would you like me to also make a **visual execution timeline diagram** comparing how `.then()`, `.catch()`, `.finally()` are triggered in different cases (success, throw, reject)? That usually makes it stick in memory for interviews.

Perfect 🚀 — let’s **visualize how Promises behave in different scenarios**.
This helps you quickly recall **when `.then`, `.catch`, and `.finally` run**.

---

# 🖼️ Promise Execution Timelines

We’ll consider 3 cases: **success, rejection, and thrown error**.

---

## ✅ Case 1: Success

```js
Promise.resolve("Data")
	.then((val) => {
		console.log("Then:", val);
		return "Next Value";
	})
	.finally(() => console.log("Finally"))
	.catch((err) => console.error("Catch:", err));
```

**Timeline →**

```
Promise fulfilled -> go to .then
Then: Data
Finally
```

👉 `.catch` not called.
👉 `.finally` always runs.

---

## ❌ Case 2: Rejection

```js
Promise.reject("Error occurred")
	.then((val) => console.log("Then:", val))
	.catch((err) => console.error("Catch:", err))
	.finally(() => console.log("Finally"));
```

**Timeline →**

```
Promise rejected -> skip .then
Catch: Error occurred
Finally
```

👉 Error jumps straight to `.catch`.
👉 `.finally` still runs.

---

## 🚨 Case 3: Throwing error inside `.then`

```js
Promise.resolve("Start")
	.then((val) => {
		console.log("Then 1:", val);
		throw new Error("Boom!");
	})
	.then((val) => console.log("Then 2:", val)) // skipped
	.catch((err) => console.error("Catch:", err.message))
	.finally(() => console.log("Finally"));
```

**Timeline →**

```
Then 1: Start
Catch: Boom!
Finally
```

👉 Throw inside `.then` = **automatic rejection** passed to `.catch`.

---

## ⚡ Case 4: No `.catch`

```js
Promise.resolve("Start")
	.then((val) => {
		throw new Error("Unhandled!");
	})
	.finally(() => console.log("Finally"));
```

**Timeline →**

```
UnhandledPromiseRejectionWarning: Error: Unhandled!
Finally
```

👉 Without `.catch`, error **bubbles to global handler**.
👉 `.finally` still runs.

---

# 🧾 Summary Table

| Situation                 | `.then` | `.catch` | `.finally`            |
| ------------------------- | ------- | -------- | --------------------- |
| Promise fulfilled         | ✅ runs | ❌ skip  | ✅ runs               |
| Promise rejected          | ❌ skip | ✅ runs  | ✅ runs               |
| Error thrown in `.then`   | ❌ skip | ✅ runs  | ✅ runs               |
| No `.catch` for rejection | ❌ skip | ❌ skip  | ✅ runs, global error |

---

# 🎯 Interview Tip

You can say:

> “A Promise always settles to fulfilled or rejected. `.then` handles fulfillment, `.catch` handles rejection or thrown errors, and `.finally` always runs no matter what. If `.catch` is missing, the error becomes an **unhandled rejection**.”

---

👉 Do you want me to also cover **how error propagation works in Promise chains** (like if you have multiple `.then`s and `.catch` somewhere in the middle vs end)? That’s another common interview twist.

# 📌 `async` / `await` in JavaScript

---

## 1. 🔹 What is `async`?

- `async` is a keyword you put **before a function**.
- It **always returns a Promise**, no matter what you return.
- If you return a value → Promise resolves with that value.
- If you throw an error → Promise rejects with that error.

✅ Example:

```js
async function foo() {
	return 42; // implicitly wrapped in Promise.resolve(42)
}

foo().then((val) => console.log(val)); // 42
```

---

## 2. 🔹 What is `await`?

- `await` pauses the execution of an `async` function until the Promise is **settled** (fulfilled or rejected).
- It only works **inside `async` functions**.
- It makes async code look like **synchronous code**.

✅ Example:

```js
async function bar() {
	console.log("Start");
	const result = await Promise.resolve("Done");
	console.log(result); // "Done"
	console.log("End");
}
bar();
```

---

## 3. 🔹 How `async/await` works behind the scenes

Think of `async/await` as **syntactic sugar** for `.then` and `.catch`.

```js
async function getData() {
	const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
	const data = await response.json();
	return data;
}
```

👉 Behind the scenes, JS rewrites it into:

```js
function getData() {
	return fetch("https://jsonplaceholder.typicode.com/todos/1")
		.then((response) => response.json())
		.then((data) => data);
}
```

- `await` unwraps the Promise value before continuing.
- Under the hood, the **event loop + microtask queue** handles continuation.

---

## 4. 🔹 Error Handling with `async/await`

### ✅ Using try/catch

```js
async function fetchData() {
	try {
		const res = await fetch("bad-url"); // rejects
		const data = await res.json();
		console.log(data);
	} catch (err) {
		console.error("Caught error:", err.message);
	}
}
fetchData();
```

👉 Same as:

```js
fetch("bad-url")
	.then((res) => res.json())
	.catch((err) => console.error("Caught error:", err.message));
```

---

## 5. 🔹 `async/await` vs `.then/.catch`

| Feature            | `async/await`                       | `.then/.catch`                    |
| ------------------ | ----------------------------------- | --------------------------------- |
| Readability        | Looks like sync code, very clean    | Can become nested (callback-like) |
| Error handling     | `try/catch` blocks                  | `.catch()` chains                 |
| Parallel execution | Needs `Promise.all` for concurrency | Natural with multiple `.then`s    |
| Learning curve     | Easier for beginners                | More control over chaining        |

✅ Example comparison:

```js
// Using async/await
async function example() {
	try {
		const a = await fetch("a.json");
		const b = await fetch("b.json");
	} catch (e) {
		console.error(e);
	}
}

// Using .then/.catch
fetch("a.json")
	.then((a) => fetch("b.json"))
	.then((b) => console.log(b))
	.catch((err) => console.error(err));
```

---

## 6. 🔹 Pitfalls of `async/await`

1. **Sequential vs Parallel execution**

```js
// ❌ Slow: runs one after another
const a = await fetch("a.json");
const b = await fetch("b.json");

// ✅ Faster: run in parallel
const [a, b] = await Promise.all([fetch("a.json"), fetch("b.json")]);
```

2. **Error swallowing if not using try/catch**

```js
async function bad() {
	const res = await fetch("bad-url"); // throws
	const data = await res.json();
	// Without try/catch -> unhandled rejection
}
```

3. **Blocking behavior inside async**
   Even though it’s "async", `await` **pauses the async function’s execution** until settled.
   This does **not block the entire JS thread**, but it delays that async function.

4. **Only works inside `async` functions**
   You cannot use `await` at the top level (except in modern ES2022 modules with **top-level await**).

---

## 7. 🔹 Real-World Example

```js
async function getUserData(userId) {
	try {
		const res = await fetch(
			`https://jsonplaceholder.typicode.com/users/${userId}`
		);
		if (!res.ok) throw new Error("User not found");
		const user = await res.json();

		const posts = await fetch(
			`https://jsonplaceholder.typicode.com/users/${userId}/posts`
		).then((r) => r.json());

		return { user, posts };
	} catch (err) {
		console.error("Failed to fetch:", err.message);
	}
}
```

---

# 🎯 Key Takeaways

- `async` makes functions always return a Promise.
- `await` unwraps Promises inside async functions.
- Internally, it’s just `.then` and `.catch`.
- Use `try/catch` for safe error handling.
- For **parallel tasks**, use `Promise.all`.
- Pitfalls: unhandled errors, accidental sequential code, only inside `async`.

---

👉 Do you want me to also make a **visual event-loop style diagram** (like microtask queue vs `await` continuation) so you can see _where exactly the async function pauses and resumes_? That’s a killer interview explanation.

Great 👍 Let’s build the **visual mental model** step by step. I’ll explain with a diagram-like flow of how the **event loop + async/await** works.

---

# 🔄 Event Loop with `async/await`

---

## Example Code

```js
console.log("Start");

async function getData() {
	console.log("Inside async");
	const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
	console.log("After await");
	return res.json();
}

getData().then((data) => console.log("Data:", data));

console.log("End");
```

---

## Step 1: Initial Execution (Call Stack)

- `console.log("Start")` → prints **Start**
- `getData()` is called

  - Logs **Inside async**
  - Encounters `await fetch(...)`

👉 At this moment:

- `fetch(...)` goes to **Web API**
- JS engine **pauses** inside `getData`
- The function immediately returns a **pending Promise**

Meanwhile, execution continues:

- Logs **End**

---

## Step 2: Web APIs + Promise resolution

- The browser handles the HTTP request (`fetch`) in **Web APIs** layer.
- Once response is ready:

  - It moves the `.then()` callback of the Promise into the **Microtask Queue**.

---

## Step 3: Event Loop Behavior

- Event loop checks:

  - Is **Call Stack empty?** ✅ Yes (all sync code done).
  - Any **Microtasks?** ✅ Yes → runs them _before any macrotask (e.g., setTimeout)_.

So:

- The paused `await` resumes → logs **After await**
- `.then(data => console.log("Data:", data))` is also in **Microtask queue** → executes next.

---

## Step 4: Final Order of Logs

```
Start
Inside async
End
After await
Data: {...}
```

---

## 📌 Visual Flow

```
┌─────────────┐      ┌────────────┐
│ Call Stack  │      │ Web APIs   │
└─────┬───────┘      └─────┬──────┘
      │                   │
      ▼                   │
 console.log("Start")     │
 getData() → fetch ───────┘
      │ returns Promise
 console.log("End")
      │
      ▼
┌─────────────┐
│ Microtasks  │  (Promise jobs, await continuation)
│   - resume getData (After await)
│   - .then(Data)
└─────────────┘
```

---

# 📝 Summary of Flow

1. **Sync code** runs first.
2. `await` pauses function, returns a Promise.
3. **Web API** resolves the async work.
4. Event loop puts **Promise callbacks** into the **Microtask Queue**.
5. Microtasks run **before** normal callbacks (like `setTimeout`).

---

✅ This is why `await` behaves like a "pause" inside async, but doesn’t block the whole thread.

---

Would you like me to **compare this same flow with `setTimeout`** (macro task) in a diagram so you see how `await` (microtask) always has higher priority than timers? That’s usually the “tricky part” interviewers test.
