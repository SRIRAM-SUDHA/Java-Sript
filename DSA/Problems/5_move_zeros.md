# Move Zeroes (LeetCode 283)

## Problem

Given an array `nums`, move all `0`s to the end while maintaining the **relative order** of the non-zero elements.

### Example

```js
Input: [0,1,0,3,12]

Output: [1,3,12,0,0]
```

### Important Terms

* **In-place** → Modify the original array. Don't create another array.
* **Relative Order** → `1,3,12` should remain `1,3,12` (not `12,1,3`).

---

# Intuition

Think of it as:

```text
Move all non-zero elements to the front
Fill the remaining positions with 0
```

Example:

```js
[0,1,0,3,12]
```

After moving non-zeroes:

```js
[1,3,12,?,?,?]
```

Fill remaining spots:

```js
[1,3,12,0,0]
```

---

# Optimal Approach: Two Pointers

## Roles

```text
i -> Read Pointer
x -> Write Pointer
```

* `i` scans every element.
* `x` points to where the next non-zero element should go.

---

## Algorithm

### Step 1

Move all non-zero elements to the front.

```js
nums[x] = nums[i]
x++
```

### Step 2

After traversal:

```js
x = number of non-zero elements
```

Fill the remaining positions with zero.

---

# Dry Run

```js
nums = [0,1,0,3,12]
```

Initial:

```text
x = 0
```

---

### i = 0

```js
nums[0] = 0
```

Skip

---

### i = 1

```js
nums[x] = nums[1]

nums[0] = 1
x = 1
```

Array:

```js
[1,1,0,3,12]
```

---

### i = 3

```js
nums[1] = 3
x = 2
```

Array:

```js
[1,3,0,3,12]
```

---

### i = 4

```js
nums[2] = 12
x = 3
```

Array:

```js
[1,3,12,3,12]
```

---

Now:

```js
x = 3
```

Fill remaining positions with `0`.

```js
nums[3] = 0
nums[4] = 0
```

Result:

```js
[1,3,12,0,0]
```

---

# JavaScript Solution

```js
/**
 * @param {number[]} nums
 * @return {void}
 */
var moveZeroes = function(nums) {
    let x = 0;

    // Move non-zero elements forward
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            nums[x] = nums[i];
            x++;
        }
    }

    // Fill remaining positions with 0
    while (x < nums.length) {
        nums[x] = 0;
        x++;
    }
};
```

---

# Better Approach (Swap)

This is the version most interviewers expect.

```js
var moveZeroes = function(nums) {
    let x = 0;

    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            [nums[x], nums[i]] = [nums[i], nums[x]];
            x++;
        }
    }
};
```

---

## Why Swap Works

Example:

```js
[0,1,0,3,12]
```

### i = 1

```js
swap(0,1)
```

Result:

```js
[1,0,0,3,12]
```

---

### i = 3

```js
swap(1,3)
```

Result:

```js
[1,3,0,0,12]
```

---

### i = 4

```js
swap(2,4)
```

Result:

```js
[1,3,12,0,0]
```

Done.

---

# Why Your Attempt Failed

You tried:

```js
nums[x] = nums[i];
nums[i] = 0;
```

This breaks when:

```js
x === i
```

Example:

```js
[1,2,3]
```

At:

```js
i = 0
x = 0
```

You do:

```js
nums[0] = nums[0];
nums[0] = 0;
```

Result:

```js
[0,2,3]
```

You accidentally destroy the value.

---

# Complexity

| Metric | Value |
| ------ | ----- |
| Time   | O(n)  |
| Space  | O(1)  |

Optimal.

---

# Pattern Learned

This is the classic:

## Slow & Fast Pointer Pattern

```text
Fast Pointer -> Reads data
Slow Pointer -> Writes data
```

Used in:

* Remove Duplicates from Sorted Array
* Remove Element
* Move Zeroes
* Compress Array Problems

When you hear:

```text
In-place
Maintain Relative Order
Move/Remove Elements
```

Think immediately:

```text
Two Pointers (Slow + Fast)
```

---

# Java Reference

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int x = 0;

        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                int temp = nums[x];
                nums[x] = nums[i];
                nums[i] = temp;
                x++;
            }
        }
    }
}
```

---

# Python Reference

```python
class Solution:
    def moveZeroes(self, nums):
        x = 0

        for i in range(len(nums)):
            if nums[i] != 0:
                nums[x], nums[i] = nums[i], nums[x]
                x += 1
```

## Interview Takeaway

For array problems:

| Problem Statement Contains | Pattern           |
| -------------------------- | ----------------- |
| Remove duplicates          | Slow/Fast Pointer |
| Remove element             | Slow/Fast Pointer |
| Move zeroes                | Slow/Fast Pointer |
| In-place modification      | Slow/Fast Pointer |
| Maintain relative order    | Slow/Fast Pointer |

This is one of the most frequently reused patterns in LeetCode array questions.
