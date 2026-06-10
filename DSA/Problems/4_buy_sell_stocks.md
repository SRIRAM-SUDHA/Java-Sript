Your solution is already the **optimal solution**.

# Rating of Your Solution

 * ✅ Time Complexity: **O(n)**
 * ✅ Space Complexity: **O(1)**
 * ✅ Single Pass
 * ✅ Interview Ready

```js
var maxProfit = function(prices) {
    let min = prices[0];
    let profit = 0;

    for (let i = 0; i < prices.length; i++) {
        if (prices[i] < min) {
            min = prices[i];
        }
        // min = Math.min(min, prices[i]) we can write like this also instead of that
        profit = Math.max(profit, prices[i] - min);
    }

    return profit;
};
```

There is **no algorithmic optimization possible** because you must inspect every price at least once.

---

# Problem Understanding

You are allowed:

* Buy once
* Sell once
* Buy must happen before sell

Goal:

```text
Maximum Profit = Sell Price - Buy Price
```

Example:

```js
[7,1,5,3,6,4]
```

Buy:

```js
1
```

Sell:

```js
6
```

Profit:

```js
5
```

---

# Core Insight

At every day ask:

> "If I sell today, what is the best profit I can make?"

To answer that:

1. Remember the cheapest price seen so far.
2. Calculate today's profit.
3. Update maximum profit.

---

# Dry Run

```js
prices = [7,1,5,3,6,4]
```

| Day | Price | Min So Far | Profit Today | Max Profit |
| --- | ----- | ---------- | ------------ | ---------- |
| 0   | 7     | 7          | 0            | 0          |
| 1   | 1     | 1          | 0            | 0          |
| 2   | 5     | 1          | 4            | 4          |
| 3   | 3     | 1          | 2            | 4          |
| 4   | 6     | 1          | 5            | 5          |
| 5   | 4     | 1          | 3            | 5          |

Answer:

```js
5
```

---

# Small Best Practice Improvement

You can start from index `1`.

Reason:

```js
min = prices[0]
```

already processed.

```js
var maxProfit = function(prices) {
    let minPrice = prices[0];
    let maxProfit = 0;

    for (let i = 1; i < prices.length; i++) {
        minPrice = Math.min(minPrice, prices[i]);

        maxProfit = Math.max(
            maxProfit,
            prices[i] - minPrice
        );
    }

    return maxProfit;
};
```

This is mostly a readability improvement.

---

# Pattern to Remember

This problem teaches:

## Running Minimum

```js
minPrice = Math.min(minPrice, current);
```

Many LeetCode problems use this pattern.

Examples:

* Best Time to Buy and Sell Stock
* Maximum Difference
* Minimum Cost
* Prefix Minimum problems

---

# Alternative Brute Force (Don't Use)

```js
for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
        profit = Math.max(
            profit,
            prices[j] - prices[i]
        );
    }
}
```

Time:

```text
O(n²)
```

Rejected for large inputs.

---

# Interview Keywords

When you see:

* Buy before sell
* Maximum difference
* Best profit
* Single transaction
* One pass preferred

Think:

```text
Running Minimum + Maximum Difference
```

Formula:

```js
profit = currentPrice - minPriceSeenSoFar
```

That's the entire trick behind this problem.

---

# Java Reference

```java
class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = prices[0];
        int maxProfit = 0;

        for (int i = 1; i < prices.length; i++) {
            minPrice = Math.min(minPrice, prices[i]);
            maxProfit = Math.max(maxProfit, prices[i] - minPrice);
        }

        return maxProfit;
    }
}
```

# Python Reference

```python
class Solution:
    def maxProfit(self, prices):
        min_price = prices[0]
        max_profit = 0

        for i in range(1, len(prices)):
            min_price = min(min_price, prices[i])
            max_profit = max(
                max_profit,
                prices[i] - min_price
            )

        return max_profit
```

### Mental Model

Think of walking through stock prices while carrying a note:

```text
"What's the cheapest stock I've seen so far?"
```

Every day:

```text
Profit if I sell today
=
Today's Price - Cheapest Price Seen Earlier
```

Keep the best answer seen so far. That's why the solution works in one pass.
