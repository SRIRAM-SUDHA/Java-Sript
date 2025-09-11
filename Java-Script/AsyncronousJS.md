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
