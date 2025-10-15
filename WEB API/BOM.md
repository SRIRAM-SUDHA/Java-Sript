Perfect 👍 Let’s zoom in on **BOM (Browser Object Model)**.

---

## 🌐 What is the **BOM (Browser Object Model)?**

- BOM is the set of **APIs provided by the browser** to interact with the **browser environment** itself (not the webpage content).
- If **DOM** lets you manipulate the **document (HTML/CSS)**, the **BOM** lets you interact with the **browser window, navigation, and environment**.
- The **root object** of the BOM is `window`.

👉 In short:

- **DOM** → controls the **page** (elements, content).
- **BOM** → controls the **browser environment** (tabs, window, history, navigator, etc.).

---

## 🔹 Key Components & APIs of BOM

### 1. **`window` object**

- Represents the **browser window**.
- All BOM features come under it.
- Common methods:

  - `window.open(url, name, specs)` → open a new window/tab
  - `window.close()` → close the current window (if opened by script)
  - `window.resizeTo(width, height)` → resize window
  - `window.alert("Hi")`, `window.confirm()`, `window.prompt()` → dialog boxes

---

### 2. **`navigator` object**

- Gives information about the **browser and device**.
- Common properties & methods:

  - `navigator.userAgent` → browser details
  - `navigator.language` → language of the browser
  - `navigator.onLine` → check internet connection
  - `navigator.geolocation.getCurrentPosition()` → location API
  - `navigator.clipboard.readText()` / `writeText()` → clipboard

---

### 3. **`screen` object**

- Gives information about the **user’s screen**.
- Common properties:

  - `screen.width`, `screen.height` → full screen size
  - `screen.availWidth`, `screen.availHeight` → available size (excluding taskbars)
  - `screen.orientation` → current screen orientation

---

### 4. **`location` object**

- Represents the **URL of the current page**.
- Lets you redirect, reload, or get parts of the URL.
- Common properties & methods:

  - `location.href` → full URL (can set it to redirect)
  - `location.protocol` → http / https
  - `location.hostname` → domain name
  - `location.pathname` → path (`/about`)
  - `location.search` → query string (`?id=123`)
  - `location.reload()` → reload page
  - `location.assign(url)` → navigate to new URL

---

### 5. **`history` object**

- Deals with the **browser’s session history** (back/forward navigation).
- Common methods:

  - `history.back()` → go to previous page
  - `history.forward()` → go to next page
  - `history.go(n)` → jump n steps (e.g., `-1` = back, `2` = forward two)

---

### 6. **`console` object**

- For debugging inside the browser’s developer tools.
- Methods:

  - `console.log()`, `console.error()`, `console.warn()`, `console.table()`, etc.

---

## ✅ BOM Summary (Important Objects & Uses)

| Object      | Purpose                                     |
| ----------- | ------------------------------------------- |
| `window`    | Browser window control, dialogs             |
| `navigator` | Browser/device info, geolocation, clipboard |
| `screen`    | Screen size & orientation                   |
| `location`  | Current page URL & navigation               |
| `history`   | Browsing history navigation                 |
| `console`   | Debugging and logging                       |

---

👉 So BOM is everything **around the webpage**, provided by the browser.

Would you like me to also prepare a **mindmap-style diagram** (showing BOM → window → navigator, location, screen, history, etc.) so you can memorize it quickly?
