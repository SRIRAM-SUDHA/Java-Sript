Perfect 🚀 You’ve given me **organisation.json** and **reviewData.json**, which are rich nested datasets. These are great for practicing _advanced iteration, extraction, and transformation problems_.

Here’s how I’ll help you:

1. I’ll **design hard, real-world style questions** on iterating objects/arrays.
2. I’ll show you **multiple approaches** (`map`, `reduce`, `flatMap`, `for...of`, `forEach`, etc.).
3. I’ll explain **how to think** when solving such problems, including corner cases.

---

## 🔥 Hard Practice Questions

### Q1. Get all **project names** across the organisation that have `"In Progress"` status.

👉 _Twist_: Projects are nested under employees → departments → divisions.

**Thinking**:

- Traverse `organisation.divisions → departments → employees → projects`.
- Filter by `status === "In Progress"`.
- Collect project names.

```js
const { organisation } = require("./organisation.json");

const inProgressProjects = organisation.divisions
	.flatMap((d) => d.departments)
	.flatMap((dep) => dep.employees)
	.flatMap((emp) => emp.projects)
	.filter((p) => p.status === "In Progress")
	.map((p) => p.name);

console.log(inProgressProjects);
```

---

### Q2. Compute **total & average salary per department** from `reviewData.json`.

👉 Output in **two formats** (object & array like you mentioned).

**Thinking**:

- Group employees by department.
- Accumulate `totalSalary`, `count`.
- Compute `avgSalary = totalSalary / headCount`.

```js
const { employees } = require("./reviewData.json");

// Format 1: Object of departments
const deptStatsObj = employees.reduce((acc, emp) => {
	const { department, salary } = emp;
	if (!acc[department]) {
		acc[department] = {
			headCountFromEmployees: 0,
			totalSalary: 0,
			avgSalary: 0,
		};
	}
	acc[department].headCountFromEmployees++;
	acc[department].totalSalary += salary;
	acc[department].avgSalary =
		acc[department].totalSalary / acc[department].headCountFromEmployees;
	return acc;
}, {});

console.log(deptStatsObj);

// Format 2: Array of objects
const deptStatsArr = Object.entries(deptStatsObj).map(([dept, stats]) => ({
	department: dept,
	...stats,
}));

console.log(deptStatsArr);
```

---

### Q3. Find all **unique certifications** across the organisation, sorted alphabetically.

👉 _Twist_: Certifications are inside employees.

```js
const uniqueCerts = [
	...new Set(
		organisation.divisions
			.flatMap((d) => d.departments)
			.flatMap((dep) => dep.employees)
			.flatMap((emp) => emp.certifications)
	),
].sort();

console.log(uniqueCerts);
```

---

### Q4. Get a **list of employees who worked on projects with budget > 250000**.

👉 _Twist_: You need `employeeName → [projectNames]`.

```js
const highBudgetProjects = organisation.divisions
	.flatMap((d) => d.departments)
	.flatMap((dep) => dep.employees)
	.map((emp) => ({
		employee: emp.name,
		projects: emp.projects.filter((p) => p.budget > 250000).map((p) => p.name),
	}))
	.filter((e) => e.projects.length > 0);

console.log(highBudgetProjects);
```

---

### Q5. Count how many **milestones are "Completed" vs "In Progress" vs "On Hold"**.

👉 _Twist_: Aggregate at the organisation level.

```js
const milestoneStats = organisation.divisions
	.flatMap((d) => d.departments)
	.flatMap((dep) => dep.employees)
	.flatMap((emp) => emp.projects)
	.flatMap((p) => p.milestones)
	.reduce((acc, m) => {
		acc[m.status] = (acc[m.status] || 0) + 1;
		return acc;
	}, {});

console.log(milestoneStats);
```

---

## 🧠 How to Think for These Problems

1. **Visualize the nesting** – e.g., Division → Department → Employee → Projects → Milestones.
2. **Decide the traversal path** – do I need all employees? all projects? only certifications?
3. **Pick the tool**:

   - `map` → transform one-to-one.
   - `flatMap` → flatten nested arrays while mapping.
   - `filter` → pick only items meeting condition.
   - `reduce` → accumulate into object/statistics.
   - `for...of` / `forEach` → when side effects (logging, pushing).

4. **Corner cases**:

   - Missing keys (`undefined` or empty arrays).
   - Division/Department with **zero employees**.
   - Avoid dividing by 0 when calculating averages.
   - Duplicates → use `Set` when uniqueness is needed.

---

⚡ Now, I can design **10–15 such “hardest” questions** gradually escalating difficulty (mixing grouping, aggregation, nested filtering, transformations).

👉 Do you want me to continue and build a **full challenge set** (with solutions) so you can practice step by step?

Excellent 👌 That’s a _real_ corner case you will face in messy data.

If `salary` can sometimes be a **string** (`"85000"`) or **undefined**, then:

---

## 🔹 Problem

```js
acc[department].totalSalary += salary;
```

If `salary` is:

- `"85000"` → JavaScript does string concatenation instead of addition → `"08500085000..."` 😬
- `undefined` → `NaN` propagation → whole total becomes `NaN`.

---

## 🔹 Safe Handling

### ✅ Convert to Number and Default to 0

```js
let safeSalary = Number(salary) || 0;
acc[department].totalSalary += safeSalary;
```

- `Number("85000")` → `85000`
- `Number(undefined)` → `NaN` → `|| 0` → `0`
- Works even if salary is already a number.

---

### ✅ With Ternary (explicit check)

```js
let safeSalary =
	typeof salary === "number" && !isNaN(salary) ? salary : Number(salary) || 0;

acc[department].totalSalary += safeSalary;
```

---

### ✅ Using `parseFloat`

If salaries might have formatting (`"$85,000"`), `Number()` fails, but `parseFloat` extracts the number:

```js
let safeSalary = parseFloat(salary) || 0;
acc[department].totalSalary += safeSalary;
```

---

## 🔹 Full Example with Average

```js
const deptStatsObj = employees.reduce((acc, emp) => {
	const { department, salary } = emp;

	if (!acc[department]) {
		acc[department] = {
			headCountFromEmployees: 0,
			totalSalary: 0,
			avgSalary: 0,
		};
	}

	let safeSalary = Number(salary) || 0;

	acc[department].headCountFromEmployees++;
	acc[department].totalSalary += safeSalary;
	acc[department].avgSalary =
		acc[department].totalSalary / acc[department].headCountFromEmployees;

	return acc;
}, {});
```

---

## 🔹 Thinking Framework

Whenever you aggregate numeric fields:

1. **Normalize** → convert everything to `Number` or `0`.
2. **Validate** → check with `!isNaN()` before adding.
3. **Default** → fall back to `0` to avoid `NaN`.

---

👉 Do you want me to extend this and show **different strategies to clean data** (like salaries as `"85k"`, `"85,000"`, `$85,000`) before aggregation?

Perfect ⚡ Let’s go deep into **data cleaning strategies** for salaries (or any numeric field) before aggregation.

In real-world datasets, salaries may appear as:

- ✅ Numbers → `85000`
- ⚠️ Strings → `"85000"`, `"85,000"`, `"85k"`, `"$85,000"`
- ❌ Bad → `undefined`, `null`, `"N/A"`, `"--"`, empty string

If you don’t normalize them, your sums and averages will break.

---

# 🧼 Strategies to Clean Salary Data

---

## 🔹 1. Basic Conversion (safe fallback)

```js
let safeSalary = Number(salary) || 0;
```

✅ Handles numbers and numeric strings (`"85000"`).
❌ Fails on commas or special symbols.

---

## 🔹 2. Strip Non-Numeric Characters

```js
function cleanSalary(s) {
	if (typeof s === "number") return s; // already fine
	if (!s) return 0; // null/undefined/empty

	return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

cleanSalary("$85,000"); // 85000
cleanSalary("85k"); // 85   (⚠️ not 85000!)
```

⚠️ `"85k"` will turn into `85` unless we add extra logic.

---

## 🔹 3. Handle `"k"` and `"M"` suffixes (common shorthand)

```js
function cleanSalary(s) {
	if (typeof s === "number") return s;
	if (!s) return 0;

	let str = String(s)
		.toLowerCase()
		.replace(/[^0-9.km-]/g, "");

	if (str.endsWith("k")) return parseFloat(str) * 1000;
	if (str.endsWith("m")) return parseFloat(str) * 1000000;

	return parseFloat(str) || 0;
}

cleanSalary("85k"); // 85000
cleanSalary("1.2M"); // 1200000
cleanSalary("$85,000"); // 85000
```

---

## 🔹 4. Handle Missing/Invalid Values

```js
function cleanSalary(s) {
	if (s === undefined || s === null) return 0;
	if (s === "" || s === "N/A" || s === "--") return 0;
	return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}
```

---

## 🔹 5. Use in Aggregation

```js
const deptStatsObj = employees.reduce((acc, emp) => {
	const { department, salary } = emp;

	if (!acc[department]) {
		acc[department] = {
			headCountFromEmployees: 0,
			totalSalary: 0,
			avgSalary: 0,
		};
	}

	let safeSalary = cleanSalary(salary);

	acc[department].headCountFromEmployees++;
	acc[department].totalSalary += safeSalary;
	acc[department].avgSalary =
		acc[department].totalSalary / acc[department].headCountFromEmployees;

	return acc;
}, {});
```

---

# 🧠 Thinking Checklist for Dirty Data

Whenever you see a **numeric field** like salary, revenue, rating:

1. **Detect Format** – number, string, missing.
2. **Normalize** – strip symbols, parse as number.
3. **Handle Shortcuts** – `k`, `M`, `%`.
4. **Default** – treat invalid as `0` or `null` (depends on your use case).
5. **Validate** – check with `!isNaN(value)` before summing.

---

👉 Want me to prepare a **reusable utility module (`salaryCleaner.js`)** with functions like `cleanSalary`, `avgSalaryByDept`, etc., so you can import and reuse them in your projects?
