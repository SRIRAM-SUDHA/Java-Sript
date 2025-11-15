Perfect 😎 — now we wrap up with **Topic 14️⃣: Advanced Patterns & Best Practices** for **React Router v6**.

This section is about structuring your routes, layouts, and code in a **scalable, maintainable way** for real-world apps.

---

# 🏗️ Advanced Patterns & Best Practices (React Router v6)

---

## 1️⃣ Layout Routes

Layout routes are **routes that share a common UI structure** (header, sidebar, footer) but render different nested content via `<Outlet>`.

### 🧩 Example:

```jsx
import { Outlet, Link } from "react-router-dom";

function DashboardLayout() {
	return (
		<div>
			<header>
				<h1>Dashboard</h1>
				<nav>
					<Link to="/dashboard">Home</Link> |{" "}
					<Link to="/dashboard/settings">Settings</Link>
				</nav>
			</header>
			<main>
				<Outlet /> {/* Nested routes render here */}
			</main>
		</div>
	);
}

// Routes
<Routes>
	<Route path="dashboard" element={<DashboardLayout />}>
		<Route index element={<DashboardHome />} />
		<Route path="settings" element={<Settings />} />
	</Route>
</Routes>;
```

- Keeps **header/sidebar consistent** across nested pages
- Reduces repetition and improves maintainability

---

## 2️⃣ Route Grouping & Organization

For large apps, **group routes by module**:

```
src/
├── routes/
│   ├── AppRoutes.jsx
│   ├── DashboardRoutes.jsx
│   └── AuthRoutes.jsx
├── pages/
│   ├── dashboard/
│   │   ├── DashboardHome.jsx
│   │   └── Settings.jsx
│   └── auth/
│       ├── Login.jsx
│       └── Register.jsx
└── components/
```

**Benefits:**

- Easier to find and maintain routes
- Supports **lazy-loading per module**

---

## 3️⃣ Nested Routes Best Practices

- Use **nested routes** for related pages
- Always render nested content using `<Outlet>`
- Use **index routes** for default nested page

```jsx
<Route path="dashboard" element={<DashboardLayout />}>
	<Route index element={<DashboardHome />} />
	<Route path="settings" element={<Settings />} />
</Route>
```

- `index` route acts as default when `/dashboard` is visited

---

## 4️⃣ NotFound / Wildcard Routes

Always include a **catch-all route** at the bottom:

```jsx
<Route path="*" element={<NotFound />} />
```

- Shows 404 page for unmatched paths
- Prevents blank screens

---

## 5️⃣ Protected Routes & Role-Based Access

- Use **`ProtectedRoute`** for auth
- Use **role-based wrapper** for admin/moderator routes
- Keep wrappers reusable:

```jsx
<ProtectedRoute>
	<AdminRoute>
		<AdminDashboard />
	</AdminRoute>
</ProtectedRoute>
```

- Avoid mixing auth logic inside pages

---

## 6️⃣ Lazy Loading & Code Splitting Patterns

- Lazy-load **modules**, not tiny components
- Combine with **layout routes**:

```jsx
const DashboardLayout = lazy(() => import("./DashboardLayout"));
const DashboardHome = lazy(() => import("./DashboardHome"));
```

- Wrap `<Routes>` or `<Outlet>` in `<Suspense>`

---

## 7️⃣ Using `useLocation` & `state` for Modals / Transitions

- Can render **modal dialogs** on top of pages without leaving the underlying page:

```jsx
const location = useLocation();
const state = location.state;

<Route path="/photo/:id" element={<Photo />} />;
```

- If `state.background` exists → show modal on top of previous page

---

## 8️⃣ Best Practices Summary

| Practice                                | Why                                         |
| --------------------------------------- | ------------------------------------------- |
| Use Layout Routes                       | Consistent UI for nested routes             |
| Group routes by feature/module          | Maintainable code structure                 |
| Always include `*` route                | Prevents broken routes/404 handling         |
| Lazy-load modules                       | Optimizes initial bundle size               |
| Keep route logic out of page components | Separation of concerns                      |
| Use `state` with `navigate()`           | For modals, transitions, and redirects      |
| Protect routes with wrapper components  | Reusable authentication/authorization logic |

---

## 9️⃣ Recommended File Structure (Real Project)

```
src/
├── routes/
│   ├── AppRoutes.jsx        # main route config
│   ├── DashboardRoutes.jsx  # nested dashboard routes
│   └── AuthRoutes.jsx       # login/register routes
├── pages/
│   ├── dashboard/
│   │   ├── DashboardHome.jsx
│   │   └── Settings.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── NotFound.jsx
├── components/
│   ├── Layout/
│   │   ├── DashboardLayout.jsx
│   │   └── Header.jsx
│   └── ProtectedRoute.jsx
└── App.jsx
```

- **Scales well** for apps with dozens of routes
- Easier for multiple developers to maintain

---

## 🔹 Key Takeaways

1. **Use layout routes & `<Outlet>`** to avoid repetition
2. **Group routes by feature/module**
3. **Use lazy loading strategically** for performance
4. **Always include 404/wildcard routes**
5. **Keep auth & role logic in wrappers, not pages**
6. **Use navigation state** for modals, transitions, and UX enhancements

---

✅ With this, you now have a **complete roadmap for React Router v6**, from **basics → advanced patterns**:

1. Client-side routing basics
2. BrowserRouter, Routes, Route
3. Link, NavLink, useNavigate, useLocation
4. Dynamic routes, nested routes, index routes
5. Wildcard / 404 pages
6. Protected routes & authentication
7. Lazy loading & code splitting
8. Data APIs (loader, action, defer)
9. Form handling & navigation states
10. Scroll restoration & transitions
11. Advanced patterns & best practices

---
