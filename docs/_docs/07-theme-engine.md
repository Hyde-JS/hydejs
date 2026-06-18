---
layout: doc
title: Theme Engine
---

HydeJS enables you to utilize, scaffold, and import themes to keep your repository directories clean.

---

## Installing Jekyll Themes

You can import any Jekyll theme library from Git and automatically convert it into a HydeJS-compatible package using:

```bash
hydejs install -t https://github.com/jekyll/minima.git
```

### What this does:
1.  **Clones** the theme repository to a local `.hydejs-themes/` cache directory.
2.  **Scaffolds** a `package.json` conversion config.
3.  **Configures** an automated GitHub actions workflow for NPM publishing.
4.  **Links** the theme natively using local NPM link bindings:
    ```bash
    npm install file:.hydejs-themes/minima
    ```
5.  **Updates** your project's `_config.yml` to specify the installed theme:
    ```yaml
    theme: "@hydejs/theme-minima"
    ```

---

## Scaffolding a New Theme

To create a new theme layout from scratch, run the command:

```bash
hydejs new-theme my-custom-theme
```

This generates a theme library skeleton under the `jekyll-themes/` directory, including layouts, includes, assets folders, and an initialized `package.json` package file.

---

## Theme Fallbacks

When compiling templates (such as includes or layouts), HydeJS searches in the following order:
1.  **Local Project Directories**: E.g. `_layouts/` and `_includes/` inside your source root. These will always override theme defaults.
2.  **Installed NPM Theme Packages**: Directories mapped inside the currently configured `theme` NPM package.
3.  **Local Fallback Directory**: Mapped under `jekyll-themes/`.
