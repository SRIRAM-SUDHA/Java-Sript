# LeetCode 1985 — Find the Kth Largest Integer in the Array

## Problem

Given an array of strings `nums`, where each string represents a positive integer without leading zeros, and an integer `k`, return the **kth largest integer** in the array.

### Example

```text
Input:
nums = ["3","6","7","10"]
k = 4

Sorted descending:
["10","7","6","3"]

Answer: "3"
```

---

# Key Observation

The numbers are stored as **strings**.

A normal numeric sort like:

```js
nums.sort((a, b) => b - a)
```

can fail for very large integers because JavaScript numbers have a safe limit:

```js
Number.MAX_SAFE_INTEGER
// 9007199254740991
```

The problem may contain numbers larger than this.

Therefore, compare them as strings.

---

# Approach 1: Using BigInt

## Idea

Convert strings to `BigInt` and sort.

### Algorithm

1. Sort array in descending order.
2. Convert strings to BigInt during comparison.
3. Return `nums[k-1]`.

### JavaScript

```js
var kthLargestNumber = function(nums, k) {
    nums.sort((a, b) => {
        return BigInt(b) > BigInt(a) ? 1 : -1;
    });

    return nums[k - 1];
};
```

---

## Complexity

### Time

```text
O(n log n)
```

### Space

```text
O(1)
```

(ignoring sorting internals)

---

# Approach 2: String Comparison (Recommended)

## Intuition

For two positive integers stored as strings:

### Rule 1

Longer length ⇒ Larger number

```text
"1000" > "999"

length:
4 > 3
```

### Rule 2

If lengths are equal, compare lexicographically.

```text
"456" > "123"
```

because same length.

---

## Algorithm

For two strings `a` and `b`:

```text
If lengths differ:
    larger length = larger number

Else:
    use localeCompare()
```

Sort descending and return `k-1`.

---

## JavaScript Solution

```js
/**
 * @param {string[]} nums
 * @param {number} k
 * @return {string}
 */
var kthLargestNumber = function(nums, k) {
    nums.sort((a, b) => {
        if (a.length !== b.length) {
            return b.length - a.length;
        }

        return b.localeCompare(a);
    });

    return nums[k - 1];
};
```

---

# Dry Run

```js
nums = ["3","6","7","10"]
k = 4
```

### Sorting

```text
"10" length 2
"7"  length 1
"6"  length 1
"3"  length 1
```

Sorted:

```text
["10","7","6","3"]
```

Return:

```js
nums[3]
```

Result:

```text
"3"
```

---

# Why Your Solution Can Fail

You wrote:

```js
nums.sort((a,b)=>parseInt(b)-parseInt(a))
```

### Problem

`parseInt()` converts strings into Number.

Example:

```js
parseInt("1000000000000000000000")
```

loses precision.

LeetCode intentionally includes huge integers.

So numeric comparison becomes incorrect.

---

# Understanding `localeCompare()`

## Syntax

```js
str1.localeCompare(str2)
```

### Returns

```text
Negative => str1 comes before str2
Zero     => equal
Positive => str1 comes after str2
```

Example:

```js
"123".localeCompare("456")
```

Output:

```text
-1
```

because `"123"` comes before `"456"`.

---

### Example

```js
["9","4","12"].sort((a,b)=>b.localeCompare(a))
```

Result:

```js
["9","4","12"]
```

Wrong for this problem because lengths differ.

That's why we first compare lengths.

---

# Corner Cases

### Case 1

```js
nums = ["1"]
k = 1
```

Answer:

```text
"1"
```

---

### Case 2

```js
nums = ["2","21","12","1"]
k = 2
```

Sorted:

```text
21,12,2,1
```

Answer:

```text
"12"
```

---

### Case 3

Very large numbers

```js
nums = [
 "999999999999999999999999",
 "1000000000000000000000000"
]
```

Correct answer requires string comparison.

---

# Pattern Recognition

```text
Pattern:
Custom Sorting
```

Recognize when:

✅ Numbers are stored as strings

✅ Numbers may exceed integer limits

✅ Need custom comparator

---

# Complexity Summary

| Approach             | Time       | Space |
| -------------------- | ---------- | ----- |
| BigInt Sort          | O(n log n) | O(1)  |
| Length + String Sort | O(n log n) | O(1)  |

---

# Java Reference

```java
class Solution {
    public String kthLargestNumber(String[] nums, int k) {

        Arrays.sort(nums, (a, b) -> {
            if (a.length() != b.length()) {
                return b.length() - a.length();
            }
            return b.compareTo(a);
        });

        return nums[k - 1];
    }
}
```

---

# Python Reference

```python
class Solution:
    def kthLargestNumber(self, nums, k):
        nums.sort(key=lambda x: (len(x), x), reverse=True)
        return nums[k - 1]
```

### Interview Answer (30 seconds)

> Since numbers are stored as strings and may exceed JavaScript's safe integer range, converting them to Number or parseInt is unsafe. I sort using a custom comparator: first by string length (longer length means larger integer), and if lengths are equal, I compare lexicographically. After sorting in descending order, I return `nums[k-1]`. This runs in `O(n log n)` time.
