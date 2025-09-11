Perfect 👍 Let’s do the same style for **JavaScript Numbers**. Numbers in JS can be tricky because **everything is `Number` (double precision floating point)** unless you use `BigInt`.

Here’s your **complete guide**:

---

# 📘 JavaScript Numbers – Complete Guide

---

## 🔹 1. Number Types

- **Integer** → `10`, `-25`
- **Floating Point** → `3.14`, `-0.5`
- **Exponential** → `1.5e4` (→ `15000`)
- **Hexadecimal** → `0xff` (→ `255`)
- **Binary** → `0b1010` (→ `10`)
- **Octal** → `0o755` (→ `493`)
- **BigInt** → `123456789012345678901234567890n` (→ very large int)

```js
let a = 42; // integer
let b = 3.14; // float
let c = 1.5e4; // 15000
let big = 123n; // BigInt
```

---

## 🔹 2. Number Properties

- `Number.MAX_VALUE` → Largest possible number
- `Number.MIN_VALUE` → Smallest possible number
- `Number.MAX_SAFE_INTEGER` → `9007199254740991` ✅
- `Number.MIN_SAFE_INTEGER` → `-9007199254740991`
- `Number.POSITIVE_INFINITY`, `Number.NEGATIVE_INFINITY`
- `NaN` → "Not a Number"

```js
Number.MAX_SAFE_INTEGER; // 9007199254740991
Number.isNaN("abc"); // false
Number.isNaN(NaN); // true
```

⚡ **Important**: Use `Number.isNaN()` (not `isNaN()`) to avoid type coercion issues.

---

## 🔹 3. Number Methods (Static)

- `Number.isInteger(x)` ✅
- `Number.isFinite(x)` ✅
- `Number.isNaN(x)` ✅
- `Number.parseInt(str)` → integer from string ✅
- `Number.parseFloat(str)` → float from string

```js
Number.isInteger(10); // true
Number.isFinite(1 / 0); // false
Number.parseInt("100px"); // 100
Number.parseFloat("12.34"); // 12.34
```

---

## 🔹 4. Number Methods (on Instances)

- `.toFixed(n)` → fixed decimal places ✅
- `.toPrecision(n)` → number with total digits
- `.toExponential(n)` → exponential notation
- `.toString(base)` → convert to different base (binary, hex) ✅

```js
let num = 123.456;

num.toFixed(2); // "123.46"  (rounds)
num.toPrecision(4); // "123.5"
num.toExponential(2); // "1.23e+2"
num.toString(16); // "7b" (hex)
num.toString(2); // "1111011" (binary)
```

⚡ **Important**: `toFixed()` is widely used for money/decimals.

---

## 🔹 5. Math Object (Super Important)

JS provides a `Math` object with many static methods:

### 📍 Rounding

- `Math.round(x)` → nearest integer ✅
- `Math.floor(x)` → always down ✅
- `Math.ceil(x)` → always up ✅
- `Math.trunc(x)` → removes decimal (no rounding) ✅

```js
Math.round(4.6); // 5
Math.floor(4.9); // 4
Math.ceil(4.1); // 5
Math.trunc(4.9); // 4
```

---

### 📍 Random

- `Math.random()` → number between 0 and 1 ✅

```js
Math.random(); // e.g. 0.736
Math.floor(Math.random() * 10); // random 0–9
Math.floor(Math.random() * 100) + 1; // random 1–100
```

⚡ **Important**: `Math.random()` + `Math.floor()` is used for random integer generation.

---

### 📍 Power & Roots

- `Math.pow(a, b)` → a^b
- `Math.sqrt(x)` → square root
- `Math.cbrt(x)` → cube root

```js
Math.pow(2, 3); // 8
Math.sqrt(16); // 4
Math.cbrt(27); // 3
```

---

### 📍 Min/Max

- `Math.min(a,b,...)`
- `Math.max(a,b,...)` ✅

```js
Math.min(1, 5, 2); // 1
Math.max(1, 5, 2); // 5
```

---

### 📍 Absolute & Misc

- `Math.abs(x)` → absolute value
- `Math.sign(x)` → sign of number (-1,0,1)
- `Math.PI`, `Math.E`, `Math.LN2` → constants

```js
Math.abs(-7); // 7
Math.sign(-7); // -1
Math.sign(0); // 0
Math.sign(7); // 1
```

---

### 📍 Trigonometry (less common but useful)

- `Math.sin(x)`, `Math.cos(x)`, `Math.tan(x)`
- Input is in radians

```js
Math.sin(Math.PI / 2); // 1
```

---

## 🔹 6. BigInt (⭐ Special Case)

Use `n` at end for huge integers:

```js
let big = 123456789012345678901234567890n;
typeof big; // "bigint"
```

⚠️ **BigInt cannot mix with normal Numbers** (must convert explicitly).

---

## 🔹 7. Common Confusions (Look-alike methods)

| **Method**     | **Looks Like**   | **Difference**                                              |
| -------------- | ---------------- | ----------------------------------------------------------- |
| `parseInt()`   | `Number()`       | `parseInt("10px") → 10`, `Number("10px") → NaN` ✅          |
| `toFixed(n)`   | `toPrecision(n)` | `toFixed` → decimals, `toPrecision` → total digits          |
| `Math.floor()` | `Math.trunc()`   | `floor(-4.7) → -5`, `trunc(-4.7) → -4` ✅                   |
| `isNaN()`      | `Number.isNaN()` | `isNaN("hello") → true`, `Number.isNaN("hello") → false` ✅ |

---

## 🔹 8. Most **Important to Master**

✔ `Number.parseInt()`, `Number.parseFloat()`
✔ `Number.isInteger()`, `Number.isNaN()`
✔ `.toFixed()`
✔ `Math.round()`, `Math.floor()`, `Math.ceil()`, `Math.trunc()`
✔ `Math.random()`
✔ `Math.max()`, `Math.min()`

---

👉 Do you also want me to make a **mindmap diagram for Numbers** (like we did for Strings/Operators) so you can visually revise?
