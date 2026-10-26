You're solving **Single Number (LeetCode 136)**.

Your approach is using a frequency map, which is valid, but there are a few mistakes.

---

# Mistake 1: Using Index Instead of Value

You wrote:

```js
if (!hash[i]) hash[i] = 1
else hash[i] += 1
```

`i` is the index.

Example:

```js
nums = [2,2,1]
```

You're storing:

```js
{
  0: 1,
  1: 1,
  2: 1
}
```

instead of:

```js
{
  2: 2,
  1: 1
}
```

You should use:

```js
nums[i]
```

---

# Mistake 2: `hash.keys()` Doesn't Exist

Objects don't have:

```js
hash.keys()
```

Use:

```js
Object.keys(hash)
```

---

# Mistake 3: `return` Inside `forEach`

```js
forEach(...)
```

does not return from the outer function.

Example:

```js
[1,2,3].forEach(num => {
    return num;
});
```

This returns nothing.

---

# Correct HashMap Solution

```js
var singleNumber = function(nums) {
    let hash = {};

    for (let i = 0; i < nums.length; i++) {
        hash[nums[i]] = (hash[nums[i]] || 0) + 1;
    }

    for (let key in hash) {
        if (hash[key] === 1) {
            return Number(key);
        }
    }
};
```

---

# Better Solution (Bit Manipulation)

This is what interviewers usually expect.

## XOR Properties

```js
a ^ a = 0
```

```js
a ^ 0 = a
```

Example:

```js
2 ^ 2 = 0
```

```js
0 ^ 1 = 1
```

---

## Dry Run

```js
[2,2,1]
```

```js
result = 0

0 ^ 2 = 2
2 ^ 2 = 0
0 ^ 1 = 1
```

Answer:

```js
1
```

---

# Optimal Solution

```js
var singleNumber = function(nums) {
    let result = 0;

    for (let num of nums) {
        result ^= num;
    }

    return result;
};
```

---

# Why XOR Works

Problem guarantee:

```text
Every element appears twice
Except one element
```

So:

```js
[a,a,b,b,c]
```

becomes:

```js
a ^ a ^ b ^ b ^ c
```

which simplifies to:

```js
0 ^ 0 ^ c
```

which becomes:

```js
c
```

---

# Complexity Comparison

| Approach | Time | Space |
| -------- | ---- | ----- |
| HashMap  | O(n) | O(n)  |
| XOR      | O(n) | O(1)  |

---

# Interview Takeaway

When the problem says:

```text
Every element appears twice
One element appears once
```

Immediately think:

```text
XOR
```

Because duplicate numbers cancel each other out, leaving only the unique number. This is one of the most common bit-manipulation interview patterns.
