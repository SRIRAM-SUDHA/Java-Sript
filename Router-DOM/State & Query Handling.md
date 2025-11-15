Awesome ⚡ Let’s continue with the **next major block** —

# ⚙️ React Router DOM v6 — State & Query Handling

This section covers how to handle **URL state**, **query parameters**, and **programmatic routing** in React Router v6 — crucial for building real-world apps like dashboards, filters, and dynamic views.

---

## 🧩 1. Passing State through `Link` or `Navigate`

### 🧠 What It Is:

Sometimes, you want to **pass temporary data** while navigating — like user info, search results, or a redirect message — **without putting it in the URL**.

You can do that using the `state` prop in `<Link>` or when calling `navigate()`.

---

### 🧩 Example 1: Passing state with `Link`

```jsx
import {
	BrowserRouter,
	Routes,
	Route,
	Link,
	useLocation,
} from "react-router-dom";

function Home() {
	return (
		<div>
			<h2>Home</h2>
			<Link to="/profile" state={{ from: "home", userId: 42 }}>
				Go to Profile
			</Link>
		</div>
	);
}

function Profile() {
	const location = useLocation();
	console.log(location.state); // 👉 { from: "home", userId: 42 }

	return (
		<div>
			<h2>Profile Page</h2>
			<p>Came from: {location.state?.from}</p>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
```

---

### 🧩 Example 2: Passing state with `useNavigate`

```jsx
import { useNavigate } from "react-router-dom";

function Login() {
	const navigate = useNavigate();

	const handleLogin = () => {
		// After login success
		navigate("/dashboard", { state: { message: "Welcome back!" } });
	};

	return <button onClick={handleLogin}>Login</button>;
}
```

Then in Dashboard:

```jsx
const location = useLocation();
console.log(location.state?.message);
```

---

### 🧠 Key Points

- Data passed via `state` **does not persist on refresh** (not stored in URL).
- Useful for one-time messages or redirects.
- Access with `useLocation().state`.

---

## 🧭 2. `useSearchParams` — Handling Query Strings

### 🧠 What It Is:

`useSearchParams` lets you read and update the **query string** in the URL — like `/products?category=shoes&page=2`.

---

### 🧩 Example:

```jsx
import {
	BrowserRouter,
	Routes,
	Route,
	useSearchParams,
} from "react-router-dom";

function Products() {
	const [searchParams, setSearchParams] = useSearchParams();

	const category = searchParams.get("category") || "all";
	const page = searchParams.get("page") || 1;

	return (
		<div>
			<h2>Products Page</h2>
			<p>Category: {category}</p>
			<p>Page: {page}</p>

			<button onClick={() => setSearchParams({ category: "books", page: 2 })}>
				Go to Books Page 2
			</button>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/products" element={<Products />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
```

### 🧠 Key Notes:

- `searchParams.get('key')` → Read values.
- `setSearchParams({ key: value })` → Updates URL without reload.
- Query params persist on refresh.
- Works great for filters, pagination, or search.

---

## ⚙️ 3. `useRoutes()` — Declarative Routing

### 💡 What It Is:

Instead of writing `<Routes>` and `<Route>` elements, you can **define routes as an array of objects**.
This approach is **cleaner** for larger apps or dynamically loaded route trees.

---

### 🧩 Example:

```jsx
import { BrowserRouter, useRoutes } from "react-router-dom";

function Home() {
	return <h2>Home</h2>;
}
function About() {
	return <h2>About</h2>;
}
function NotFound() {
	return <h2>404 Not Found</h2>;
}

function AppRoutes() {
	// ✅ Define routes as a JS object
	const routes = useRoutes([
		{ path: "/", element: <Home /> },
		{ path: "about", element: <About /> },
		{ path: "*", element: <NotFound /> },
	]);

	return routes;
}

function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	);
}

export default App;
```

---

### 🧠 Why Use This:

- Easier to generate routes dynamically from config.
- Cleaner for large applications.
- Works perfectly with nested routes:

  ```js
  const routes = [
  	{
  		path: "dashboard",
  		element: <Dashboard />,
  		children: [
  			{ index: true, element: <Overview /> },
  			{ path: "settings", element: <Settings /> },
  		],
  	},
  ];
  ```

---

## ⚠️ Common Pitfalls

| ❌ Mistake                                    | ✅ Correct Way                                        |
| --------------------------------------------- | ----------------------------------------------------- |
| Forgetting to use `useLocation` for state     | Always access state with `useLocation()`              |
| Using state for persistent data               | Use `searchParams` for that                           |
| Calling `useRoutes()` outside `BrowserRouter` | Must be **inside** router                             |
| Using old `useHistory()` or `useRouteMatch()` | Replaced with `useNavigate()` and nested routes in v6 |

---

## 🧠 Summary Table

| Concept                 | Purpose                            | Hook / Element        |
| ----------------------- | ---------------------------------- | --------------------- |
| Link / Navigate `state` | Pass temporary data between routes | `useLocation().state` |
| useSearchParams         | Manage URL query strings           | `useSearchParams()`   |
| useRoutes               | Object-based routing               | `useRoutes()`         |

---

## 🪄 Real-World Usage Example

Use all three together:

```jsx
<Link to="/products?category=tech" state={{ from: "home" }}>
	Tech Products
</Link>
```

Then in `/products`:

```jsx
const [params] = useSearchParams();
const category = params.get("category");
const location = useLocation();
console.log(location.state?.from);
```

---

✅ **You now know:**

- How to pass state between routes (`state` prop)
- How to manage query strings (`useSearchParams`)
- How to define routes declaratively (`useRoutes`)

---

Next, we can move to **Authentication & Protected Routes**, which covers:

1. Creating protected routes
2. Role-based access
3. Redirects after login/logout

Would you like me to continue with that next?
