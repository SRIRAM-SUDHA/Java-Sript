### `/` (Division)

Divides one number by another and gives the **quotient**.

```js
10 / 3 // 3.3333
10 / 2 // 5
```

**Use when:** You need the result after dividing.

Examples:
- Calculate average
- Convert units
- Split something equally

---

### `%` (Modulo / Remainder)

Gives the **remainder** after division.

```js
10 % 3 // 1
10 % 2 // 0
```

Explanation:

```js
10 = (3 × 3) + 1
```

So remainder = `1`.

**Use when:**
- Check even/odd
- Extract digits
- Circular indexing
- Detect multiples

Examples:

```js
n % 2 === 0  // Even number

n % 10       // Last digit

n % 5 === 0  // Multiple of 5
```

---

### Quick Memory Trick

For:

```js
17 / 5
```

Think:

```js
17 = (5 × 3) + 2
```

- `/` → gives `3.4` (actual division result)
- `%` → gives `2` (what is left over)

---

### Most Common DSA Usage

```js
// Check even or odd
n % 2

// Get last digit
n % 10

// Remove last digit
Math.floor(n / 10)
```

Example:

```js
let n = 123;

n % 10;              // 3 (last digit)
Math.floor(n / 10);  // 12 (remove last digit)
```

This combination (`% 10` and `Math.floor(/10)`) is used in many number problems like reverse number, palindrome number, sum of digits, Armstrong number, etc.