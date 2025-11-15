## 🌱 **Chapter 4: Modules & NPM (Node Package Manager)**

---

### 🧩 1. What are Modules?

**Modules** are reusable blocks of code — like functions, variables, or classes — that are kept in separate files.
They help keep your code **organized, reusable, and maintainable**.

Think of modules as _Lego blocks_ — you can build a large application by connecting small, focused modules.

---

### 📦 2. Types of Modules in Node.js

There are **3 main types**:

| Type                    | Description         | Example                      |
| ----------------------- | ------------------- | ---------------------------- |
| **Core Modules**        | Built into Node.js  | `fs`, `path`, `http`, `os`   |
| **Local Modules**       | You create them     | `./math.js`, `./user.js`     |
| **Third-party Modules** | Installed using NPM | `express`, `axios`, `lodash` |

---

### ⚙️ 3. How to Create and Use Local Modules

Let’s say you have two files:

#### 🧮 `math.js`

```js
// math.js
function add(a, b) {
	return a + b;
}

function sub(a, b) {
	return a - b;
}

// Exporting functions
module.exports = { add, sub };
```

#### 🧾 `app.js`

```js
// app.js
const math = require("./math");

console.log(math.add(5, 3)); // 8
console.log(math.sub(5, 3)); // 2
```

#### 💡 Explanation:

- `require()` → imports a module.
- `module.exports` → exports functions, objects, or variables.
- `./` → means the module is in the same directory.

---

### 🏗️ 4. ES6 Module Syntax (Modern Way)

Node.js now supports **ES Modules** (like browsers).

#### 🧮 `math.mjs`

```js
export function add(a, b) {
	return a + b;
}

export function sub(a, b) {
	return a - b;
}
```

#### 🧾 `app.mjs`

```js
import { add, sub } from "./math.mjs";

console.log(add(5, 3));
console.log(sub(5, 3));
```

#### ⚠️ Note:

- Use `.mjs` extension **or** add `"type": "module"` in your `package.json` to enable ES module syntax.

---

### 📦 5. What is NPM?

**NPM (Node Package Manager)** is a tool used to:

- Install and manage third-party packages.
- Manage dependencies via `package.json`.
- Publish and share your own packages.

It comes **automatically with Node.js**.

---

### 🧰 6. Common NPM Commands

| Command                            | Description                             |
| ---------------------------------- | --------------------------------------- |
| `npm init`                         | Creates a new `package.json` file       |
| `npm install <package>`            | Installs a package                      |
| `npm install <package> --save-dev` | Installs a dev-only dependency          |
| `npm uninstall <package>`          | Removes a package                       |
| `npm list`                         | Shows installed packages                |
| `npm outdated`                     | Lists outdated packages                 |
| `npm update`                       | Updates all packages                    |
| `npm run <script>`                 | Runs a script defined in `package.json` |

---

### 📂 7. `package.json`

This file holds **project metadata** and **dependencies**.

Example:

```json
{
	"name": "my-app",
	"version": "1.0.0",
	"description": "My first Node project",
	"main": "index.js",
	"scripts": {
		"start": "node app.js"
	},
	"dependencies": {
		"express": "^4.18.2"
	},
	"devDependencies": {
		"nodemon": "^3.0.1"
	}
}
```

---

### 🔁 8. Installing Packages Locally vs Globally

| Installation Type | Command                  | Used For                                            |
| ----------------- | ------------------------ | --------------------------------------------------- |
| **Local**         | `npm install express`    | Installed in the project folder (in `node_modules`) |
| **Global**        | `npm install -g nodemon` | Installed system-wide for command-line use          |

---

### 🧩 9. Using a Third-party Module

Example with **Express.js**:

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
	res.send("Hello from Express!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

Then run:

```bash
npm install express
node app.js
```

---

### 🧹 10. Ignoring `node_modules`

Never upload your `node_modules` folder to GitHub.

Create a file `.gitignore`:

```
node_modules/
.env
```

Later, others can restore dependencies by:

```bash
npm install
```

---

### ⚡ Summary

| Concept                     | Purpose                              |
| --------------------------- | ------------------------------------ |
| **Module**                  | Reusable piece of code               |
| **require / import**        | Import modules                       |
| **module.exports / export** | Share modules                        |
| **NPM**                     | Manages third-party packages         |
| **package.json**            | Stores project info and dependencies |

---

# ⭐ **4.5 — Global vs Local Packages**

In Node.js, npm packages can be installed in **two ways**:

### **1️⃣ Local installation (most common)**

### **2️⃣ Global installation (system-wide commands)**

Let’s break them down clearly.

---

# 🟩 **1️⃣ Local Packages (Most Common)**

### 📌 **Installed inside your project folder**

```
my-project/
  node_modules/
  package.json
  package-lock.json
```

### 📌 Install command:

```bash
npm install packageName
```

### 📌 They stay inside **node_modules** and are only available **inside that project**.

### Example:

```bash
npm install express
npm install nodemon --save-dev
```

### ✔️ Use case:

- Express
- Mongoose
- JSONWebToken
- Bcrypt
- Lodash

### ✔️ Why local?

- Every project gets its own version → fewer conflicts
- Works perfectly in deployment (cloud, servers)

---

# 🟦 **2️⃣ Global Packages (Installed system-wide)**

### 📌 Installed on your computer (not inside project)

They go to a location like:

```
/usr/local/lib/node_modules
```

### 📌 Install command:

```bash
npm install -g packageName
```

### 📌 Global packages provide **command-line tools** available from **any folder**.

### Example tools installed globally:

```
npm install -g nodemon
npm install -g http-server
npm install -g pm2
npm install -g typescript
```

### ✔️ Use case:

- Tools you run from the terminal
- CLIs (Command Line Interfaces)
- Build tools
- Developer tools

**They are NOT imported inside your JS file.**

---

# 🟨 Main Difference Table

| Feature                      | Local Package                          | Global Package               |
| ---------------------------- | -------------------------------------- | ---------------------------- |
| Location                     | node_modules inside project            | system-wide directory        |
| Usage                        | imported using `require()` or `import` | used as CLI tool in terminal |
| Available in other projects? | ❌ No                                  | ✔️ Yes                       |
| Installed by default?        | ✔️ Yes (most packages)                 | ❌ Only tools                |
| Example                      | express, dotenv                        | nodemon, typescript, pm2     |

---

# 🟣 Example Scenario

### You want to **run Express server** → install **locally**:

```bash
npm install express
```

### You want to **restart server automatically while coding** → install **globally OR locally**:

```bash
npm install -g nodemon
# or
npm install nodemon --save-dev
```

---

# ⭐ **4.6 — Using NPX**

`npx` is a tool that comes with npm (version 5.2+).
Its main purpose is:

### 👉 **Run a package WITHOUT installing it globally**

### 👉 **Run a locally installed package easily**

### 👉 **Execute package binaries (CLI commands)**

---

# 🟩 **1️⃣ Run a package without installing globally**

Example: Create React App

Without npx:

```bash
npm install -g create-react-app
create-react-app myApp
```

With npx:

```bash
npx create-react-app myApp
```

✔️ No global install
✔️ No version conflicts

---

# 🟦 **2️⃣ Run local node_modules/.bin commands**

Example: locally installed nodemon:

```bash
npm install nodemon --save-dev
```

To run nodemon:

Without npx:

```bash
./node_modules/.bin/nodemon server.js
```

With npx:

```bash
npx nodemon server.js
```

Much easier!

---

# 🟨 **3️⃣ Run any GitHub repo package**

Example:

```bash
npx github-username/repo-name
```

---

# 🟫 Why NPX is useful?

| Problem                             | Solution with npx              |
| ----------------------------------- | ------------------------------ |
| You don’t want global installs      | npx runs it without installing |
| Tools update constantly             | npx uses latest version        |
| Local package requires complex path | npx auto-resolves              |

---

---

# ⭐ **4.7 — Semantic Versioning (SemVer)**

NPM uses **Semantic Versioning**:

```
MAJOR.MINOR.PATCH
```

Example:

```
"express": "4.18.2"
```

Meaning:

- **4** → Major version (breaking changes)
- **18** → Minor version (new features, no breaking changes)
- **2** → Patch version (bug fixes)

---

# 📌 **Symbols you see in package.json (`^`, `~`)**

## 1️⃣ **Caret (^)**

```
"express": "^4.18.2"
```

✔️ Updates **MINOR** and **PATCH**
❌ Does NOT update MAJOR

Example:

- Allowed: 4.19.0, 4.20.5
- Not allowed: 5.0.0

---

## 2️⃣ **Tilde (~)**

```
"express": "~4.18.2"
```

✔️ Updates **PATCH only**
❌ Does NOT update MINOR or MAJOR

Example:

- Allowed: 4.18.3
- Not allowed: 4.19.0

---

## 3️⃣ **Exact version (no symbol)**

```
"express": "4.18.2"
```

✔️ No updates
✔️ Safe in production for stability
❌ No improvements unless manual upgrade

---

## ⭐ Recommended strategy

| Environment | Recommendation              |
| ----------- | --------------------------- |
| Development | Use `^` (get minor updates) |
| Production  | Use exact version or `~`    |

---

---

# ⭐ **4.8 — Useful NPM Packages (Backend Essentials)**

Here are the most commonly used Node.js packages with purpose explained simply:

---

# 🟩 **1. express**

✔️ Web server framework
✔️ Used for APIs and backend routes

```bash
npm install express
```

---

# 🟦 **2. nodemon**

✔️ Auto-restart server on file changes
✔️ Dev tool only

```bash
npm install nodemon --save-dev
```

---

# 🟨 **3. dotenv**

✔️ Load environment variables from `.env`

```bash
npm install dotenv
```

Example:

```js
require("dotenv").config();
```

---

# 🟧 **4. cors**

✔️ Allows frontend (React) to talk to backend (Node)

```bash
npm install cors
```

---

# 🟥 **5. chalk**

✔️ Colors your console text (logging)

```bash
npm install chalk
```

---

# 🟫 **6. bcrypt**

✔️ Password hashing (secure login systems)

```bash
npm install bcrypt
```

---

# 🟪 **7. jsonwebtoken (jwt)**

✔️ User authentication tokens
✔️ Used for login + authorization

```bash
npm install jsonwebtoken
```

---

# 🟦 **8. mongoose**

✔️ ORM for MongoDB
✔️ For database schemas + queries

```bash
npm install mongoose
```

---

# 🟨 **9. multer**

✔️ File uploads (images, PDFs etc.)

```bash
npm install multer
```

---

# 🟩 **10. axios**

✔️ Make API calls (usually frontend but can use in backend too)

```bash
npm install axios
```

# ⭐ **1. CommonJS vs ES Modules**

Node.js supports **two module systems**:

# 🔶 **A. CommonJS (CJS)**

👉 **Default module system in Node.js (older)**
👉 Uses `require` and `module.exports`

### Example:

### **export.js**

```js
function greet(name) {
	return `Hello ${name}`;
}

module.exports = greet;
```

### **importing in main.js**

```js
const greet = require("./export");

console.log(greet("Sriram"));
```

✔ Works by default
✔ Synchronous (blocks the thread)
✔ Used in most older Node projects

---

# 🔷 **B. ES Modules (ESM)**

👉 Modern JavaScript module system
👉 Uses `import` and `export`

### Example:

### **export.js**

```js
export function greet(name) {
	return `Hello ${name}`;
}
```

### **main.js**

```js
import { greet } from "./export.js";

console.log(greet("Sriram"));
```

✔ Asynchronous loading
✔ Cleaner, modern syntax
✔ Used in React, Vue, Next.js, modern Node apps

---

# 🔵 **How Node decides which module system (CJS or ESM)**

Node uses 3 rules:

---

### **1. If package.json has:**

```json
{
	"type": "module"
}
```

➡ Node treats **.js files as ES Modules**

---

### **2. If file extension is `.mjs`**

➡ Always treated as **ESM**

---

### **3. If package.json has no "type" field**

➡ `.js` files are treated as **CommonJS** by default

---

# 🔻 **How bundlers treat them**

Bundlers like **Webpack, Vite, Parcel**:

- Prefer **ES Modules**
- They convert ESM → browser-compatible code
- They also support CJS but recommend ESM

Modern frontend = **always ES Modules**

---

---

# ⭐ **2. Creating Your Own Modules**

In Node, a module = any file.

You can export:

### ✔ Functions

### ✔ Objects

### ✔ Classes

### ✔ Variables

---

# 🔶 **A. Using CommonJS**

### Example:

**math.js**

```js
function add(a, b) {
	return a + b;
}

module.exports = {
	add,
};
```

**main.js**

```js
const math = require("./math");

console.log(math.add(2, 3));
```

---

# 🔷 **B. Using ES Modules**

**math.js**

```js
export function add(a, b) {
	return a + b;
}
```

**main.js**

```js
import { add } from "./math.js";

console.log(add(2, 3));
```

---

# 🟪 Multiple Export Styles

### 1️⃣ Named exports

```js
export function add() {}
export function subtract() {}
```

### 2️⃣ Export at bottom

```js
function add() {}
function subtract() {}
export { add, subtract };
```

### 3️⃣ Default export (only one allowed)

```js
export default function () {
	console.log("Hello World");
}
```

---

---

# ⭐ **3. Using import/export in Node**

Node supports ESM in 3 ways:

---

# 🔶 **1. Using `"type": "module"`**

In **package.json**

```json
{
	"type": "module"
}
```

Now `.js` behaves as ESM.

---

# 🔷 **2. Using `.mjs` extension**

If file name is `file.mjs`
→ Node treats it as ESM even without `"type": "module"`

---

# 🔸 **3. Using `"module"` field (rare)**

Some bundlers use:

```json
{
	"module": "dist/index.esm.js"
}
```

But this is **not used by Node directly** — bundlers use it to pick ESM version.

---

# 🔹 **4. Using dynamic import()**

Works inside CommonJS or ESM.

```js
const module = await import("./file.js");
console.log(module.default);
```

Useful for:

- Lazy loading
- Conditional imports
- Performance optimization

---

---

# ⭐ **4. package.json Explained (Basics)**

This is the **heart of every Node project**.

It stores:

### ✔ Project info

### ✔ Version

### ✔ Dependencies

### ✔ Scripts

### ✔ Entry file

---

# 🔶 Example package.json

```json
{
	"name": "my-app",
	"version": "1.0.0",
	"type": "module",
	"scripts": {
		"start": "node index.js",
		"dev": "nodemon index.js"
	},
	"dependencies": {
		"express": "^4.18.2"
	},
	"devDependencies": {
		"nodemon": "^3.0.0"
	}
}
```

---

# 🔵 Important fields

### **1. `name`**

Name of your project

### **2. `version`**

Project version (SemVer)

### **3. `scripts`**

Run commands:

```bash
npm run start
npm run dev
```

### **4. `dependencies`**

Packages required for production

### **5. `devDependencies`**

Packages needed only during development
(e.g., nodemon)

### **6. `type`**

CJS or ESM

### **7. `main` or `module` fields**

Entry point file

---

---

# ⭐ **5. Installing & Managing Dependencies**

There are 3 kinds of installs:

---

# 🔶 **1. Normal install**

```bash
npm install express
```

Adds package to:

- node_modules/
- dependencies in package.json
- package-lock.json

---

# 🔷 **2. Dev install**

```bash
npm install nodemon --save-dev
```

Adds package to:

- node_modules/
- **devDependencies**
  (Used only for development)

---

# 🔸 **3. Global install**

```bash
npm install -g nodemon
```

Installs system-wide CLI tools.

---

# 🔹 What's inside node_modules?

- All downloaded packages
- Sub-dependencies
- Internal files

---

# 🔺 package-lock.json?

Locks all versions exactly
Ensures consistent installation on:

- Your machine
- Other developers
- Production server

---
