# 📘 Chapter 5 — Building HTTP Servers (No Frameworks)

Node’s built-in `http` module is powerful. Learning it gives you intuition about how frameworks (Express, Fastify) work under the hood.

Start each example in a new folder, run `node filename.js`, and test with `curl` or the browser.

---

# 1) Creating a simple server with `http.createServer()`

Core idea: create a server, provide a request handler `(req, res)`, and call `.listen(port)`.

```js
// server-basic.js
const http = require("http");

const server = http.createServer((req, res) => {
	// req = incoming request
	// res = response to send back
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("Hello from raw Node HTTP server!\n");
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
```

Test:

```bash
curl http://localhost:3000
```

---

# 2) Handling routes manually

Without a framework you decide routing logic. Use `req.url` and `req.method` or the `URL` class for parsing.

```js
// server-routing.js
const http = require("http");

const server = http.createServer((req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	if (req.method === "GET" && url.pathname === "/") {
		res.writeHead(200, { "Content-Type": "text/plain" });
		return res.end("Home Page");
	}

	if (req.method === "GET" && url.pathname === "/about") {
		res.writeHead(200, { "Content-Type": "text/plain" });
		return res.end("About Page");
	}

	// simple dynamic route: /users/123
	const userMatch = url.pathname.match(/^\/users\/(\d+)$/);
	if (req.method === "GET" && userMatch) {
		const userId = userMatch[1];
		res.writeHead(200, { "Content-Type": "application/json" });
		return res.end(JSON.stringify({ userId }));
	}

	res.writeHead(404, { "Content-Type": "text/plain" });
	res.end("Not Found");
});

server.listen(3000);
```

Tips:

- Use `URL` for safe parsing of query params (needs full origin).
- For more routes, consider a small router function mapping `method+path` to handlers.

---

# 3) Sending JSON and HTML responses

Set correct `Content-Type` and `charset` when sending responses.

**JSON:**

```js
res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
res.end(JSON.stringify({ message: "OK", data: [1, 2, 3] }));
```

**HTML:**

```js
res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
res.end(`<html><body><h1>Hello</h1><p>HTML response</p></body></html>`);
```

**Binary / File streaming example (send image or file):**

```js
const fs = require("fs");
const stream = fs.createReadStream("./large-image.jpg");
res.writeHead(200, { "Content-Type": "image/jpeg" });
stream.pipe(res); // efficient streaming
```

---

# 4) Request and response objects (important properties & methods)

**`req` (IncomingMessage)**

- `req.method` — HTTP method (GET, POST, ...)
- `req.url` — path + query (e.g., `/users?id=2`)
- `req.headers` — object of request headers
- `req.on('data', chunk)` and `req.on('end')` — read request body (stream)
- `req.socket` — TCP socket

**`res` (ServerResponse)**

- `res.statusCode = 200` — set status
- `res.setHeader(name, value)` — set header
- `res.write(chunk)` — write partial response
- `res.end([data])` — end response
- `res.writeHead(statusCode, headersObj)` — set status + headers

Example: set cookie (simple)

```js
res.setHeader("Set-Cookie", ["token=abc; HttpOnly; Path=/"]);
```

---

# 5) HTTP Methods (GET, POST, PUT, DELETE)

REST-like semantics (convention):

- `GET` — read data / fetch resource
- `POST` — create a new resource (server assigns ID)
- `PUT` — replace/update resource (idempotent)
- `PATCH` — partial update
- `DELETE` — remove resource

Example server handling CRUD-ish endpoints (in-memory store):

```js
// crud-server.js
const http = require("http");

let items = []; // in-memory DB

function parseJSONBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
			if (body.length > 1e6) {
				// protect from large bodies
				req.socket.destroy();
				reject(new Error("Body too large"));
			}
		});
		req.on("end", () => {
			if (!body) return resolve(null);
			try {
				resolve(JSON.parse(body));
			} catch (err) {
				reject(err);
			}
		});
	});
}

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	if (req.method === "GET" && url.pathname === "/items") {
		res.writeHead(200, { "Content-Type": "application/json" });
		return res.end(JSON.stringify(items));
	}

	if (req.method === "POST" && url.pathname === "/items") {
		try {
			const data = await parseJSONBody(req);
			const newItem = { id: Date.now(), ...data };
			items.push(newItem);
			res.writeHead(201, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(newItem));
		} catch (err) {
			res.writeHead(400, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ error: "Invalid JSON" }));
		}
	}

	// PUT /items/ID
	const putMatch = url.pathname.match(/^\/items\/(\d+)$/);
	if (req.method === "PUT" && putMatch) {
		try {
			const id = Number(putMatch[1]);
			const data = await parseJSONBody(req);
			const idx = items.findIndex((it) => it.id === id);
			if (idx === -1) {
				res.writeHead(404);
				return res.end("Not found");
			}
			items[idx] = { id, ...data };
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(items[idx]));
		} catch (err) {
			res.writeHead(400);
			return res.end("Bad Request");
		}
	}

	// DELETE /items/ID
	const delMatch = url.pathname.match(/^\/items\/(\d+)$/);
	if (req.method === "DELETE" && delMatch) {
		const id = Number(delMatch[1]);
		const prevLen = items.length;
		items = items.filter((it) => it.id !== id);
		if (items.length === prevLen) {
			res.writeHead(404);
			return res.end("Not found");
		}
		res.writeHead(204); // No Content
		return res.end();
	}

	res.writeHead(404);
	res.end("Not found");
});

server.listen(3000, () => console.log("CRUD server on :3000"));
```

Test with `curl`:

```bash
# create
curl -X POST -H "Content-Type: application/json" -d '{"name":"task1"}' http://localhost:3000/items

# list
curl http://localhost:3000/items

# update (put)
curl -X PUT -H "Content-Type: application/json" -d '{"name":"task1-updated"}' http://localhost:3000/items/123456

# delete
curl -X DELETE http://localhost:3000/items/123456
```

---

# 6) Handling query params and request bodies

## Query params

Use the `URL` class and its `searchParams`.

```js
const url = new URL(req.url, `http://${req.headers.host}`);
const page = url.searchParams.get("page") || "1";
```

Example: `/search?q=node&page=2`

```js
// q = url.searchParams.get('q')
```

## Request bodies — reading and parsing

Node exposes the request as a readable stream. For JSON/text bodies:

```js
function readBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => resolve(body));
		req.on("error", (err) => reject(err));
	});
}
```

Better: parse JSON with try/catch and size limits. Already had `parseJSONBody()` earlier.

**Form data (application/x-www-form-urlencoded):**

```js
const qs = require("querystring");
// after reading body string:
const parsed = qs.parse(body); // returns object
```

**multipart/form-data** (file uploads): you’d normally use a library like `multer` — manual parsing is painful.

**Content-Type check**:
Always check `req.headers['content-type']` before parsing.

---

# 7) Sending headers and status codes

Important to send correct status codes and headers.

**Common status codes**

- `200 OK` — success
- `201 Created` — resource created
- `204 No Content` — success, no body
- `400 Bad Request` — client sent invalid data
- `401 Unauthorized` — needs authentication
- `403 Forbidden` — authenticated but no permission
- `404 Not Found` — missing resource
- `500 Internal Server Error` — server error

**Set headers**

```js
res.setHeader("Content-Type", "application/json");
res.setHeader("Cache-Control", "no-store");
res.writeHead(200, { "X-Custom-Header": "value" }); // sets status + headers
```

**CORS (cross-origin requests)**
If your API will be consumed from browsers on other origins, set CORS headers:

```js
res.setHeader("Access-Control-Allow-Origin", "*"); // or specific origin
res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
```

Also handle `OPTIONS` preflight requests:

```js
if (req.method === "OPTIONS") {
	res.writeHead(204);
	return res.end();
}
```

---

# 8) Error handling, streaming, and performance tips

### a) Protect from large bodies

Limit size while reading to avoid DoS or memory exhaustion.

### b) Use streams for big files

Streaming (`fs.createReadStream().pipe(res)`) avoids loading entire file into memory.

### c) Use `res.once('finish', () => ...)` for cleanup

If you allocate resources during request, clean up when response finishes.

### d) Keep socket timeouts reasonable

```js
server.timeout = 120000; // 2 minutes
```

### e) Parse bodies asynchronously and return promptly

Avoid blocking CPU in request handler.

---

# 9) A compact full example (combines many concepts)

```js
// server-full-example.js
const http = require("http");
const fs = require("fs");
const qs = require("querystring");

const items = [];

function parseJSONBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
			if (body.length > 1e6) {
				req.socket.destroy();
				reject(new Error("Too large"));
			}
		});
		req.on("end", () => {
			if (!body) return resolve(null);
			try {
				resolve(JSON.parse(body));
			} catch (err) {
				reject(err);
			}
		});
		req.on("error", reject);
	});
}

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	// CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.writeHead(204);
		return res.end();
	}

	try {
		if (req.method === "GET" && url.pathname === "/") {
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			return res.end("<h1>Welcome</h1>");
		}

		if (req.method === "GET" && url.pathname === "/items") {
			return res.end(JSON.stringify(items));
		}

		if (req.method === "POST" && url.pathname === "/items") {
			const data = await parseJSONBody(req);
			if (!data || !data.name) {
				res.writeHead(400, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: "name required" }));
			}
			const it = { id: Date.now(), name: data.name };
			items.push(it);
			res.writeHead(201, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(it));
		}

		// static file: /static/file.txt
		if (req.method === "GET" && url.pathname.startsWith("/static/")) {
			const path = `.${url.pathname}`; // careful in production—sanitize path!
			if (!fs.existsSync(path)) {
				res.writeHead(404);
				return res.end("Not found");
			}
			res.writeHead(200, { "Content-Type": "text/plain" });
			return fs.createReadStream(path).pipe(res);
		}

		res.writeHead(404);
		res.end("Not found");
	} catch (err) {
		console.error(err);
		res.writeHead(500, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "server error" }));
	}
});

server.listen(3000, () => console.log("Server on :3000"));
```

---

# 10) Exercises (practice)

1. Build a server that supports:

   - `GET /notes` — list notes
   - `POST /notes` — add a note (`{ title, content }`)
   - `GET /notes/:id` — fetch one
   - `DELETE /notes/:id` — delete
     Persist notes to a JSON file using `fs.promises`.

2. Implement pagination for `GET /items?page=2&limit=10`.

3. Create a route `GET /search?q=term` that returns case-insensitive results from an in-memory list.

4. Implement request size limit and return `413 Payload Too Large` when exceeded.

5. Serve an HTML form (GET `/form`) that POSTs to `/submit`; parse `application/x-www-form-urlencoded` body and show the result.

---

# 11) Common pitfalls & best practices

- **Don’t trust client input** — always validate.
- **Limit body size** to protect memory.
- **Use proper Content-Type** headers (`application/json`, `text/html`).
- **Stream large files**, don’t `readFileSync`.
- **Sanitize file paths** before serving static files.
- **Return correct status codes** — clients and tools rely on them.
- **Avoid blocking operations** in request handlers (no heavy synchronous loops).

---
