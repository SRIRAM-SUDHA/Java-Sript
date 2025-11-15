Below is the **clearest and simplest guide** to learning **Sequelize with MySQL**, including:

✅ What Sequelize is
✅ Installing
✅ Connecting to MySQL
✅ Creating database & tables
✅ Defining models
✅ CRUD operations (Create, Read, Update, Delete)
✅ Syncing tables
✅ Associations (optional if you want later)

Everything explained in a clean, beginner-friendly way.

---

# 🚀 **What is Sequelize?**

Sequelize is an **ORM** (Object Relational Mapper).

Instead of writing SQL manually:

```sql
SELECT * FROM users WHERE id=1;
```

You write:

```js
User.findByPk(1);
```

You interact with DB using **JavaScript objects**, Sequelize converts them into SQL for MySQL.

---

# 🛠 Step 1 — Install Packages

Run:

```bash
npm install sequelize mysql2
```

- `sequelize` → ORM
- `mysql2` → MySQL driver

---

# 🛠 Step 2 — Create Database in MySQL

You can create it manually in MySQL:

```sql
CREATE DATABASE node_sequelize;
```

Or from CLI:

```bash
mysql -u root -p
CREATE DATABASE node_sequelize;
```

---

# 🛠 Step 3 — Initialize Sequelize Connection

Create:

```
/config/db.js
```

```js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node_sequelize", "root", "yourpassword", {
	host: "localhost",
	dialect: "mysql",
	logging: false, // remove SQL logs
});

module.exports = sequelize;
```

✔ Connects to MySQL
✔ Disables unwanted logs

---

# 🛠 Step 4 — Test the DB Connection

Create:

```
/testConnection.js
```

```js
const sequelize = require("./config/db");

(async () => {
	try {
		await sequelize.authenticate();
		console.log("📌 Database connected successfully!");
	} catch (error) {
		console.error("❌ Database connection failed:", error);
	}
})();
```

Run:

```bash
node testConnection.js
```

---

# 🛠 Step 5 — Create a Model (Table)

Create:

```
/models/User.js
```

```js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},

		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: { isEmail: true },
		},

		age: {
			type: DataTypes.INTEGER,
			defaultValue: 18,
		},
	},
	{
		tableName: "users",
		timestamps: true, // createdAt, updatedAt
	}
);

module.exports = User;
```

✔ Creates a `users` table
✔ Adds validation
✔ Adds timestamps

---

# 🛠 Step 6 — Sync Models (Create Table)

Create:

```
/sync.js
```

```js
const sequelize = require("./config/db");
const User = require("./models/User");

(async () => {
	try {
		await sequelize.sync({ alter: true });
		console.log("📌 Tables synced successfully!");
	} catch (err) {
		console.error(err);
	}
})();
```

Run:

```bash
node sync.js
```

✔ Table created in MySQL automatically
✔ Changes auto-updated (`alter: true`)

---

# 🧪 Step 7 — CRUD Operations

Create:

```
/controllers/userController.js
```

---

# ✅ 1. **CREATE** (Insert)

```js
// Create new user
exports.createUser = async (req, res) => {
	const { name, email, age } = req.body;

	const user = await User.create({ name, email, age });

	res.json({
		message: "User created!",
		user,
	});
};
```

Equivalent SQL:

```sql
INSERT INTO users (name, email, age) VALUES (...);
```

---

# ✅ 2. **READ** (Get all)

```js
exports.getUsers = async (req, res) => {
	const users = await User.findAll();
	res.json(users);
};
```

Equivalent SQL:

```sql
SELECT * FROM users;
```

---

# 📌 Read One

```js
exports.getUser = async (req, res) => {
	const user = await User.findByPk(req.params.id);
	res.json(user);
};
```

---

# ✅ 3. **UPDATE**

```js
exports.updateUser = async (req, res) => {
	const { name, age } = req.body;

	const user = await User.update(
		{ name, age },
		{ where: { id: req.params.id } }
	);

	res.json({ message: "User updated!" });
};
```

Equivalent SQL:

```sql
UPDATE users SET name=?, age=? WHERE id=?;
```

---

# ✅ 4. **DELETE**

```js
exports.deleteUser = async (req, res) => {
	await User.destroy({ where: { id: req.params.id } });

	res.json({ message: "User deleted!" });
};
```

Equivalent SQL:

```sql
DELETE FROM users WHERE id=?;
```

---

# 🛠 Step 8 — Routes

```
/routes/userRoutes.js
```

```js
const express = require("express");
const {
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
```

---

# 🛠 Step 9 — App.js

```
/app.js
```

```js
const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);

module.exports = app;
```

---

# 🛠 Step 10 — Server

```
/server.js
```

```js
const app = require("./app");
const sequelize = require("./config/db");

sequelize
	.authenticate()
	.then(() => console.log("DB connected"))
	.catch((err) => console.error(err));

app.listen(5000, () => console.log("Server running on 5000"));
```

---

# 🎉 Your Sequelize CRUD with MySQL Is Ready!

You now have:

✔ DB connection
✔ Model
✔ Automatic table creation
✔ Full CRUD routes
✔ MVC structure

---

# Want the Next Level?

I can teach:

✅ Sequelize Associations (1-1, 1-many, many-many)
✅ Joins & eager loading (`include`)
✅ Pagination
✅ Advanced queries
✅ Transaction handling
✅ Migrations & seeders

Just tell me **what you want next**.
Perfect — I will teach all four topics in **the clearest possible way**, with diagrams, examples, and complete Sequelize code you can actually use.

You will learn:

---

# ✔️ 1. Sequelize Associations

# ✔️ 2. Eager Loading (JOINs using `include`)

# ✔️ 3. Pagination

# ✔️ 4. Advanced Queries (WHERE, LIKE, Operators, Sorting, GROUP BY)

---

# ⚡ BEFORE WE START:

Assume 3 models for our examples:

### **User**

### **Post**

### **Tag** (for many-to-many)

---

# ⛳ 1. Sequelize Associations

Associations define relationships between tables.

---

# 🎯 **A) One-to-One (1–1)**

Example:
**User → Profile**

📌 Relationship: 1 user has 1 profile.

### Diagram:

```
User 1 ----- 1 Profile
```

### Sequelize:

**User.js**

```js
User.hasOne(Profile, {
	foreignKey: "userId",
});
```

**Profile.js**

```js
Profile.belongsTo(User, {
	foreignKey: "userId",
});
```

### SQL Behind:

```sql
ALTER TABLE profiles ADD COLUMN userId INT;
```

---

# 🎯 **B) One-to-Many (1–N)**

Example:
**User → Posts**

📌 Relationship:
**1 user can have many posts**,
but each post belongs to 1 user.

### Diagram:

```
User 1 ----- N Posts
```

### Sequelize:

**User.js**

```js
User.hasMany(Post, {
	foreignKey: "userId",
});
```

**Post.js**

```js
Post.belongsTo(User, {
	foreignKey: "userId",
});
```

### SQL Behind:

```sql
ALTER TABLE posts ADD COLUMN userId INT;
```

---

# 🎯 **C) Many-to-Many (M–N)**

Example:
**Posts ↔ Tags**

📌 A post can have many tags
📌 A tag can belong to many posts

Requires a **junction table** → `PostTags`

### Diagram:

```
Posts N ----- M Tags
       \     /
      PostTags
```

### Sequelize:

```js
Post.belongsToMany(Tag, { through: "PostTags" });
Tag.belongsToMany(Post, { through: "PostTags" });
```

Sequelize creates a join table:

```
PostTags
---------
postId
tagId
```

---

# ⛳ 2. Sequelize JOINs (Eager Loading Using `include`)

You do not manually write JOIN SQL; Sequelize handles it.

---

# 🎯 **A) Get User with Posts (1–N JOIN)**

```js
const users = await User.findAll({
	include: [Post],
});
```

### SQL Behind

```sql
SELECT * FROM users
LEFT JOIN posts ON posts.userId = users.id;
```

---

# 🎯 **B) Get Post with User (reverse)**

```js
const posts = await Post.findAll({
	include: [User],
});
```

---

# 🎯 **C) Many-to-Many Include (Posts ↔ Tags)**

```js
const posts = await Post.findAll({
	include: [Tag],
});
```

---

# 🎯 **D) Nested Include (Post → User + Tags)**

```js
const post = await Post.findAll({
	include: [{ model: User }, { model: Tag }],
});
```

---

# 🎯 **E) Rename Keys (Aliases)**

If you define:

```js
User.hasMany(Post, { as: "articles" });
```

Then you MUST include via:

```js
User.findAll({
	include: [{ model: Post, as: "articles" }],
});
```

---

# ⛳ 3. Pagination (limit, offset)

📌 Formula:

```
page = 1 → offset = 0
page = 2 → offset = limit
page = 3 → offset = limit * 2
```

Example:

```js
const page = req.query.page || 1;
const limit = req.query.limit || 10;

const offset = (page - 1) * limit;

const posts = await Post.findAll({
	limit: Number(limit),
	offset: Number(offset),
});
```

---

### ✔ Response Format for Pagination

```js
res.json({
	page,
	limit,
	results: posts.length,
	data: posts,
});
```

---

# ⛳ 4. Advanced Sequelize Queries

Using Sequelize **operators** from:

```js
const { Op } = require("sequelize");
```

---

# 🎯 A) WHERE Clause

```js
const users = await User.findAll({
	where: {
		age: { [Op.gt]: 18 }, // age > 18
	},
});
```

---

# 🎯 B) LIKE Search

```js
const users = await User.findAll({
	where: {
		name: { [Op.like]: "%john%" },
	},
});
```

---

# 🎯 C) IN Operator

```js
const users = await User.findAll({
	where: {
		id: { [Op.in]: [1, 2, 3] },
	},
});
```

---

# 🎯 D) OR Condition

```js
const users = await User.findAll({
	where: {
		[Op.or]: [{ age: 20 }, { name: "John" }],
	},
});
```

---

# 🎯 E) AND Condition

```js
where: {
  age: { [Op.gt]: 18 },
  status: "active"
}
```

---

# 🎯 F) Sorting (ORDER BY)

```js
const posts = await Post.findAll({
	order: [["createdAt", "DESC"]],
});
```

---

# 🎯 G) GROUP BY + Aggregate

```js
const result = await Post.findAll({
	attributes: [
		"userId",
		[sequelize.fn("COUNT", sequelize.col("id")), "postCount"],
	],
	group: ["userId"],
});
```

Equivalent SQL:

```sql
SELECT userId, COUNT(id) as postCount
FROM posts
GROUP BY userId;
```

---

# 🎉 **FULL Example: User → Posts with Pagination + Search + Sorting**

```js
const users = await User.findAll({
	include: [
		{
			model: Post,
			where: {
				title: { [Op.like]: "%node%" },
			},
			required: false,
		},
	],
	limit: 10,
	offset: 20,
	order: [["createdAt", "DESC"]],
});
```

---

# 📦 Summary Table

| Feature          | Sequelize                        |
| ---------------- | -------------------------------- |
| 1–1              | `hasOne`, `belongsTo`            |
| 1–N              | `hasMany`, `belongsTo`           |
| M–N              | `belongsToMany + through`        |
| JOINs            | `include: []`                    |
| Pagination       | `limit`, `offset`                |
| Advanced Queries | `Op.like`, `Op.gt`, `Op.or`, ... |

---
