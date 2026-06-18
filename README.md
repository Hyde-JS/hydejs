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

## Configuration

HydeJS is configured via a `_config.yml` file in your root directory. If a key is missing from your config file, HydeJS will use the following default values:

| Key | Default Value | Description |
| :--- | :--- | :--- |
| `title` | `My HydeJS Site` | The title of your website. |
| `description` | `A Node.js-based static site generator inspired by Jekyll` | A short description for SEO meta tags. |
| `author` | `{ name: "HydeJS User", email: "user@example.com" }` | Default author information. |
| `source` | `.` | Root directory for your site files. |
| `destination` | `_site` | Output directory for the generated site. |
| `layouts_dir` | `_layouts` | Directory for Liquid layout files. |
| `posts_dir` | `_posts` | Directory for blog posts. |
| `includes_dir` | `_includes` | Directory for reusable partials. |
| `data_dir` | `_data` | Directory for YAML/JSON data files. |
| `baseurl` | `""` | The subpath your site will be served from. |
| `url` | `""` | The full hostname of your site. |
| `markdown` | `markdown-it` | The markdown processor used. |

## Contributing

We are actively building the future of HydeJS! Check out our [ROADMAP.md](./ROADMAP.md) to see what's coming next, or visit the [Hyde-JS Organization](https://github.com/Hyde-JS) to get involved.

## License

MIT © [Michael Joseph Miller](https://github.com/mjmiller41)
