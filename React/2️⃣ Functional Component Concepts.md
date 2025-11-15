## **1. Hooks**

**Explanation in depth:**
Hooks are **functions that let you “hook into” React state and lifecycle features** from functional components. Before hooks, state and lifecycle methods were only available in class components. Hooks allow **functional components to be fully capable**.

**What it does (Syntax & usage):**

- Examples: `useState`, `useEffect`, `useRef`, etc.
- Used **inside functional components** only.

```jsx
import React, { useState } from "react";

function Counter() {
	const [count, setCount] = useState(0); // useState hook
	return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Why it exists:**

- Before hooks, functional components were **stateless**.
- Hooks allow **state, side-effects, context access, and refs** in functional components.

**How it works internally (Mental model):**

- React maintains a **hook list per component**.
- Each hook call is tracked **in the order they are called** (call order matters).
- On re-render, React matches hooks **by order**, not by name.

---

## **2. useState**

**Explanation:**
`useState` allows a functional component to have **local state**.

**Syntax & usage:**

```jsx
const [count, setCount] = useState(0); // initial value = 0

<button onClick={() => setCount(count + 1)}>Increment</button>;
```

**Why it exists:**

- Functional components were **stateless**.
- useState solves **maintaining local, mutable state**.

**Internal working:**

- React stores state in a **linked list of hooks** per component instance.
- `setState` triggers **re-render** and updates the Virtual DOM.

---

## **3. useEffect**

**Explanation:**
`useEffect` lets you perform **side effects** like API calls, timers, or subscriptions.

**Syntax & usage:**

```jsx
import React, { useEffect, useState } from "react";

function FetchData() {
	const [data, setData] = useState(null);

	useEffect(() => {
		fetch("https://api.example.com/data")
			.then((res) => res.json())
			.then(setData);
	}, []); // empty array = run once (componentDidMount equivalent)

	return <div>{JSON.stringify(data)}</div>;
}
```

**Why it exists:**

- Functional components had **no lifecycle methods**.
- `useEffect` replaces `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`.

**Internal working:**

- React runs the effect **after render**.
- Cleanup functions run **before the next render** or **on unmount**.
- Dependencies array `[]` controls **when effect runs**.

---

## **4. useRef**

**Explanation:**
`useRef` provides **a mutable object whose `.current` persists across renders**. Often used to **access DOM elements**.

**Syntax & usage:**

```jsx
import React, { useRef } from "react";

function InputFocus() {
	const inputRef = useRef();

	return <input ref={inputRef} placeholder="Focus me" />;
}

// You can focus the input programmatically
inputRef.current.focus();
```

**Why it exists:**

- Functional components cannot use `this` like classes.
- Provides a way to **store mutable data or access DOM nodes** without triggering re-renders.

**Internal working:**

- React keeps a **single object per useRef call**.
- Updating `.current` does **not trigger re-render**.

---

## **5. useMemo**

**Explanation:**
`useMemo` **memoizes expensive calculations** so they only recompute when dependencies change.

**Syntax & usage:**

```jsx
import React, { useMemo, useState } from "react";

function Expensive({ num }) {
	const factorial = useMemo(() => {
		console.log("Calculating factorial...");
		return factorialCalc(num); // expensive function
	}, [num]);

	return <div>{factorial}</div>;
}
```

**Why it exists:**

- Avoids **recomputing expensive values** on every render.

**Internal working:**

- React stores **cached value** and dependencies array.
- Recomputes only if **dependency array changes**.

---

## **6. useCallback**

**Explanation:**
`useCallback` memoizes a **function reference** to prevent unnecessary re-creation.

**Syntax & usage:**

```jsx
import React, { useState, useCallback } from "react";

function Child({ onClick }) {
	console.log("Child rendered");
	return <button onClick={onClick}>Click Me</button>;
}

function Parent() {
	const [count, setCount] = useState(0);

	const handleClick = useCallback(() => {
		setCount((c) => c + 1);
	}, []); // memoized function

	return <Child onClick={handleClick} />;
}
```

**Why it exists:**

- Prevents **unnecessary renders** of child components when passing functions as props.

**Internal working:**

- React stores **function reference** and dependency array.
- Returns **same function object** until dependencies change.

---

## **7. useReducer**

**Explanation:**
`useReducer` manages **complex state logic** using a reducer function. Similar to Redux but local to a component.

**Syntax & usage:**

```jsx
import React, { useReducer } from "react";

function reducer(state, action) {
	switch (action.type) {
		case "increment":
			return { count: state.count + 1 };
		case "decrement":
			return { count: state.count - 1 };
		default:
			return state;
	}
}

function Counter() {
	const [state, dispatch] = useReducer(reducer, { count: 0 });

	return (
		<>
			<button onClick={() => dispatch({ type: "decrement" })}>-</button>
			{state.count}
			<button onClick={() => dispatch({ type: "increment" })}>+</button>
		</>
	);
}
```

**Why it exists:**

- Handles **complex state transitions** better than multiple `useState` calls.

**Internal working:**

- React calls **reducer with current state + action**.
- Returned value replaces **current state**, triggers **re-render**.

---

## **8. useContext**

**Explanation:**
`useContext` allows a component to **access values from a React Context** without prop drilling.

**Syntax & usage:**

```jsx
import React, { useContext } from "react";

const ThemeContext = React.createContext("light");

function ThemedButton() {
	const theme = useContext(ThemeContext);
	return (
		<button style={{ background: theme === "dark" ? "#333" : "#eee" }}>
			Click
		</button>
	);
}
```

**Why it exists:**

- Avoids **prop drilling** through multiple levels.
- Provides **global state-like behavior** within a component tree.

**Internal working:**

- React **subscribes component to context value**.
- Re-renders component when **context value changes**.

---

## **9. Custom Hooks**

**Explanation:**
Custom hooks are **user-defined hooks** that encapsulate **reusable logic**.

**Syntax & usage:**

```jsx
import { useState, useEffect } from "react";

function useFetch(url) {
	const [data, setData] = useState(null);

	useEffect(() => {
		fetch(url)
			.then((res) => res.json())
			.then(setData);
	}, [url]);

	return data;
}

function App() {
	const data = useFetch("https://api.example.com/data");
	return <pre>{JSON.stringify(data)}</pre>;
}
```

**Why it exists:**

- Enables **code reuse across multiple components**.
- Keeps code **clean and composable**.

**Internal working:**

- Works like a **normal function using hooks inside**.
- React tracks all internal hooks as usual.

---

✅ **Summary Mental Model of Hooks:**

```
useState -> manages local state
useEffect -> side effects after render
useRef -> persistent mutable values / DOM refs
useMemo -> memoize computed values
useCallback -> memoize functions
useReducer -> complex state updates
useContext -> global-like state via Context
Custom Hooks -> reusable hook logic
```

---

Absolutely! Let’s dive **deeply** into `useState` in React — different **use cases**, **best practices**, and **common pitfalls**. I’ll break this down clearly with examples.

---

## **1. Basic `useState` Usage**

`useState` is a **hook to manage local state** in functional components.

```jsx
import { useState } from "react";

function Counter() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

- `count` → current state.
- `setCount` → function to update state.
- `useState(0)` → initial value.

---

## **2. Different Use Cases**

### **a) Primitive State**

Numbers, strings, booleans.

```jsx
const [name, setName] = useState("Sriram");
const [isVisible, setIsVisible] = useState(true);
```

- Simple and efficient.
- Best for single-value states.

---

### **b) Object State**

For multiple related values.

```jsx
const [user, setUser] = useState({ name: "Sriram", age: 30 });

// Updating age without losing name
setUser((prevUser) => ({ ...prevUser, age: prevUser.age + 1 }));
```

**⚠ Pitfall:** Directly updating without spreading previous state:

```jsx
setUser({ age: 31 }); // ❌ 'name' will be lost
```

---

### **c) Array State**

For lists or collections.

```jsx
const [tasks, setTasks] = useState(["task1", "task2"]);

setTasks((prevTasks) => [...prevTasks, "task3"]); // Add new item
setTasks((prevTasks) => prevTasks.filter((t) => t !== "task2")); // Remove item
```

**Best Practice:** Always use functional update (`prevTasks => ...`) to avoid stale closures.

---

### **d) Derived/Computed State**

Sometimes state depends on previous state:

```jsx
const [count, setCount] = useState(0);

const incrementTwice = () => {
	setCount((prev) => prev + 1);
	setCount((prev) => prev + 1);
};
```

- **Functional updates** ensure state is calculated from the latest value.
- Without functional updates, multiple `setCount(count + 1)` calls may not work as expected.

---

### **e) Lazy Initialization**

Useful if initial state is expensive to compute:

```jsx
const [data, setData] = useState(() => {
	// expensive computation only runs once
	return computeInitialData();
});
```

---

### **f) Toggling Boolean**

Common UI pattern (modal open/close, dark/light mode):

```jsx
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen((prev) => !prev);
```

- ✅ Functional updates prevent issues when toggling multiple times rapidly.

---

## **3. Best Practices**

1. **Use functional updates when new state depends on old state.**

```jsx
setCount((prev) => prev + 1);
```

2. **Avoid storing redundant or derived state.**

- Example: Don’t store both `fullName` and `firstName`/`lastName` if you can compute `fullName` dynamically.

3. **Keep state as minimal as possible.**

- Only store what is necessary for rendering.

4. **Use separate state variables for unrelated pieces of state.**

```jsx
const [name, setName] = useState("");
const [age, setAge] = useState(0); // better than one big object
```

5. **Use lazy initialization for expensive computations.**

6. **Never mutate state directly.**

```jsx
user.age = 31; // ❌ Don't do this
```

Always replace with a new object/array.

---

## **4. Common Pitfalls**

| Pitfall                   | Example                                                                | Issue                                            |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Stale closure             | `setCount(count + 1); setCount(count + 1);`                            | Only increments once                             |
| Direct mutation           | `state.push(item)`                                                     | React won’t detect change                        |
| Overcomplicated objects   | One big object with multiple unrelated states                          | Hard to manage and causes unnecessary re-renders |
| Derived state duplication | `const [fullName, setFullName] = useState(firstName + " " + lastName)` | Leads to inconsistent state                      |
| Updating asynchronously   | Using `state` immediately after `setState`                             | State updates are async, value won’t reflect yet |

---

### ✅ **Summary**

- `useState` is simple but **powerful** for local state.
- Prefer **primitive states** or **small, separate states**.
- Always use **functional updates** if state depends on previous value.
- Avoid **direct mutation** and **duplicated derived state**.
- Lazy initialization is useful for **expensive computations**.

---

## **1. Basic `useEffect` Usage**

`useEffect` is a **hook to run side effects** in functional components, like API calls, subscriptions, or DOM manipulations.

```jsx
import { useEffect, useState } from "react";

function Example() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		console.log("Count changed:", count);
	}, [count]); // dependency array

	return (
		<div>
			<p>{count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

- **Effect function:** Runs after render.
- **Dependency array:** Determines **when** the effect runs.

---

## **2. Different Use Cases**

### **a) Component Did Mount (Run Once)**

```jsx
useEffect(() => {
	console.log("Component mounted");
}, []); // empty dependency array
```

- Runs only **once after the first render**.
- Commonly used for **fetching data** or **setting up subscriptions**.

---

### **b) Component Did Update**

```jsx
const [name, setName] = useState("");

useEffect(() => {
	console.log("Name updated:", name);
}, [name]); // runs every time 'name' changes
```

- Runs **whenever a dependency changes**.

---

### **c) Component Will Unmount (Cleanup)**

```jsx
useEffect(() => {
	const interval = setInterval(() => console.log("Tick"), 1000);

	return () => {
		clearInterval(interval);
		console.log("Component unmounted, cleanup done");
	};
}, []);
```

- Cleanup function runs **before component unmounts**.
- Essential for **timers, subscriptions, event listeners**.

---

### **d) Multiple Dependencies**

```jsx
useEffect(() => {
	console.log("Count or name changed:", count, name);
}, [count, name]);
```

- Runs when **any listed dependency changes**.

---

### **e) Fetching Data / Async Effects**

```jsx
useEffect(() => {
	const controller = new AbortController();

	async function fetchData() {
		try {
			const res = await fetch("https://api.example.com/data", {
				signal: controller.signal,
			});
			const data = await res.json();
			console.log(data);
		} catch (err) {
			if (err.name !== "AbortError") console.error(err);
		}
	}

	fetchData();

	return () => controller.abort(); // cancel fetch on unmount
}, []);
```

- Use **async functions inside `useEffect`** (not directly async).
- Cleanup aborts requests to **prevent memory leaks**.

---

### **f) Watching Props**

```jsx
useEffect(() => {
	console.log("Prop value changed:", props.value);
}, [props.value]);
```

- Good for **side effects based on prop changes**, like updating local state or animations.

---

### **g) Debouncing / Throttling**

```jsx
const [query, setQuery] = useState("");

useEffect(() => {
	const handler = setTimeout(() => {
		console.log("Search query:", query);
	}, 500);

	return () => clearTimeout(handler);
}, [query]);
```

- Common pattern for **search inputs** or **resize events**.

---

## **3. Best Practices**

1. **Always specify dependencies** — avoids stale closures.

```jsx
useEffect(() => {
	console.log(count);
}, [count]); // correct
```

2. **Use cleanup functions** for timers, subscriptions, or event listeners.
3. **Avoid putting non-stable references** (like inline objects/functions) in dependencies; use `useCallback` or `useMemo`.
4. **Use multiple `useEffect`s for unrelated side effects** — improves readability.

```jsx
useEffect(() => {
	/* effect A */
}, [depA]);
useEffect(() => {
	/* effect B */
}, [depB]);
```

5. **Keep effects pure** — avoid heavy computations inside `useEffect`; use `useMemo` for derived values.

---

## **4. Common Pitfalls**

| Pitfall                       | Example                                                      | Issue                                                 |
| ----------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| Missing dependencies          | `useEffect(() => console.log(count), []);`                   | Count changes won’t trigger effect                    |
| Over-fetching / Infinite loop | `useEffect(() => setCount(count+1), [count]);`               | Effect updates state causing rerender → infinite loop |
| Async directly in effect      | `useEffect(async () => { await fetch(...) }, []);`           | React warns; must wrap in inner async function        |
| Mutating state inside effect  | `state.push(item);`                                          | Violates React’s immutability, can break rendering    |
| Using stale closure           | `console.log(count)` inside effect without proper dependency | Logs outdated values                                  |

---

### **5. Summary**

- `useEffect` is for **side effects**, not state computation.
- **Always include dependencies** unless intentionally skipping (`eslint-disable-next-line` is rarely recommended).
- **Use cleanup functions** for unmount or repeated effects.
- **Split effects by concern** — makes code cleaner and avoids bugs.
- **Async effects** should be wrapped in functions, not direct async.

---

Ah! This is **one of the most common mistakes in React**. Forgetting the dependency array in `useEffect` changes **how often the effect runs** and can introduce subtle bugs. Let me break it down carefully.

---

## **1. No Dependency Array**

```jsx
useEffect(() => {
	console.log("Effect ran");
});
```

- ✅ This is **legal**, but **different from including a dependency array**.
- Behavior: **Runs after every render**, including the first render **and every re-render**.

---

### **Example**

```jsx
const [count, setCount] = useState(0);

useEffect(() => {
	console.log("Effect ran");
});

return <button onClick={() => setCount(count + 1)}>Increment</button>;
```

**What happens:**

1. Component renders → effect runs.
2. Click → state changes → component re-renders → effect runs **again**.
3. Click again → effect runs again, **even if the state used in effect didn’t change**.

---

## **2. Potential Problems**

1. **Performance Issues**

   - Effect runs **on every render**, even if unnecessary.
   - Expensive operations (API calls, DOM updates) will be repeated many times.

2. **Infinite Loops**

   ```jsx
   const [count, setCount] = useState(0);

   useEffect(() => {
   	setCount(count + 1); // ❌ updates state inside effect
   }); // no dependency array
   ```

   - Each render triggers `useEffect`.
   - Effect updates state → triggers re-render → effect runs → **infinite loop**.

3. **Stale or inconsistent data**

   - Forgetting dependencies can cause the effect to use **old closures** of state or props.

   ```jsx
   const [count, setCount] = useState(0);

   useEffect(() => {
   	console.log("Count:", count);
   }); // no dependency array
   ```

   - Here, effect logs current count on every render, but if you add async logic, it can capture **stale values** unless you use functional updates or proper dependencies.

---

## **3. Correct Usage Patterns**

### **a) Run only once (on mount)**

```jsx
useEffect(() => {
	console.log("Run once on mount");
}, []); // ✅ empty array
```

### **b) Run on specific dependency change**

```jsx
useEffect(() => {
	console.log("Count changed:", count);
}, [count]); // ✅ effect runs only when count changes
```

### **c) Run every render (rarely needed)**

```jsx
useEffect(() => {
	console.log("Runs every render");
}); // no dependency array
```

- Usually avoid this unless intentionally monitoring **every render**.

---

## **4. Best Practices**

1. **Always think about dependencies**

   - Include **all variables used inside the effect** in the dependency array.

2. **Use ESLint’s `react-hooks/exhaustive-deps`**

   - Warns if dependencies are missing.

3. **Split effects**

   - Don’t combine unrelated logic into one effect to avoid unnecessary dependencies.

4. **Avoid updating state without dependencies**

   - Can cause infinite loops.

---

### **TL;DR**

| Dependency Array | Effect Behavior                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| `[]`             | Run **once** on mount                                                                  |
| `[dep1, dep2]`   | Run **only when dep1 or dep2 changes**                                                 |
| Not provided     | Run **after every render** → potential performance issues, infinite loops, stale state |

---

Absolutely! Let’s do a **deep dive into `useReducer`** in React — covering **use cases, where to use it (and not), different patterns, corner cases, and pitfalls**. I’ll explain it thoroughly like a React pro would think about it.

---

# **1. What is `useReducer`?**

`useReducer` is a **hook for managing complex state logic**.

- It’s like `useState`, but better when state has **multiple sub-values** or **complex transitions**.
- It’s inspired by the **Redux reducer pattern**.

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

- `state` → current state
- `dispatch` → function to trigger state changes
- `reducer` → function `(state, action) => newState`
- `initialState` → starting state

---

# **2. Basic Example**

Counter with increment and decrement:

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
	switch (action.type) {
		case "increment":
			return { count: state.count + 1 };
		case "decrement":
			return { count: state.count - 1 };
		default:
			return state;
	}
}

function Counter() {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<>
			<p>Count: {state.count}</p>
			<button onClick={() => dispatch({ type: "increment" })}>+</button>
			<button onClick={() => dispatch({ type: "decrement" })}>-</button>
		</>
	);
}
```

✅ **Why use `useReducer` here?**

- Easy to scale if more actions are added (reset, multiply, etc.)
- Keeps state updates predictable

---

# **3. When to Use `useReducer`**

### **a) Complex State**

- Multiple related pieces of state.

```jsx
const initialState = { username: "", email: "", password: "" };
```

- Instead of multiple `useState`s:

```jsx
setUsername("new"); // separate for each field
```

- `useReducer` can handle **all fields in one state object** cleanly.

### **b) State depends on previous state**

- Functional updates get verbose with `useState` if multiple sub-values need updating.

### **c) Predictable State Transitions**

- When you want **all state changes centralized** and easier to debug.
- Example: multi-step forms, complex UI interactions.

### **d) Optimizing Performance**

- If passing state setters down many layers, using `dispatch` reduces prop drilling.
- Can combine with `useContext` to mimic a mini Redux pattern.

---

# **4. When NOT to Use `useReducer`**

1. **Simple state**

```jsx
const [count, setCount] = useState(0); // simpler
```

2. **Unrelated state variables**

- Don’t combine totally unrelated pieces into one reducer; it adds complexity.

3. **If you need local transient state**

- Toggles, simple flags, counters — `useState` is easier and more readable.

---

# **5. Different Cases / Patterns**

### **a) Multiple Actions**

```jsx
switch (action.type) {
	case "increment":
		return { count: state.count + 1 };
	case "decrement":
		return { count: state.count - 1 };
	case "reset":
		return initialState;
}
```

### **b) Object / Array State**

- Updating arrays:

```jsx
case "addTodo":
  return { todos: [...state.todos, action.payload] };
case "removeTodo":
  return { todos: state.todos.filter(t => t.id !== action.payload) };
```

- Updating objects:

```jsx
case "updateField":
  return { ...state, [action.field]: action.value };
```

### **c) Lazy Initialization**

```jsx
function init(initialValue) {
	return { count: initialValue };
}

const [state, dispatch] = useReducer(reducer, 0, init);
```

- Useful for **expensive initial computations**.

---

# **6. Corner Cases**

1. **State mutation**

```jsx
case "increment":
  state.count += 1; // ❌ BAD
  return state;
```

- **Trap:** `useReducer` expects **immutable updates**. Always return a new object.

2. **Action payload mistakes**

```jsx
dispatch({ type: "addTodo" }); // forgot payload
```

- **Trap:** Reducer may crash or update state incorrectly.

3. **Nested objects**

- Updating deeply nested state without immutability helpers can be error-prone.

```jsx
return { ...state, nested: { ...state.nested, value: 5 } };
```

- Use libraries like **Immer** for cleaner updates.

4. **Switch fall-through**

- Forgetting `default` → undefined state returned → component breaks.

5. **Derived state**

- Don’t store something in state that can be computed from existing state.

```jsx
// Bad
{
	total: state.items.length;
} // better compute dynamically
```

---

# **7. Pitfalls**

| Pitfall                    | Example                       | Fix / Best Practice                                                 |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Mutating state             | `state.count++`               | Always return a **new object**                                      |
| Missing default            | No default in switch          | Always return `state` as fallback                                   |
| Deep nesting               | `state.user.profile.name`     | Use `...` spread or Immer for immutability                          |
| Overkill                   | Single primitive like `count` | Use `useState` instead                                              |
| Async logic inside reducer | Calling API inside reducer    | Reducers must be **pure functions**; side effects go in `useEffect` |

---

# **8. Summary / Rule of Thumb**

- ✅ Use `useReducer` for **complex state**, multiple interrelated fields, predictable transitions.
- ✅ Combine with `useContext` for **centralized state** without Redux.
- ❌ Avoid for simple counters, toggles, or unrelated states.
- ✅ Always return a **new state object**, never mutate.
- ✅ Keep reducers **pure**, no side effects.

---

If you want, I can create a **mini interactive React playground** showing:

1. Simple counter with `useReducer`
2. Form with multiple fields
3. Todo list (array updates)
4. Corner case mistakes like mutating state

So you can **see best practices vs pitfalls in action**.

Do you want me to make that?

---

Absolutely! Let’s deep dive into **Custom Hooks** in React — what they are, why we use them, different use cases, best practices, and corner cases/pitfalls. I’ll make it detailed like a React pro would explain.

---

# **1. What is a Custom Hook?**

A **Custom Hook** is a JavaScript function whose name starts with `use` and **can call other hooks** inside it.

- Purpose: **Reuse logic** across multiple components.
- They **do not render JSX directly**, only manage logic and state.
- Follows React **Rules of Hooks**:

  - Only call hooks at the top level.
  - Only call hooks from React functions or other hooks.

**Syntax:**

```jsx
function useCustomHook() {
	// can use useState, useEffect, useReducer, etc.
	return something; // state, functions, or any value
}
```

---

# **2. Basic Example**

**Use case: Track window width**

```jsx
import { useState, useEffect } from "react";

function useWindowWidth() {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return width;
}

// Usage in component
function App() {
	const width = useWindowWidth();

	return <p>Window width: {width}px</p>;
}
```

✅ **Why this is useful:**

- Instead of repeating `useEffect` logic in multiple components, we **encapsulate it** in a hook.

---

# **3. Different Use Cases for Custom Hooks**

### **a) Fetching / Data Loading**

```jsx
function useFetch(url) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);

		fetch(url, { signal: controller.signal })
			.then((res) => res.json())
			.then(setData)
			.catch((err) => {
				if (err.name !== "AbortError") setError(err);
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [url]);

	return { data, loading, error };
}
```

- Reusable **data fetching logic** for any endpoint.

---

### **b) Form Handling**

```jsx
function useForm(initialValues) {
	const [values, setValues] = useState(initialValues);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setValues((prev) => ({ ...prev, [name]: value }));
	};

	const resetForm = () => setValues(initialValues);

	return { values, handleChange, resetForm };
}

// Usage
const { values, handleChange } = useForm({ username: "", email: "" });
```

---

### **c) Authentication / Token Management**

```jsx
function useAuth() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) setUser({ name: "Sriram" });
	}, []);

	const login = (token) => {
		localStorage.setItem("token", token);
		setUser({ name: "Sriram" });
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	return { user, login, logout };
}
```

- Can be used across multiple components **without repeating logic**.

---

### **d) Debounce / Throttle**

```jsx
function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}
```

- Useful for search inputs or avoiding rapid state updates.

---

# **4. Best Practices**

1. **Always start the name with `use`**

   - React relies on this to enforce **rules of hooks**.

2. **Keep hooks focused**

   - Each custom hook should handle **one concern**, e.g., form logic, fetch logic.

3. **Return only what’s needed**

   - Return state and handlers, not internal variables.

4. **Avoid side effects outside `useEffect`**

   - Always wrap async or DOM effects inside `useEffect`.

5. **Combine hooks**

   - Custom hooks can call other hooks internally (e.g., `useState` + `useEffect`).

---

# **5. Corner Cases / Pitfalls**

| Pitfall                                         | Example                                      | Explanation / Fix                                                        |
| ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| Forgetting `use` prefix                         | `function windowWidth()`                     | React won’t recognize it as a hook; breaks rules of hooks                |
| Returning mutable objects                       | Returning same object reference              | Causes unnecessary re-renders; always return new object if needed        |
| Including functions/objects in deps incorrectly | `useEffect(() => {...}, [obj])`              | Memoize objects/functions with `useMemo`/`useCallback`                   |
| Async logic mistakes                            | Calling async function directly in hook body | Wrap in `useEffect` with proper cleanup                                  |
| Overloading hook with multiple concerns         | Combining fetch + form + auth                | Makes hook hard to maintain; split into multiple hooks                   |
| Using hook conditionally                        | `if (loggedIn) useCustomHook()`              | ❌ Breaks rules of hooks; always call hooks unconditionally at top level |

---

# **6. Summary**

- **Custom Hooks = logic reuse**
- Can combine `useState`, `useReducer`, `useEffect`, etc.
- **Best for:** forms, fetch, auth, debounce, subscriptions, timers.
- **Avoid:** overloading, conditional calls, returning stale objects.
- **Corner case vigilance:** async cleanup, memoization, immutable returns.

---

If you want, I can create a **single React playground** that shows **5–6 different real-world custom hooks** like:

- `useWindowWidth`
- `useDebounce`
- `useFetch`
- `useForm`
- `useAuth`

And show **correct usage vs common pitfalls**.

Do you want me to do that?
