# ✅ What is MVC in Express?

**MVC = Model – View – Controller**

| Layer          | Purpose                                                          | Example Files                 |
| -------------- | ---------------------------------------------------------------- | ----------------------------- |
| **Model**      | Handles **data** — DB schema, queries, ORM                       | `User.js`, `Product.js`       |
| **View**       | What the **user sees** — HTML, EJS, React frontend               | `views/home.ejs`, React pages |
| **Controller** | Contains **logic** — handle request, call Model, return response | `userController.js`           |

In Express, you mostly write:

- `controllers` → request logic
- `models` → database logic
- `routes` → express router that connects URL → controller
- `views` → optional (EJS), or separate React/Next.js frontend

---

# 📁 Express MVC Folder Structure (Standard)

```
project/
├── package.json
├── server.js
├── /config
│   └── db.js
├── /models
│   └── User.js
├── /controllers
│   └── userController.js
├── /routes
│   └── userRoutes.js
├── /views   (optional if using EJS)
│   └── home.ejs
└── /middlewares
    └── auth.js
```

---

# 🚀 Complete Working Example (CRUD in MVC)

Let’s build CRUD for a **User** model using **Express + Mongoose**.

---

# 1️⃣ server.js (Entry point)

```js
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

// Connect DB
mongoose
	.connect("mongodb://localhost:27017/mvc_demo")
	.then(() => console.log("DB Connected"))
	.catch((err) => console.log(err));

app.use("/api/users", userRoutes);

app.listen(4000, () => console.log("Server running on port 4000"));
```

---

# 2️⃣ /models/User.js (Model layer)

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

---

# 3️⃣ /controllers/userController.js (Logic layer)

```js
const User = require("../models/User");

// Create
exports.createUser = async (req, res) => {
	try {
		const user = await User.create(req.body);
		res.status(201).json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// Read all
exports.getUsers = async (req, res) => {
	const users = await User.find();
	res.json(users);
};

// Read single
exports.getUser = async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ message: "Not found" });
	res.json(user);
};

// Update
exports.updateUser = async (req, res) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	res.json(user);
};

// Delete
exports.deleteUser = async (req, res) => {
	await User.findByIdAndDelete(req.params.id);
	res.json({ message: "User deleted" });
};
```

---

# 4️⃣ /routes/userRoutes.js (Route layer)

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

# 🟦 Optional — Views (EJS)

If you want server-rendered HTML pages:

### Add view engine in server.js

```js
app.set("view engine", "ejs");
app.set("views", "./views");
```

### /views/home.ejs

```html
<h1>Welcome to MVC Express</h1>
```

### Add route

```js
app.get("/", (req, res) => {
	res.render("home");
});
```

---

# 💡 How MVC Helps You

### Without MVC

All code goes into one file → messy, difficult to maintain.

### With MVC

- **Models** know about data
- **Controllers** know about business logic
- **Routes** know URLs
- **Views** show output

Clear boundaries → scalable + clean code.

---

# 🧱 Add Authentication on top of MVC?

You now have:

- `User.js` → Model
- `authController.js` → Controller
- `authRoutes.js` → Routes
- `authMiddleware.js` → Middleware

Exactly what we built in the previous message.

---
