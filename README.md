# HydeJS ⚡

**HydeJS** is a fast, lightweight, and modern static site generator built on Node.js. It is designed to be a drop-in replacement for **Jekyll**, providing full functional parity while leveraging the speed and ecosystem of the JavaScript world.

[![npm version](https://img.shields.io/npm/v/hydejs.svg)](https://www.npmjs.com/package/hydejs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why HydeJS?

- **Jekyll Parity:** Support for standard Jekyll directory structures, Liquid templates, and Markdown content.
- **Node.js Powered:** No Ruby or Gems required. Install everything via `npm`.
- **Built-in Pagination:** Native blog pagination support out of the box.
- **Modern Highlighting:** High-quality, build-time syntax highlighting powered by [Shiki](https://shiki.style/).
- **Fast Performance:** Optimized for quick builds and a smooth developer experience.

## Installation

Install HydeJS globally to use it as a standalone CLI tool:

```bash
npm install -g hydejs
```

## Quick Start in 30 Seconds

1.  **Create a new site:**
    ```bash
    hydejs new my-blog
    cd my-blog
    ```

2.  **Start the development server:**
    ```bash
    hydejs serve
    ```
    Your site will be available at `http://localhost:4000`. Changes to your files will automatically trigger a rebuild and refresh the browser.

3.  **Build for Production:**
    ```bash
    hydejs build
    ```
    Your static files will be generated in the `_site` directory, ready to be hosted anywhere.

## Commands

- `hydejs new <path>`: Create a new site scaffold.
- `hydejs build` (alias: `b`): Perform a one-off build of your site.
- `hydejs serve` (alias: `s`): Build and serve with live-reloading.
- `hydejs clean`: Remove the generated `_site` directory.
- `hydejs doctor`: Check your configuration and directory structure for issues.

## Project Structure

HydeJS follows standard Jekyll conventions:

- `_posts/`: Blog posts written in Markdown.
- `_layouts/`: Liquid templates defining your page structures.
- `_includes/`: Reusable partial templates.
- `_config.yml`: Site-wide configuration and metadata.
- `assets/`: Static assets like CSS, images, and JavaScript.

## Contributing

We are actively building the future of HydeJS! Check out our [ROADMAP.md](./ROADMAP.md) to see what's coming next, or visit the [Hyde-JS Organization](https://github.com/Hyde-JS) to get involved.

## License

MIT © [Michael Joseph Miller](https://github.com/mjmiller41)
