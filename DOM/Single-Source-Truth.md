Good question — understanding **Single Source of Truth (SSOT)** is crucial when building front-end apps, especially forms or multi-step flows like the one in your exercise.

Let’s break it down clearly 👇

---

### 🧠 What is “Single Source of Truth”?

**Single Source of Truth (SSOT)** means that your **data lives in one central place**, and every part of your application that needs that data gets it from there — instead of keeping separate, possibly inconsistent copies.

In other words:

> There should be **only one authoritative data source** for any given piece of information in your app.

---

### ⚙️ Example (Without SSOT)

Imagine you’re building a **multi-step form** with three steps:

1. Personal Info
2. Address
3. Summary

If each step keeps its own local state like this:

```js
// Step1.jsx
const [name, setName] = useState("");

// Step2.jsx
const [address, setAddress] = useState("");
```

Now you have **multiple sources of truth** — one in each component.
If you change `name` in Step 1 and want to display it in Step 3 (summary), you have to pass it down or synchronize manually. This is error-prone and hard to maintain.

---

### ✅ Example (With SSOT)

Instead, you can store **all form data in a single shared state** (for example, in a parent component or global store like Redux, Zustand, or React Context):

```js
// App.jsx
const [formData, setFormData] = useState({
	name: "",
	address: "",
	email: "",
});

function updateFormData(key, value) {
	setFormData((prev) => ({ ...prev, [key]: value }));
}
```

Then you pass `formData` and `updateFormData` down to each step:

```js
<Step1 data={formData} update={updateFormData} />
<Step2 data={formData} update={updateFormData} />
<Step3 data={formData} />
```

Now, every component reads and updates **the same source of truth** — the `formData` object in the parent.
✅ Changes made in one place are instantly reflected everywhere.

---

### 🧩 How to Apply This in the Project

Since your project is a **multi-step form**, you can:

1. Create a top-level `formData` state (object) that holds all form inputs.
2. Pass `formData` and a function to update it (`setFormData`) to each step component.
3. Use that single state to render the summary and submit the final form.

**Technically:**

- You can manage it via React’s `useState` (for small projects).
- Or use Context API / Zustand / Redux (for larger or deeply nested projects).

---

### 🧵 In Simple Terms

| Without SSOT                           | With SSOT                     |
| -------------------------------------- | ----------------------------- |
| Data spread across multiple components | Data centralized in one place |
| Hard to sync updates                   | Easy to maintain consistency  |
| Risk of mismatch                       | One true version of state     |

---

Absolutely ✅ — you **can and should** use `localStorage` when you want to **persist your Single Source of Truth (SSOT)** between page reloads.

Let’s go over how and why 👇

---

## 🧠 Why Use `localStorage`

By default, your `formData` object only lives **in memory**, so if the user refreshes the page, everything is lost.

`localStorage` lets you **save your SSOT object permanently** in the browser — until the user clears it manually.
That means your form can “remember” what the user typed, even after a refresh.

---

## ⚙️ How to Use It

Here’s how to integrate `localStorage` with the **SSOT pattern** in vanilla JS:

### 1. Initialize from localStorage (if data exists)

```js
let formData = JSON.parse(localStorage.getItem("formData")) || {
	name: "",
	email: "",
};
```

This ensures:

- If there’s saved data → use it
- If not → start with empty fields

---

### 2. Create a unified update function

Every time you update the form data, also update localStorage:

```js
function updateFormData(key, value) {
	formData[key] = value;
	localStorage.setItem("formData", JSON.stringify(formData));
	console.log("Updated formData:", formData);
}
```

Now your **SSOT (formData)** stays synced between memory and storage.

---

### 3. Pre-fill fields from saved data

When the page loads, you can fill form fields automatically:

```js
window.addEventListener("DOMContentLoaded", () => {
	if (formData.name) document.getElementById("name").value = formData.name;
	if (formData.email) document.getElementById("email").value = formData.email;
});
```

---

### 4. (Optional) Clear storage on submit

If you want to clear saved data after submission:

```js
document.getElementById("submit").addEventListener("click", () => {
	alert("Form submitted!");
	localStorage.removeItem("formData");
});
```

---

### ✅ Full Example (SSOT + localStorage)

```js
// 1. Load existing data or start new
let formData = JSON.parse(localStorage.getItem("formData")) || {
	name: "",
	email: "",
};

// 2. Update and persist
function updateFormData(key, value) {
	formData[key] = value;
	localStorage.setItem("formData", JSON.stringify(formData));
	console.log("Updated:", formData);
}

// 3. Step handling
function showStep(step) {
	document.querySelectorAll(".step").forEach((s, i) => {
		s.style.display = i === step - 1 ? "block" : "none";
	});
}

// 4. Pre-fill inputs
window.addEventListener("DOMContentLoaded", () => {
	document.getElementById("name").value = formData.name || "";
	document.getElementById("email").value = formData.email || "";
});

// Step 1 → Step 2
document.getElementById("next-1").addEventListener("click", () => {
	updateFormData("name", document.getElementById("name").value.trim());
	showStep(2);
});

// Step 2 → Step 3
document.getElementById("next-2").addEventListener("click", () => {
	updateFormData("email", document.getElementById("email").value.trim());
	showStep(3);
	document.getElementById(
		"summary"
	).textContent = `Name: ${formData.name}, Email: ${formData.email}`;
});

// Navigation & submit
document.getElementById("prev-2").addEventListener("click", () => showStep(1));
document.getElementById("prev-3").addEventListener("click", () => showStep(2));
document.getElementById("submit").addEventListener("click", () => {
	console.log("Final form data:", formData);
	alert("Form submitted!");
	localStorage.removeItem("formData"); // clear saved data
});
```

---

### 🧩 Summary

| Goal                          | Code Feature                             |
| ----------------------------- | ---------------------------------------- |
| Keep a single source of truth | `formData` object                        |
| Persist data between reloads  | `localStorage`                           |
| Keep UI in sync               | Load values on DOMContentLoaded          |
| Avoid duplicate sources       | Always update through `updateFormData()` |

---

Excellent — you’re asking the _right_ question! 👏

Let’s unpack what **“Keep UI in sync (Load values on `DOMContentLoaded`)”** actually means and how to do it in **vanilla JavaScript**, step by step.

---

## 🧠 What “Keep UI in sync” Means

When we talk about **Single Source of Truth (SSOT)** — your `formData` object is the _only_ place where the true data lives.

> “Keeping the UI in sync” means that the **visible form fields** (inputs, labels, summaries, etc.) should **always reflect what’s inside `formData`**, even after reloading the page.

If your `formData` says:

```js
{ name: "Alice", email: "alice@example.com" }
```

Then your input boxes should _show_:

```
Name: Alice
Email: alice@example.com
```

---

## ⚙️ Why Use `DOMContentLoaded`

When a web page loads, scripts can run **before** the HTML is fully loaded.
`DOMContentLoaded` is an event that fires when the HTML document is completely parsed and ready — meaning you can safely access and update DOM elements.

So this ensures:

- The form elements exist
- You can safely fill them with data from `formData`

---

## ✅ How to Do It (Example)

Let’s say you have this HTML:

```html
<input type="text" id="name" placeholder="Enter your name" />
<input type="email" id="email" placeholder="Enter your email" />
```

And your Single Source of Truth in JavaScript:

```js
// Load saved data if it exists
let formData = JSON.parse(localStorage.getItem("formData")) || {
	name: "",
	email: "",
};
```

Now, to **keep the UI in sync**, you do this:

```js
window.addEventListener("DOMContentLoaded", () => {
	// Set the input values based on formData
	document.getElementById("name").value = formData.name;
	document.getElementById("email").value = formData.email;
});
```

So as soon as the page finishes loading:

- If the user had data saved in `localStorage`,
  → it’s loaded into `formData`
- Then, the inputs are automatically filled in to match it

This keeps your **UI** (the inputs) and your **data** (`formData`) perfectly aligned.

---

## 🔁 Keeping It Synced Both Ways

To make it _bi-directional_ — i.e., updates in the UI also update the data — listen for input changes:

```js
document.getElementById("name").addEventListener("input", (e) => {
	formData.name = e.target.value;
	localStorage.setItem("formData", JSON.stringify(formData));
});

document.getElementById("email").addEventListener("input", (e) => {
	formData.email = e.target.value;
	localStorage.setItem("formData", JSON.stringify(formData));
});
```

Now:

- When user types → `formData` updates
- When page loads → input values update from `formData`

✅ Both are **always in sync**.

---

## 🧩 In Short

| Concept                    | Meaning                                    | How to Achieve                                     |
| -------------------------- | ------------------------------------------ | -------------------------------------------------- |
| **Single Source of Truth** | One data object holds the real state       | `let formData = {...}`                             |
| **Keep UI in Sync**        | Inputs always show what’s in `formData`    | Set `.value` from data                             |
| **On DOMContentLoaded**    | Wait until the page is ready to modify DOM | `window.addEventListener("DOMContentLoaded", ...)` |
| **Two-way sync**           | Update both UI → data and data → UI        | Use event listeners and data binding manually      |

---

Would you like me to show a **complete working example** (HTML + JS) that demonstrates both one-way and two-way syncing clearly?

Perfect! Let’s build a **complete working example** of a **multi-step form** in **vanilla JS** that demonstrates:

1. Single Source of Truth (`formData`)
2. Loading values on `DOMContentLoaded` (keep UI in sync)
3. Two-way syncing (inputs update `formData` and vice versa)
4. Persisting data using `localStorage`

---

## ✅ HTML

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Multi-Step Form</title>
		<script defer src="form.js"></script>
		<style>
			.step {
				display: none;
			}
			.step.active {
				display: block;
			}
		</style>
	</head>
	<body>
		<div id="step-1" class="step">
			<h2>Step 1: Personal Info</h2>
			<input type="text" id="name" placeholder="Enter your name" />
			<button id="next-1">Next</button>
		</div>

		<div id="step-2" class="step">
			<h2>Step 2: Contact Info</h2>
			<input type="email" id="email" placeholder="Enter your email" />
			<button id="prev-2">Back</button>
			<button id="next-2">Next</button>
		</div>

		<div id="step-3" class="step">
			<h2>Step 3: Summary</h2>
			<p id="summary"></p>
			<button id="prev-3">Back</button>
			<button id="submit">Submit</button>
		</div>
	</body>
</html>
```

---

## ✅ JavaScript (`form.js`)

```js
// 1️⃣ Single Source of Truth (SSOT)
let formData = JSON.parse(localStorage.getItem("formData")) || {
	name: "",
	email: "",
};

// 2️⃣ Utility: update data and persist
function updateFormData(key, value) {
	formData[key] = value;
	localStorage.setItem("formData", JSON.stringify(formData));
	console.log("Updated formData:", formData);
}

// 3️⃣ Show specific step
function showStep(stepNumber) {
	document.querySelectorAll(".step").forEach((step, index) => {
		step.classList.toggle("active", index === stepNumber - 1);
	});
}

// 4️⃣ Keep UI in sync on page load
window.addEventListener("DOMContentLoaded", () => {
	// Pre-fill inputs from SSOT
	document.getElementById("name").value = formData.name;
	document.getElementById("email").value = formData.email;

	// Show first step
	showStep(1);

	// 5️⃣ Two-way binding: input changes update formData
	document.getElementById("name").addEventListener("input", (e) => {
		updateFormData("name", e.target.value);
	});

	document.getElementById("email").addEventListener("input", (e) => {
		updateFormData("email", e.target.value);
	});

	// Navigation buttons
	document
		.getElementById("next-1")
		.addEventListener("click", () => showStep(2));
	document
		.getElementById("prev-2")
		.addEventListener("click", () => showStep(1));
	document.getElementById("next-2").addEventListener("click", () => {
		showStep(3);
		document.getElementById(
			"summary"
		).textContent = `Name: ${formData.name}, Email: ${formData.email}`;
	});
	document
		.getElementById("prev-3")
		.addEventListener("click", () => showStep(2));

	// Submit button
	document.getElementById("submit").addEventListener("click", () => {
		alert(`Form submitted!\nName: ${formData.name}\nEmail: ${formData.email}`);
		localStorage.removeItem("formData"); // Clear stored data
		formData = { name: "", email: "" }; // Reset SSOT
		showStep(1);
		document.getElementById("name").value = "";
		document.getElementById("email").value = "";
		document.getElementById("summary").textContent = "";
	});
});
```

---

### ✅ How It Works

1. **SSOT:** All data is stored in `formData`.
2. **Persistent Storage:** Every change updates `localStorage`.
3. **UI Sync on Load:** `DOMContentLoaded` ensures inputs are filled from `formData`.
4. **Two-Way Binding:** Any typing updates `formData` immediately.
5. **Navigation & Summary:** Each step reads from the SSOT and summary shows live data.

---

If you want, I can **enhance this example using TailwindCSS** so the multi-step form looks **modern and responsive** while keeping the same SSOT + localStorage logic.

Do you want me to do that next?
