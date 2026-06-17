# HydeJS Roadmap

A vision for a pure Node.js static site generator with full Jekyll parity and modern enhancements.

## Phase 1: Full Jekyll Parity 🏗️
- [ ] **Native Pagination:** Built-in engine to handle blog post pagination without external dependencies.
- [ ] **Advanced Liquid Filters:** Full support for `group_by`, `where_exp`, `sort`, and `markdownify`.
- [ ] **Collection Support:** Ability to define custom collections (e.g., `_portfolio`, `_team`) in `_config.yml`.
- [ ] **Drafts Handling:** Support for the `_drafts` directory and a `--drafts` CLI flag.

## Phase 2: Modern Node.js Enhancements 🚀
- [ ] **High-Quality Syntax Highlighting:** Integration with `shiki` for build-time rendered, accessible code blocks.
- [ ] **NPM Theme System:** Support for loading and updating themes via `npm install`, keeping project directories clean.
- [ ] **Incremental Builds:** Only re-render modified files to speed up development on large sites.
- [ ] **Asset Pipeline (Plugin):** Automatic image optimization (via `sharp`) and CSS/JS minification.

## Phase 3: Developer Experience (DX) 🛠️
- [ ] **Extensible Plugin System:** A simple API for hooks into the build lifecycle (pre-render, post-render, etc.).
- [ ] **Improved Doctor Command:** Deeper analysis of theme compatibility and configuration health.
- [ ] **Project Templates:** Official "blank", "blog", and "portfolio" templates via `hydejs new`.

## Strategic Goal
To become the go-to alternative for Jekyll users who want to stay in the Node.js ecosystem while maintaining 100% compatibility with their existing content and layouts.
