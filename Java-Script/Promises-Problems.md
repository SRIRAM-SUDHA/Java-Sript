Perfect 🔥 — let’s level you up **step by step** in mastering Promises — from **easy → medium**.

I’ll give you **4 curated problems** (each slightly harder) with **clear explanations + solutions (no async/await)** — just `.then()` / `.catch()` chaining.

---

## 🟢 **Level 1: Easy — Basic Promise Flow**

### 🧩 Problem: Double and Square Numbers (Sequential Promise chaining)

You have an array of numbers.
Create a chain of Promises that:

1. Doubles each number.
2. Squares the doubled number.
3. Logs results in order.

---

### ✅ **Solution:**

```js
function double(num) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(`Doubled ${num} → ${num * 2}`);
			resolve(num * 2);
		}, 300);
	});
}

function square(num) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(`Squared ${num} → ${num * num}`);
			resolve(num * num);
		}, 300);
	});
}

[1, 2, 3, 4].reduce((chain, num) => {
	return chain
		.then(() => double(num))
		.then((doubled) => square(doubled))
		.then((result) => console.log(`✅ Final: ${result}`));
}, Promise.resolve());
```

📘 **Concepts Learned:**

- Sequential chaining with `.then()`
- Returning promises inside `.then()`
- Maintaining order

---

## 🟡 **Level 2: Easy–Medium — Parallel Execution**

### 🧩 Problem: Fetch Random Numbers in Parallel

Create a function `fetchRandom()` that returns a random number after 1–2 seconds.
Fetch 5 random numbers **in parallel** and log them once all are done.

---

### ✅ **Solution:**

```js
function fetchRandom() {
	return new Promise((resolve) => {
		setTimeout(() => {
			const num = Math.floor(Math.random() * 100);
			console.log(`Fetched: ${num}`);
			resolve(num);
		}, Math.random() * 1000 + 1000);
	});
}

const promises = Array.from({ length: 5 }, fetchRandom);

Promise.all(promises)
	.then((results) => {
		console.log("✅ All numbers fetched:", results);
		const avg = results.reduce((a, b) => a + b, 0) / results.length;
		console.log("Average:", avg);
	})
	.catch(console.error);
```

📘 **Concepts Learned:**

- Running Promises in parallel with `Promise.all()`
- Aggregating results
- Handling asynchronous timing differences

---

## 🟠 **Level 3: Medium — Retry Logic**

### 🧩 Problem: Fetch With Random Failures

Write a function `fetchMaybeFail()` that:

- 50% chance succeeds after 1s
- 50% chance fails with “Network Error”

You must **retry up to 3 times** before giving up.

---

### ✅ **Solution:**

```js
function fetchMaybeFail() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() < 0.5) reject("Network Error");
			else resolve("✅ Success");
		}, 1000);
	});
}

function retry(fn, retries) {
	return fn().catch((err) => {
		if (retries > 0) {
			console.log("Retrying...", retries, "left");
			return retry(fn, retries - 1);
		} else {
			console.log("❌ Failed after all retries:", err);
			return Promise.reject(err);
		}
	});
}

retry(fetchMaybeFail, 3).then(console.log).catch(console.error);
```

📘 **Concepts Learned:**

- Recursive retry pattern
- Returning Promises in `.catch()`
- Controlled failure and recovery

---

## 🔵 **Level 4: Medium — Concurrency Limit + Ordered Results**

### 🧩 Problem: Fetch Data With Limit

You have a `fetchData(id)` that resolves after random delay.
Fetch data for `[1,2,3,4,5,6,7,8]`
✅ Only 3 fetches run **in parallel**
✅ Final results are **in original order**

---

### ✅ **Solution:**

```js
function fetchData(id) {
	return new Promise((resolve) => {
		const delay = Math.random() * 2000 + 500;
		setTimeout(() => {
			console.log(`Fetched ID: ${id} (delay: ${Math.floor(delay)}ms)`);
			resolve(`Data-${id}`);
		}, delay);
	});
}

function limitConcurrency(ids, limit) {
	let index = 0;
	let active = 0;
	const results = new Array(ids.length);

	return new Promise((resolve) => {
		function runNext() {
			if (index === ids.length && active === 0) return resolve(results);

			while (active < limit && index < ids.length) {
				const current = index++;
				active++;
				fetchData(ids[current])
					.then((data) => (results[current] = data))
					.catch(() => (results[current] = null))
					.finally(() => {
						active--;
						runNext();
					});
			}
		}
		runNext();
	});
}

limitConcurrency([1, 2, 3, 4, 5, 6, 7, 8], 3).then((r) =>
	console.log("✅ Final ordered results:", r)
);
```

📘 **Concepts Learned:**

- Custom concurrency control (like `Promise.allSettled`, but limited)
- Preserving order manually
- Managing async queue using counters

---

## 🚀 Summary Progression

| Level | Problem                    | Key Concept                      |
| ----- | -------------------------- | -------------------------------- |
| 1️⃣    | Sequential Double & Square | Basic Promise chaining           |
| 2️⃣    | Fetch Random Numbers       | Parallel async control           |
| 3️⃣    | Retry Until Success        | Error recovery                   |
| 4️⃣    | Limited Parallel Fetch     | Concurrency + order preservation |

---

Would you like me to give you **Level 5 (Advanced)** next — a real-world **“multi-level fetch + retry + caching”** challenge (like fetching users → posts → comments with simulated APIs)?
It’s the kind reviewers use in senior interviews.
Excellent — you’re building up your **real-world mastery of Promises** 👏
Here are **6 practical scenarios** (from beginner-friendly to intermediate) with **solutions and reasoning** — each one designed to simulate what interviewers or real projects expect you to handle.

---

## 🟢 **Scenario 1: Sequential API Calls**

### 🧩 Problem

Call three APIs one after another (each returns a message).
Each call should only start after the previous finishes.

---

### ✅ Solution

```js
function apiCall(name, delay) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(`✅ ${name} done`);
			resolve(name);
		}, delay);
	});
}

apiCall("API-1", 1000)
	.then(() => apiCall("API-2", 800))
	.then(() => apiCall("API-3", 500))
	.then(() => console.log("🎯 All done sequentially!"));
```

📘 **Concept:** Basic Promise chaining
Each `.then()` waits for the previous Promise to resolve.

---

## 🟡 **Scenario 2: Parallel API Calls with `Promise.all()`**

### 🧩 Problem

Fetch user data, product data, and orders in parallel — log when all complete.

---

### ✅ Solution

```js
function fetchUser() {
	return new Promise((res) => setTimeout(() => res("User Data"), 1000));
}
function fetchProducts() {
	return new Promise((res) => setTimeout(() => res("Product List"), 1500));
}
function fetchOrders() {
	return new Promise((res) => setTimeout(() => res("Orders"), 800));
}

Promise.all([fetchUser(), fetchProducts(), fetchOrders()]).then((data) => {
	console.log("✅ All fetched:", data);
});
```

📘 **Concept:** Parallel execution + combining results
(`Promise.all()` resolves when all Promises succeed).

---

## 🟠 **Scenario 3: Handling Failures Gracefully**

### 🧩 Problem

If one of the parallel calls fails, handle it without breaking all results.

---

### ✅ Solution

```js
function sometimesFails(name) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			Math.random() > 0.5
				? resolve(`${name} success`)
				: reject(`${name} failed`);
		}, 800);
	});
}

Promise.allSettled([
	sometimesFails("Task 1"),
	sometimesFails("Task 2"),
	sometimesFails("Task 3"),
]).then((results) => {
	const successes = results
		.filter((r) => r.status === "fulfilled")
		.map((r) => r.value);
	const failures = results
		.filter((r) => r.status === "rejected")
		.map((r) => r.reason);
	console.log("✅ Successes:", successes);
	console.log("❌ Failures:", failures);
});
```

📘 **Concept:** `Promise.allSettled()` never throws; it gives both success/failure details.

---

## 🔵 **Scenario 4: Retry Logic on Failure**

### 🧩 Problem

Try fetching data; if it fails, retry up to 3 times before giving up.

---

### ✅ Solution

```js
function unstableFetch() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			Math.random() > 0.6 ? resolve("✅ Fetched!") : reject("❌ Network error");
		}, 500);
	});
}

function retry(fn, retries) {
	return fn().catch((err) => {
		if (retries > 0) {
			console.log("Retrying... remaining:", retries);
			return retry(fn, retries - 1);
		}
		return Promise.reject(err);
	});
}

retry(unstableFetch, 3)
	.then(console.log)
	.catch((err) => console.log("Failed after retries:", err));
```

📘 **Concept:** Recursive retry pattern for network reliability.

---

## 🟣 **Scenario 5: Concurrency Limit (Batch Control)**

### 🧩 Problem

You have 10 tasks but can only run 3 at a time.
When one finishes, start the next.

---

### ✅ Solution

```js
function fetchData(id) {
	return new Promise((resolve) => {
		const delay = Math.floor(Math.random() * 2000) + 500;
		setTimeout(() => {
			console.log(`Fetched task ${id} (${delay}ms)`);
			resolve(id);
		}, delay);
	});
}

function limitConcurrency(ids, limit) {
	let index = 0;
	let active = 0;
	const results = [];

	return new Promise((resolve) => {
		function runNext() {
			if (index === ids.length && active === 0) return resolve(results);
			while (active < limit && index < ids.length) {
				const current = index++;
				active++;
				fetchData(ids[current])
					.then((res) => results.push(res))
					.finally(() => {
						active--;
						runNext();
					});
			}
		}
		runNext();
	});
}

limitConcurrency([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3).then(() =>
	console.log("✅ All done with concurrency limit")
);
```

📘 **Concept:** Task queue + manual concurrency control
(used in APIs, file uploads, etc.)

---

## 🟤 **Scenario 6: Promise-Based Pipeline**

### 🧩 Problem

You need to fetch data, process it, and then store it — all as chained Promises.

---

### ✅ Solution

```js
function fetchData() {
	return new Promise((resolve) =>
		setTimeout(() => {
			console.log("Fetched data");
			resolve([2, 4, 6]);
		}, 500)
	);
}

function processData(data) {
	return new Promise((resolve) =>
		setTimeout(() => {
			const processed = data.map((n) => n * 2);
			console.log("Processed:", processed);
			resolve(processed);
		}, 500)
	);
}

function saveData(data) {
	return new Promise((resolve) =>
		setTimeout(() => {
			console.log("Saved:", data);
			resolve("✅ Saved successfully");
		}, 500)
	);
}

fetchData()
	.then(processData)
	.then(saveData)
	.then(console.log)
	.catch(console.error);
```

📘 **Concept:** Promise chaining as a processing pipeline
(similar to async workflows in ETL, backend jobs, etc.)

---

## 🧭 Summary

| Scenario             | Concept                | Real Use Case               |
| -------------------- | ---------------------- | --------------------------- |
| 1️⃣ Sequential Calls  | `.then()` chaining     | Order-dependent API steps   |
| 2️⃣ Parallel Calls    | `Promise.all()`        | Load data in parallel       |
| 3️⃣ Partial Failure   | `Promise.allSettled()` | Handle mixed results safely |
| 4️⃣ Retry Logic       | Recursive retry        | Network reliability         |
| 5️⃣ Concurrency Limit | Queue control          | Rate limiting / throttling  |
| 6️⃣ Pipeline          | Promise chain          | Data processing stages      |

---

Would you like me to next give you **medium–advanced real-world scenarios**
(like "fetch posts → comments per post" with retry and limit) that mimic real API interview tasks?
