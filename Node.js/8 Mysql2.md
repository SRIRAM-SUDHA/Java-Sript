Here is a **clear, beginner-friendly + interview-ready explanation** of:

### ✔ **mysql2 library**

### ✔ **Writing SQL queries**

### ✔ **Connecting via ORM (Sequelize / Prisma)**

with examples you can directly use in projects or explain to your mentor.

---

# 📘 **1. mysql2 Library**

`mysql2` is the most popular Node.js library for connecting to MySQL databases.

### ✔ Why mysql2?

- Faster than `mysql`
- Supports **Promises** (so you can use async/await)
- Works well with ORMs like Sequelize/Prisma
- Fully compatible with MySQL & MariaDB

---

## ✔ Installing mysql2

```
npm install mysql2
```

---

## ✔ Connecting to MySQL using mysql2

### **1️⃣ Basic connection**

```js
const mysql = require("mysql2");

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password",
	database: "testdb",
});

db.connect((err) => {
	if (err) throw err;
	console.log("MySQL Connected!");
});
```

---

### **2️⃣ Using mysql2 with async/await (recommended)**

```js
const mysql = require("mysql2/promise");

async function connectDB() {
	const db = await mysql.createPool({
		host: "localhost",
		user: "root",
		password: "password",
		database: "testdb",
	});

	return db;
}
```

💡 `createPool()` is better → It manages multiple connections efficiently.

---

# 📘 2. Writing SQL Queries

Once connected, you write SQL queries using **db.query()**.

---

## ✔ Example 1: SELECT

```js
const [rows] = await db.query("SELECT * FROM users");
console.log(rows);
```

---

## ✔ Example 2: SELECT with WHERE

```js
const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
```

💡 `?` prevents SQL injection.

---

## ✔ Example 3: INSERT

```js
const [result] = await db.query(
	"INSERT INTO users (name, email) VALUES (?, ?)",
	[name, email]
);
```

---

## ✔ Example 4: UPDATE

```js
await db.query("UPDATE users SET email = ? WHERE id = ?", [email, id]);
```

---

## ✔ Example 5: DELETE

```js
await db.query("DELETE FROM users WHERE id = ?", [id]);
```

---

# 📘 3. Connecting via ORM (Sequelize / Prisma)

ORM = **Object Relational Mapper**
It converts DB rows → JavaScript objects.

This means:

### ❌ No need to write SQL manually

### ✔ You write JS code, ORM generates SQL internally

---

# ⭐ Option A: Sequelize ORM

## ✔ Install

```
npm install sequelize mysql2
```

---

## ✔ Setup Connection

```js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("testdb", "root", "password", {
	host: "localhost",
	dialect: "mysql",
});
```

Test connection:

```js
sequelize
	.authenticate()
	.then(() => console.log("Connected"))
	.catch((err) => console.log(err));
```

---

## ✔ Define a Model (table)

```js
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
	name: DataTypes.STRING,
	email: DataTypes.STRING,
});
```

---

## ✔ Create Tables Automatically

```js
sequelize.sync();
```

---

## ✔ CRUD using Sequelize

### Create

```js
await User.create({ name: "Sriram", email: "test@gmail.com" });
```

### Read

```js
const users = await User.findAll();
```

### Update

```js
await User.update({ email: "new@gmail.com" }, { where: { id } });
```

### Delete

```js
await User.destroy({ where: { id } });
```

---

# ⭐ Option B: Prisma ORM (More modern, easier)

## ✔ Install

```
npm install prisma --save-dev
npx prisma init
```

This generates:

```
prisma/schema.prisma
```

---

## ✔ Configure MySQL inside schema.prisma

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## ✔ Create a Model

```prisma
model User {
  id       Int     @id @default(autoincrement())
  name     String
  email    String
}
```

---

## ✔ Apply to DB

```
npx prisma migrate dev --name init
```

---

## ✔ Use Prisma in Node

```js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
```

---

### CRUD using Prisma

### Create

```js
await prisma.user.create({
	data: { name: "Sriram", email: "a@gmail.com" },
});
```

### Read

```js
const users = await prisma.user.findMany();
```

### Update

```js
await prisma.user.update({
	where: { id: 1 },
	data: { email: "updated@gmail.com" },
});
```

### Delete

```js
await prisma.user.delete({ where: { id: 1 } });
```

---

# 📌 mysql2 vs ORM Comparison (Interview-Ready)

| Feature             | mysql2         | Sequelize         | Prisma               |
| ------------------- | -------------- | ----------------- | -------------------- |
| Write raw SQL       | ✔ Yes          | ⚠ Mostly no       | ❌ No                |
| Async/await support | ✔              | ✔                 | ✔                    |
| Auto migrations     | ❌             | Semi              | ✔ Best               |
| Performance         | Fastest        | Good              | Very good            |
| Learning curve      | Easy           | Medium            | Easiest              |
| Best for            | Custom queries | Medium-large apps | Modern scalable apps |

---

# 📌 When to use what?

### ✔ Use **mysql2**

- When you need full control over SQL
- When queries are complex
- When app is small/simple

### ✔ Use **Sequelize**

- When using MVC structure
- When you want object-based DB operations

### ✔ Use **Prisma**

- Modern apps
- Complex database schema
- Best developer experience

---

Great — here are **FULL CRUD examples** using all 3 approaches:

1. **mysql2 (raw SQL)**
2. **Sequelize ORM**
3. **Prisma ORM**

Each version will create the same API:

| Method | Route      | Action          |
| ------ | ---------- | --------------- |
| POST   | /users     | Create user     |
| GET    | /users     | Get all users   |
| GET    | /users/:id | Get single user |
| PUT    | /users/:id | Update user     |
| DELETE | /users/:id | Delete user     |

And each will work with a table:

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100)
);
```

---

# ⭐ PART 1 — CRUD with **mysql2**

---

## 📌 Step 1: Install dependencies

```
npm install express mysql2
```

---

## 📌 Step 2: Database connection (db.js)

```js
const mysql = require("mysql2/promise");

const db = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "password",
	database: "testdb",
});

module.exports = db;
```

---

## 📌 Step 3: CRUD Routes

### 👉 index.js

```js
const express = require("express");
const db = require("./db");
const app = express();

app.use(express.json());
```

---

## ✔ CREATE (POST)

```js
app.post("/users", async (req, res) => {
	const { name, email } = req.body;

	const [result] = await db.query(
		"INSERT INTO users (name, email) VALUES (?, ?)",
		[name, email]
	);

	res.status(201).json({ id: result.insertId, name, email });
});
```

---

## ✔ READ ALL (GET)

```js
app.get("/users", async (req, res) => {
	const [rows] = await db.query("SELECT * FROM users");
	res.json(rows);
});
```

---

## ✔ READ ONE (GET)

```js
app.get("/users/:id", async (req, res) => {
	const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
		req.params.id,
	]);

	if (rows.length === 0) return res.status(404).send("User not found");

	res.json(rows[0]);
});
```

---

## ✔ UPDATE (PUT)

```js
app.put("/users/:id", async (req, res) => {
	const { name, email } = req.body;

	await db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
		name,
		email,
		req.params.id,
	]);

	res.send("User updated");
});
```

---

## ✔ DELETE (DELETE)

```js
app.delete("/users/:id", async (req, res) => {
	await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
	res.send("User deleted");
});
```

---

## ✔ Start server

```js
app.listen(3000, () => console.log("Server running on 3000"));
```

---

# ⭐ PART 2 — CRUD with **Sequelize ORM**

---

## 📌 Step 1: Install dependencies

```
npm install express sequelize mysql2
```

---

## 📌 Step 2: Setup Sequelize (db.js)

```js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("testdb", "root", "password", {
	host: "localhost",
	dialect: "mysql",
});

module.exports = sequelize;
```

---

## 📌 Step 3: Create User Model (User.js)

```js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const User = sequelize.define("User", {
	name: DataTypes.STRING,
	email: DataTypes.STRING,
});

module.exports = User;
```

---

## 📌 Step 4: Sync DB

```js
sequelize.sync();
```

---

## 📌 Step 5: CRUD Routes (index.js)

```js
const express = require("express");
const sequelize = require("./db");
const User = require("./User");
const app = express();

app.use(express.json());
sequelize.sync();
```

---

### ✔ CREATE

```js
app.post("/users", async (req, res) => {
	const user = await User.create(req.body);
	res.status(201).json(user);
});
```

---

### ✔ READ ALL

```js
app.get("/users", async (req, res) => {
	const users = await User.findAll();
	res.json(users);
});
```

---

### ✔ READ ONE

```js
app.get("/users/:id", async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).send("User not found");
	res.json(user);
});
```

---

### ✔ UPDATE

```js
app.put("/users/:id", async (req, res) => {
	await User.update(req.body, { where: { id: req.params.id } });
	res.send("User updated");
});
```

---

### ✔ DELETE

```js
app.delete("/users/:id", async (req, res) => {
	await User.destroy({ where: { id: req.params.id } });
	res.send("User deleted");
});
```

---

# ⭐ PART 3 — CRUD with **Prisma ORM**

---

## 📌 Step 1: Install Prisma

```
npm install prisma --save-dev
npx prisma init
npm install @prisma/client
```

---

## 📌 Step 2: Update schema.prisma

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String
}
```

---

## 📌 Step 3: Run migration

```
npx prisma migrate dev --name init
```

---

## 📌 Step 4: CRUD Routes

### index.js

```js
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
```

---

### ✔ CREATE

```js
app.post("/users", async (req, res) => {
	const user = await prisma.user.create({ data: req.body });
	res.status(201).json(user);
});
```

---

### ✔ READ ALL

```js
app.get("/users", async (req, res) => {
	const users = await prisma.user.findMany();
	res.json(users);
});
```

---

### ✔ READ ONE

```js
app.get("/users/:id", async (req, res) => {
	const user = await prisma.user.findUnique({
		where: { id: Number(req.params.id) },
	});

	if (!user) return res.status(404).send("User not found");

	res.json(user);
});
```

---

### ✔ UPDATE

```js
app.put("/users/:id", async (req, res) => {
	await prisma.user.update({
		where: { id: Number(req.params.id) },
		data: req.body,
	});

	res.send("User updated");
});
```

---

### ✔ DELETE

```js
app.delete("/users/:id", async (req, res) => {
	await prisma.user.delete({
		where: { id: Number(req.params.id) },
	});

	res.send("User deleted");
});
```

---

# 🎯 Summary (Interview Ready)

| Feature             | mysql2                | Sequelize | Prisma               |
| ------------------- | --------------------- | --------- | -------------------- |
| Raw SQL             | ✔                     | ❌        | ❌                   |
| Auto table creation | ❌                    | ✔         | ✔                    |
| Code simplicity     | Medium                | Medium    | **Best**             |
| Best for            | Performance & control | MVC apps  | Modern scalable apps |

---
