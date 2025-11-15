# 📘 **Chapter 9: Authentication & Security**

---

# 🔹 **1. Authentication vs Authorization**

## ✅ Authentication = “Who are you?”

User proves identity.

Examples:

- Login with email/password
- OTP verification
- Token verification

## ✅ Authorization = “What are you allowed to do?”

Determines user permissions.

Examples:

- Admin can delete users
- Normal user can only view profile
- Managers can create projects

---

### 🧠 Easy Diagram

```
AUTHENTICATION → Are you really SRIRAM?
AUTHORIZATION   → What can SRIRAM do inside the app?
```

---

❗ Many juniors mix both — in interviews this is a common question.

---

# 🔹 **2. Hashing Passwords (bcrypt)**

Never store passwords in plain text.

Example (bad):

```
password: "123456"
```

If database leaks → user is finished.

So we **hash** passwords:

- One-way function
- Cannot be reversed
- Secure

### bcrypt features:

✔ adds random “salt”
✔ slow to compute → prevents brute force
✔ industry standard

---

## Example: Hashing Password

```js
const bcrypt = require("bcrypt");

const hash = await bcrypt.hash(password, 10);
```

- **password** = user input
- **10** = salt rounds (higher = safer but slower)

---

## Example: Comparing Password

```js
const isMatch = await bcrypt.compare(inputPassword, storedHash);
```

Returns:

- **true** → password correct
- **false** → wrong password

---

# 🔹 **3. JSON Web Tokens (JWT)**

JWT helps in:

- Login
- Maintaining session
- Protecting routes
- Identifying users

---

## ⚙ How JWT Works (simple diagram)

```
1. User logs in → backend checks email + password
2. Backend creates JWT token → gives to user
3. User sends token with every request
4. Server verifies token
5. If valid → allow access
```

---

## ✨ JWT Structure

JWT has 3 parts:

```
header.payload.signature
```

Example:

```
abc.xyz.123
```

---

## Code Example: Generate Token

```js
const jwt = require("jsonwebtoken");

const token = jwt.sign(
	{ id: user.id, email: user.email },
	process.env.JWT_SECRET,
	{ expiresIn: "1d" }
);
```

---

## Verify Token

```js
const data = jwt.verify(token, process.env.JWT_SECRET);
```

---

# 🔹 **4. Middleware for Protected Routes**

Middleware = function that runs **before** your route.

Example: Only logged in users can access `/dashboard`.

---

## Auth Middleware Example

```js
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) return res.status(401).send("No token provided");

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		req.user = user; // attach user data
		next(); // allow route
	} catch {
		return res.status(403).send("Invalid token");
	}
}
```

---

## Usage

```js
app.get("/profile", auth, (req, res) => {
	res.send(`Hello user ${req.user.email}`);
});
```

---

# 🔹 **5. Cookies & Sessions**

JWT works in headers.

But websites also store tokens in **cookies**.

---

## Cookies

- Stored on browser
- Sent automatically with every request
- Can store session ID, JWT, CSRF token

### Secure cookies:

```js
res.cookie("token", token, {
	httpOnly: true,
	secure: true,
	sameSite: "strict",
});
```

---

## Sessions

Used by Express session:

- Server stores session data in memory/Redis
- Client stores only session ID in cookie

More secure than JWT, but less scalable.

---

# 🔹 **6. Environment Variables (dotenv)**

Never hard-code secrets.

❌ Wrong:

```js
const JWT_SECRET = "mysecret123";
```

✔ Correct:

```
JWT_SECRET=supersecret
DB_PASSWORD=abc123
```

Use dotenv:

```js
require("dotenv").config();
```

---

# 🔹 **7. Security Best Practices**

Essential for production.

---

# 🔥 7.1 Helmet

Helmet adds security headers.

Install:

```
npm install helmet
```

Use:

```js
const helmet = require("helmet");
app.use(helmet());
```

Protects against:

- XSS
- Clickjacking
- MIME sniffing

---

# 🔥 7.2 Rate Limiting

Protects server from brute force & DDoS.

```
npm install express-rate-limit
```

Example:

```js
const rateLimit = require("express-rate-limit");

app.use(
	rateLimit({
		windowMs: 1 * 60 * 1000, // 1 minute
		max: 50, // limit
	})
);
```

---

# 🔥 7.3 CORS

Enable specific frontend origins.

```
npm install cors
```

```js
const cors = require("cors");
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);
```

---

# 🔥 7.4 Input Sanitization (Prevent XSS / SQL Injection)

Install validator:

```
npm install express-validator
```

Example:

```js
body("email").isEmail();
```

---

# 🧨 Additional Sanitization:

### XSS Clean

```
npm install xss-clean
```

```js
app.use(xss());
```

### Prevent NoSQL Injection

```
npm install express-mongo-sanitize
```

```js
app.use(mongoSanitize());
```

---

# 🟩 Final Summary (Interview Perfect)

| Topic           | Explanation                |
| --------------- | -------------------------- |
| Authentication  | Verifies identity          |
| Authorization   | Verifies permissions       |
| bcrypt          | Hash passwords safely      |
| JWT             | Token-based login system   |
| Auth Middleware | Protects routes            |
| Cookies         | Stores tokens in browser   |
| Sessions        | Server-stored login state  |
| dotenv          | Protect secrets            |
| Helmet          | Adds security headers      |
| Rate limiting   | Prevents brute force       |
| CORS            | Controls frontend access   |
| Sanitization    | Prevents XSS/SQL injection |

---
