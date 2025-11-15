# 🌟 **Chapter 6: Express.js Framework**

---

# 🟥 **1. What is Express.js and why use it?**

### ✔ Express.js = A minimal, fast, flexible web framework for Node.js.

Node.js can create servers, but almost everything is **manual**:

- Routing manually
- Parsing JSON manually
- Handling errors manually
- No middleware
- No folder structure
- Hard to scale as the app grows

Express solves this.

### Why use Express?

| Without Express       | With Express             |
| --------------------- | ------------------------ |
| Manual routing        | Clean routing            |
| Hard request parsing  | Automatic JSON parsing   |
| No middleware system  | Strong middleware system |
| Hard to handle errors | Built-in error mechanism |
| Messy server code     | Clear file structure     |
| Hard to maintain      | Easy to scale            |

---

# 🟦 **2. Setting up Express**

Install:

```bash
npm install express
```

Create basic server:

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
	res.send("Welcome to Express!");
});

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
```

Run:

```bash
node index.js
```

---

# 🟧 **3. Creating Routes**

### Route Format:

```
app.METHOD(path, handler)
```

Example:

```js
app.get("/hello", (req, res) => {
	res.send("Hello Sriram!");
});
```

REST API routes:

```js
app.get("/users", (req, res) => res.send("GET users"));
app.post("/users", (req, res) => res.send("POST user"));
app.put("/users/:id", (req, res) => res.send("PUT user"));
app.delete("/users/:id", (req, res) => res.send("DELETE user"));
```

---

# 🟩 **4. Route Parameters & Query Parameters**

---

### ✔ **Route Parameters**

URL:

```
/users/10
```

Route:

```js
app.get("/users/:id", (req, res) => {
	res.send(`User ID is ${req.params.id}`);
});
```

Output:

```
User ID is 10
```

---

### ✔ **Query Parameters**

URL:

```
/search?name=ram&age=20
```

Route:

```js
app.get("/search", (req, res) => {
	res.send(req.query);
});
```

Output:

```json
{ "name": "ram", "age": "20" }
```

---

# 🟨 **5. Serving Static Files**

Create a folder:

```
public/
   index.html
   style.css
   script.js
```

Serve files:

```js
app.use(express.static("public"));
```

Now:

- `/index.html`
- `/style.css`
- `/script.js`

are accessible.

---

# 🟪 **6. Middleware: Concept & Usage**

### 🧠 Middleware = Function that runs **before the route handler**.

Diagram:

```
Request → [Middleware] → [Middleware] → [Route] → Response
```

Middleware has three arguments:

```js
function logger(req, res, next) {
	console.log(req.method, req.url);
	next(); // go to next middleware
}

app.use(logger);
```

---

# 🟦 **7. Built-in Middleware**

Express has many built-in middlewares:

---

### ✔ express.json()

Parses JSON body:

```js
app.use(express.json());
```

POST request body becomes:

```
req.body
```

---

### ✔ express.urlencoded()

Reads form data:

```js
app.use(express.urlencoded({ extended: true }));
```

---

### ✔ express.static()

Serves static files:

```js
app.use(express.static("public"));
```

---

# 🟧 **8. Third-party Middleware**

Common modules:

| Middleware         | Purpose          |
| ------------------ | ---------------- |
| cors               | Fix CORS errors  |
| morgan             | API request logs |
| helmet             | Security headers |
| multer             | File uploads     |
| cookie-parser      | Read cookies     |
| jsonwebtoken       | JWT auth         |
| express-rate-limit | Limit requests   |

Example:

```js
const cors = require("cors");
app.use(cors());
```

---

# 🟩 **9. Custom Middleware**

Custom middleware example:

```js
app.use((req, res, next) => {
	console.log("Custom middleware running");
	next();
});
```

---

# 🟥 **10. Error-handling Middleware**

Error middleware has **4 arguments**:

```js
app.use((err, req, res, next) => {
	console.error("Error:", err.message);
	res.status(500).send("Something went wrong");
});
```

Trigger an error:

```js
app.get("/boom", () => {
	throw new Error("Boom!");
});
```

---

# 🟦 **11. Using Postman for Testing APIs**

Postman helps test backend APIs without browser restrictions.

### You can test:

- GET
- POST JSON
- PUT
- DELETE
- Auth headers
- Cookies
- File uploads
- Query params
- Route params

Example: Testing POST JSON

Postman:

1. Method → POST
2. Body → raw → JSON

```json
{
	"name": "Sriram"
}
```

Server:

```js
app.post("/user", (req, res) => {
	res.json(req.body);
});
```

---
