# HydeJS

A Node.js-based static site generator inspired by [Jekyll](https://jekyllrb.com/).

## Installation

### Globally (Recommended for CLI use)

You can install HydeJS globally to use it as a standalone CLI tool:

```bash
npm install -g .
# Or if published to npm:
# npm install -g hydejs
```

### Locally (For a specific project)

```bash
npm install --save-dev hydejs
```

## Quick Start

1.  **Create a new site:**
    ```bash
    hydejs new my-awesome-site
    cd my-awesome-site
    ```

2.  **Build and Serve:**
    ```bash
    hydejs serve
    ```
    Your site will be available at `http://localhost:4000`. Any changes you make to your files will automatically trigger a rebuild and refresh the browser.

3.  **Build for Production:**
    ```bash
    hydejs build
    ```
    The static files will be generated in the `_site` directory.

## Commands

- `hydejs new <path>`: Create a new site scaffold.
- `hydejs build` (alias: `b`): Build the site once.
- `hydejs serve` (alias: `s`): Build and serve with live-reloading.
- `hydejs clean`: Remove the generated `_site` directory.
- `hydejs doctor`: Check your configuration and directory structure for issues.
- `hydejs new-theme <name>`: Create a new theme scaffold.

## Project Structure

HydeJS follows the same directory conventions as Jekyll:
- `_posts/`: Your blog posts (Markdown).
- `_layouts/`: Liquid templates for page structures.
- `_includes/`: Partial templates.
- `_config.yml`: Site configuration settings.
- `index.md` / `index.html`: Your site's homepage.

## License

MIT
