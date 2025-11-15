Nice — below is a **complete, ready-to-run authentication system** (signup/login/logout + access & refresh tokens + protected routes + role-based guard + hashed passwords) built with **Node.js + Express + MongoDB (Mongoose)**.
I include all source files, explanations, how to run, and common Postman/cURL examples so you can show this to your mentor or run it locally.

> This implementation uses:

- `express` — server
- `mongoose` — MongoDB ORM
- `bcrypt` — hashing passwords
- `jsonwebtoken` — JWT access & refresh tokens
- `cookie-parser` — read cookies (refresh token stored as HttpOnly cookie)
- `dotenv` — environment variables
- `helmet`, `cors`, `express-rate-limit` — basic security

---

# Project structure

```
auth-system/
├─ package.json
├─ .env.example
├─ server.js
├─ config/
│  └─ db.js
├─ models/
│  └─ User.js
├─ controllers/
│  └─ authController.js
├─ middlewares/
│  ├─ auth.js
│  └─ rateLimiter.js
├─ routes/
│  └─ authRoutes.js
└─ utils/
   └─ tokens.js
```

---

# 1) package.json (install these deps)

```json
{
	"name": "auth-system",
	"version": "1.0.0",
	"main": "server.js",
	"scripts": {
		"start": "node server.js",
		"dev": "nodemon server.js"
	},
	"dependencies": {
		"bcrypt": "^5.1.0",
		"cookie-parser": "^1.4.7",
		"cors": "^2.8.5",
		"dotenv": "^16.0.0",
		"express": "^4.18.2",
		"express-rate-limit": "^6.7.0",
		"helmet": "^6.0.0",
		"jsonwebtoken": "^9.0.0",
		"mongoose": "^7.0.0"
	},
	"devDependencies": {
		"nodemon": "^3.0.1"
	}
}
```

Install:

```bash
npm install
# or
npm i express mongoose bcrypt jsonwebtoken cookie-parser dotenv helmet cors express-rate-limit
npm i -D nodemon
```

---

# 2) .env.example

Create `.env` from this and fill values:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/auth_demo
JWT_ACCESS_SECRET=replace_this_with_a_long_random_secret_access
JWT_REFRESH_SECRET=replace_this_with_a_long_random_secret_refresh
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
COOKIE_SECURE=false   # true in production (HTTPS); false for localhost testing
CLIENT_URL=http://localhost:3000
```

> Use long random secrets in production. `COOKIE_SECURE` should be `true` when serving over HTTPS.

---

# 3) config/db.js — Mongo connection

```js
// config/db.js
const mongoose = require("mongoose");

async function connectDB(uri) {
	try {
		await mongoose.connect(uri, { dbName: "auth_demo" });
		console.log("MongoDB connected");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
}

module.exports = connectDB;
```

---

# 4) models/User.js — Mongoose user model

```js
// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, maxlength: 100 },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		role: { type: String, enum: ["user", "admin"], default: "user" },
		// store refresh tokens identifiers or other metadata if needed
	},
	{ timestamps: true }
);

// Hash password before save (only if modified)
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const saltRounds = 10;
	this.password = await bcrypt.hash(this.password, saltRounds);
	next();
});

// Instance method to compare password
userSchema.methods.comparePassword = function (plain) {
	return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

---

# 5) utils/tokens.js — generate & verify tokens

```js
// utils/tokens.js
const jwt = require("jsonwebtoken");

function createAccessToken(payload) {
	return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
	});
}

function createRefreshToken(payload) {
	return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
	});
}

function verifyAccessToken(token) {
	return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
	return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
	createAccessToken,
	createRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
};
```

---

# 6) controllers/authController.js — full auth flows

```js
// controllers/authController.js
const User = require("../models/User");
const {
	createAccessToken,
	createRefreshToken,
	verifyRefreshToken,
} = require("../utils/tokens");

// Helper to set refresh token cookie
function sendRefreshToken(res, token) {
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.COOKIE_SECURE === "true",
		sameSite: "lax",
		path: "/api/auth/refresh", // cookie only sent to refresh endpoint (optional)
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in ms
	};
	res.cookie("jid", token, cookieOptions);
}

exports.register = async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;
		if (!name || !email || !password)
			return res
				.status(400)
				.json({ message: "Name, email and password are required" });

		const existing = await User.findOne({ email });
		if (existing)
			return res.status(409).json({ message: "Email already registered" });

		const user = await User.create({ name, email, password, role });
		const accessToken = createAccessToken({ id: user._id, role: user.role });
		const refreshToken = createRefreshToken({ id: user._id, role: user.role });

		sendRefreshToken(res, refreshToken);
		res.status(201).json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			accessToken,
		});
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ message: "Email and password required" });

		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: "Invalid credentials" });

		const match = await user.comparePassword(password);
		if (!match) return res.status(401).json({ message: "Invalid credentials" });

		const accessToken = createAccessToken({ id: user._id, role: user.role });
		const refreshToken = createRefreshToken({ id: user._id, role: user.role });

		sendRefreshToken(res, refreshToken);
		res.json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			accessToken,
		});
	} catch (err) {
		next(err);
	}
};

// Refresh endpoint: read refresh token from cookie, verify, issue new access token
exports.refresh = async (req, res, next) => {
	try {
		const token = req.cookies.jid;
		if (!token) return res.status(401).json({ message: "No refresh token" });

		let payload;
		try {
			payload = verifyRefreshToken(token);
		} catch (err) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		// Optionally validate user still exists, not revoked, etc.
		const user = await User.findById(payload.id);
		if (!user) return res.status(401).json({ message: "User not found" });

		const accessToken = createAccessToken({ id: user._id, role: user.role });
		// Optionally rotate refresh token:
		const refreshToken = createRefreshToken({ id: user._id, role: user.role });
		sendRefreshToken(res, refreshToken);

		res.json({ accessToken });
	} catch (err) {
		next(err);
	}
};

// Logout: clear cookie
exports.logout = async (req, res, next) => {
	res.clearCookie("jid", { path: "/api/auth/refresh" });
	res.json({ message: "Logged out" });
};
```

Notes:

- Refresh token cookie name is `jid` (just a name). Cookie is HttpOnly so inaccessible from JS.
- You can store refresh tokens server-side (DB/Redis) for revocation/rotation; above is stateless (JWT only).

---

# 7) middlewares/auth.js — protect routes & role guard

```js
// middlewares/auth.js
const { verifyAccessToken } = require("../utils/tokens");
const User = require("../models/User");

exports.protect = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer "))
			return res.status(401).json({ message: "No token provided" });

		const token = authHeader.split(" ")[1];
		const payload = verifyAccessToken(token);
		req.user = { id: payload.id, role: payload.role };
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};

// role-based access (e.g., admin only)
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user)
			return res.status(401).json({ message: "Not authenticated" });
		if (!roles.includes(req.user.role))
			return res.status(403).json({ message: "Forbidden" });
		next();
	};
};
```

---

# 8) middlewares/rateLimiter.js — basic rate limiting

```js
// middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 60, // limit each IP to 60 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = limiter;
```

---

# 9) routes/authRoutes.js

```js
// routes/authRoutes.js
const express = require("express");
const {
	register,
	login,
	refresh,
	logout,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh); // refresh token endpoint (cookie-based)
router.post("/logout", logout);

module.exports = router;
```

---

# 10) server.js — entry point

```js
// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { protect, authorize } = require("./middlewares/auth");
const limiter = require("./middlewares/rateLimiter");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI);

// Global middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// CORS: allow your frontend origin
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	})
);

// Routes
app.use("/api/auth", authRoutes);

// Example protected route
app.get("/api/profile", protect, async (req, res) => {
	// req.user is set by protect middleware
	res.json({ message: "Protected data", user: req.user });
});

// example admin-only route
app.get("/api/admin", protect, authorize("admin"), (req, res) => {
	res.json({ secret: "admin stuff" });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

# How it works — quick flow

- **Register** (`POST /api/auth/register`): create user, hash password (pre-save), return `accessToken` in response and `refreshToken` in HttpOnly cookie.
- **Login** (`POST /api/auth/login`): validate credentials, return `accessToken` + set refresh token cookie.
- **Refresh** (`POST /api/auth/refresh`): client calls this with cookie automatically (browser sends cookie) -> server verifies refresh token and returns new access token (and optionally rotates refresh token).
- **Protect routes**: the client attaches `Authorization: Bearer <accessToken>` header to protected endpoints.
- **Logout**: clear the refresh cookie.

---

# Postman / curl examples

Assume server runs at `http://localhost:4000`.

### Register (Postman: POST /api/auth/register, Body JSON)

```json
{
	"name": "Sriram",
	"email": "sriram@example.com",
	"password": "secret123"
}
```

Response: JSON with `accessToken`; cookie `jid` set (HttpOnly).

### Login

POST `/api/auth/login` with body `{ "email":"sriram@example.com","password":"secret123" }`
Response: `accessToken` JSON; cookie set.

### Access protected route

Header:

```
Authorization: Bearer <accessToken>
```

GET `/api/profile` — returns protected data.

### Refresh (automatic with cookie)

POST `/api/auth/refresh` — no body required (cookie sent automatically by browser). Returns new `accessToken`. In Postman, enable cookies and send cookie `jid`.

### Logout

POST `/api/auth/logout` — clears cookie.

### cURL example (login -> call protected)

1. Login and save access token (bash):

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"sriram@example.com","password":"secret123"}' | jq -r '.accessToken')
```

2. Use token:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/profile
```

(If you want to test cookie-based refresh with curl, it's more involved — Postman or browser is easier.)

---

# Security considerations & improvements (production)

1. **HTTPS + `secure` cookie**: set `COOKIE_SECURE=true` and use HTTPS.
2. **Refresh token storage**: store refresh tokens (or their hashes) server-side (DB/Redis) so you can revoke them when user logs out or on breach.
3. **Token rotation**: issue a new refresh token on each refresh and invalidate old one (prevents reuse).
4. **Use short-lived access tokens** (15m) + refresh tokens (7d).
5. **Rate limit** auth endpoints** (already included)** to protect brute-force.
6. **Account lockout** or progressive delays after multiple failed logins.
7. **Email verification** before giving full access.
8. **2FA (MFA)** for higher security.
9. **Whitelist refresh token cookie path** & set `sameSite` appropriately.
10. **Store JWT secrets in a secure vault** (not plain .env in real production).

---

# Common interview Q & short answers

- **Q: Why store refresh token in cookie?**
  A: HttpOnly cookie is inaccessible to JS, protecting from XSS stealing. Access token is stored client-side (memory) and attached to Authorization header.

- **Q: Why both access & refresh tokens?**
  A: Access tokens are short-lived for safety; refresh tokens are longer-lived and used to get new access tokens without re-login.

- **Q: Should the server store refresh tokens?**
  A: For revocation and more secure control, yes — store them (or their hashed versions) and verify on refresh.

- **Q: Why hash passwords with bcrypt?**
  A: One-way salted hashing prevents attackers from recovering plaintext even if DB leaks; salt + cost factor increases brute-force difficulty.

---

# Next steps I can provide (pick one)

- Provide a **complete runnable repo zip** or a single-file version for quick testing.
- Add **refresh-token DB storage + revocation logic** (best practice).
- Add **email verification & password reset** flows.
- Demonstrate **frontend example** (React) showing login, storing tokens in memory, and refresh logic.

Which would you like next?
