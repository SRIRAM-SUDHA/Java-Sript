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

Your code is almost correct, Sri. You're using the browser's Geolocation API to get the user's current location.

```
navigator.geolocation.getCurrentPosition(
  (position) => console.log(position)
);
```

### 1. Access latitude and longitude

The `position` object contains a `coords` property.

```
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  },
  (error) => {
    console.error(error.message);
  }
);
```

### 2. What does `position` contain?

```
{
  coords: {
    latitude: 17.385,
    longitude: 78.4867,
    accuracy: 20
  },
  timestamp: 1792300000000
}
```

Example values only.

| Property           | Meaning                             |
| ------------------ | ----------------------------------- |
| `coords.latitude`  | Latitude                            |
| `coords.longitude` | Longitude                           |
| `coords.accuracy`  | Estimated accuracy in meters        |
| `timestamp`        | Time when the position was obtained |

### 3. Why might it not work?

- Permission denied: The user blocked location access.
- Timeout: The browser couldn't obtain the location in time.
- Insecure context: Geolocation generally requires HTTPS or `localhost`.
- Callback missing: Your original code has no error callback.

### 4. Best practice: handle success and errors

```
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;

    console.log({ latitude, longitude });
  },
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("Location permission denied");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location unavailable");
        break;
      case error.TIMEOUT:
        console.log("Location request timed out");
        break;
    }
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);
```

Frontend interview tip: `getCurrentPosition()` retrieves a location once. For continuous location updates, use `navigator.geolocation.watchPosition()` and clean up with `navigator.geolocation.clearWatch(watchId)`.

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
