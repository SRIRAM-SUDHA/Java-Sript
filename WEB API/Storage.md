Awesome 👌 let’s go deep into **Storage APIs**. These are ways to **store data in the browser** so your app can save user preferences, session info, or even offline data.

---

# 🌐 Storage APIs in Browser

---

## 1. **`localStorage`**

- Stores **key-value pairs**.
- Data **does not expire** (stays even after closing browser).
- Stored **per domain** (one website can’t read another’s storage).
- Max size ~5–10 MB.

### 🔹 Methods:

- `localStorage.setItem(key, value)` → Save
- `localStorage.getItem(key)` → Retrieve
- `localStorage.removeItem(key)` → Delete one
- `localStorage.clear()` → Delete all
- `localStorage.key(index)` → Get key name by index
- `localStorage.length` → Number of items

### ✅ Example:

```js
// Save
localStorage.setItem("username", "Alice");

// Get
console.log(localStorage.getItem("username")); // Alice

// Remove
localStorage.removeItem("username");

// Clear all
localStorage.clear();
```

---

## 2. **`sessionStorage`**

- Works **exactly like `localStorage`**, but:

  - Data lasts **only for the session** (cleared when tab/window closes).
  - Also per-domain.

### ✅ Example:

```js
sessionStorage.setItem("sessionID", "12345");
console.log(sessionStorage.getItem("sessionID")); // "12345"

// Close tab → data gone
```

---

## 3. **IndexedDB**

- A **client-side NoSQL database** in the browser.
- Stores **large, structured data** (objects, blobs, files).
- Asynchronous (uses events or promises).
- More complex but very powerful (used in PWAs, offline apps).

### 🔹 Basic Steps:

1. **Open a database**

```js
let request = indexedDB.open("MyDatabase", 1);

request.onsuccess = (event) => {
	let db = event.target.result;
	console.log("DB opened", db);
};
```

2. **Create object store** (like a table)

```js
request.onupgradeneeded = (event) => {
	let db = event.target.result;
	db.createObjectStore("users", { keyPath: "id" });
};
```

3. **Insert data**

```js
let db = request.result;
let tx = db.transaction("users", "readwrite");
let store = tx.objectStore("users");

store.add({ id: 1, name: "Alice" });
```

4. **Read data**

```js
let getReq = store.get(1);
getReq.onsuccess = () => {
	console.log("User:", getReq.result);
};
```

👉 IndexedDB is useful for **offline apps, caching API responses, storing large datasets**.

---

## 4. **Cookies API**

- Small pieces of data stored in the browser (max ~4 KB).
- Sent **automatically with every HTTP request** → useful for authentication.
- Can have **expiry dates**.

### 🔹 Access with JavaScript:

```js
// Set cookie
document.cookie =
	"username=Alice; expires=Fri, 31 Dec 2025 23:59:59 GMT; path=/";

// Read cookies
console.log(document.cookie);

// Update cookie (just overwrite)
document.cookie = "username=Bob; path=/";

// Delete cookie (set expiry in past)
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
```

⚠️ But:

- **Cookies are limited** (4KB storage).
- Mostly used for **authentication/session tracking**.
- For larger data, use **localStorage / IndexedDB**.

---

# ✅ Quick Comparison

| Feature       | localStorage                           | sessionStorage         | IndexedDB                   | Cookies                  |
| ------------- | -------------------------------------- | ---------------------- | --------------------------- | ------------------------ |
| **Data size** | ~5–10 MB                               | ~5–10 MB               | Hundreds MBs+               | ~4 KB                    |
| **Expiry**    | Never                                  | Tab close              | Never (until deleted)       | Set manually             |
| **Data type** | String only                            | String only            | Structured (objects, files) | String                   |
| **Scope**     | Domain                                 | Domain + tab           | Domain                      | Domain + sent to server  |
| **Use cases** | Preferences, theme, caching small data | Temporary data per tab | Offline apps, large data    | Authentication, tracking |

---

✅ **Summary:**

- Use **localStorage** for small persistent data.
- Use **sessionStorage** for temporary per-tab data.
- Use **IndexedDB** for large/structured offline storage.
- Use **Cookies** for authentication & server-related data.

---

👉 Do you want me to also show you a **real-world example** (like saving login state with localStorage, caching API data with IndexedDB, and using cookies for auth)?
