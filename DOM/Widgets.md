Perfect — you’re now talking about **“interactive DOM logic snippets”** — the kind that give your project life: timers, counters, ratings, progress bars, etc. 💡

Here’s a curated list of **clean, real-world DOM interaction snippets** — each small, modular, and beautiful — that you can drop into any project or playground.

---

# ⚡ Common Interactive DOM Snippets

---

## 🕒 1. **Start / Stop Timer**

```html
<div>
	<h2 id="time">0</h2>
	<button id="start">Start</button>
	<button id="stop">Stop</button>
	<button id="reset">Reset</button>
</div>
```

```js
let timer;
let count = 0;
const display = document.getElementById("time");

document.getElementById("start").addEventListener("click", () => {
	if (!timer) {
		timer = setInterval(() => {
			count++;
			display.textContent = count;
		}, 1000);
	}
});

document.getElementById("stop").addEventListener("click", () => {
	clearInterval(timer);
	timer = null;
});

document.getElementById("reset").addEventListener("click", () => {
	clearInterval(timer);
	timer = null;
	count = 0;
	display.textContent = 0;
});
```

✅ **Used in:** Stopwatch, quizzes, countdown apps.

---

## ⏳ 2. **Progress Bar Animation**

```html
<div class="progress-container">
	<div id="progress"></div>
</div>
<button id="fill">Fill Progress</button>
```

```css
.progress-container {
	width: 300px;
	height: 20px;
	background: #ddd;
	border-radius: 10px;
	overflow: hidden;
}
#progress {
	width: 0;
	height: 100%;
	background: linear-gradient(90deg, #00b4db, #0083b0);
	transition: width 0.3s ease;
}
```

```js
document.getElementById("fill").addEventListener("click", () => {
	let progress = 0;
	const bar = document.getElementById("progress");
	const interval = setInterval(() => {
		progress += 5;
		bar.style.width = progress + "%";
		if (progress >= 100) clearInterval(interval);
	}, 100);
});
```

✅ **Used in:** File upload, quiz progress, loading indicators.

---

## ⭐ 3. **Star Rating**

```html
<div id="stars">★★★★★</div>
<p id="ratingText">Rating: 0 / 5</p>
```

```css
#stars {
	font-size: 30px;
	cursor: pointer;
	color: #ccc;
}
.star.active {
	color: gold;
}
```

```js
const stars = document.getElementById("stars");
const ratingText = document.getElementById("ratingText");

stars.addEventListener("click", (e) => {
	const rating = [...stars.textContent].indexOf(e.target.textContent) + 1;
	ratingText.textContent = `Rating: ${rating} / 5`;
	stars.innerHTML = "★★★★★"
		.split("")
		.map((s, i) => `<span class="star ${i < rating ? "active" : ""}">★</span>`)
		.join("");
});
```

✅ **Used in:** Reviews, feedback, e-commerce UI.

---

## 🔢 4. **Counter (Animated Increment)**

```html
<h2 id="count">0</h2>
<button id="increase">+</button>
<button id="decrease">-</button>
```

```js
let value = 0;
const count = document.getElementById("count");

function update() {
	count.textContent = value;
}

document.getElementById("increase").addEventListener("click", () => {
	value++;
	update();
});

document.getElementById("decrease").addEventListener("click", () => {
	if (value > 0) value--;
	update();
});
```

✅ **Used in:** Cart counters, like/dislike, numeric inputs.

---

## 🕰️ 5. **Countdown Timer**

```html
<div id="countdown">10</div>
<button id="startCountdown">Start Countdown</button>
```

```js
document.getElementById("startCountdown").addEventListener("click", () => {
	let time = 10;
	const display = document.getElementById("countdown");

	const interval = setInterval(() => {
		display.textContent = time;
		time--;
		if (time < 0) {
			clearInterval(interval);
			display.textContent = "Time's up!";
		}
	}, 1000);
});
```

✅ **Used in:** Quizzes, offer timers, reminders.

---

## 🎯 6. **Progress Circle (Circular Loader)**

```html
<svg width="100" height="100">
	<circle cx="50" cy="50" r="40" stroke="#ddd" stroke-width="8" fill="none" />
	<circle
		id="circleProgress"
		cx="50"
		cy="50"
		r="40"
		stroke="#00b4db"
		stroke-width="8"
		fill="none"
		stroke-dasharray="251"
		stroke-dashoffset="251"
	/>
</svg>
<button id="circleFill">Animate</button>
```

```js
document.getElementById("circleFill").addEventListener("click", () => {
	const circle = document.getElementById("circleProgress");
	let offset = 251;
	const interval = setInterval(() => {
		offset -= 10;
		circle.style.strokeDashoffset = offset;
		if (offset <= 0) clearInterval(interval);
	}, 100);
});
```

✅ **Used in:** Dashboards, trackers, analytics displays.

---

## ❤️ 7. **Like Button (Toggle State)**

```html
<button id="likeBtn">♡ Like</button>
```

```js
const likeBtn = document.getElementById("likeBtn");
likeBtn.addEventListener("click", () => {
	likeBtn.classList.toggle("liked");
	likeBtn.textContent = likeBtn.classList.contains("liked")
		? "❤️ Liked"
		: "♡ Like";
});
```

```css
#likeBtn {
	font-size: 18px;
	transition: transform 0.2s;
}
#likeBtn.liked {
	color: red;
	transform: scale(1.2);
}
```

✅ **Used in:** Blogs, posts, comments, videos.

---

## 🎮 8. **Typing Effect**

```html
<h2 id="typing"></h2>
```

```js
const text = "Welcome to the DOM Playground!";
let i = 0;
const typing = document.getElementById("typing");

function type() {
	if (i < text.length) {
		typing.textContent += text.charAt(i);
		i++;
		setTimeout(type, 100);
	}
}
type();
```

✅ **Used in:** Hero headers, intros, loaders.

---

## 💥 9. **Auto-Counter Animation (Scroll Reveal)**

```html
<div class="stat" data-target="1200">0</div>
<div class="stat" data-target="980">0</div>
<div class="stat" data-target="3000">0</div>
```

```js
const stats = document.querySelectorAll(".stat");

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			const el = entry.target;
			const target = +el.dataset.target;
			let count = 0;

			const interval = setInterval(() => {
				count += Math.ceil(target / 100);
				el.textContent = count;
				if (count >= target) {
					el.textContent = target;
					clearInterval(interval);
				}
			}, 30);
			observer.unobserve(el);
		}
	});
});

stats.forEach((stat) => observer.observe(stat));
```

✅ **Used in:** Stats counters, analytics, landing pages.

---

Would you like me to:

1. 🔧 **Add these to your existing “DOM Playground” HTML page** (so you can interact with them live),
   or
2. 🎨 Create a **new “Interactive Widgets Playground” page** — just for these timer/progress/rating/counter examples?

(Option 2 keeps it cleaner and separate for testing.)
