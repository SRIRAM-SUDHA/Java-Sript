Below is **clean, structured, interview-ready notes** for
📘 **Chapter 7: Working with REST APIs**
Written **simply, clearly, with examples + explanations** so you can confidently explain to your mentor.

---

# 📘 **Chapter 7: Working with REST APIs**

---

# ⭐ 1. What is REST Architecture?

**REST** → _Representational State Transfer_
It is an **architecture style** for designing APIs.

### ✔ Key principles:

1. **Client–Server**
   Frontend (client) and backend (server) are separate.

2. **Stateless**
   Server does **not store client session**.
   Each request must contain all required info.

3. **Uniform Interface**
   Standard rules for API actions (GET, POST, PUT, DELETE).

4. **Resource-based URLs**
   You work with **nouns**, not verbs.
   Example:
   `/users`, `/users/:id`, `/products`.

5. **HTTP Methods define the action**

| Method | Meaning          |
| ------ | ---------------- |
| GET    | Read             |
| POST   | Create           |
| PUT    | Update (full)    |
| PATCH  | Update (partial) |
| DELETE | Delete           |

---

# ⭐ 2. Designing RESTful Routes

REST = follow naming standards for clarity.

Example: **User Resource**

| Action        | Method    | Route        |
| ------------- | --------- | ------------ |
| Create user   | POST      | `/users`     |
| Get all users | GET       | `/users`     |
| Get one user  | GET       | `/users/:id` |
| Update        | PUT/PATCH | `/users/:id` |
| Delete        | DELETE    | `/users/:id` |

---

# ⭐ 3. CRUD Operations with Express

```js
const express = require("express");
const app = express();
app.use(express.json());
```

### Create

```js
app.post("/users", (req, res) => {
	res.status(201).json({ message: "User created", data: req.body });
});
```

### Read all

```js
app.get("/users", (req, res) => {
	res.status(200).json({ users: [] });
});
```

### Read one

```js
app.get("/users/:id", (req, res) => {
	res.status(200).json({ id: req.params.id });
});
```

### Update

```js
app.put("/users/:id", (req, res) => {
	res.json({ message: "Updated", id: req.params.id });
});
```

### Delete

```js
app.delete("/users/:id", (req, res) => {
	res.json({ message: "Deleted", id: req.params.id });
});
```

---

# ⭐ 4. HTTP Status Codes (Important for Interviews)

| Code    | Meaning      | When to use                      |
| ------- | ------------ | -------------------------------- |
| **200** | OK           | Data returned successfully       |
| **201** | Created      | New resource created (POST)      |
| **400** | Bad request  | Missing fields / validation fail |
| **401** | Unauthorized | Missing/invalid token            |
| **403** | Forbidden    | Not allowed                      |
| **404** | Not found    | Wrong ID / resource not found    |
| **500** | Server error | Unhandled error                  |

---

# ⭐ 5. Working with JSON Data

Express automatically parses JSON when you use:

```js
app.use(express.json());
```

Now you can access request JSON:

```js
req.body.name;
req.body.email;
```

---

# ⭐ 6. API Versioning

When you add new features, you shouldn't break old apps.

Common versions:

```
/api/v1/users
/api/v2/users
```

Allows smooth upgrades.

---

# ⭐ 7. Organizing Routes and Controllers (MVC)

### ❗ Why organize?

To avoid writing everything inside `server.js`.

### MVC Structure:

```
project/
│ server.js
│
├─ routes/
│   └─ userRoutes.js
│
├─ controllers/
│   └─ userController.js
│
├─ models/
│   └─ userModel.js
│
└─ config/
    └─ db.js
```

---

# ⭐ 8. Controllers (Handling the logic)

**controllers/userController.js**

```js
exports.getUsers = (req, res) => {
	res.json({ message: "All users" });
};

exports.createUser = (req, res) => {
	res.status(201).json({ message: "User created", data: req.body });
};
```

---

# ⭐ 9. Routes (Only defines URL)

**routes/userRoutes.js**

```js
const express = require("express");
const { getUsers, createUser } = require("../controllers/userController");
const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);

module.exports = router;
```

Use route in server:

```js
app.use("/api/v1/users", require("./routes/userRoutes"));
```

---

# ⭐ 10. Models (Schema / DB Structure)

If using MongoDB + Mongoose:

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
});

module.exports = mongoose.model("User", userSchema);
```

---

# ⭐ 11. Creating Database Connections

**config/db.js**

```js
const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB Connected");
	} catch (err) {
		console.log(err);
	}
};

module.exports = connectDB;
```

Call in server:

```js
require("dotenv").config();
connectDB();
```

---

# ⭐ 12. CRUD Operations with Database

Example: **Create User**

```js
const User = require("../models/userModel");

exports.createUser = async (req, res) => {
	try {
		const user = await User.create(req.body);
		res.status(201).json({ user });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};
```

Read:

```js
exports.getUsers = async (req, res) => {
	const users = await User.find();
	res.json({ users });
};
```

---

# ⭐ 13. Handling Async Operations in Routes

Always wrap in try/catch:

```js
app.get("/data", async (req, res) => {
	try {
		const result = await fetchData();
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});
```

---

# ⭐ 14. Error Handling

Create middleware:

```js
function errorHandler(err, req, res, next) {
	console.log(err.stack);
	res.status(500).json({ message: err.message });
}

app.use(errorHandler);
```

---

# ⭐ 15. Tokens (JWT Authentication)

Why JWT?
→ Sessionless login (Stateless authentication)

Install:

```
npm install jsonwebtoken
```

Generate token:

```js
const jwt = require("jsonwebtoken");

const token = jwt.sign({ id: user._id }, "SECRET_KEY", {
	expiresIn: "1d",
});
```

Verify token (middleware):

```js
function auth(req, res, next) {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) return res.status(401).json({ message: "No token" });

	try {
		const decoded = jwt.verify(token, "SECRET_KEY");
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: "Invalid token" });
	}
}
```

---

# ⭐ 16. Password Hashing (bcrypt)

Install:

```
npm install bcrypt
```

Hash password:

```js
const bcrypt = require("bcrypt");

const hashed = await bcrypt.hash(password, 10);
```

Compare password:

```js
const isMatch = await bcrypt.compare(enteredPassword, storedHash);
```

---

# ⭐ FINAL SUMMARY (Interview Points)

### 🔥 REST API:

- Resource-based URLs
- Stateless
- CRUD operations using HTTP verbs

### 🔥 Express:

- Lightweight
- Middleware based
- Route organization

### 🔥 MVC:

- Routes → URL mapping
- Controllers → logic
- Models → DB structure

### 🔥 Security:

- JWT for authentication
- bcrypt for hashing passwords

### 🔥 Good Practices:

- Versioning `/api/v1`
- Async/await + try/catch
- Use meaningful HTTP status codes

---

If you want, I can create:
✅ A printable PDF
✅ A diagram-based explanation
✅ A full real project folder structure

Just tell me!
