# 📚 React Router v6 — Object-Based Routing (`createBrowserRouter`) Notes

https://www.geeksforgeeks.org/reactjs/explain-the-purpose-of-the-browserrouter-and-route-components/

---

## 1️⃣ Basic Setup

```jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

const router = createBrowserRouter([
	{ path: "/", element: <Home /> },
	{ path: "/about", element: <About /> },
]);

function App() {
	return <RouterProvider router={router} />;
}
```

**Key Points:**

- `createBrowserRouter()` → defines routes as JS objects
- `RouterProvider` → renders the router
- Object-based routing replaces `<Routes>` and `<Route>` JSX
- You can attach **loader, action, errorElement** to routes

---

## 2️⃣ Nested Routes

```jsx
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Settings from "./pages/dashboard/Settings";

const router = createBrowserRouter([
	{
		path: "/dashboard",
		element: <DashboardLayout />,
		children: [
			{ index: true, element: <DashboardHome /> }, // default page
			{ path: "settings", element: <Settings /> },
		],
	},
]);
```

**Notes:**

- `<Outlet />` in `DashboardLayout` renders nested routes
- `index: true` → default child route for `/dashboard`
- Nested routes can themselves have children → deeply nested layouts

---

## 3️⃣ Loaders (Fetching Data Before Render)

```jsx
const router = createBrowserRouter([
	{
		path: "/users/:id",
		element: <UserProfile />,
		loader: async ({ params }) => {
			const res = await fetch(`/api/users/${params.id}`);
			if (!res.ok) throw new Error("User not found");
			return res.json();
		},
		errorElement: <UserError />,
	},
]);
```

- **`loader`** → fetch data **before the route renders**
- Receives `{ params, request }` as arguments
- **`useLoaderData()`** hook → access returned data

```jsx
import { useLoaderData } from "react-router-dom";

const UserProfile = () => {
	const user = useLoaderData();
	return <div>{user.name}</div>;
};
```

---

## 4️⃣ Actions (Form Submission / Mutations)

```jsx
const router = createBrowserRouter([
	{
		path: "/users/new",
		element: <NewUserForm />,
		action: async ({ request }) => {
			const formData = await request.formData();
			const name = formData.get("name");
			return await fetch("/api/users", {
				method: "POST",
				body: JSON.stringify({ name }),
			});
		},
	},
]);
```

**Notes:**

- **`action`** handles form submission for the route
- Receives `{ request, params }`
- Works seamlessly with `<Form>` component

---

## 5️⃣ `<Form>` Component

```jsx
import { Form, useNavigation, useActionData } from "react-router-dom";

const NewUserForm = () => {
	const actionData = useActionData(); // response from action
	const navigation = useNavigation(); // track submission state

	return (
		<Form method="post">
			<input name="name" placeholder="Name" />
			<button disabled={navigation.state === "submitting"}>
				{navigation.state === "submitting" ? "Saving..." : "Submit"}
			</button>
			{actionData?.error && <p>{actionData.error}</p>}
		</Form>
	);
};
```

**Notes:**

- `<Form>` automatically calls route `action`
- `useNavigation()` → `"idle" | "submitting" | "loading"`
- `useActionData()` → access response or validation errors

---

## 6️⃣ Error Handling

```jsx
const router = createBrowserRouter([
	{
		path: "/users/:id",
		element: <UserProfile />,
		loader: userLoader,
		errorElement: <UserError />,
	},
]);
```

- `errorElement` renders if **loader or action throws an error**
- Can show friendly messages or retry buttons

```jsx
const UserError = ({ error }) => (
	<div>
		<h2>Error!</h2>
		<p>{error.message}</p>
	</div>
);
```

---

## 7️⃣ Programmatic Navigation

```jsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/dashboard"); // go to dashboard
navigate("/login", { replace: true }); // replace history
```

- Works inside components and context logic

---

## 8️⃣ Redirects After Login / Logout

```jsx
import { useLocation, Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
	const { user } = useAuth();
	const location = useLocation();

	if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

	return children;
}
```

- `state.from` → redirect user **back to intended page** after login

---

## 9️⃣ Wildcard / Not Found Routes

```jsx
{
  path: "*",
  element: <NotFound />,
}
```

- Catches **all unmatched paths**
- Avoids blank screens

---

## 🔹 10️⃣ Scroll Restoration & Transitions

```jsx
import { ScrollRestoration } from "react-router-dom";

<RouterProvider router={router}>
	<ScrollRestoration /> {/* restores scroll positions automatically */}
</RouterProvider>;
```

- Combine with `useNavigation()` for **loading spinners**

---

## 11️⃣ Lazy Loading & Code Splitting

```jsx
import { lazy, Suspense } from "react";

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

<Suspense fallback={<div>Loading...</div>}>
	<RouterProvider router={router} />
</Suspense>;
```

- Lazy-load **entire route modules**
- Use `<Suspense>` to show fallback UI

---

## 12️⃣ Recommended File Structure

```
src/
├── context/
│   └── AuthContext.jsx
├── routes/
│   ├── AppRoutes.jsx
│   ├── ProtectedRoute.jsx
│   └── DashboardRoutes.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── DashboardHome.jsx
│   ├── Settings.jsx
│   ├── NotFound.jsx
│   └── UserError.jsx
├── layouts/
│   └── DashboardLayout.jsx
└── App.jsx
```

- Organizes routes, layouts, pages, and context
- Supports nested routes, auth, lazy-loading

---

## ✅ Key Hooks / Components Summary

| Hook / Component        | Purpose                             |
| ----------------------- | ----------------------------------- |
| `useNavigate()`         | Navigate programmatically           |
| `useLocation()`         | Get current URL & state             |
| `useParams()`           | Get route params                    |
| `useSearchParams()`     | Query params                        |
| `useLoaderData()`       | Access route loader data            |
| `useActionData()`       | Access form/action result           |
| `useNavigation()`       | Track submitting/loading state      |
| `<Outlet>`              | Render nested routes                |
| `<Form>`                | Declarative form submission         |
| `<ScrollRestoration>`   | Restore scroll positions            |
| `errorElement` property | Show UI for loader/action errors    |
| `loader` property       | Pre-fetch route data                |
| `action` property       | Handle route-based form submissions |

---

This is a **complete reference for `createBrowserRouter` / object-based routing**, covering:

- Routes & nested routes
- Form handling & submissions
- Loaders, actions, and error handling
- Protected routes & redirects
- Scroll restoration & transitions
- Lazy loading & code splitting

🔥 Excellent — this question is **100% guaranteed** to come up if your mentor checks your routing setup!
Let’s unpack **everything** about `BrowserRouter`, `Routes`, `Route`, and `RouterProvider` (especially in React Router v6+ / v7).

I’ll explain **conceptually first**, then show **real code examples** so you can visualize it clearly.

---

## 🧠 The Core Idea

In React Router, routing means **showing different components depending on the URL path**.

For example:

- `/` → Home page
- `/boards` → Boards page
- `/boards/:id` → Specific board page

To make that work, we use:

1. A **Router** — defines _how_ navigation works (Browser, Hash, Memory).
2. A **Provider** — gives that router to React.
3. **Routes** + **Route** — define _what to show_ for each path.

---

## 🧩 1️⃣ `BrowserRouter`

```jsx
import { BrowserRouter } from "react-router-dom";

<BrowserRouter>
	<App />
</BrowserRouter>;
```

### 🔍 What it does:

- Keeps your **UI in sync with the browser URL**.
- Uses the **HTML5 History API** (`pushState`, `popstate`) to change URLs _without reloading the page_.
- Automatically handles forward/back navigation.

So it’s like saying:

> “React, please watch the browser’s address bar and show the correct component.”

---

## 🧩 2️⃣ `Routes` and `Route`

```jsx
import { Routes, Route } from "react-router-dom";

<Routes>
	<Route path="/" element={<Home />} />
	<Route path="/boards" element={<Boards />} />
	<Route path="/boards/:id" element={<BoardDetails />} />
</Routes>;
```

### 🔍 What happens here:

- `Routes` is a **container** that looks at the current URL.
- It finds the first `Route` whose `path` matches the URL.
- It then renders the `element` (your component).

So if URL = `/boards/123`,
`<BoardDetails />` will render because it matches `"/boards/:id"`.

---

## 🧩 3️⃣ `RouterProvider` (newer style, React Router v6.4+)

In older versions, you manually wrapped everything in `<BrowserRouter>` and `<Routes>`.
Now, React Router introduced a **data-aware API** using `createBrowserRouter()` and `RouterProvider`.

### Example:

```jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import Boards from "./pages/Boards";
import Board from "./pages/Board";

const router = createBrowserRouter([
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{ path: "boards", element: <Boards /> },
			{ path: "boards/:id", element: <Board /> },
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}
```

---

### 🔍 What’s happening:

1. `createBrowserRouter()` creates a **router object** — a full tree of routes, layouts, loaders, and actions.
2. `RouterProvider` takes that router and **renders the correct component** based on the current URL.

---

## ⚙️ Why “Render Object” (or “router object”)?

When you do this:

```js
const router = createBrowserRouter([...]);
```

It doesn’t render anything by itself — it just **returns a configuration object** describing all your routes.

So `RouterProvider` is like saying:

> “Here’s my route map — please render the correct page depending on the current URL.”

Without `RouterProvider`, React wouldn’t know how to interpret the router configuration.

---

## 🧭 Visualization

```
<RouterProvider router={router} />
        ↓
<BrowserRouter>
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route path="boards" element={<Boards />} />
      <Route path="boards/:id" element={<Board />} />
    </Route>
  </Routes>
</BrowserRouter>
```

The new syntax is **cleaner and more powerful**, especially when using:

- **Nested routes**
- **Loaders** (fetch data before rendering)
- **Actions** (for form submissions)
- **Error boundaries**

---

## 🧠 Mentor-friendly Summary

If your mentor asks, here’s a solid 30-second explanation:

> “`BrowserRouter` manages navigation using the browser’s history API, keeping the UI in sync with the URL.
> `Routes` is a container that picks which `Route` to show based on the path.
> Each `Route` maps a URL path to a React component.
>
> In React Router v6.4+, we now use `createBrowserRouter()` to build a router object and give it to `RouterProvider`.
> The provider takes care of rendering the right element when the URL changes — it’s more declarative and supports advanced features like loaders and actions.”

---

## ⚡ Bonus Tip

If you add this line in `vite.config.js`:

```json
{
	"rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

That ensures **refreshing `/boards/123`** won’t 404 — Vite will serve `index.html`, and React Router takes over.

---

Would you like me to show a **visual diagram** (like a flow chart) of how BrowserRouter → Routes → Route → RouterProvider connect together? It’s great to include in your README or presentation.
