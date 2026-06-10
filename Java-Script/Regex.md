# 📘 Regular Expressions (Regex) - Complete Notes for JavaScript Developers

---

# 🤔 What is Regex?

**Regex (Regular Expression)** is a pattern used to search, validate, extract, and replace text.

Think of Regex as a **smart search pattern**.

Instead of searching for an exact word:

```js
"hello world".includes("hello")
```

Regex lets you search for patterns:

```js
Any email
Any phone number
Any 6 digit OTP
Any URL
Any date
```

---

# 🌎 Real World Examples

### Email Validation

```txt
sri@gmail.com
john@yahoo.com
```

Regex:

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

---

### Phone Number Validation

```txt
9876543210
```

Regex:

```regex
^\d{10}$
```

---

### OTP Validation

```txt
123456
```

Regex:

```regex
^\d{6}$
```

---

# 🏗️ Creating Regex in JavaScript

## Method 1

```js
const regex = /hello/
```

---

## Method 2

```js
const regex = new RegExp("hello")
```

---

# 🔍 Common Regex Methods

---

## test()

Returns true/false

```js
const regex = /hello/

regex.test("hello world")
```

Output:

```js
true
```

---

## match()

Returns matched data

```js
"hello world".match(/hello/)
```

Output:

```js
["hello"]
```

---

## search()

Returns index

```js
"hello world".search(/world/)
```

Output:

```js
6
```

---

## replace()

```js
"hello world".replace(/world/, "JS")
```

Output:

```js
hello JS
```

---

## matchAll()

Returns all matches

```js
const str = "cat bat rat"

[...str.matchAll(/at/g)]
```

---

# 🧩 Regex Building Blocks

---

# 1. Literal Characters

Match exact characters.

```regex
cat
```

Matches:

```txt
cat
```

Doesn't match:

```txt
bat
dog
```

---

# 2. Dot (.)

## Meaning

Matches any single character.

```regex
c.t
```

Matches:

```txt
cat
cot
cut
c9t
```

Not:

```txt
ct
```

Because one character is required.

---

# 3. Character Sets []

---

## Match one character from a group

```regex
[abc]
```

Matches:

```txt
a
b
c
```

---

Example

```regex
gr[ae]y
```

Matches:

```txt
gray
grey
```

---

# Range Matching

```regex
[a-z]
```

Matches:

```txt
a
b
c
...
z
```

---

Uppercase

```regex
[A-Z]
```

---

Numbers

```regex
[0-9]
```

---

Combined

```regex
[a-zA-Z0-9]
```

---

# Negation

Using ^ inside []

```regex
[^0-9]
```

Means:

```txt
NOT a digit
```

Matches:

```txt
a
b
@
#
```

---

# 4. Quantifiers

These specify how many times something appears.

---

## *

Zero or More

```regex
go*
```

Matches:

```txt
g
go
goo
gooo
```

---

## +

One or More

```regex
go+
```

Matches:

```txt
go
goo
gooo
```

Not:

```txt
g
```

---

## ?

Zero or One

```regex
colou?r
```

Matches:

```txt
color
colour
```

---

## {n}

Exactly n times

```regex
\d{4}
```

Matches:

```txt
1234
```

---

## {n,m}

Between n and m times

```regex
\d{2,4}
```

Matches:

```txt
12
123
1234
```

---

## {n,}

At least n times

```regex
\d{2,}
```

Matches:

```txt
12
123
123456
```

---

# 5. Predefined Character Classes

---

## \d

Digit

Equivalent:

```regex
[0-9]
```

Matches:

```txt
1
2
3
```

---

## \D

Non-digit

Matches:

```txt
a
@
#
```

---

## \w

Word character

Equivalent:

```regex
[a-zA-Z0-9_]
```

Matches:

```txt
hello
name_1
```

---

## \W

Non-word character

Matches:

```txt
@
#
$
```

---

## \s

Whitespace

Matches:

```txt
space
tab
newline
```

---

## \S

Non-whitespace

Matches:

```txt
a
1
@
```

---

# 6. Anchors

Anchors don't match characters.

They match positions.

---

## ^

Beginning of string

```regex
^hello
```

Matches:

```txt
hello world
```

Not:

```txt
say hello
```

---

## $

End of string

```regex
world$
```

Matches:

```txt
hello world
```

---

## Combined

```regex
^hello$
```

Matches ONLY:

```txt
hello
```

Not:

```txt
hello world
```

---

# 7. Alternation |

Means OR

```regex
cat|dog
```

Matches:

```txt
cat
dog
```

---

Example

```regex
html|css|javascript
```

Matches any of them.

---

# 8. Grouping ()

Groups patterns together.

```regex
(ab)+
```

Matches:

```txt
ab
abab
ababab
```

---

Example

```regex
(I love) (JS)
```

Groups:

```txt
Group 1 -> I love
Group 2 -> JS
```

---

# 9. Capturing Groups

```js
const str = "2026-06-10"

const result = str.match(/(\d{4})-(\d{2})-(\d{2})/)
```

Output:

```js
[
 "2026-06-10",
 "2026",
 "06",
 "10"
]
```

---

# 10. Backreferences

Reuse captured values.

```regex
(\w+)\s\1
```

Matches:

```txt
hello hello
bye bye
```

Not:

```txt
hello bye
```

---

# 🎯 Regex Flags

---

## g

Global

Find all matches.

```js
/cat/g
```

---

## i

Case insensitive

```js
/cat/i
```

Matches:

```txt
cat
CAT
Cat
```

---

## m

Multiline

Makes ^ and $ work per line.

---

## s

Dotall

Allows . to match newline.

---

# 🔥 Most Useful Regex Patterns

---

## Email

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

Example:

```txt
sri@gmail.com
```

---

## Mobile Number

10 digits

```regex
^\d{10}$
```

---

## OTP

6 digits

```regex
^\d{6}$
```

---

## Password

Minimum:

* 1 uppercase
* 1 lowercase
* 1 number
* 8 chars

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
```

---

## URL

```regex
https?:\/\/.+$
```

Matches:

```txt
http://google.com
https://google.com
```

---

# 🚀 Lookaheads (Advanced)

These are heavily used in validations.

---

## Positive Lookahead

Must contain digit.

```regex
(?=.*\d)
```

Example:

```txt
abc123
```

Passes.

---

## Negative Lookahead

Must NOT contain digit.

```regex
(?!.*\d)
```

Matches:

```txt
hello
```

Not:

```txt
hello123
```

---

# 🎯 Regex in Frontend Interviews

Very common questions:

### Validate Email

```js
const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

---

### Validate Phone

```js
const phoneRegex =
/^\d{10}$/
```

---

### Extract Numbers

```js
const text = "Price is 500 and tax is 50"

text.match(/\d+/g)
```

Output:

```js
["500", "50"]
```

---

### Remove Spaces

```js
str.replace(/\s+/g, "")
```

---

### Find All Words

```js
str.match(/\w+/g)
```

---

# ⚠️ Common Beginner Mistakes

### Mistake 1

```regex
[0-9]+
```

This finds digits anywhere.

Example:

```txt
abc123xyz
```

Matches:

```txt
123
```

---

If you want ONLY digits:

```regex
^[0-9]+$
```

---

### Mistake 2

Forgetting global flag

```js
"cat cat".match(/cat/)
```

Output:

```js
["cat"]
```

Only first match.

Use:

```js
"cat cat".match(/cat/g)
```

Output:

```js
["cat", "cat"]
```

---

# 🧠 Regex Cheat Sheet

| Pattern | Meaning         |
| ------- | --------------- |
| .       | Any character   |
| \d      | Digit           |
| \D      | Non-digit       |
| \w      | Word character  |
| \W      | Non-word        |
| \s      | Space           |
| \S      | Non-space       |
| *       | 0 or more       |
| +       | 1 or more       |
| ?       | 0 or 1          |
| {n}     | Exactly n       |
| {n,m}   | Between n and m |
| ^       | Start           |
| $       | End             |
| []      | Character set   |
| [^]     | Negation        |
| |       | OR              |
| ()      | Group           |
| g       | Global          |
| i       | Ignore case     |
| m       | Multiline       |

# 💡 Frontend Developer Takeaway

As a frontend engineer, you'll use Regex mostly for:

✅ Form validation
✅ Email validation
✅ Phone validation
✅ Password rules
✅ OTP verification
✅ Search/filter functionality
✅ URL validation
✅ Extracting values from text
✅ Input sanitization

You don't need to memorize every Regex syntax. Focus on understanding:

1. Character classes (`\d`, `\w`, `\s`)
2. Quantifiers (`*`, `+`, `?`, `{}`)
3. Anchors (`^`, `$`)
4. Groups (`()`)
5. Flags (`g`, `i`)
6. Lookaheads (`?=`)

These six topics cover about **90% of Regex usage in frontend development**.


# 🧠 How to Build the Regex Mindset

Most people fail at Regex because they try to **memorize patterns**.

Don't memorize.

Think like a detective.

---

# ❌ Wrong Mindset

When you see:

```regex
^\d{10}$
```

Don't think:

> "I need to remember this strange syntax."

---

# ✅ Correct Mindset

Think:

> "I need a string that contains exactly 10 digits and nothing else."

Then translate that requirement into Regex.

---

# Step 1: Describe the Problem in Plain English

Example:

Validate a mobile number.

Input:

```txt
9876543210
```

Ask yourself:

### What do I need?

- Start of string
- 10 digits
- End of string

Plain English:

```txt
Start
10 digits
End
```

Regex:

```regex
^\d{10}$
```

Notice how the regex comes naturally from the requirements.

---

# Step 2: Break Every Regex Into Pieces

Never look at regex as one monster.

Example:

```regex
^[a-z]{3}\d{2}$
```

Break it:

```txt
^          Start

[a-z]      Lowercase letters

{3}        Exactly 3 times

\d         Digit

{2}        Exactly 2 times

$          End
```

Examples:

```txt
abc12 ✅
xyz99 ✅

ab12 ❌
abcd12 ❌
```

---

# Step 3: Think in Patterns, Not Values

Bad thinking:

```txt
Find "john@gmail.com"
```

Good thinking:

```txt
Find ANY email
```

Bad:

```txt
Find 9876543210
```

Good:

```txt
Find ANY 10 digit number
```

Regex is about patterns.

Not actual values.

---

# Step 4: Ask These Questions

Whenever you see a problem, ask:

### What characters are allowed?

```txt
letters?
digits?
special chars?
```

Example:

```txt
abc123
```

Allowed:

```txt
letters + digits
```

Regex:

```regex
[a-zA-Z0-9]
```

---

### How many times?

```txt
once?
many?
optional?
```

Examples:

```txt
1 digit
```

```regex
\d
```

---

```txt
4 digits
```

```regex
\d{4}
```

---

```txt
1 or more digits
```

```regex
\d+
```

---

### Must it start with something?

Example:

```txt
Email starts with text
```

Use:

```regex
^
```

---

### Must it end with something?

Example:

```txt
File ends with .pdf
```

Use:

```regex
\.pdf$
```

---

# Step 5: Learn Regex Like LEGO Blocks

Think of regex as building blocks.

---

## Digits

```regex
\d
```

means

```txt
one digit
```

---

## Letters

```regex
[a-z]
```

means

```txt
one lowercase letter
```

---

## Multiple Digits

```regex
\d+
```

means

```txt
one or more digits
```

---

## Exact Count

```regex
\d{6}
```

means

```txt
exactly 6 digits
```

OTP!

---

Combine blocks:

```regex
[a-z]{3}\d{2}
```

Meaning:

```txt
3 letters
followed by
2 digits
```

---

# Step 6: Read Regex Like English

Example:

```regex
^\d{6}$
```

Read it as:

```txt
Start

exactly 6 digits

End
```

---

Example:

```regex
^[A-Z][a-z]+$
```

Read:

```txt
Start

One uppercase letter

One or more lowercase letters

End
```

Matches:

```txt
John
David
Sri
```

---

# Step 7: Practice Reverse Engineering

Look at a string.

Create regex.

---

Example 1

```txt
12345
```

Question:

```txt
What pattern is this?
```

Answer:

```txt
5 digits
```

Regex:

```regex
^\d{5}$
```

---

Example 2

```txt
AB123
```

Question:

```txt
What pattern?
```

Answer:

```txt
2 uppercase letters
3 digits
```

Regex:

```regex
^[A-Z]{2}\d{3}$
```

---

Example 3

```txt
sri@gmail.com
```

Answer:

```txt
text
@
text
.
text
```

Regex:

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

---

# Step 8: Learn the 20% That Gives 80% Results

For frontend interviews and work, master only:

### Character Classes

```regex
\d
\w
\s
[a-z]
[A-Z]
```

---

### Quantifiers

```regex
*
+
?
{n}
{n,m}
```

---

### Anchors

```regex
^
$
```

---

### Groups

```regex
()
```

---

### Flags

```regex
g
i
```

---

These alone solve most frontend regex tasks.

---

# Mental Model for Frontend Developers

When you see a validation question:

### Example

Password:

```txt
At least:
1 uppercase
1 lowercase
1 digit
Minimum 8 chars
```

Don't think regex.

Think requirements:

```txt
Need uppercase
Need lowercase
Need number
Need length >= 8
```

Then translate:

```regex
^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$
```

Regex is simply:

> Requirements → Pattern Translation

---

# Daily Practice Routine (10 Minutes)

Take 5 examples every day:

```txt
OTP
Phone Number
PAN Card
Email
Password
```

For each one:

1. Write requirements in English.
2. Convert requirements to regex.
3. Test in JavaScript.

After 2–3 weeks, you'll stop seeing symbols like `\d+` and start seeing:

> "one or more digits"

That's the point where Regex starts feeling natural instead of cryptic.

This is one of the most commonly used **email validation regexes**:

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

The biggest mistake beginners make is trying to understand it all at once.

Let's break it into small pieces.

---

# Step 1: Visualize an Email

Example:

```txt
sri@gmail.com
```

An email generally looks like:

```txt
someText @ someText . someText
```

Like:

```txt
username @ domain . extension
```

Example:

```txt
sri      @ gmail  . com
```

The regex is checking exactly that structure.

---

# Complete Breakdown

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

Let's split it:

```regex
^
[^\s@]+
@
[^\s@]+
\.
[^\s@]+
$
```

---

# Part 1: `^`

```regex
^
```

Means:

```txt
Start of string
```

Examples:

```txt
sri@gmail.com
^
```

The match must begin here.

---

# Part 2: `[^\s@]+`

This is the most important piece.

Let's break it further.

---

## `[]` → Character Set

```regex
[a-z]
```

means:

```txt
match any lowercase letter
```

---

## `[^ ]` → Negated Character Set

When `^` is inside brackets:

```regex
[^abc]
```

means:

```txt
match anything EXCEPT
a
b
c
```

---

So:

```regex
[^\s@]
```

means:

```txt
match any character
EXCEPT:

whitespace
@
```

---

### `\s`

Means whitespace:

```txt
space
tab
newline
```

Examples:

```txt
" "
"\t"
"\n"
```

---

Therefore:

```regex
[^\s@]
```

means:

```txt
Any character except:

space
tab
newline
@
```

---

### `+`

```regex
+
```

means:

```txt
One or more times
```

---

Combining:

```regex
[^\s@]+
```

means:

```txt
One or more characters

that are NOT:
- spaces
- @
```

---

Examples that match:

```txt
sri
john123
hello.world
```

---

Examples that don't:

```txt
sr i
john@
```

---

This part matches:

```txt
sri
```

in:

```txt
sri@gmail.com
```

---

# Part 3: `@`

```regex
@
```

Literal @ symbol.

Must exist.

---

Matches:

```txt
sri@gmail.com
   ^
```

---

# Part 4: Another `[^\s@]+`

Same logic.

This matches:

```txt
gmail
```

from:

```txt
sri@gmail.com
```

---

Again:

```txt
One or more characters

not spaces
not @
```

---

# Part 5: `\.`

You might wonder:

```regex
.
```

means:

```txt
ANY character
```

Remember:

```regex
c.t
```

matches:

```txt
cat
cot
cut
```

---

So if we wrote:

```regex
.
```

it would match ANY character.

We specifically want a dot.

Therefore:

```regex
\.
```

means:

```txt
Literal .
```

---

Matches:

```txt
gmail.com
     ^
```

---

# Part 6: Last `[^\s@]+`

Matches:

```txt
com
```

from:

```txt
gmail.com
```

---

Examples:

```txt
com
org
net
io
dev
```

---

# Part 7: `$`

```regex
$
```

means:

```txt
End of string
```

---

Ensures nothing comes after:

```txt
sri@gmail.com
             $
```

---

# Full Walkthrough

Input:

```txt
sri@gmail.com
```

Regex:

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

---

Step 1:

```regex
^
```

Start checking from beginning.

---

Step 2:

```regex
[^\s@]+
```

Matches:

```txt
sri
```

---

Step 3:

```regex
@
```

Matches:

```txt
@
```

---

Step 4:

```regex
[^\s@]+
```

Matches:

```txt
gmail
```

---

Step 5:

```regex
\.
```

Matches:

```txt
.
```

---

Step 6:

```regex
[^\s@]+
```

Matches:

```txt
com
```

---

Step 7:

```regex
$
```

End reached.

✅ Valid

---

# Why These Fail

### Missing username

```txt
@gmail.com
```

Fails because:

```regex
[^\s@]+
```

needs at least one character before `@`.

---

### Missing domain

```txt
sri@
```

Fails because:

```regex
[^\s@]+
```

after `@` is missing.

---

### Missing extension

```txt
sri@gmail
```

Fails because:

```regex
\.
```

and extension are missing.

---

### Contains spaces

```txt
sri @gmail.com
```

Fails because:

```regex
[^\s@]
```

doesn't allow spaces.

---

# A Mental Reading of This Regex

Instead of reading symbols, read it as:

```txt
Start

One or more characters
that are not spaces or @

Then @

One or more characters
that are not spaces or @

Then .

One or more characters
that are not spaces or @

End
```

That's exactly why:

```txt
sri@gmail.com
john123@yahoo.in
test.user@company.org
```

match successfully.


This is one of the most common **password validation regexes**:

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
```

Many developers memorize it without understanding it. Let's break it down piece by piece.

---

# 🎯 What Requirements Does This Password Have?

A valid password must contain:

✅ At least 1 lowercase letter
✅ At least 1 uppercase letter
✅ At least 1 digit
✅ Minimum 8 characters

Examples:

```txt
Password1
Hello123
MySecurePass9
```

---

# Step 1: Split the Regex

```regex
^
(?=.*[a-z])
(?=.*[A-Z])
(?=.*\d)
.{8,}
$
```

Let's understand each part.

---

# Part 1: `^`

```regex
^
```

Means:

```txt
Start of string
```

Example:

```txt
Password1
^
```

The regex starts checking from the beginning.

---

# Part 2: `(?=.*[a-z])`

This is called a **Positive Lookahead**.

Let's break it further:

```regex
(?=
  .*
  [a-z]
)
```

---

## What is a Lookahead?

A lookahead checks:

> "Can I find this pattern somewhere ahead?"

But it does **not consume characters**.

Think of it like a security guard checking requirements.

---

### `.*`

Means:

```txt
Any character
0 or more times
```

Examples:

```txt
Password1
123abc
HELLO
```

---

### `[a-z]`

Means:

```txt
One lowercase letter
```

Examples:

```txt
a
b
z
```

---

### Entire Expression

```regex
(?=.*[a-z])
```

Means:

```txt
Somewhere in this string,
there must be at least one lowercase letter.
```

---

## Example

Password:

```txt
Password1
```

Contains:

```txt
a
s
s
w
o
r
d
```

✅ Passes

---

Password:

```txt
PASSWORD1
```

Contains no lowercase letters.

❌ Fails

---

# Part 3: `(?=.*[A-Z])`

Same concept.

```regex
(?=.*[A-Z])
```

Means:

```txt
Somewhere in this string,
there must be at least one uppercase letter.
```

---

Examples:

```txt
Password1
```

Contains:

```txt
P
```

✅ Passes

---

```txt
password1
```

Contains no uppercase letters.

❌ Fails

---

# Part 4: `(?=.*\d)`

Again a lookahead.

---

## `\d`

Means:

```txt
Any digit
```

Equivalent to:

```regex
[0-9]
```

Examples:

```txt
0
1
2
9
```

---

Entire expression:

```regex
(?=.*\d)
```

Means:

```txt
Somewhere in this string,
there must be at least one digit.
```

---

Examples:

```txt
Password1
```

Contains:

```txt
1
```

✅ Passes

---

```txt
Password
```

Contains no digit.

❌ Fails

---

# Part 5: `.{8,}`

This is the actual matching part.

---

## `.`

Means:

```txt
Any character
```

Examples:

```txt
a
1
@
#
```

---

## `{8,}`

Means:

```txt
At least 8 times
```

---

Combined:

```regex
.{8,}
```

Means:

```txt
Any 8 or more characters
```

---

Examples:

```txt
Password1
```

Length:

```txt
9
```

✅ Passes

---

```txt
Pass1
```

Length:

```txt
5
```

❌ Fails

---

# Part 6: `$`

```regex
$
```

Means:

```txt
End of string
```

Ensures the entire password is checked.

---

# Complete Walkthrough

Input:

```txt
Password1
```

Regex:

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
```

---

### Check 1

```regex
(?=.*[a-z])
```

Any lowercase?

```txt
assword
```

✅ Yes

---

### Check 2

```regex
(?=.*[A-Z])
```

Any uppercase?

```txt
P
```

✅ Yes

---

### Check 3

```regex
(?=.*\d)
```

Any digit?

```txt
1
```

✅ Yes

---

### Check 4

```regex
.{8,}
```

Length ≥ 8?

```txt
Password1
```

Length = 9

✅ Yes

---

Result:

```txt
VALID PASSWORD
```

---

# Why These Fail

### Example 1

```txt
password1
```

Fails:

```regex
(?=.*[A-Z])
```

No uppercase letter.

---

### Example 2

```txt
PASSWORD1
```

Fails:

```regex
(?=.*[a-z])
```

No lowercase letter.

---

### Example 3

```txt
Password
```

Fails:

```regex
(?=.*\d)
```

No digit.

---

### Example 4

```txt
Pass1
```

Fails:

```regex
.{8,}
```

Less than 8 characters.

---

# Visual Mental Model

Think of this regex as **4 security checkpoints**:

```txt
Password1
│
├── Has lowercase? ✅
│
├── Has uppercase? ✅
│
├── Has number? ✅
│
└── Length >= 8? ✅
```

Only if all checkpoints pass does the password become valid.

---

# Frontend Interview Tip

When you see a regex like:

```regex
(?=.*something)
```

Immediately think:

> "This is a lookahead. It is checking whether the string contains something somewhere, without actually matching it."

That's the key concept behind most password validation regexes.
