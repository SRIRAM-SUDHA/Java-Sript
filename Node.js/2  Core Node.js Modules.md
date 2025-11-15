## 🧩 **Chapter 2 — Core Node.js Modules**

Node.js comes with several **core modules** — built-in libraries that you can use directly (no installation needed).

To use a module:

```js
const moduleName = require("module_name");
```

---

### ⚙️ **1. The `fs` (File System) Module**

This module lets you **read, write, delete, rename, and manage files**.

Let’s go step-by-step 👇

#### **📄 a. Writing to a file**

```js
const fs = require("fs");

fs.writeFileSync("test.txt", "Hello Node.js!");
console.log("File created!");
```

🧠 Explanation:

- `writeFileSync` → writes data _synchronously_ (blocks other code until done).
- Creates a new file if it doesn’t exist.

#### **📖 b. Reading a file**

```js
const fs = require("fs");

const data = fs.readFileSync("test.txt", "utf8");
console.log(data);
```

🧠 `'utf8'` ensures text is readable instead of showing binary.

#### **⚡ c. Async file operations**

Use the non-blocking (asynchronous) versions — better for servers.

```js
const fs = require("fs");

fs.writeFile("hello.txt", "Async File Write!", (err) => {
	if (err) throw err;
	console.log("File written successfully!");
});
```

Read asynchronously:

```js
fs.readFile("hello.txt", "utf8", (err, data) => {
	if (err) throw err;
	console.log(data);
});
```

🧠 While the file is being read, Node continues executing other code — that’s event-driven behavior.

#### **🗑️ d. Appending and Deleting**

```js
// Append
fs.appendFileSync("test.txt", "\nNew line added!");

// Delete
fs.unlinkSync("hello.txt");
```

---

### 🧭 **2. The `path` Module**

Helps work safely with **file paths** (especially across OS like Windows vs Linux).

```js
const path = require("path");

console.log(__filename); // full file path
console.log(__dirname); // directory path
console.log(path.basename(__filename)); // file name
console.log(path.extname(__filename)); // .js
console.log(path.join(__dirname, "files", "app.txt")); // combine safely
```

🧠 `path.join()` automatically handles slashes (`/` vs `\`), making it platform-independent.

---

### 💻 **3. The `os` Module**

Provides information about your operating system.

```js
const os = require("os");

console.log("Platform:", os.platform());
console.log("Architecture:", os.arch());
console.log("Total Memory:", os.totalmem());
console.log("Free Memory:", os.freemem());
console.log("CPU Info:", os.cpus());
console.log("Home Directory:", os.homedir());
```

🧠 You can use this info to monitor system performance or customize server behavior.

---

### 🌐 **4. The `url` Module**

Used to parse or build URLs.

```js
const url = require("url");

const myUrl = new URL("https://example.com:8080/path/name?user=sriram&id=5");

console.log(myUrl.hostname); // example.com
console.log(myUrl.pathname); // /path/name
console.log(myUrl.searchParams.get("user")); // sriram
console.log(myUrl.searchParams.get("id")); // 5
```

🧠 Useful when handling incoming requests (like `/users?id=1`).

---

### ⚡ **5. The `events` Module**

Node.js runs on **events** (like “file loaded”, “data received”).
You can create your own **EventEmitter** to trigger and listen to events.

```js
const EventEmitter = require("events");

const event = new EventEmitter();

event.on("sayHello", (name) => {
	console.log(`Hello, ${name}!`);
});

event.emit("sayHello", "Sriram");
```

🧠 `.on()` listens for the event; `.emit()` triggers it.
This is the base concept behind frameworks like **Express.js**.

---

### 🌍 **6. The `http` Module**

This is how you create a **web server** without any external framework.

#### Basic Example:

```js
const http = require("http");

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("Hello, World from Node.js server!");
});

server.listen(3000, () => {
	console.log("Server running at http://localhost:3000");
});
```

🧠

- `req` = request object (contains info about the client)
- `res` = response object (used to send data back)
- `listen(3000)` means your server is running on port 3000

#### Add simple routing:

```js
const server = http.createServer((req, res) => {
	if (req.url === "/") {
		res.end("Home Page");
	} else if (req.url === "/about") {
		res.end("About Page");
	} else {
		res.statusCode = 404;
		res.end("Page Not Found");
	}
});
```

Now visit:

- `http://localhost:3000/` → Home Page
- `http://localhost:3000/about` → About Page
- Anything else → 404

---

### ⏱ **7. The `timers` Module**

Timers are automatically available in Node (no import needed).

```js
console.log("Start");

setTimeout(() => {
	console.log("After 2 seconds");
}, 2000);

setInterval(() => {
	console.log("Every 3 seconds");
}, 3000);

console.log("End");
```

🧠 Node schedules these asynchronously via the **event loop**.

---

### ✅ **Chapter Summary**

| Module   | Purpose              | Example                          |
| -------- | -------------------- | -------------------------------- |
| `fs`     | Work with files      | Read/Write/Delete                |
| `path`   | Manage file paths    | `path.join()`                    |
| `os`     | Get system info      | Memory, CPU                      |
| `url`    | Parse/build URLs     | `new URL()`                      |
| `events` | Handle custom events | `.on()` / `.emit()`              |
| `http`   | Build web servers    | `http.createServer()`            |
| `timers` | Time-based actions   | `setTimeout()` / `setInterval()` |

---
