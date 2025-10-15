Nice catch — thanks for pointing that out! You're absolutely right: there are several **`has`-style** checks across the DOM and JS that are easy to miss because they live in different API families. I should have listed them. Below is a compact, organized reference with short explanations and examples so you can see where each `has` (or similar) lives and when to use it.

---

## DOM / Element-related `has` checks

### 1. `element.hasAttribute(name)`

Checks whether an element has a specific attribute.

```html
<div id="card" data-id="42"></div>
<script>
	const el = document.getElementById("card");
	console.log(el.hasAttribute("data-id")); // true
	console.log(el.hasAttribute("title")); // false
</script>
```

### 2. `element.hasAttributes()`

Returns `true` if the element has **any** attributes at all.

```js
const el = document.getElementById("card");
console.log(el.hasAttributes()); // true if it has at least one attribute
```

### 3. `element.hasChildNodes()`

Tells you whether the node has **any child nodes** (includes text nodes & comments).

```html
<div id="p">Hello</div>
<script>
	const p = document.getElementById("p");
	console.log(p.hasChildNodes()); // true (text node "Hello")
</script>
```

### 4. `parentNode.contains(childNode)`

Checks whether a node is a **descendant** of another node (true if same node or inside).

```html
<div id="wrap"><p id="txt">X</p></div>
<script>
	const wrap = document.getElementById("wrap");
	const txt = document.getElementById("txt");
	console.log(wrap.contains(txt)); // true
	console.log(document.body.contains(wrap)); // usually true
</script>
```

### 5. `element.classList.contains(className)`

(Previously discussed) Checks whether the element's class list includes a class.

```js
el.classList.add("active");
console.log(el.classList.contains("active")); // true
```

---

## JavaScript (non-DOM) `has` checks

### 6. `Map.prototype.has(key)` and `Set.prototype.has(value)`

Test membership in ES collections.

```js
const m = new Map([["a", 1]]);
console.log(m.has("a")); // true

const s = new Set([1, 2, 3]);
console.log(s.has(2)); // true
```

### 7. `URLSearchParams.prototype.has(param)`

Check if a URL query parameter exists.

```js
const qp = new URLSearchParams("?q=1&page=2");
console.log(qp.has("q")); // true
console.log(qp.has("other")); // false
```

---

## CSS `:has()` selector (selector-level “has”)

A **CSS relational pseudo-class** that selects elements which **contain** (or match) something inside. Useful with `querySelector`/`querySelectorAll`:

```js
// Select any article that has at least one img child
const articlesWithImages = document.querySelectorAll("article:has(img)");
```

> Note: `:has()` is powerful (e.g., `ul:has(li.active)`), but historically had spotty browser support — modern browsers have been adding support. If you need wide compatibility, check caniuse or use JS fallbacks.

---

## Other misc `has`-like APIs you might encounter

- `Element.hasPointerCapture(pointerId)` — pointer capture status (advanced pointer API).
- `document.hasFocus()` — whether document has focus (returns boolean).

---

## Why I missed it earlier

These `has` checks are spread across different API families (Element methods, DOM utilities, JS collection APIs, CSS selectors). When grouping topics by category (selectors, traversal, properties), a few of these lived at the boundaries — so I should’ve explicitly listed them. Thanks for catching that!

---

Would you like:

- A short interactive demo showing `hasAttribute`, `hasChildNodes`, `contains`, and `classList.contains` in action?
- Or add `:has()` examples and a browser-support note to your learning checklist?

Pick one and I’ll build it for you right away.
