Nice — below is a focused, practical deep-dive for **each `fs` topic you listed**. For every method I show:

- what it does
- common signatures (callback / sync / promise)
- important options (and the meaning of flags/mode etc.)
- short examples (callback, sync, and `async/await` where applicable)
- common pitfalls & tips

Use the Node `fs` API like this at the top of your file:

```js
// CommonJS
const fs = require("fs");
const fsp = require("fs").promises; // or: require("fs/promises")
const { pipeline } = require("stream");
const { pipeline: pipelinePromise } = require("stream/promises"); // Node 15+

// Or in ESM:
// import fs from 'fs';
// import fsp from 'fs/promises';
```

---

# File Read / Write

## `fs.readFile(path[, options], callback)`

**Also:** `fs.readFileSync(path[, options])`, `fsp.readFile(path[, options])`

**What it does:** reads entire file into memory and returns `Buffer` (by default) or string (if `encoding` provided).

**Options:**

- `encoding` — `'utf8'`, `'ascii'`, etc. If omitted you get a `Buffer`.
- `flag` — e.g. `'r'` (default), `'rs'` (synchronous), see flags table below.
- `signal` — an `AbortSignal` to cancel the operation (Node supports this on recent versions).

**Example — callback**

```js
fs.readFile("./data.txt", { encoding: "utf8" }, (err, content) => {
	if (err) return console.error(err);
	console.log(content);
});
```

**Example — sync**

```js
const text = fs.readFileSync("./data.txt", "utf8");
```

**Example — promise/async**

```js
const content = await fsp.readFile("./data.txt", { encoding: "utf8" });
```

**Pitfalls / tips**

- If you omit encoding you will get a `Buffer`. For text files use `'utf8'`.
- Not suitable for very large files (would use streams).
- `flag` values can change semantics; typically use default `'r'`.

---

## `fs.writeFile(path, data[, options], callback)`

**Also:** `fs.writeFileSync`, `fsp.writeFile`

**What it does:** writes data to file — **overwrites** by default (creates file if it doesn't exist).

**Options:**

- `encoding` — e.g. `"utf8"`.
- `mode` — file permission bits (e.g. `0o666`) — will be masked by process `umask`.
- `flag` — e.g. `'w'` (write, truncate), `'wx'` (fail if exists), `'w+'`, etc.
- `signal` — AbortSignal to cancel.

**Flags summary (common):**

- `'r'` — read
- `'r+'` — read/write
- `'w'` — write (truncate or create)
- `'wx'` — write, fail if exists (exclusive)
- `'a'` — append (create if not exists)
- `'ax'` — append, fail if exists

**Example — simple (async)**

```js
await fsp.writeFile("./out.txt", "hello world", {
	encoding: "utf8",
	mode: 0o644,
});
```

**Example — fail if file exists**

```js
try {
	await fsp.writeFile("./out.txt", "x", { flag: "wx" });
} catch (err) {
	if (err.code === "EEXIST") console.error("already exists");
}
```

**Atomic write pattern (recommended when accuracy matters):**

```js
// write to temp, then rename (rename is atomic on POSIX)
await fsp.writeFile("./out.txt.tmp", data);
await fsp.rename("./out.txt.tmp", "./out.txt");
```

**Pitfalls / tips**

- `writeFile` **isn’t guaranteed atomic**; if that matters, write to a temp file and `rename`.
- Simultaneous `writeFile` calls can race; coordinate or use append/stream.

---

## `fs.appendFile(path, data[, options], callback)`

**Also:** `fs.appendFileSync`, `fsp.appendFile`

**What it does:** appends data to a file (creates file if not present). Default `flag: 'a'`.

**Options:** same as `writeFile` (`encoding`, `mode`, `flag`).

**Example**

```js
await fsp.appendFile("./log.txt", "entry\n");
// or callback
fs.appendFile("./log.txt", "entry\n", (err) => {
	if (err) throw err;
});
```

**Pitfalls / tips**

- On POSIX with `O_APPEND` the append operation is atomic at the OS level **for a single write syscall**, but that isn’t a universal cross-filesystem guarantee (NFS caveats). For high-concurrency logging use append streams or a logging system.
- If you want strict "create only if not exists" behavior, use `flag: 'ax'`.

---

# File Delete & Rename

## `fs.unlink(path, callback)`

**Also:** `fs.unlinkSync`, `fsp.unlink`

**What it does:** deletes a file. (Use `fs.rm` for more options.)

**Example**

```js
await fsp.unlink("./temp.txt");
```

**Pitfalls / tips**

- Deleting a non-existent file throws `ENOENT`.
- For recursive directory deletion use `fs.rm` with `recursive: true` (below).

---

## `fs.rename(oldPath, newPath, callback)`

**Also:** `fs.renameSync`, `fsp.rename`

**What it does:** moves/renames a file or directory. Usually atomic when on the same filesystem.

**Example**

```js
await fsp.rename("./tmp.txt", "./data/real.txt");
```

**Pitfalls / tips**

- **Cross-device move**: if `oldPath` and `newPath` are on different devices you get `EXDEV`. Fallback pattern:

  1. `fs.copyFile(src, dest)`
  2. `fs.unlink(src)`
     (Or use `fsp.copyFile` then `fsp.unlink`.)

- Behavior when destination exists: on POSIX `rename` usually overwrites target atomically; on Windows behavior differs — be defensive if you rely on specific semantics.

---

# Directory Handling

## `fs.mkdir(path[, options], callback)`

**Also:** `fs.mkdirSync`, `fsp.mkdir`

**Options:**

- `recursive` (boolean) — if `true`, create nested directories. If the directory already exists and `recursive:true` no error is thrown.
- `mode` — permission bits for newly created dirs, e.g. `0o777` (subject to `umask`).

**Examples**

```js
// create single dir
await fsp.mkdir("./cache");

// create nested dirs (mkdir -p equivalent)
await fsp.mkdir("./a/b/c", { recursive: true });
```

**Pitfalls / tips**

- Without `recursive` you will get `EEXIST` if directory exists.
- `recursive:true` will not throw if the path already exists (convenient).

---

## `fs.readdir(path[, options], callback)`

**Also:** `fs.readdirSync`, `fsp.readdir`

**Options:**

- `encoding` — `'utf8'` etc.
- `withFileTypes` (boolean) — if `true`, returns `Dirent` objects instead of name strings. `Dirent` has methods: `.isFile()`, `.isDirectory()`, `.isSymbolicLink()`.

**Examples**

```js
// simple names
const names = await fsp.readdir("./mydir");

// Dirent usage
const entries = await fsp.readdir("./mydir", { withFileTypes: true });
for (const dirent of entries) {
	console.log(dirent.name, dirent.isFile(), dirent.isDirectory());
}
```

**Pitfalls / tips**

- `readdir` returns names only — to get stats you must call `stat` per entry (or use `withFileTypes` as optimization to avoid some `stat` calls).

---

## `fs.rm(path[, options], callback)`

**Also:** `fs.rmSync`, `fsp.rm`

**What it does:** modern unified API to remove files and directories. Replaces `fs.rmdir` (which is limited to empty directories) for most use-cases.

**Options:**

- `recursive` (boolean) — remove directories and their contents.
- `force` (boolean) — ignore errors if path does not exist (similar to `rm -f`).
- `maxRetries`, `retryDelay` — retry options on Windows/locked files (supported in recent Node versions).
- `signal` — AbortSignal.

**Example — remove directory tree**

```js
await fsp.rm("./dist", { recursive: true, force: true });
```

**Pitfalls / tips**

- Be careful with `recursive: true` — it will delete content irreversibly.
- Use `force:true` for idempotent deletes (i.e., ignore missing files).

---

# Metadata

## `fs.stat(path, callback)` and `fs.lstat(path, callback)`

**Also:** `fs.statSync`, `fsp.stat`, `fsp.lstat`

**What they do:**

- `stat` follows symlinks and returns stats for the target.
- `lstat` returns stats for the link itself (if path is a symlink).

**Options:**

- `{ bigint: true }` — return numeric timestamps/size as `BigInt` (useful for very large files).

**Common properties of `stats`:**

- `stats.isFile()`, `stats.isDirectory()`, `stats.size` (bytes)
- `stats.mtime`, `stats.ctime`, `stats.birthtime`

**Example**

```js
const s = await fsp.stat("./file.txt");
console.log(s.isFile(), s.size, s.mtime.toISOString());
```

**Pitfalls / tips**

- `stat` gives a snapshot — between `stat` and subsequent action the file could change (TOCTOU). Prefer to attempt the operation and handle errors.

---

## `fs.access(path[, mode], callback)`

**Also:** `fs.accessSync`, `fsp.access`

**What it does:** checks if the calling process can access the file with the specified mode.

**Modes (via `fs.constants`):**

- `fs.constants.F_OK` — file exists
- `fs.constants.R_OK` — readable
- `fs.constants.W_OK` — writable
- `fs.constants.X_OK` — executable

**Example**

```js
try {
	await fsp.access("./config.json", fs.constants.R_OK | fs.constants.W_OK);
	// file exists & is readable and writable
} catch (err) {
	console.error("Not accessible:", err.code);
}
```

**Pitfalls / tips**

- **TOCTOU**: Checking with `access` then performing an operation is susceptible to race conditions. It’s often safer to just perform the operation and handle errors.

---

# Watching Files

## `fs.watch(filename[, options][, listener])`

**What it does:** Notify you when file or directory contents change.

**Options:**

- `persistent` (default `true`) — whether the process should continue running as long as the watcher is active.
- `recursive` (boolean) — watch subdirectories (only supported on macOS/Windows; Linux inotify does not support it).
- `encoding` — encoding for `filename` (default `'utf8'`).

**Callback:** `(eventType, filename)` where `eventType` is `'rename'` or `'change'`. `filename` can be `null` on some platforms.

**Example**

```js
const watcher = fs.watch(
	"./notes",
	{ recursive: false },
	(eventType, filename) => {
		console.log(eventType, filename);
	}
);
// later
watcher.close();
```

**Alternatives:**

- `fs.watchFile()` — polling-based (less efficient) with options `{ interval }`.

**Pitfalls / tips**

- `fs.watch` is **platform-dependent and can be unreliable** (miss events, coalesce multiple events). For production file-watching use a battle-tested library like **chokidar** (which handles cross-platform edge-cases).
- `rename` event may indicate deletion, rename, or create.

---

# Streams

Streams are the right tool for **large files** or **pipelining**.

## `fs.createReadStream(path[, options])`

**Options:**

- `flags` — default `'r'`.
- `encoding` — if you want string chunks.
- `fd` — supply an existing file descriptor.
- `autoClose` — default `true`.
- `start`, `end` — byte positions for partial reads.
- `highWaterMark` — buffer size (default 64KB for streams).

**Example**

```js
const rs = fs.createReadStream("./big.bin", { highWaterMark: 64 * 1024 });
rs.on("data", (chunk) => {
	console.log("got chunk", chunk.length);
});
rs.on("end", () => console.log("done"));
rs.on("error", (err) => console.error(err));
```

## `fs.createWriteStream(path[, options])`

**Options:**

- `flags` — default `'w'`. Use `'a'` to append.
- `encoding`, `mode` — like `writeFile`.
- `start` — position to begin writing.
- `autoClose` — default `true`.

**Example — piping**

```js
const rs = fs.createReadStream("./large.iso");
const ws = fs.createWriteStream("./copy.iso");
rs.pipe(ws);
```

**Better: use `pipeline` to handle errors & cleanup**

```js
const { pipeline } = require("stream");
pipeline(
	fs.createReadStream("./large.iso"),
	fs.createWriteStream("./copy.iso"),
	(err) => {
		if (err) console.error("Pipeline failed", err);
		else console.log("Pipeline succeeded");
	}
);

// or async/await
await pipelinePromise(fs.createReadStream("./a"), fs.createWriteStream("./b"));
```

**Pitfalls / tips**

- Use `pipeline` (or `stream/promises`) to handle cleanup and errors robustly.
- For partial reads/writes use `start`/`end`.
- Streams are memory-efficient and ideal for large transfers or streaming to HTTP responses.

---

# Promises API (`fs.promises`)

Use `const fsp = require("fs").promises` or `require("fs/promises")`. All major operations have promise equivalents: `readFile`, `writeFile`, `appendFile`, `mkdir`, `readdir`, `stat`, `rm`, `rename`, `unlink`, `open`, etc.

**Examples**

```js
// read, append, and show stat
try {
	const data = await fsp.readFile("./data.txt", "utf8");
	await fsp.appendFile("./log.txt", `read ${Date.now()}\n`);
	const s = await fsp.stat("./data.txt");
	console.log("size:", s.size);
} catch (err) {
	console.error(err);
}
```

**File handles (advanced)**
`const fh = await fsp.open("file.txt", "r+");` returns a `FileHandle` with methods `.read()`, `.write()`, `.close()`. Use `FileHandle` when performing multiple low-level read/write calls (faster than open/close each time).

**Example using FileHandle**

```js
const fh = await fsp.open("file.bin", "r");
const buffer = Buffer.alloc(1024);
const { bytesRead } = await fh.read(buffer, 0, buffer.length, 0);
await fh.close();
```

---

# Common patterns, flags, and quick reference

**Flags quick table (for `open` / read/write):**

- `'r'` — read
- `'r+'` — read & write
- `'rs'` — synchronous read (bypass caches)
- `'w'` — write (create/truncate)
- `'wx'` — write exclusive (fail if exists)
- `'a'` — append
- `'ax'` — append exclusive

**Mode defaults & `umask`:**

- Default file mode for `writeFile` is usually `0o666` masked by process `umask`.
- Default dir mode for `mkdir` is usually `0o777` masked by `umask`.

**Existence checks:**
Avoid `fs.exists()` (deprecated style). Use `try/catch` with the operation, or `fs.access` if you must check prior to an operation (but watch for race conditions).

**Cross-device rename fallback:**

```js
async function moveAcrossDevices(src, dest) {
	try {
		await fsp.rename(src, dest);
	} catch (err) {
		if (err.code === "EXDEV") {
			// copy-then-unlink fallback
			await fsp.copyFile(src, dest);
			await fsp.unlink(src);
		} else throw err;
	}
}
```

**Large file handling:** use streams + `pipeline`. Don’t `readFile` massive files into memory.

**Watching in production:** use `chokidar` for a stable cross-platform watcher.

---

# Final tips & common pitfalls (summary)

- Prefer async (`fs.promises` or callbacks) in server code — sync methods block the event loop.
- Always **handle errors** (try/catch or callbacks).
- Be careful with defaults: `readFile` → `Buffer` unless `encoding` set.
- `writeFile` is not automatically atomic — use temp+rename for atomic updates.
- `appendFile` uses `O_APPEND`, which is often atomic for single write syscalls on POSIX, but do not rely on it across all filesystems or for multi-step appends.
- `fs.watch` is platform-dependent — use libraries for production-grade watching.
- When performing many `stat`/`read` operations in a directory, prefer `withFileTypes` from `readdir` to save `stat` calls where possible.

---

Got it ✅ — since you’re asking _either_ for a **cheat-sheet** or **example scripts**, I’ll prepare **both**, so you can pick what you need:

---

# 📄 Node.js `fs` Cheat-Sheet (Printable, One-Page)

```txt
=== FILE READ / WRITE ===
fs.readFile(path, [opts], cb)         // async read
fs.readFileSync(path, [opts])         // sync
fsp.readFile(path, [opts])            // promise
  opts: { encoding: "utf8", flag: "r" }

fs.writeFile(path, data, [opts], cb)  // overwrite/create
fs.appendFile(path, data, [opts], cb) // append/create
fsp.writeFile, fsp.appendFile
  opts: { encoding: "utf8", flag: "w", mode: 0o644 }

=== FILE DELETE / RENAME ===
fs.unlink(path, cb)        // delete file
fs.rename(old, new, cb)    // move/rename

=== DIRECTORY HANDLING ===
fs.mkdir(path, [opts], cb)
  opts: { recursive: true, mode: 0o755 }

fs.readdir(path, [opts], cb)
  opts: { withFileTypes: true }

fs.rm(path, [opts], cb)
  opts: { recursive: true, force: true }

=== METADATA ===
fs.stat(path, cb)          // follow symlinks
fs.lstat(path, cb)         // stats of symlink itself
fs.access(path, mode, cb)  // check access
  mode: fs.constants.F_OK | R_OK | W_OK | X_OK

=== WATCHING ===
fs.watch(path, [opts], cb)
  opts: { recursive: true, persistent: true }

=== STREAMS ===
fs.createReadStream(path, [opts])
  opts: { start, end, highWaterMark, encoding }
fs.createWriteStream(path, [opts])
  opts: { flags: "w" | "a" }

pipeline(rs, ws, cb)      // robust stream piping
await pipelinePromise(rs, ws)

=== PROMISES API ===
const fsp = require("fs").promises
await fsp.readFile("file.txt", "utf8")
await fsp.writeFile("out.txt", "hello")
await fsp.mkdir("dir", { recursive: true })
await fsp.rm("dir", { recursive: true, force: true })
```

---

# 📜 Example Scripts

## 1. Recursive Copy

```js
const fs = require("fs").promises;
const path = require("path");

async function copyDir(src, dest) {
	await fs.mkdir(dest, { recursive: true });
	const entries = await fs.readdir(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath);
		} else {
			await fs.copyFile(srcPath, destPath);
		}
	}
}

copyDir("./src", "./backup");
```

---

## 2. Atomic Write

```js
const fs = require("fs").promises;

async function atomicWrite(path, data) {
	const tmp = path + ".tmp";
	await fs.writeFile(tmp, data, "utf8");
	await fs.rename(tmp, path); // atomic replace
}

atomicWrite("config.json", JSON.stringify({ key: "value" }));
```

---

## 3. Watch + Rebuild

```js
const fs = require("fs");

fs.watch("./src", { recursive: true }, (event, filename) => {
	console.log("Change detected:", event, filename);
	// Run your build script
	console.log("Rebuilding...");
});
```

---

## 4. Stream Copy (Large Files)

```js
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipe = promisify(pipeline);

async function copyFile(src, dest) {
	await pipe(fs.createReadStream(src), fs.createWriteStream(dest));
	console.log("Copied:", src, "->", dest);
}

copyFile("big.iso", "backup.iso");
```

---

👉 Which one do you want me to **expand into a full “practice pack”** with tasks + step-by-step solutions:
the **cheat-sheet** or the **example scripts**?
