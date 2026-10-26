# ESLint vs Oxlint for React

Linters inspect code and report likely bugs, suspicious patterns, and project-rule violations. They do not replace React, tests, or code review, but they can catch mistakes while a change is still small.

> The tool is named **Oxlint** (not “Oxlimit”). “ESLint” is often mistyped as “eslimit.”

## Why use a linter in a React project?

React code has a few especially useful lint checks:

- **Hooks rules** catch hooks called conditionally or in places where React cannot track them reliably.
- **Effect dependency checks** can catch stale values and effects that do not re-run when their inputs change.
- **JavaScript checks** find unused variables, accidental assignments, and other common mistakes.
- **React-specific checks** can flag questionable component patterns.
- **A shared rule set** keeps a team’s code consistent and makes reviews focus on behavior instead of personal style.

For example, this conditional hook call breaks the Rules of Hooks:

```jsx
function Profile({ user }) {
  if (!user) return null;

  const [expanded, setExpanded] = useState(false); // Hook is conditional
  return <button onClick={() => setExpanded(!expanded)}>{user.name}</button>;
}
```

Move the hook above the early return:

```jsx
function Profile({ user }) {
  const [expanded, setExpanded] = useState(false);
  if (!user) return null;

  return <button onClick={() => setExpanded(!expanded)}>{user.name}</button>;
}
```

## ESLint and Oxlint: the difference

| | ESLint | Oxlint |
|---|---|---|
| What it is | A mature, highly configurable JavaScript/TypeScript linter | A fast linter from the Oxc toolchain, implemented in Rust |
| Main strength | Broad plugin ecosystem and fine-grained customization | Speed and useful built-in checks with little startup overhead |
| React fit | A strong choice when you need React, Hooks, accessibility, or project-specific plugin rules | A strong choice for fast feedback on common React and JavaScript issues |
| Trade-off | More configuration and can take longer on large projects | Rule and plugin coverage is not identical to ESLint; check that it supports the rules your project depends on |
| Best thought of as | Flexible rule platform | Fast linting option, not an automatic one-for-one ESLint replacement |

Neither tool understands whether a feature is correct in the product sense. A clean lint run is useful feedback, not proof that the code works.

## When a linter is super helpful

- **Hooks and effects:** Catching a missing dependency can prevent an effect from using an old value.
- **Before review or CI:** A quick check catches simple mistakes before they reach another developer.
- **Large teams or codebases:** Shared rules prevent every folder from developing a different style.
- **Refactoring:** Unused variables and imports are easy to miss after moving or deleting code.
- **Learning React:** A good Hooks rule set teaches patterns that are otherwise easy to misuse.

Example of a potentially stale effect:

```jsx
useEffect(() => {
  document.title = `Hello, ${name}`;
}, []); // The effect reads `name` but does not rerun when it changes.
```

The right fix depends on the intended behavior. If the title should always follow `name`, include it in the dependencies:

```jsx
useEffect(() => {
  document.title = `Hello, ${name}`;
}, [name]);
```

Do not add a dependency mechanically if it creates a loop or changes the intended behavior. Reconsider the effect’s purpose and structure first.

## When linting feels naggy

Linting feels naggy when a rule reports code that is intentional, irrelevant to the current task, or mostly about personal preference. Common causes:

- Enabling many strict rules before the team agrees on them.
- Treating every warning as an urgent bug, including low-value style preferences.
- Formatting rules duplicating the work of a formatter.
- Repeatedly suppressing Hooks dependency warnings instead of understanding the effect.
- Using broad disable comments that hide future problems as well as the current one.
- Running two linters with overlapping rules that produce duplicate messages.

For example, this suppression may silence a real stale-value bug:

```jsx
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  saveDraft(draft);
}, []);
```

Before suppressing a warning, ask:

1. Is the code wrong, or is the rule not relevant here?
2. Can I restructure the code so the rule is satisfied naturally?
3. If suppression is truly needed, can I make it local and explain the reason?

Use lint rules for correctness and maintainability. Use a formatter for routine whitespace and layout, rather than making linting a source of style arguments.

## Which one should I choose?

Choose **ESLint** when:

- A React plugin or custom rule your team relies on is required.
- You need detailed control over rule configuration.
- The repository already has a well-maintained ESLint setup.
- You need to preserve compatibility with existing editor, CI, or framework tooling.

Choose **Oxlint** when:

- Fast feedback is the priority, especially in a large codebase.
- Its supported rules cover the checks you need.
- You want a straightforward linter and do not depend on ESLint-only plugins or custom rules.

Use **both (a hybrid)** only when there is a clear gap: for example, Oxlint handles the broad, fast checks while ESLint runs a small set of required plugin rules. Assign each rule to one tool where possible so developers do not see the same warning twice.

### A simple decision process

1. Check what the project already runs and what its CI expects.
2. List the rules that matter, especially Hooks and any React-specific rules.
3. Confirm the chosen tool supports those rules in the project’s installed version.
4. Prefer one linter if it covers the requirements.
5. Add a second linter only for specific missing rules, and document which tool owns each check.
6. Run the same checks in the editor and CI so local results match the build.

## Example workflows

### ESLint-only project

If ESLint is already configured, keep using it and run the project’s scripts, for example:

```sh
npm run lint
```

If the project has no script, a typical direct command is:

```sh
npx eslint .
```

The exact command depends on the project configuration and file types. Use `--fix` only for fixes you have reviewed; automatic fixes do not mean every change is behavior-preserving.

### Oxlint-only project

Install and configure Oxlint according to its current documentation and the project’s package manager. A common direct check is:

```sh
npx oxlint .
```

Check the project’s installed Oxlint version for the available React and Hooks rules instead of assuming that every ESLint rule has an equivalent.

### Hybrid project

A reasonable hybrid might use Oxlint for frequent, broad feedback and ESLint for one or two plugin rules that Oxlint does not provide:

```json
{
  "scripts": {
    "lint:fast": "oxlint .",
    "lint:plugins": "eslint src --max-warnings 0",
    "lint": "npm run lint:fast && npm run lint:plugins"
  }
}
```

This is an example, not a drop-in script: install both tools, configure their rule sets, and adjust paths and options for the repository. Avoid enabling the same rule in both tools unless you deliberately want both results.

## Bottom line

- Start with **one** linter that covers the project’s important checks.
- Pick **ESLint** for ecosystem depth and customization; pick **Oxlint** for fast checks where its rule coverage is sufficient.
- A **hybrid** can work, but keep the responsibilities distinct.
- Treat warnings as useful prompts to investigate—not as commands to suppress or obey blindly.

For an ESLint configuration walkthrough, see [eslinit.md](./eslinit.md).
