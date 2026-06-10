# Remove Duplicates from Sorted Array (LeetCode 26)

## Problem

Given a **sorted array** `nums`, remove the duplicates **in-place** such that each unique element appears only once.

Return the number of unique elements `k`.

Example:

```js
Input: nums = [1,1,2]

Output: 2
nums = [1,2,_]
```

---

# Key Observation

The array is already **sorted**.

So duplicates will always be adjacent:

```js
[1,1,1,2,2,3,4,4]
```

We only need to keep the first occurrence of each number.

---

# Best Approach: Two Pointers

Use:

* `i` → position where next unique element should be placed
* `j` → scans the array

### Idea

```text
[1,1,2,3,3]

i
↓
[1,1,2,3,3]

      j
```

Whenever we find a new number:

```js
nums[j] !== nums[i - 1]
```

place it at index `i` and increment `i`.

---

# Dry Run

```js
nums = [1,1,2,3,3]
```

Initial:

```text
i = 1

[1,1,2,3,3]
```

### j = 1

```js
nums[1] === nums[0]
```

Duplicate → Skip

---

### j = 2

```js
2 !== 1
```

Place:

```js
nums[1] = 2
```

Array:

```text
[1,2,2,3,3]
```

```js
i = 2
```

---

### j = 3

```js
3 !== 2
```

Place:

```js
nums[2] = 3
```

Array:

```text
[1,2,3,3,3]
```

```js
i = 3
```

---

### j = 4

Duplicate

Skip.

---

Return:

```js
3
```

First 3 elements:

```js
[1,2,3]
```

---

# JavaScript Solution

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    if (nums.length === 0) return 0;

    let i = 1;

    for (let j = 1; j < nums.length; j++) {
        if (nums[j] !== nums[i - 1]) {
            nums[i] = nums[j];
            i++;
        }
    }

    return i;
};
```

---

# Simpler Version

```js
var removeDuplicates = function(nums) {
    let k = 1;

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }

    return nums.length ? k : 0;
};
```

---

# Why It Works

Since the array is sorted:

```js
[1,1,2,2,3]
```

If current element differs from the last unique element:

```js
nums[j] !== nums[i - 1]
```

it must be a new unique value.

We copy it forward.

---

# Corner Cases

### Single Element

```js
[1]
```

Output:

```js
1
```

---

### All Duplicates

```js
[2,2,2,2]
```

Output:

```js
1
```

---

### No Duplicates

```js
[1,2,3,4]
```

Output:

```js
4
```

---

### Empty Array

```js
[]
```

Output:

```js
0
```

---

# Complexity

| Metric | Value |
| ------ | ----- |
| Time   | O(n)  |
| Space  | O(1)  |

This is the optimal solution.

---

# Pattern Learned

This is a classic **Slow & Fast Pointer** problem.

```text
slow -> position to write
fast -> position to read
```

Use this pattern when:

* Removing duplicates
* Removing specific elements
* Compacting arrays
* In-place array modifications

---

# Java Reference

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;

        int i = 1;

        for (int j = 1; j < nums.length; j++) {
            if (nums[j] != nums[i - 1]) {
                nums[i] = nums[j];
                i++;
            }
        }

        return i;
    }
}
```

---

# Python Reference

```python
class Solution:
    def removeDuplicates(self, nums):
        if not nums:
            return 0

        i = 1

        for j in range(1, len(nums)):
            if nums[j] != nums[i - 1]:
                nums[i] = nums[j]
                i += 1

        return i
```

### Interview Takeaway

Whenever you hear:

* **sorted array**
* **remove duplicates**
* **in-place**
* **constant extra memory**

Think immediately:

✅ **Two Pointers (Slow/Fast Pointer)**
✅ **O(n) Time, O(1) Space**
