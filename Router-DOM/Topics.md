Perfect — learning **React Router DOM** is one of the key skills for building real-world React web apps! 🚀

Let’s make a **structured roadmap** with topics in the **right learning order**, including **fundamentals → intermediate → advanced concepts**, along with **common pitfalls** and **real-world patterns**.

---

## 🧭 **React Router DOM Learning Roadmap (for Web)**

### 🩵 1. **Basics & Setup**

Before diving into routes:

- ✅ Understand what **Client-Side Routing** is and how it differs from **Server-Side Routing**
- ✅ Why React needs React Router
- ✅ Installation

  ```bash
  npm install react-router-dom
  ```

- ✅ Folder structure for routing (e.g., `src/pages`, `src/components`, `src/routes`)

---

### 💡 2. **Core Components & Concepts**

These are the building blocks of React Router:

| Concept            | Description                        | Example                                                                                     |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| **BrowserRouter**  | Wraps your app to enable routing   | `<BrowserRouter><App /></BrowserRouter>`                                                    |
| **Routes & Route** | Define individual routes           | `<Route path="/about" element={<About />} />`                                               |
| **Link**           | Navigate without page reload       | `<Link to="/about">About</Link>`                                                            |
| **NavLink**        | Like Link, but with active styling | `<NavLink to="/about" className={({isActive}) => isActive ? "active" : ""}>About</NavLink>` |
| **Navigate**       | Programmatically redirect          | `<Navigate to="/login" replace />`                                                          |

---

### 🧭 3. **Dynamic Routing**

Handle routes that depend on data:

- `:params` → Route parameters

  ```jsx
  <Route path="/user/:id" element={<User />} />
  ```

- `useParams()` → Access params

  ```jsx
  const { id } = useParams();
  ```

- Wildcards (`*`) for 404 or nested routes

  ```jsx
  <Route path="*" element={<NotFound />} />
  ```

---

### 🧩 4. **Nested Routes (Layout Routes)**

Learn how to structure reusable layouts:

```jsx
<Route path="/" element={<Layout />}>
	<Route index element={<Home />} />
	<Route path="about" element={<About />} />
</Route>
```

- `Outlet` → placeholder for nested components
- `index` route → default child route
- File structure for layouts (like `DashboardLayout`, `PublicLayout`)

---

### ⚙️ 5. **Navigation Hooks**

| Hook            | Purpose                                |
| --------------- | -------------------------------------- |
| `useNavigate()` | Navigate programmatically              |
| `useLocation()` | Get current URL, state                 |
| `useParams()`   | Access route params                    |
| `useRoutes()`   | Define routes via object configuration |

Example:

```jsx
const navigate = useNavigate();
navigate("/login", { replace: true });
```

---

### 🧠 6. **Route State & Search Params**

- `useSearchParams()` for query strings

  ```jsx
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  setSearchParams({ filter: "active" });
  ```

- Passing `state` with navigation

  ```jsx
  <Link to="/profile" state={{ fromDashboard: true }} />
  ```

- Accessing state:

  ```jsx
  const location = useLocation();
  console.log(location.state.fromDashboard);
  ```

---

### 🔐 7. **Protected & Private Routes**

- How to protect routes (e.g., only allow logged-in users)
- Create a `PrivateRoute` wrapper:

  ```jsx
  function PrivateRoute({ children }) {
  	return isAuth ? children : <Navigate to="/login" />;
  }
  ```

- Nested protected routes inside authenticated layouts

---

### 🌍 8. **Lazy Loading & Code Splitting**

- Use `React.lazy()` + `Suspense` for route-level code splitting:

  ```jsx
  const Home = React.lazy(() => import("./pages/Home"));
  <Route
  	path="/"
  	element={
  		<Suspense fallback={<Loading />}>
  			<Home />
  		</Suspense>
  	}
  />;
  ```

---

### 🔄 9. **Data Loading & Actions (React Router v6.4+)**

Modern React Router supports **Data APIs**:

- `loader` → fetch data before route renders
- `action` → handle form submissions
- `useLoaderData()`, `useActionData()` hooks
- `Form` component (enhanced form handling)

Example:

```jsx
<Route path="users" loader={fetchUsers} element={<Users />} />
```

---

### 🧱 10. **Error Handling**

- Route-based error handling with `errorElement`
- `useRouteError()` hook

```jsx
<Route path="/" element={<App />} errorElement={<ErrorPage />} />
```

---

### 🧭 11. **Route Objects (Declarative Routing)**

Instead of JSX:

```jsx
const routes = [
	{ path: "/", element: <Home /> },
	{ path: "/about", element: <About /> },
];
const router = createBrowserRouter(routes);
<RouterProvider router={router} />;
```

---

### 🧩 12. **Advanced Topics**

- Scroll restoration on route change
- Redirects & custom history objects
- Handling 404 and fallback routes
- Route-based modals or drawers
- Animating route transitions (with Framer Motion)

---

### ⚠️ 13. **Common Pitfalls**

- Forgetting `<BrowserRouter>` wrapper
- Using relative paths incorrectly
- Not handling wildcard routes
- Missing `replace` when redirecting after login
- Mixing v5 and v6 syntax (big breaking changes!)

---

### 🧱 14. **Real-World Project Structure Example**

```
src/
 ├── routes/
 │    ├── AppRoutes.jsx
 │    ├── ProtectedRoute.jsx
 │    └── DashboardRoutes.jsx
 ├── layouts/
 │    ├── MainLayout.jsx
 │    └── AuthLayout.jsx
 ├── pages/
 │    ├── Home.jsx
 │    ├── About.jsx
 │    ├── Login.jsx
 │    └── Dashboard/
 │         ├── Index.jsx
 │         └── Profile.jsx
```

---

### 🧩 15. **Practice Projects**

- 🔹 Multi-page Portfolio with nested routes
- 🔹 E-commerce app with Product Detail routes (`/products/:id`)
- 🔹 Dashboard app with protected routes & lazy loading
- 🔹 Blog app with data loaders (`loader`, `useLoaderData`)

---

# Cheat sheet

Perfect 😎 — here’s a **complete React Router v6 cheat-sheet / reference** fully updated for **object-based routing (`createBrowserRouter` + `RouterProvider`)**, covering **basics → advanced patterns → auth → data APIs → forms → scroll restoration → performance**. This will be a **ready reference for real-world apps**.

---

# 🗂️ React Router v6 Cheat-Sheet (Object-Based Routing)

---

## 1️⃣ Installation & Setup

```bash
npm install react-router-dom@6
```

```jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
	{ path: "/", element: <Home /> },
	{ path: "/about", element: <About /> },
]);

function App() {
	return <RouterProvider router={router} />;
}
```

- `<RouterProvider>` replaces `<BrowserRouter>` in v6.4+
- Routes are defined as **JS objects**

---

## 2️⃣ Basic Object-Based Routes

```jsx
const router = createBrowserRouter([
	{ path: "/", element: <Home /> },
	{ path: "/about", element: <About /> },
	{ path: "*", element: <NotFound /> }, // wildcard route
]);
```

**Advantages:**

- Centralized route config
- Supports loaders, actions, and errorElement
- Nested routes are easy with `children`

---

## 3️⃣ Nested Routes & Layouts

```jsx
const router = createBrowserRouter([
	{
		path: "/dashboard",
		element: <DashboardLayout />, // common header/sidebar
		children: [
			{ index: true, element: <DashboardHome /> }, // default page
			{ path: "settings", element: <Settings /> },
		],
	},
]);
```

- `<Outlet />` in `DashboardLayout` renders nested routes
- `index: true` → default nested route

---

## 4️⃣ Protected Routes (Authentication)

```jsx
{
  path: "/dashboard",
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <DashboardHome /> },
    { path: "settings", element: <Settings /> },
  ],
}
```

**ProtectedRoute wrapper:**

```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, role }) => {
	const { user } = useAuth();
	const location = useLocation();

	if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
	if (role && user.role !== role)
		return <Navigate to="/unauthorized" replace />;

	return children;
};
```

- Redirects unauthenticated users
- Supports role-based access

---

## 5️⃣ Auth Context Example

```jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const login = (username, role = "user") => setUser({ username, role });
	const logout = () => setUser(null);

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
```

- Provides global access to user state
- Use in `ProtectedRoute` and components

---

## 6️⃣ Data APIs (Loaders & Actions)

```jsx
const router = createBrowserRouter([
	{
		path: "/users",
		element: <Users />,
		loader: async () => fetch("/api/users").then((res) => res.json()),
		action: async ({ request }) => {
			const formData = await request.formData();
			return saveUser(formData);
		},
		errorElement: <ErrorPage />,
	},
]);
```

- `loader` → fetch data before route renders
- `action` → handle forms declaratively
- `errorElement` → show fallback UI for errors

---

### Hooks for Data APIs

| Hook                 | Purpose                        |
| -------------------- | ------------------------------ |
| `useLoaderData()`    | Get data from loader           |
| `useActionData()`    | Get result from action         |
| `useNavigation()`    | Track loading/submitting state |
| `useDeferredValue()` | Stream partial loader data     |

---

## 7️⃣ Forms & Programmatic Navigation

```jsx
import { Form, useNavigation, useActionData } from "react-router-dom";

<Form method="post">
	<input name="username" />
	<button disabled={navigation.state === "submitting"}>
		{navigation.state === "submitting" ? "Saving..." : "Save"}
	</button>
</Form>;

const navigation = useNavigation();
const actionData = useActionData();
```

- `<Form>` → automatic submit to route action
- `useNavigation()` → `"idle" | "submitting" | "loading"`
- Optimistic UI: disable buttons, show spinner

---

## 8️⃣ Scroll Restoration & Transitions

```jsx
import { ScrollRestoration } from "react-router-dom";

<RouterProvider router={router}>
	<ScrollRestoration /> {/* auto restore scroll */}
</RouterProvider>;
```

- For custom scroll:

```jsx
const { pathname } = useLocation();
useEffect(() => window.scrollTo(0, 0), [pathname]);
```

- Use `useNavigation()` to show loading indicators during route transitions

---

## 9️⃣ Lazy Loading & Suspense

```jsx
import { lazy, Suspense } from "react";

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

<Suspense fallback={<div>Loading...</div>}>
	<RouterProvider router={router} />
</Suspense>;
```

- Lazy-load modules for performance
- Combine with layout routes for nested lazy loading

---

## 🔄 10️⃣ Recommended File Structure

```
src/
├── context/
│   └── AuthContext.jsx
├── routes/
│   ├── ProtectedRoute.jsx
│   └── AppRoutes.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── DashboardHome.jsx
│   ├── Settings.jsx
│   └── Unauthorized.jsx
├── layouts/
│   └── DashboardLayout.jsx
└── App.jsx
```

- Organizes **context, routes, pages, layouts**
- Scales well for **medium → large apps**

---

## 11️⃣ Hooks Summary

| Hook / Component      | Purpose                             |
| --------------------- | ----------------------------------- |
| `useNavigate()`       | Programmatic navigation             |
| `useLocation()`       | Access current URL & state          |
| `useParams()`         | Access route params                 |
| `useSearchParams()`   | Access query params                 |
| `useLoaderData()`     | Access route loader data            |
| `useActionData()`     | Access route action result          |
| `useNavigation()`     | Track route/form submission/loading |
| `<Outlet>`            | Render nested routes in layout      |
| `<Form>`              | Declarative form submission         |
| `<ScrollRestoration>` | Auto scroll management              |

---

## 12️⃣ Best Practices

1. **Use object-based routes** for v6.4+ (centralized, supports loaders/actions).
2. **Use layout routes & `<Outlet>`** for consistent UI.
3. **Wrap protected routes** with `ProtectedRoute` or role-based wrappers.
4. **Lazy-load modules**, not tiny components.
5. **Always include a wildcard route** (`path="*"`) for 404 pages.
6. **Keep auth logic in context**, not inside page components.
7. **Use `useNavigation()`** for spinners, pending states, and optimistic UI.
8. **Organize files by feature/module** for maintainability.

---
