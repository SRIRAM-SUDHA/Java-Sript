There are several ways to find the number of digits in a number in JavaScript.

## Method 1: Convert to String (Most Common)

```js
const num = 12345;
const digits = num.toString().length;

console.log(digits); // 5
```

### For negative numbers

```js
const num = -12345;
const digits = Math.abs(num).toString().length;

console.log(digits); // 5
```

---

## Method 2: Using `Math.log10()` (Mathematical)

Formula:

\lfloor \log_{10}(n) \rfloor + 1

```js
const num = 12345;
const digits = Math.floor(Math.log10(num)) + 1;

console.log(digits); // 5
```

### Edge Case

```js
Math.log10(0); // -Infinity
```

So:

```js
function countDigits(num) {
    if (num === 0) return 1;
    return Math.floor(Math.log10(Math.abs(num))) + 1;
}
```

---

## Method 3: Using a Loop

```js
function countDigits(num) {
    num = Math.abs(num);

    if (num === 0) return 1;

    let count = 0;

    while (num > 0) {
        count++;
        num = Math.floor(num / 10);
    }

    return count;
}
```

### Example

```js
countDigits(12345); // 5
countDigits(987);   // 3
```

### how the % and / works

```
// Check even or odd
n % 2

// Get last digit
n % 10

// Remove last digit
Math.floor(n / 10)
```
---


## Method 4: For LeetCode Problems with Very Large Numbers (Strings)

Many problems store huge numbers as strings:

```js
const num = "123456789012345678901234567890";

console.log(num.length); // 30
```

No conversion needed.

---

## Time Complexity Comparison

| Method            | Time | Space |
| ----------------- | ---- | ----- |
| String Conversion | O(d) | O(d)  |
| log10             | O(1) | O(1)  |
| Loop              | O(d) | O(1)  |
| String Length     | O(1) | O(1)  |

(`d` = number of digits)

### Interview Recommendation

* Normal integer → `Math.floor(Math.log10(n)) + 1`
* LeetCode large-number strings → `str.length`
* If interviewer asks without built-in methods → use the loop approach.

`Math.log10()` returns the **base-10 logarithm** of a number.

```js
Math.log10(x)
```

It answers:

> "To what power should 10 be raised to get `x`?"

---

## Examples

```js
Math.log10(10);      // 1
Math.log10(100);     // 2
Math.log10(1000);    // 3
Math.log10(10000);   // 4
```

Because:

```js
10^1 = 10
10^2 = 100
10^3 = 1000
10^4 = 10000
```

---

## Numbers That Are Not Exact Powers of 10

```js
Math.log10(50);    // 1.69897...
Math.log10(500);   // 2.69897...
Math.log10(999);   // 2.99956...
```

The result is a decimal because the number lies between two powers of 10.

---

## Finding Number of Digits

This is the most common interview use case.

Observe:

| Number | log10 | Floor | Digits |
| ------ | ----- | ----- | ------ |
| 9      | 0.xxx | 0     | 1      |
| 99     | 1.xxx | 1     | 2      |
| 999    | 2.xxx | 2     | 3      |
| 9999   | 3.xxx | 3     | 4      |

Formula:

\lfloor \log_{10}(n) \rfloor + 1

Example:

```js
let n = 12345;

let digits = Math.floor(Math.log10(n)) + 1;

console.log(digits); // 5
```

### Why it works

```js
Math.log10(12345); // 4.09149...
Math.floor(4.09149); // 4
4 + 1 = 5 digits
```

---

## Finding Magnitude / Range

You can determine the range of a number quickly.

```js
let n = 7896;

let power = Math.floor(Math.log10(n));

console.log(power); // 3
```

This tells us:

```js
10^3 <= 7896 < 10^4
```

So it's a 4-digit number.

---

## Scientific Notation

```js
let n = 123456;

let exponent = Math.floor(Math.log10(n));

console.log(exponent); // 5
```

Meaning:

```js
123456 ≈ 1.23456 × 10^5
```

---

## Common LeetCode Usage

### Count digits

```js
function countDigits(n) {
    if (n === 0) return 1;
    return Math.floor(Math.log10(Math.abs(n))) + 1;
}
```

### Check if number has k digits

```js
function hasKDigits(n, k) {
    return Math.floor(Math.log10(Math.abs(n))) + 1 === k;
}
```

---

## Edge Cases

### Zero

```js
Math.log10(0); // -Infinity
```

Because there is no power of 10 that equals 0.

So always handle:

```js
if (n === 0) return 1;
```

---

### Negative Numbers

```js
Math.log10(-100); // NaN
```

Use:

```js
Math.log10(Math.abs(n))
```

---

## Related Log Functions

```js
Math.log(x)      // Natural log (base e)
Math.log2(x)     // Base 2 log
Math.log10(x)    // Base 10 log
```

Examples:

```js
Math.log2(8);     // 3
Math.log2(16);    // 4

Math.log10(1000); // 3
```

### When to use which?

* `Math.log10()` → decimal digits, powers of 10, scientific notation.
* `Math.log2()` → binary problems, bit manipulation, complete binary trees.
* `Math.log()` → mathematical formulas, probability, growth/decay calculations.

For DSA and LeetCode, you'll most often see `Math.log10()` for **digit counting** and `Math.log2()` for **bit-related problems**.
