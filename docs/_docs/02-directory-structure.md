---
layout: doc
title: Directory Structure
---

HydeJS conforms to standard Jekyll directory conventions, enabling you to migrate existing sites with ease.

---

## Directory Layout

Here is the standard folder layout of a HydeJS project:

```text
my-blog/
├── _config.yml         # Global configurations and metadata
├── package.json        # Node.js dependencies
├── index.md            # The site landing page
├── about.md            # Standalone page
├── _posts/             # Blog post collections
│   └── 2026-06-18-welcome.md
├── _layouts/           # Liquid page template structures
│   ├── default.html
│   └── post.html
├── _includes/          # Reusable template components (partials)
│   ├── header.html
│   └── footer.html
├── _data/              # Global data files (JSON and YAML)
│   └── navigation.yml
├── assets/             # Static style files, scripts, images
│   ├── css/
│   │   └── style.scss  # Automatically compiled to style.css
│   └── images/
└── _site/              # Compiled output distribution (gitignored)
```

---

## Directories Explained

### `_config.yml`
Contains global metadata, site titles, author details, and advanced compilers settings (such as custom pagination thresholds or collections keys).

### `_posts/`
Contains blog posts written in Markdown. Filenames must follow the Jekyll date convention: `YYYY-MM-DD-title-slug.md`. HydeJS automatically extracts the post date and title slug from the filename if they are missing in the front-matter.

### `_layouts/`
Holds the Liquid template shells that wrap page contents. Layouts can be nested recursively. For example, a `post.html` layout can designate `layout: default` to nest inside the global wrapper.

### `_includes/`
Contains reusable HTML or Liquid snippets. You can embed these snippets in layouts or pages using the `{% raw %}{% include <filename> %}{% endraw %}` tag.

### `_data/`
Allows you to store custom datasets in YAML or JSON format. For example, storing `navigation.yml` exposes its contents in templates under the `site.data.navigation` namespace.

### `assets/`
Contains public files. SASS/SCSS files written inside assets are compiled to CSS on build. Standard assets (like PNGs, PDFs, or JavaScript files) are copied directly to the output folder.
