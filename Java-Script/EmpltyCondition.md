Perfect ✅
Here’s your **comprehensive Markdown cheat sheet** showing what common JavaScript methods return — when they _do_ find something, when they _don’t_, and what _type_ they return.

---

# 🧠 JavaScript Return Behavior Cheat Sheet

> A quick reference for what each method returns when successful vs when not.

---

## 🧩 Array Methods

| Method            | When It Finds / Works         | When It Doesn’t                                            | Return Type                |
| :---------------- | :---------------------------- | :--------------------------------------------------------- | :------------------------- |
| **`find()`**      | First matching element        | `undefined`                                                | Element type / `undefined` |
| **`findIndex()`** | Index of first match          | `-1`                                                       | `number`                   |
| **`filter()`**    | Array of matching elements    | `[]`                                                       | `Array`                    |
| **`map()`**       | Transformed array             | Always returns array (even empty)                          | `Array`                    |
| **`forEach()`**   | Executes callback             | Always `undefined` (void)                                  | `undefined`                |
| **`some()`**      | `true` if any element matches | `false`                                                    | `boolean`                  |
| **`every()`**     | `true` if all match           | `false`                                                    | `boolean`                  |
| **`reduce()`**    | Accumulated result            | ❌ Throws `TypeError` if empty array without initial value | depends on callback        |
| **`includes()`**  | `true` if found               | `false`                                                    | `boolean`                  |
| **`indexOf()`**   | Index of element              | `-1`                                                       | `number`                   |
| **`join()`**      | Joined string                 | Empty array → `""`                                         | `string`                   |
| **`concat()`**    | Merged array                  | Works always                                               | `Array`                    |
| **`flat()`**      | Flattened array               | Works always                                               | `Array`                    |
| **`flatMap()`**   | Mapped + flattened array      | Always array                                               | `Array`                    |
| **`reverse()`**   | Same array (mutated)          | Works always                                               | `Array`                    |
| **`sort()`**      | Sorted array (mutated)        | Works always                                               | `Array`                    |
| **`slice()`**     | Extracted portion             | Returns `[]` if no elements match                          | `Array`                    |
| **`splice()`**    | Removed elements              | Returns `[]` if none removed                               | `Array`                    |
| **`push()`**      | Adds element(s)               | Returns new length                                         | `number`                   |
| **`pop()`**       | Last element                  | `undefined` if empty                                       | Element / `undefined`      |
| **`shift()`**     | First element                 | `undefined` if empty                                       | Element / `undefined`      |
| **`unshift()`**   | Adds at start                 | Returns new length                                         | `number`                   |

---

## 🔢 Number Methods

| Method               | When Valid                    | When Invalid                          | Return Type |
| :------------------- | :---------------------------- | :------------------------------------ | :---------- |
| **`toFixed(n)`**     | Rounded string, e.g. `"3.14"` | Throws `RangeError` if n < 0 or > 100 | `string`    |
| **`toPrecision(n)`** | Rounded string                | Throws `RangeError` if n < 1 or > 100 | `string`    |
| **`parseInt()`**     | Parsed integer                | `NaN`                                 | `number`    |
| **`parseFloat()`**   | Parsed float                  | `NaN`                                 | `number`    |
| **`Number()`**       | Converted number              | `NaN` if invalid                      | `number`    |
| **`isNaN()`**        | `true` if value is `NaN`      | `false`                               | `boolean`   |
| **`isFinite()`**     | `true` if finite number       | `false`                               | `boolean`   |

---

## 🧵 String Methods

| Method                        | When It Works               | When Not Found                 | Return Type      |
| :---------------------------- | :-------------------------- | :----------------------------- | :--------------- |
| **`charAt(i)`**               | Character at index          | `""` (empty string)            | `string`         |
| **`includes()`**              | `true` if substring found   | `false`                        | `boolean`        |
| **`indexOf()`**               | Index of substring          | `-1`                           | `number`         |
| **`lastIndexOf()`**           | Last occurrence             | `-1`                           | `number`         |
| **`slice()`**                 | Substring                   | Returns `""` for invalid range | `string`         |
| **`substring()`**             | Substring                   | `""` for invalid range         | `string`         |
| **`split()`**                 | Array of substrings         | Always array                   | `Array`          |
| **`replace()`**               | New string with replacement | Returns original if no match   | `string`         |
| **`replaceAll()`**            | All matches replaced        | Returns original if none found | `string`         |
| **`trim()`**                  | String without spaces       | Always returns string          | `string`         |
| **`toUpperCase()`**           | Uppercase string            | Always works                   | `string`         |
| **`toLowerCase()`**           | Lowercase string            | Always works                   | `string`         |
| **`padStart()` / `padEnd()`** | Padded string               | Works always                   | `string`         |
| **`match()`**                 | Array of matches            | `null` if no match             | `Array` / `null` |
| **`matchAll()`**              | Iterator of matches         | Empty iterator if none         | `Iterator`       |

---

## 🧮 Object / Map / Set

| Method                  | When Key Exists             | When Key Doesn’t Exist | Return Type         |
| :---------------------- | :-------------------------- | :--------------------- | :------------------ |
| **`Object.keys()`**     | Array of keys               | `[]`                   | `Array`             |
| **`Object.values()`**   | Array of values             | `[]`                   | `Array`             |
| **`Object.entries()`**  | Array of [key, value] pairs | `[]`                   | `Array`             |
| **`Object.hasOwn()`**   | `true` if property exists   | `false`                | `boolean`           |
| **`Map.get(key)`**      | Value                       | `undefined`            | Value / `undefined` |
| **`Map.has(key)`**      | `true`                      | `false`                | `boolean`           |
| **`Map.delete(key)`**   | `true` if existed           | `false`                | `boolean`           |
| **`Set.has(value)`**    | `true`                      | `false`                | `boolean`           |
| **`Set.add(value)`**    | Returns same Set            | Always works           | `Set`               |
| **`Set.delete(value)`** | `true` if existed           | `false`                | `boolean`           |

---

## ⚙️ Function Behavior

| Function Type                    | Return Value               |
| :------------------------------- | :------------------------- |
| Regular function (no `return`)   | `undefined`                |
| Arrow function (implicit return) | Expression value           |
| `async` function                 | Always returns a `Promise` |
| Generator function (`function*`) | Returns an iterator object |
| Void function                    | `undefined`                |

---

## 🧰 Special & Edge Cases

| Case                                           | Example             | Behavior / Return       |
| :--------------------------------------------- | :------------------ | :---------------------- |
| Empty array + `reduce()` without initial value | `[].reduce(...)`    | ❌ Throws `TypeError`   |
| JSON parsing invalid string                    | `JSON.parse("abc")` | ❌ Throws `SyntaxError` |
| `Array.isArray([])`                            |                     | `true`                  |
| `Array.isArray({})`                            |                     | `false`                 |
| `typeof null`                                  |                     | `"object"`              |
| `typeof NaN`                                   |                     | `"number"`              |
| `Boolean("")`                                  |                     | `false`                 |
| `Boolean("0")`                                 |                     | `true`                  |

---

Would you like me to add **Promise methods** (`then`, `catch`, `finally`, `all`, `any`, etc.) and **DOM methods** next — to complete it as a full developer’s reference?
