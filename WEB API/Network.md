Excellent 👌 Let’s dive into **Network APIs** and focus on the two most important ones:

1. **`fetch()`** → for making **HTTP requests**
2. **WebSocket API** → for **real-time two-way communication**

---

# 🌐 1. `fetch()` API (HTTP Requests)

### 🔹 What it is:

- A **modern replacement** for `XMLHttpRequest`.
- Returns a **Promise** that resolves to a `Response` object.
- Works asynchronously.

---

### ✅ Basic Syntax

```js
fetch(url, options)
	.then((response) => response.json()) // or .text(), .blob(), etc.
	.then((data) => console.log(data))
	.catch((error) => console.error("Error:", error));
```

---

### 🔹 Common Use Cases

#### 1. **GET Request** (default)

```js
fetch("https://jsonplaceholder.typicode.com/posts/1")
	.then((res) => res.json())
	.then((data) => console.log(data));
```

---

#### 2. **POST Request** (sending data)

```js
fetch("https://jsonplaceholder.typicode.com/posts", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		title: "New Post",
		body: "This is a test",
		userId: 1,
	}),
})
	.then((res) => res.json())
	.then((data) => console.log("Created:", data));
```

---

#### 3. **PUT / PATCH Request**

```js
fetch("https://jsonplaceholder.typicode.com/posts/1", {
	method: "PUT",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({ title: "Updated Title" }),
})
	.then((res) => res.json())
	.then((data) => console.log("Updated:", data));
```

---

#### 4. **DELETE Request**

```js
fetch("https://jsonplaceholder.typicode.com/posts/1", {
	method: "DELETE",
}).then((res) => console.log("Deleted:", res.status));
```

---

#### 5. **Async/Await Style**

```js
async function getData() {
	try {
		const res = await fetch("https://jsonplaceholder.typicode.com/posts");
		const data = await res.json();
		console.log(data);
	} catch (err) {
		console.error("Error:", err);
	}
}
getData();
```

---

🔹 **Summary of fetch()**:

- Simple, promise-based.
- Can handle **GET, POST, PUT, PATCH, DELETE**.
- Works great with `async/await`.

---

# 🌐 2. WebSocket API (Real-Time Communication)

### 🔹 What it is:

- A protocol for **bi-directional, persistent connection** between client & server.
- Unlike `fetch()`, which is **request → response**, WebSockets let **both sides send messages anytime**.

---

### ✅ Basic Usage

#### 1. **Creating a WebSocket**

```js
const socket = new WebSocket("wss://echo.websocket.org");

// when connection is open
socket.onopen = () => {
	console.log("Connected to server");
	socket.send("Hello Server!");
};

// when message is received
socket.onmessage = (event) => {
	console.log("Message from server:", event.data);
};

// when connection closes
socket.onclose = () => {
	console.log("Disconnected from server");
};

// when error happens
socket.onerror = (error) => {
	console.error("WebSocket Error:", error);
};
```

---

#### 2. **Sending Data**

```js
socket.send(JSON.stringify({ type: "greet", message: "Hi there!" }));
```

---

#### 3. **Receiving Data**

```js
socket.onmessage = (event) => {
	const data = JSON.parse(event.data);
	console.log("Server says:", data);
};
```

---

### 🔹 When to use what?

| API           | Best For                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `fetch()`     | One-time requests (REST APIs, fetching JSON, posting forms)                                       |
| **WebSocket** | Continuous, real-time communication (chat apps, live dashboards, multiplayer games, stock prices) |

---

✅ **Quick Recap**

- Use `fetch()` for **request/response** style (like getting recipes from an API).
- Use **WebSockets** for **continuous, real-time updates** (like a chat or stock ticker).

---

👉 Do you want me to build a **small example project** (like a mini chat demo using WebSocket + `fetch()` for initial messages) so you see both working together in practice?
