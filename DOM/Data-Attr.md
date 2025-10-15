## 🧩 `dataset` (Custom Data Attributes)

### 📘 Definition:

Lets you store **custom data** inside HTML elements using `data-*` attributes and access them easily in JS via `.dataset`.

### 🧠 Why:

Used to store small bits of extra info — like IDs, states, or options — without cluttering attributes.

### 🧮 Example:

```html
<button id="userBtn" data-user-id="42" data-role="admin">Click Me</button>

<script>
	const btn = document.getElementById("userBtn");
	console.log(btn.dataset.userId); // "42"
	console.log(btn.dataset.role); // "admin"

	btn.dataset.active = "true"; // add new data attribute dynamically
	console.log(btn.outerHTML);
	// <button data-user-id="42" data-role="admin" data-active="true">...</button>
</script>
```

🟢 Great for:

- Passing info between HTML & JS
- Making dynamic components (e.g., `data-index`, `data-product-id`, etc.)

---
