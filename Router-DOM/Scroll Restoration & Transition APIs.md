Perfect 😎 — now let’s move to **Topic 13️⃣: Scroll Restoration & Transition APIs** in **React Router v6**.

These are essential for **better UX**, especially in SPAs where page navigation doesn’t automatically scroll like traditional websites.

---

# 🔄 Scroll Restoration & Transition APIs (React Router v6)

---

## 1️⃣ Scroll Restoration

In traditional websites, navigating to a new page automatically scrolls to the top.
In React SPA, route changes **don’t reset scroll** by default — which can confuse users.

React Router v6 provides **scroll restoration utilities**.

---

### ⚙️ Automatic Scroll Restoration

```jsx
import {
	BrowserRouter,
	Routes,
	Route,
	ScrollRestoration,
} from "react-router-dom";

function App() {
	return (
		<BrowserRouter>
			<ScrollRestoration /> {/* 🔹 Automatically restores scroll positions */}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</BrowserRouter>
	);
}
```

- `<ScrollRestoration />` tracks **scroll positions** for each route.
- Works with **back/forward navigation**.

---

### ⚙️ Manual Scroll Control

Sometimes you want to **customize scroll behavior**:

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0); // scroll to top on route change
	}, [pathname]);

	return null;
}

// Usage
<BrowserRouter>
	<ScrollToTop />
	<Routes>...</Routes>
</BrowserRouter>;
```

✅ Works for **pages that require scroll reset** or SPA-style navigation.

---

## 2️⃣ Transitions & Pending States (`useNavigation()`)

`useNavigation()` (from Data APIs) can also help with **route transitions**:

```jsx
import { useNavigation } from "react-router-dom";

function Page() {
	const navigation = useNavigation();

	return (
		<div>
			{navigation.state === "loading" && <p>Loading page...</p>}
			<p>Page content here</p>
		</div>
	);
}
```

- `"idle"` → no navigation
- `"loading"` → route is loading
- `"submitting"` → form is being submitted

**Use case:** show a **progress bar or spinner** at top of page while route is changing.

---

### ⚡ Example: Top Loading Bar

```jsx
import { useNavigation } from "react-router-dom";

function TopLoader() {
	const navigation = useNavigation();

	return navigation.state !== "idle" ? (
		<div style={{ height: 4, background: "blue", width: "100%" }} />
	) : null;
}

// Usage
<BrowserRouter>
	<TopLoader />
	<Routes>...</Routes>
</BrowserRouter>;
```

- Gives **instant feedback** during slow route transitions.

---

## 3️⃣ Smooth Page Transitions

You can combine **CSS transitions** with `useNavigation()`:

```jsx
const navigation = useNavigation();

<div className={`page ${navigation.state !== "idle" ? "fade-out" : "fade-in"}`}>
	<Content />
</div>;
```

```css
.fade-in {
	opacity: 1;
	transition: opacity 0.3s;
}
.fade-out {
	opacity: 0.5;
	transition: opacity 0.3s;
}
```

- Smoothly fades pages in/out during navigation.
- Great for dashboards, blogs, or multi-step forms.

---

## 4️⃣ Scroll Restoration + Lazy Loading

Combine with **lazy-loaded routes**:

```jsx
<Suspense fallback={<p>Loading...</p>}>
	<ScrollRestoration />
	<Routes>...</Routes>
</Suspense>
```

- Ensures **scroll resets** even when component is lazy-loaded.

---

## 🧠 Summary Table

| Feature                 | Purpose                             | Implementation                        |
| ----------------------- | ----------------------------------- | ------------------------------------- |
| `<ScrollRestoration />` | Automatic scroll position tracking  | Wrap inside `<BrowserRouter>`         |
| Custom `ScrollToTop`    | Force scroll to top on route change | `useLocation()` + `window.scrollTo()` |
| `useNavigation()`       | Track transitions / pending states  | Show spinners or disable buttons      |
| CSS Transitions         | Smooth visual page transitions      | Combine with `useNavigation().state`  |

---

## 🔹 Real-World Usage

- Long content pages → reset scroll to top
- Multi-step forms → track submission/loading states
- Dashboards → lazy-loaded widgets + scroll restoration
- Blogs or docs → maintain scroll position on back/forward navigation

---

✅ **Next Topic (14️⃣ — Final):**
**Advanced Patterns & Best Practices**

- Nested routes best practices
- Layout components
- Route grouping
- Code organization

Do you want me to continue with that final topic next?
