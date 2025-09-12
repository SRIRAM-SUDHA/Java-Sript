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
