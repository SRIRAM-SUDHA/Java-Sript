These terms appear repeatedly in LeetCode. Understanding them saves a lot of confusion.

# 1. Ascending Order

Numbers strictly increase.

```js
[1, 2, 3, 4, 5]
```

Condition:

```js
a[i] < a[i + 1]
```

Every next element must be greater.

✅ Valid

```js
[1, 3, 5, 7]
```

❌ Invalid

```js
[1, 2, 2, 3]
```

because `2` is repeated.

---

# 2. Descending Order

Numbers strictly decrease.

```js
[9, 7, 5, 3, 1]
```

Condition:

```js
a[i] > a[i + 1]
```

✅ Valid

```js
[10, 8, 6]
```

❌ Invalid

```js
[10, 8, 8, 5]
```

because `8` repeats.

---

# 3. Non-Decreasing

Numbers can stay the same or increase.

```js
[1, 2, 2, 3, 3, 4]
```

Condition:

```js
a[i] <= a[i + 1]
```

Think:

> "Never goes down."

✅ Valid

```js
[1, 1, 2, 2, 3]
```

❌ Invalid

```js
[1, 2, 1]
```

because it decreases.

---

# 4. Non-Increasing

Numbers can stay the same or decrease.

```js
[5, 5, 4, 4, 3, 1]
```

Condition:

```js
a[i] >= a[i + 1]
```

Think:

> "Never goes up."

✅ Valid

```js
[10, 10, 8, 8, 2]
```

❌ Invalid

```js
[5, 4, 6]
```

because it increases.

---

# Quick Memory Trick

| Term           | Meaning       |
| -------------- | ------------- |
| Ascending      | Strictly Up   |
| Descending     | Strictly Down |
| Non-Decreasing | Up or Same    |
| Non-Increasing | Down or Same  |

---

# 5. In-Place

Modify the original array instead of creating a new one.

### In-Place

```js
nums[0] = 100;
```

Original array changes.

---

### Not In-Place

```js
let newArr = [...nums];
```

Creates extra memory.

---

LeetCode statement:

> "Do it in-place with O(1) extra space."

Means:

✅ Modify existing array

❌ Don't create another array

---

# 6. Relative Order

The order between elements must stay the same.

Example:

```js
[5, 1, 3, 2]
```

Suppose we move odd numbers first.

Result:

```js
[5, 1, 3, 2]
```

Relative order preserved because:

```text
5 before 1 before 3
```

remains unchanged.

---

### Relative Order NOT Preserved

```js
[3, 5, 1, 2]
```

Now:

```text
3 moved before 5
```

Order changed.

---

LeetCode often says:

> "Maintain the relative order."

Meaning:

✅ Keep original sequence among affected elements.

---

# 7. Sorted Array

Elements already arranged.

```js
[1,2,3,4,5]
```

or

```js
[5,4,3,2,1]
```

depending on the problem statement.

---

# 8. Subarray

Continuous part of an array.

```js
[1,2,3,4,5]
```

Subarrays:

```js
[1,2]
[2,3,4]
[3,4,5]
```

Must be continuous.

❌

```js
[1,3,5]
```

Not a subarray.

---

# 9. Subsequence

Can skip elements but keep order.

```js
[1,2,3,4,5]
```

Valid subsequences:

```js
[1,3,5]
[2,4]
[1,2,5]
```

Order matters.

❌

```js
[5,3]
```

because order changed.

---

# 10. Prefix

Starting portion of an array/string.

```js
[1,2,3,4]
```

Prefixes:

```js
[1]
[1,2]
[1,2,3]
```

Always starts from index 0.

---

# 11. Suffix

Ending portion.

```js
[1,2,3,4]
```

Suffixes:

```js
[4]
[3,4]
[2,3,4]
```

Always ends at last index.

---

# 12. Stable Sort

Equal elements keep their original order.

Before:

```js
[(A,10), (B,10), (C,20)]
```

After sorting:

```js
[(A,10), (B,10), (C,20)]
```

A stays before B.

This is important in some sorting problems.

---

# 13. Lexicographical Order

Dictionary order.

Strings:

```js
"apple" < "banana"
```

Numbers as strings:

```js
"123" < "456"
```

Used heavily in string and large-number problems.

