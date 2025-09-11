Got it 👍 Let’s go step by step and write **clear documentation** on **CommonJS** and **ES6 Modules (ECMAScript Modules)**. I’ll cover:

- What they are
- Syntax (named + default exports/imports)
- How to use them
- File extensions
- Pitfalls and gotchas

---

# 📦 JavaScript Modules

Modules let you split your code into separate files and **reuse/import** them.

There are **two main module systems** in JavaScript:

1. **CommonJS (CJS)** → used in Node.js (default until recently)
2. **ES Modules (ESM)** → official JavaScript standard (browser + Node.js with `"type": "module"`)

---

## 1. CommonJS (CJS)

- Default module system in **Node.js** before ES6 modules.
- Uses `require()` to import and `module.exports` / `exports` to export.
- **Synchronous** loading.

### 🔹 Named Exports (CJS)

```js
// math.js
function add(a, b) {
	return a + b;
}
function subtract(a, b) {
	return a - b;
}

// Export multiple functions
module.exports = { add, subtract };

// Alternatively:
exports.add = add;
exports.subtract = subtract;
```

```js
// app.js
const math = require("./math"); // Import whole object
console.log(math.add(2, 3));

const { subtract } = require("./math"); // Destructure for direct use
console.log(subtract(5, 2));
```

### 🔹 Default Export (CJS)

```js
// logger.js
function log(message) {
	console.log("LOG:", message);
}
module.exports = log; // Default export
```

```js
// app.js
const log = require("./logger"); // No {}
log("Hello CommonJS!");
```

### 🔹 File Extensions

- `.js` (default)
- `.cjs` (forces CommonJS in Node.js when `"type": "module"` is set in package.json)

### ⚠️ Pitfalls of CommonJS

- **Not tree-shakable** → unused exports still get bundled.
- **Synchronous** → not ideal for browsers.
- Can’t directly use `import/export` syntax.
- Mixing with ESM can be tricky.

---

## 2. ES6 Modules (ESM)

- Official standard for JavaScript (introduced in ES6).
- Uses `import` and `export`.
- **Asynchronous** and supports **tree-shaking**.

### 🔹 Named Exports (ESM)

```js
// math.mjs
export function add(a, b) {
	return a + b;
}

export function subtract(a, b) {
	return a - b;
}
```

```js
// app.mjs
import { add, subtract } from "./math.mjs";

console.log(add(2, 3));
console.log(subtract(5, 2));
```

- You can also import everything:

```js
import * as math from "./math.mjs";
console.log(math.add(10, 20));
```

### 🔹 Default Export (ESM)

```js
// logger.mjs
export default function log(message) {
	console.log("LOG:", message);
}
```

```js
// app.mjs
import log from "./logger.mjs"; // No {}
log("Hello ES Modules!");
```

### 🔹 Mixing Default + Named Exports

```js
// utils.mjs
export default function greet(name) {
	return `Hello, ${name}`;
}

export function bye(name) {
	return `Bye, ${name}`;
}
```

```js
// app.mjs
import greet, { bye } from "./utils.mjs";

console.log(greet("Alice"));
console.log(bye("Alice"));
```

### 🔹 File Extensions

- `.js` → works if `"type": "module"` is in `package.json`
- `.mjs` → forces ESM
- `.cjs` → forces CommonJS

### ⚠️ Pitfalls of ESM

- Must run in an environment that **supports ESM**:

  - Browsers (works natively with `<script type="module">`)
  - Node.js (need `"type": "module"` in `package.json`, or use `.mjs`)

- `__dirname` and `__filename` are **not available** by default in ESM.
- Can’t use `require()` inside ESM files.
- Imports are **always static** (must be at top-level, except for `import()`).

---

## 3. Differences at a Glance

| Feature         | CommonJS (CJS)               | ES Modules (ESM)                      |
| --------------- | ---------------------------- | ------------------------------------- |
| Import syntax   | `require()`                  | `import`                              |
| Export syntax   | `module.exports` / `exports` | `export` / `export default`           |
| Loading         | Synchronous                  | Asynchronous                          |
| Tree-shaking    | ❌ No                        | ✅ Yes                                |
| Default export  | `module.exports = ...`       | `export default ...`                  |
| File extensions | `.js`, `.cjs`                | `.js`, `.mjs`                         |
| In Node.js      | Default before ES6           | Requires `"type": "module"` or `.mjs` |
| In Browsers     | ❌ Not supported             | ✅ Supported                          |

---

✅ **Rule of Thumb**:

- Use **CommonJS** only if you’re working in older Node.js projects.
- Use **ESM** for modern apps, libraries, and browser code.

---

Do you want me to also give you a **side-by-side code comparison (CJS vs ESM)** for _named_ and _default_ exports in one table for quick reference?
