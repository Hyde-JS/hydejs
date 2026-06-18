---
layout: doc
title: Getting Started
---

**HydeJS** is a fast, lightweight static site generator built on Node.js. It acts as a drop-in replacement for **Jekyll**, meaning it preserves Jekyll's directory conventions and Liquid rendering capabilities while leveraging the speed and vast module library of the Node.js ecosystem.

---

## Why HydeJS?

*   **Zero Ruby Dependencies**: No need to manage Bundler, Ruby versions, gem compilation errors, or local paths issues. Run everything via NPM.
*   **Built-in Parity**: Drop your existing Jekyll layouts, posts, and page markups directly into HydeJS and build immediately.
*   **Lightning Fast Compiler**: Highly optimized compilation cycles powered by asynchronous ES Modules.
*   **Accessible Highlights**: Integrated Shiki highlights render code blocks beautifully during build-time.

---

## 30-Second Quick Start

### 1. Global Installation
Install HydeJS globally to use it as a standalone command-line tool:

```bash
npm install -g @hydejs/hydejs
```

### 2. Scaffold a New Site
Generate a new blog site at your target path:

```bash
hydejs new my-blog
cd my-blog
```

### 3. Run Development Server
Launch the live development server with hot reload:

```bash
hydejs serve
```

Your site will be available at `http://localhost:4000`. Any local files saved will trigger immediate compilation and browser refreshes automatically.

### 4. Build for Production
Generate the optimized production distribution build folder:

```bash
hydejs build
```

Your static HTML, CSS, and asset files will compile into the `_site/` directory, ready to be hosted on Netlify, Vercel, GitHub Pages, or any web server.
