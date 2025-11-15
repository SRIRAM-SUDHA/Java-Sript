## 🧭 **Chapter 1 — Introduction & Setup**

### 📘 **1. What is Backend Development?**

Before diving into Node.js, understand what backend means:

- **Frontend:** What the user sees — UI built with HTML, CSS, JavaScript (React, etc.)
- **Backend:** The behind-the-scenes part — handles logic, databases, authentication, etc.
- **Backend tasks include:**

  - Handling client requests (like login, saving data)
  - Communicating with databases
  - Processing data and sending responses
  - Managing authentication, sessions, APIs

🧩 **Example Flow:**

```
User → (Frontend Request) → Backend Server (Node.js) → Database → Response → User
```

---

### 📗 **2. What is Node.js?**

**Node.js** is:

> A **JavaScript runtime** built on Chrome’s **V8 engine**, that lets you run JavaScript code **outside the browser** — typically on a **server**.

🔹 Key points:

- JavaScript was originally made for browsers (frontend).
- Node.js lets you use JS for backend too.
- Non-blocking, event-driven — great for scalable apps.

🧠 Think of Node.js as:

> "The engine that runs your JavaScript code on your computer/server instead of the browser."

---

### 📘 **3. Why use Node.js?**

| Feature            | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| ⚡ Fast            | Uses Google’s V8 engine (C++ based, very fast).                 |
| 🧵 Single-threaded | Handles multiple requests efficiently using an event loop.      |
| 🔁 Asynchronous    | Doesn’t block other tasks while waiting (e.g., reading a file). |
| 🌍 Huge ecosystem  | npm has 2M+ open-source packages.                               |
| 🧩 Same language   | You can use JavaScript for both frontend and backend.           |

✅ Perfect for:

- REST APIs
- Real-time apps (chat, notifications)
- Streaming services
- Microservices

---

### 📗 **4. Installing Node.js**

**Step-by-step:**

#### 🪟 For Windows

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download **LTS version** (Long-Term Support)
3. Install it → keep default options.
4. Open **Command Prompt** and verify:

   ```bash
   node -v
   npm -v
   ```

   This shows Node.js and npm (Node Package Manager) versions.

#### 🐧 For Linux / macOS

Use your terminal:

```bash
sudo apt update
sudo apt install nodejs npm -y
node -v
npm -v
```

If you want the latest version, use **nvm** (Node Version Manager):

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install --lts
```

---

### 📘 **5. Running Your First Node.js Script**

1. Create a file:

   ```bash
   touch hello.js
   ```

2. Open it in your editor and add:

   ```js
   console.log("Hello from Node.js!");
   ```

3. Run it:

   ```bash
   node hello.js
   ```

🖥️ Output:

```
Hello from Node.js!
```

Congratulations 🎉 — You’ve just run JavaScript **outside the browser**!

---

### 📗 **6. Understanding REPL**

**REPL** = _Read–Eval–Print–Loop_

You can use it as a mini playground:

```bash
node
```

Try typing:

```js
> 2 + 3
5
> console.log("Hi")
Hi
undefined
> const name = "Sriram"
> name.toUpperCase()
'SRIRAM'
```

To exit REPL:

```
Ctrl + C (twice)
```

---

### 📘 **7. Understanding Node.js Execution Model**

- Node.js runs on **a single thread**.
- But uses an **event loop** to handle multiple tasks asynchronously.
- Non-blocking I/O allows Node to manage many operations simultaneously.

🧩 Example:

```js
console.log("Start");

setTimeout(() => {
	console.log("After 2 seconds");
}, 2000);

console.log("End");
```

🖥️ Output:

```
Start
End
After 2 seconds
```

💡 Even though `setTimeout` is 2 seconds, the rest of the code continues — that’s asynchronous, non-blocking behavior.

---

### 📗 **8. Using `process` and Command-Line Arguments**

You can access command-line arguments in Node using `process.argv`:

```js
// file: greet.js
const name = process.argv[2];
console.log(`Hello, ${name}!`);
```

Run:

```bash
node greet.js Sriram
```

Output:

```
Hello, Sriram!
```

🧠 `process.argv` gives you an array:

- `[0]` → node path
- `[1]` → file path
- `[2]` → your argument
