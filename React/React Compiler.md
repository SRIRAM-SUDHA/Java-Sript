# React Compiler

## What it is

React Compiler is a build-time tool that analyzes React components and Hooks, then automatically memoizes values and work when it can do so safely. Memoization helps React avoid repeating work when a component's inputs have not changed.

It is **not** a replacement for React, Vite, or a bundler. Vite runs the compiler as part of transforming your React code; the compiler does not replace Vite's dev server or production build.

## How it makes React development easier

Before the compiler, developers sometimes added `useMemo`, `useCallback`, or `React.memo` by hand to avoid unnecessary re-renders. That can help, but it also adds code and dependency lists to maintain.

With the compiler enabled, you can often write the straightforward version:

```jsx
function ProductList({ products, search }) {
  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ul>
      {visibleProducts.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

The compiler can memoize the calculation and component work based on the values they use. Without compiler optimization, a developer might write:

```jsx
function ProductList({ products, search }) {
  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <ul>
      {visibleProducts.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

The compiler reduces the need to manually add memoization in many cases. It does not mean every component will be optimized, nor does it make expensive algorithms or avoidable network requests automatically cheap.

## Add it to a Vite React project

This example uses Vite's Babel-based React plugin, `@vitejs/plugin-react`.

Install the compiler:

```sh
npm install -D babel-plugin-react-compiler
```

Add it to `vite.config.js` (or `vite.config.ts`):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
```

If you add other Babel plugins, keep `babel-plugin-react-compiler` first in the Babel plugin list so it analyzes the code before those transforms.

The compiler runs when Vite transforms your React files, both in development and when creating a production build. There is no special React component API to call. Start the project using its existing script:

```sh
npm run dev
npm run build
```

This configuration is for `@vitejs/plugin-react`. If the project uses the SWC-based `@vitejs/plugin-react-swc`, a different integration is needed; do not paste this Babel configuration into the SWC plugin setup.

For a React version other than the version recommended by the current React Compiler installation guide, check its compatibility and runtime requirements before enabling it. Compiler setup can differ by React version and build tool.

## Keep React code compiler-friendly

The compiler relies on React's rules, such as components and Hooks being pure and Hooks being called consistently. For example, this Hook cannot be conditional:

```jsx
function UserPanel({ user }) {
  if (!user) return null;

  const [open, setOpen] = useState(false); // Invalid: Hook is conditional
  return <button onClick={() => setOpen(!open)}>{user.name}</button>;
}
```

Call the Hook before returning:

```jsx
function UserPanel({ user }) {
  const [open, setOpen] = useState(false);
  if (!user) return null;

  return <button onClick={() => setOpen(!open)}>{user.name}</button>;
}
```

The compiler can skip code it cannot safely optimize; it does not make invalid React patterns safe. Keep the Hooks lint checks enabled so you can find and fix problems.

## See optimization in the code you write

For example, a parent can pass a callback directly rather than wrapping it in `useCallback` just to keep its identity stable:

```jsx
function Cart({ products }) {
  const [cart, setCart] = useState([]);

  function addProduct(product) {
    setCart((currentCart) => [...currentCart, product]);
  }

  return products.map((product) => (
    <ProductRow
      key={product.id}
      product={product}
      onAdd={() => addProduct(product)}
    />
  ));
}
```

When the compiler can prove the relevant values are unchanged, it can optimize component work and values without requiring you to manually wrap every callback. Write clear code first; measure performance and investigate actual bottlenecks rather than adding memoization everywhere.

## Diagnostics and gradual adoption

Use `eslint-plugin-react-hooks` to surface React Compiler diagnostics in your editor and lint runs. The plugin reports React rule violations, including patterns the compiler cannot optimize reliably. Follow the plugin's current recommended configuration for the project's installed version.

You can adopt the compiler incrementally. Start with a small area, check diagnostics, and run the app's tests and production build. Fix violations where appropriate; do not silence a warning without understanding it. Code the compiler cannot optimize can generally continue to run without receiving those optimizations.

## What the compiler does not do

- It does not replace Vite, Babel, TypeScript, ESLint, or tests.
- It does not automatically fix incorrect application behavior.
- It does not remove the need to follow the Rules of React.
- It does not guarantee a faster app in every case; measure real performance.
- It does not make every manual `useMemo`, `useCallback`, or `React.memo` unnecessary in every codebase. Existing memoization may be preserved, and profiling or compatibility needs can still matter.

## Quick mental model

> **Vite builds and serves the app; React Compiler optimizes eligible React code during that build; React renders the UI at runtime.**

For Vite configuration basics, see [Vite.md](./Vite.md).
