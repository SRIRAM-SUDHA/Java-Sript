# ✔ Logging with `morgan` & `winston`

I’ll give you:

- What they are
- Why we use them
- How they work
- Full examples (Copy–paste ready)
- Best practices

---

# 📘 **1. Request Validation with express-validator**

## ❓ Why Validation Is Important?

Users can send:

❌ Empty fields
❌ Invalid email formats
❌ Very small/large input
❌ SQL/NoSQL injection attempts
❌ Wrong data types

**Validation protects your server & database.**

---

# ✔ What is express-validator?

A middleware library that validates & sanitizes incoming requests.

It helps check:

- Fields existence
- Data types
- Format (email, phone, URL, etc.)
- Min/max length
- Sanitization (escape, trim)

---

# ➤ Install

```
npm install express-validator
```

---

# ✔ Step-by-step Example

### **1️⃣ Create validation rules**

`validators/userValidator.js`

```js
const { body } = require("express-validator");

exports.createUserValidator = [
	body("name")
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ min: 3 })
		.withMessage("Name must be at least 3 characters"),

	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email"),

	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 chars"),
];
```

---

### **2️⃣ Create a middleware to handle validation result**

`middlewares/validation.js`

```js
const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			errors: errors.array(),
		});
	}

	next();
};
```

---

### **3️⃣ Use validators inside routes**

`routes/userRoutes.js`

```js
const express = require("express");
const { createUser } = require("../controllers/userController");
const { createUserValidator } = require("../validators/userValidator");
const { validate } = require("../middlewares/validation");

const router = express.Router();

router.post("/", createUserValidator, validate, createUser);

module.exports = router;
```

---

## ✔ Output Example When Validation Fails

```json
{
	"success": false,
	"errors": [
		{ "msg": "Name is required", "param": "name" },
		{ "msg": "Invalid email", "param": "email" }
	]
}
```

---

## ✔ Sanitization Example

```js
body("name").trim().escape(),
body("email").normalizeEmail(),
```

---

# 🏆 Best Practices for express-validator

- Always write validators separately
- Always use a `validate` middleware
- Run sanitizers first (trim, escape)
- Keep validation & controller separate (MVC principle)

---

---

# 📘 **2. Logging with Morgan or Winston**

Logging helps you understand:

- Every request
- Errors
- App behavior
- Debugging
- Monitoring in production

---

# 🟦 **A) Morgan — HTTP Request Logger**

Morgan logs **only HTTP requests**.
Great for development.

---

## ➤ Install

```
npm install morgan
```

---

## ➤ Usage

### server.js

```js
const morgan = require("morgan");

app.use(morgan("dev"));
```

---

## ✔ Output Example

```
GET /api/users 200 12ms
POST /api/users 201 45ms
```

---

## Morgan Formats:

| Format   | Meaning                                |
| -------- | -------------------------------------- |
| dev      | colorful output (best for development) |
| combined | Apache format (prod)                   |
| tiny     | minimal logs                           |

Example:

```js
app.use(morgan("combined"));
```

---

# 🟩 **B) Winston — Advanced Logger**

Winston is used for **real production logging**.

Features:

✔ Custom log levels
✔ Save logs in files
✔ Timestamping
✔ JSON logs
✔ Error logging
✔ Rotate logs

---

## ➤ Install

```
npm install winston
```

---

## ✔ Example Winston Logger

`utils/logger.js`

```js
const { createLogger, transports, format } = require("winston");

const logger = createLogger({
	level: "info",
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.json()
	),

	transports: [
		new transports.Console(),
		new transports.File({ filename: "logs/error.log", level: "error" }),
		new transports.File({ filename: "logs/app.log" }),
	],
});

module.exports = logger;
```

---

### **Use inside routes or controllers**

```js
const logger = require("../utils/logger");

exports.createUser = async (req, res) => {
	try {
		logger.info("Creating new user");
		// ...
	} catch (err) {
		logger.error(err.message);
	}
};
```

---

# 🧱 Comparison: Morgan vs Winston

| Feature               | Morgan | Winston                   |
| --------------------- | ------ | ------------------------- |
| For dev?              | ✔ Yes  | ✔ Yes                     |
| For production?       | ❌ No  | ✔ Yes                     |
| Logs HTTP requests    | ✔ Yes  | ❌ No (but can customize) |
| Logs app-level errors | ❌ No  | ✔ Yes                     |
| Writes to files       | ❌ No  | ✔ Yes                     |
| JSON logs             | ❌ No  | ✔ Yes                     |
| Log severity levels   | ❌ No  | ✔ Yes                     |

---

# 🧠 Simple Architecture with Both

```
app.use(morgan("dev"));  // tracks every API request
app.use(logger);         // tracks system-level events/errors
```

---

# 🎯 Summary for Interview

### **✔ express-validator**

- Validates incoming request body, params, query
- Prevents invalid and malicious data
- Uses chainable validation methods
- Sends readable error responses

### **✔ Morgan**

- HTTP request logger
- Useful in development
- Not for production

### **✔ Winston**

- Advanced logging
- File logging
- Error logging
- Perfect for production

---

Here is **full, clean, production-style validation using `express-validator`** inside **MVC architecture**.

You will get:
✅ Request body validation
✅ Sanitization
✅ Custom error messages
✅ Reusable validation middleware
✅ Centralized error formatting

---

# 📘 express-validator in MVC (Complete Setup)

We will validate the following example endpoint:

### **POST /products**

Body:

```json
{
	"name": "iPhone",
	"price": 999,
	"category": "mobile"
}
```

---

# 🗂 Folder Structure

```
project/
  ├─ controllers/
  │    └─ productController.js
  ├─ routes/
  │    └─ productRoutes.js
  ├─ validators/
  │    └─ productValidator.js
  ├─ middleware/
  │    ├─ validateRequest.js
  │    └─ errorMiddleware.js
  ├─ models/
  │    └─ productModel.js
  ├─ utils/
  │    └─ AppError.js
  ├─ app.js
  └─ server.js
```

---

# ⭐ Step 1 — Create Validator for Product

### `validators/productValidator.js`

```js
const { body } = require("express-validator");

exports.createProductValidator = [
	body("name")
		.notEmpty()
		.withMessage("Name is required")
		.isString()
		.withMessage("Name must be a string")
		.trim()
		.escape(),

	body("price")
		.notEmpty()
		.withMessage("Price is required")
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),

	body("category")
		.optional()
		.isString()
		.withMessage("Category must be a string")
		.trim()
		.escape(),
];
```

✔ Validates
✔ Sanitizes
✔ Converts price to number

---

# ⭐ Step 2 — Validation Result Handler

### `middleware/validateRequest.js`

```js
const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const messages = errors.array().map((err) => err.msg);
		return next(new AppError(messages.join(", "), 400));
	}

	next();
};
```

✔ Centralized
✔ Returns clean error messages
✔ Uses our global error handler

---

# ⭐ Step 3 — Controller

### `controllers/productController.js`

```js
const Product = require("../models/productModel");
const catchAsync = require("../middleware/catchAsync");

exports.createProduct = catchAsync(async (req, res) => {
	const product = await Product.create(req.body);

	res.status(201).json({
		status: "success",
		data: { product },
	});
});
```

---

# ⭐ Step 4 — Route with Validation

### `routes/productRoutes.js`

```js
const express = require("express");
const { createProduct } = require("../controllers/productController");
const { createProductValidator } = require("../validators/productValidator");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", createProductValidator, validateRequest, createProduct);

module.exports = router;
```

✔ Validation runs
✔ Then validationResult
✔ Then controller

---

# ⭐ Step 5 — Test It

### ✔ Valid Request

```json
POST /products
{
  "name": "Laptop",
  "price": 1500
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "product": { ... }
  }
}
```

---

### ❌ Invalid Request

```
POST /products
{
  "name": "",
  "price": -20
}
```

Response:

```json
{
	"status": "fail",
	"message": "Name is required, Price must be a positive number"
}
```

---

# ⭐ Bonus: Update Validation

If you want validation for updating:

### `updateProductValidator`

```js
exports.updateProductValidator = [
	body("name")
		.optional()
		.isString()
		.withMessage("Name must be a string")
		.trim()
		.escape(),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),

	body("category")
		.optional()
		.isString()
		.withMessage("Category must be a string")
		.trim()
		.escape(),
];
```

---

# ⭐ Bonus 2 — Query Validation

### `/products?limit=abc`

Use:

```js
const { query } = require("express-validator");

exports.paginationValidator = [
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a number"),
	query("limit")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Limit must be a number"),
];
```

---
