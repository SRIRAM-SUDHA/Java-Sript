Perfect 🔐 — let’s move into the **Authentication & Protected Routes** section — a critical skill for _real-world React apps_ (dashboards, SaaS apps, admin portals, etc.)

We’ll stay fully in **React Router DOM v6** syntax and patterns.

---

# 🔐 React Router DOM v6 — Authentication & Protected Routes

---

## 🧩 1. What Are Protected Routes?

Protected routes are routes that only **authorized users** (like logged-in users) can access.

If the user isn’t logged in, they are **redirected** (usually to a login page).

---

### 🧠 Concept

React Router doesn’t manage authentication by itself.
You handle it using **state/context**, and then use a custom component to **guard routes**.

---

## ⚙️ 2. Basic Protected Route Pattern

### Example:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

function ProtectedRoute({ children }) {
	const isAuthenticated = localStorage.getItem("auth") === "true"; // mock auth
	return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Home() {
	return <h2>🏠 Home Page (Public)</h2>;
}

function Dashboard() {
	return <h2>📊 Dashboard (Protected)</h2>;
}

function Login() {
	const handleLogin = () => {
		localStorage.setItem("auth", "true");
		window.location.href = "/dashboard";
	};

	return <button onClick={handleLogin}>Login</button>;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route path="/login" element={<Login />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
```

---

### 🧠 Explanation:

- `ProtectedRoute` checks `isAuthenticated`.
- If `true` → renders child (`Dashboard`).
- If `false` → redirects with `<Navigate to="/login" />`.
- The `replace` prop prevents the user from going back using the browser’s Back button.

---

## 💡 3. Using Context for Auth State (Recommended for Real Apps)

Instead of `localStorage`, real apps store user data in **React Context**.

### Example:

```jsx
import { createContext, useContext, useState } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from "react-router-dom";

// Create AuthContext
const AuthContext = createContext(null);

function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	const login = (username) => {
		setUser(username);
		navigate("/dashboard");
	};

	const logout = () => {
		setUser(null);
		navigate("/");
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

// ProtectedRoute
function ProtectedRoute({ children }) {
	const { user } = useContext(AuthContext);
	return user ? children : <Navigate to="/login" replace />;
}

// Pages
function Home() {
	return <h2>Home Page</h2>;
}

function Dashboard() {
	const { user, logout } = useContext(AuthContext);
	return (
		<>
			<h2>Welcome, {user}</h2>
			<button onClick={logout}>Logout</button>
		</>
	);
}

function Login() {
	const { login } = useContext(AuthContext);
	return <button onClick={() => login("Sriram")}>Login as Sriram</button>;
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
```

---

### 🧠 How It Works:

- `AuthContext` provides global access to auth state.
- `ProtectedRoute` uses `user` from context.
- `login` and `logout` handle navigation programmatically.

---

## 🧠 4. Redirecting After Login or Logout

Sometimes you want to redirect the user **to where they came from** after login.

Example:

```jsx
function ProtectedRoute({ children }) {
	const { user } = useAuth();
	const location = useLocation();

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
}

function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || "/";

	const handleLogin = () => {
		login("User");
		navigate(from, { replace: true });
	};

	return <button onClick={handleLogin}>Login</button>;
}
```

🧩 Here:

- If user visits `/dashboard`, they’re redirected to `/login?from=/dashboard`.
- After logging in, they go back to `/dashboard`.

---

## 🧩 5. Role-Based Access Control (RBAC)

If your app has roles (e.g. “admin”, “user”), you can control access like this:

```jsx
function ProtectedRoute({ children, role }) {
	const { user } = useAuth();

	if (!user) return <Navigate to="/login" replace />;
	if (role && user.role !== role)
		return <Navigate to="/unauthorized" replace />;

	return children;
}

// Usage
<Route
	path="/admin"
	element={
		<ProtectedRoute role="admin">
			<AdminDashboard />
		</ProtectedRoute>
	}
/>;
```

---

## ⚠️ Common Pitfalls

| ❌ Mistake                                      | ✅ Correct Way                              |
| ----------------------------------------------- | ------------------------------------------- |
| Checking `auth` directly inside route component | Use a wrapper like `ProtectedRoute`         |
| Redirect loops (login → dashboard → login...)   | Use `replace` prop in `<Navigate>`          |
| Forgetting `AuthProvider` context               | Wrap your whole app inside it               |
| Losing state on refresh                         | Persist minimal user info in `localStorage` |

---

## 🧠 Summary Table

| Concept              | Purpose                            | Key Tools                     |
| -------------------- | ---------------------------------- | ----------------------------- |
| ProtectedRoute       | Restrict access to logged-in users | `<Navigate />`, Context       |
| Redirect after login | Return to previous route           | `useLocation().state`         |
| Role-based access    | Different UI per role              | Conditional routes            |
| AuthContext          | Global user state                  | `createContext`, `useContext` |

---

## 🧩 Example File Structure (Real Projects)

```
src/
├── context/
│   └── AuthContext.jsx
├── routes/
│   ├── ProtectedRoute.jsx
│   └── AppRoutes.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Home.jsx
│   └── Unauthorized.jsx
└── App.jsx
```

---

✅ **You now understand:**

- How to create protected routes
- How to redirect after login/logout
- How to handle role-based access
- How to structure auth flow with context

---

# Same but with object way

Absolutely 😎 — let’s rewrite your **Authentication & Protected Routes** example using **object-based routing** with `createBrowserRouter()` and `RouterProvider` (React Router v6.4+).

This will make the code cleaner and fully compatible with **v6.4+ patterns**, including loaders, actions, and nested routes.

---

# 🔐 React Router v6 — Auth & Protected Routes (Object-Based Routing)

---

## 1️⃣ Auth Context

We still use context to store user info:

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

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

export const useAuth = () => useContext(AuthContext);
```

---

## 2️⃣ Protected Route Wrapper

```jsx
// src/routes/ProtectedRoute.jsx
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

---

## 3️⃣ Page Components

```jsx
// src/pages/Home.jsx
export const Home = () => <h2>🏠 Home Page (Public)</h2>;

// src/pages/Login.jsx
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || "/dashboard";

	const handleLogin = () => {
		login("Sriram", "admin");
		navigate(from, { replace: true });
	};

	return <button onClick={handleLogin}>Login as Sriram (Admin)</button>;
};

// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";

export const Dashboard = () => {
	const { user, logout } = useAuth();
	return (
		<>
			<h2>Welcome, {user.username}</h2>
			<button onClick={logout}>Logout</button>
		</>
	);
};

// src/pages/Unauthorized.jsx
export const Unauthorized = () => <h2>❌ Unauthorized Access</h2>;
```

---

## 4️⃣ Object-Based Routes with `createBrowserRouter()`

```jsx
// src/routes/AppRoutes.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Unauthorized } from "../pages/Unauthorized";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/unauthorized",
		element: <Unauthorized />,
	},
	{
		path: "/dashboard",
		element: (
			<ProtectedRoute>
				<Dashboard />
			</ProtectedRoute>
		),
	},
]);
```

---

## 5️⃣ App Component

```jsx
// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes/AppRoutes";

export const App = () => {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	);
};
```

---

## ✅ Key Advantages of Object-Based Routing

1. Routes are **centralized** in one place (`AppRoutes.jsx`).
2. Supports **nested routes, loaders, actions, and error elements**.
3. Cleaner than JSX-based `<Routes>` nesting.
4. Easier to scale for large apps (dashboards, admin panels).

---

### Optional: Nested Layout Example

If you want a **Dashboard layout**:

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
    { path: "settings", element: <DashboardSettings /> },
  ],
}
```

- Uses `<Outlet />` in `DashboardLayout`
- All nested pages are automatically protected

---

If you want, I can **rewrite the full cheat-sheet now** to include **this object-based routing + auth pattern**, so your React Router v6 reference is **fully up-to-date for real-world apps**.

Do you want me to do that?

Awesome 😎 — let’s go into **Topic 9️⃣ → Protected Routes & Auth Guards in React Router v6**, one of the **most practical** parts of real-world apps.

---

# 🛡️ Protected Routes & Auth Guards (React Router v6)

## 🧭 What is a Protected Route?

A **protected route** is a route that is only accessible to certain users — typically **logged-in** users.
If a user is **not authenticated**, we redirect them (usually to `/login`).

Think of it as a “gatekeeper” that checks whether you can access a certain path.

---

## ⚙️ Concept

We wrap protected pages inside a component that:

1. Checks if the user is authenticated.
2. If yes → render the page.
3. If not → redirect using `<Navigate />`.

---

## 🧩 Example 1: Basic Protected Route

```jsx
// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, children }) {
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}
	return children;
}

export default ProtectedRoute;
```

### Usage:

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
	const isAuthenticated = false; // Replace with real auth logic

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />

				<Route
					path="/dashboard"
					element={
						<ProtectedRoute isAuthenticated={isAuthenticated}>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
```

🧠 **Explanation:**

- `<ProtectedRoute>` checks auth state.
- If `isAuthenticated === false`, redirects with `<Navigate />`.
- `replace` removes the current page from history — prevents user from going “back” to the restricted route.

---

## 🧩 Example 2: With Auth Context (Real-World Pattern)

In real apps, auth state is stored in a **Context**.

### 🔹 Step 1: Create an AuthContext

```jsx
// AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	const login = (username) => setUser({ name: username });
	const logout = () => setUser(null);

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
```

---

### 🔹 Step 2: Create ProtectedRoute with Context

```jsx
// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }) {
	const { user } = useAuth();
	const location = useLocation();

	if (!user) {
		// Save current location to redirect after login
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
}
```

---

### 🔹 Step 3: Use It in App.jsx

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
```

---

### 🔹 Step 4: Handle Redirect After Login

```jsx
// Login.jsx
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || "/dashboard";

	function handleLogin() {
		login("Sriram");
		navigate(from, { replace: true });
	}

	return (
		<div>
			<h2>Login Page</h2>
			<button onClick={handleLogin}>Login</button>
		</div>
	);
}

export default Login;
```

💡 **Flow Explanation:**

1. If user tries `/dashboard` while logged out → redirected to `/login`.
2. `location.state.from` remembers where they came from.
3. After login → `navigate(from)` sends them back to the original page.

---

## ⚡ Bonus: Role-Based Route Protection

```jsx
function AdminRoute({ user, children }) {
	if (!user) return <Navigate to="/login" replace />;
	if (user.role !== "admin") return <Navigate to="/unauthorized" replace />;
	return children;
}
```

---

## 🧠 Key Takeaways

| Concept         | Description                                      |
| --------------- | ------------------------------------------------ |
| `<Navigate />`  | Replaces `<Redirect />` from v5                  |
| `replace` prop  | Removes previous entry from browser history      |
| `useLocation()` | Lets you remember where user was before redirect |
| `AuthContext`   | Centralized auth state used by all components    |
| Role-based      | Add permission checks on top of login checks     |

---

✅ **Next Topic (10️⃣):**
**Lazy Loading & Code Splitting with `React.lazy()` and `Suspense`** — helps optimize large apps and only load routes when needed.

Would you like me to continue with that next?
