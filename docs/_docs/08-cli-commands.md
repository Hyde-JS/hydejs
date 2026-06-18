---
layout: doc
title: CLI Reference
---

HydeJS provides a clean command-line interface to build, serve, test, and scaffold projects.

---

## Commands Cheat Sheet

| Command | Alias | Description |
| :--- | :--- | :--- |
| `hydejs new <path>` | — | Scaffolds a new themed blog project at the target path. |
| `hydejs build` | `b` | Performs a one-off build compilation of your site. |
| `hydejs serve` | `s` | Launches a live dev server with chokidar file watchers. |
| `hydejs clean` | — | Empties all compiled assets inside the build directory. |
| `hydejs doctor` | — | Audits directory layouts and warns on Jekyll migration leftovers. |
| `hydejs install` | — | Converts and installs a theme from a git URL. |
| `hydejs new-theme <name>` | — | Generates a theme framework shell inside `jekyll-themes/`. |

---

## Global Options

The `build`, `serve`, and `clean` subcommands accept global options to customize directories:

### `--source <dir>` (or `-s <dir>`)
Specifies the source root directory containing project files. Defaults to `.`.
```bash
hydejs build --source docs
```

### `--destination <dir>` (or `-d <dir>`)
Overrides the target compilation output folder. Defaults to `_site`.
```bash
hydejs build --destination build_output
```

---

## Command Details

### `hydejs new <path> [--blank]`
Scaffolds a new project.
*   **Themed Scaffold** (Default): Copies layouts, includes, assets, and configs from the default minima theme.
*   **Blank Scaffold**: Specifies `--blank` to create empty folders (`_posts/`, `_layouts/`, `_includes/`, `_data/`, `assets/`) and a minimal config.

### `hydejs serve [--config <path>]`
*   Serves compiled assets inside the destination folder on `http://localhost:4000`.
*   Monitors file changes inside source folders (excluding dotfiles, git, node_modules, and destination folders) and triggers rebuilds and hot reload refreshes on change.
