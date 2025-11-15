Awesome 😎 — now we move into **Topic 11️⃣: Data APIs in React Router v6.4+**.

This is a **big feature** in modern React Router: it allows your routes to **load data declaratively** and handle **form submissions** directly inside routes.

---

# 📦 React Router v6.4+ — Data APIs

---

## 🧭 1️⃣ What Are Data APIs?

React Router v6.4 introduced a **data-driven routing system**, inspired by frameworks like Remix.

Key concepts:

- **loader** → fetch data before route renders
- **action** → handle form submissions / mutations
- **useLoaderData()** → access data from loader
- **useActionData()** → access response from action
- **defer()** → support for streaming / lazy data

---

## ⚙️ 2️⃣ Loader — Fetch Data Before Rendering

**Loader** is a function attached to a route that **runs before the component renders**.

### 🧩 Example:

```jsx
import {
	createBrowserRouter,
	RouterProvider,
	Route,
	useLoaderData,
} from "react-router-dom";

// Loader function
async function usersLoader() {
	const res = await fetch("https://jsonplaceholder.typicode.com/users");
	return res.json();
}

// Component
function Users() {
	const users = useLoaderData(); // ✅ access loader data
	return (
		<div>
			<h2>Users</h2>
			<ul>
				{users.map((u) => (
					<li key={u.id}>{u.name}</li>
				))}
			</ul>
		</div>
	);
}

// Router
const router = createBrowserRouter([
	{
		path: "/users",
		element: <Users />,
		loader: usersLoader,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
```

### 🧠 Notes:

- Loader runs **before the component mounts**
- Data is available immediately via `useLoaderData()`
- Avoid doing side-effects here (like `localStorage` writes)

---

## 🔄 3️⃣ Action — Handle Form Submissions

**Action** handles form submissions declaratively at the route level.

### 🧩 Example:

```jsx
import { Form, redirect, useActionData } from "react-router-dom";

// Action function
async function loginAction({ request }) {
	const formData = await request.formData();
	const username = formData.get("username");

	if (!username) return { error: "Username is required" };

	// simulate login
	localStorage.setItem("user", username);
	return redirect("/dashboard"); // redirect after login
}

// Component
function Login() {
	const actionData = useActionData();
	return (
		<Form method="post">
			<input type="text" name="username" placeholder="Username" />
			<button type="submit">Login</button>
			{actionData?.error && <p>{actionData.error}</p>}
		</Form>
	);
}

// Router
const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
		action: loginAction,
	},
]);
```

### 🧠 Notes:

- `Form` automatically posts to the route’s `action`
- `useActionData()` reads any data returned from the action (e.g., errors)
- `redirect()` allows navigation after submission

---

## ⚡ 4️⃣ Combining Loader & Action

You can **combine loader and action** on the same route:

```jsx
{
  path: "/profile",
  element: <Profile />,
  loader: profileLoader,
  action: profileAction,
}
```

- `loader` fetches initial data
- `action` handles updates / submissions

---

## 🔄 5️⃣ `defer()` — Lazy / Streaming Data

`defer()` lets you **stream data** and show parts of the UI while other parts are still loading.

```jsx
import { defer, Await, useLoaderData } from "react-router-dom";

function usersLoader() {
	return defer({
		users: fetch("https://jsonplaceholder.typicode.com/users").then((res) =>
			res.json()
		),
	});
}

function Users() {
	const data = useLoaderData();
	return (
		<Suspense fallback={<p>Loading users...</p>}>
			<Await resolve={data.users}>
				{(users) => (
					<ul>
						{users.map((u) => (
							<li key={u.id}>{u.name}</li>
						))}
					</ul>
				)}
			</Await>
		</Suspense>
	);
}
```

- Shows fallback while data is still loading
- Improves perceived performance for large datasets

---

## 🧠 6️⃣ Key Hooks / Concepts Summary

| Hook / Concept    | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `loader`          | Fetch data before rendering the route     |
| `action`          | Handle form submissions / mutations       |
| `useLoaderData()` | Access loader data in the component       |
| `useActionData()` | Access action result / errors             |
| `redirect()`      | Programmatic redirect after action        |
| `defer()`         | Stream / lazy load large data sets        |
| `<Form>`          | Automatically posts to the route’s action |

---

## 🪄 7️⃣ Real-World Example

- **Dashboard page**: loader fetches initial stats
- **Edit form page**: action updates data and redirects
- **Users list**: defer loads users while main layout shows immediately

---

✅ **Next Topic (12️⃣):**
**Navigation & Form APIs**:

- `useNavigation()` — track route transitions
- `<Form>` advanced usage
- Optimistic UI, pending states, and canceling navigations

Do you want me to continue with that next?
