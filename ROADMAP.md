# HydeJS Roadmap

A vision for a pure Node.js static site generator with full Jekyll parity and modern enhancements.

## Current Priority 🎯
- [ ] **NPM-based Theme System:** Support for loading and updating themes via `npm install`, keeping project directories clean and allowing themes to be distributed as packages.

## Phase 1: Full Jekyll Parity 🏗️
- [x] **Native Pagination:** Built-in engine to handle blog post pagination without external dependencies.
- [x] **Advanced Liquid Filters:** Full support for `group_by`, `where_exp`, `sort`, and `markdownify`.
- [ ] **Collection Support:** Ability to define custom collections (e.g., `_portfolio`, `_team`) in `_config.yml`.
- [ ] **Drafts Handling:** Support for the `_drafts` directory and a `--drafts` CLI flag.
- [ ] **Universal Markdownify:** Ensure any configuration field or front-matter data can be parsed as Markdown.

## Phase 2: Modern Node.js Enhancements 🚀
- [x] **High-Quality Syntax Highlighting:** Integration with `shiki` for build-time rendered, accessible code blocks.
- [ ] **Incremental Builds:** Only re-render modified files using a file-hashing cache (`.hydejs-cache/`).
- [ ] **Asset Pipeline (Plugin):** Automatic image optimization (via `sharp`), responsive image generation, and CSS/JS minification.

## Phase 3: Developer Experience (DX) & Ecosystem 🛠️
- [ ] **Extensible Plugin System:** A simple API for hooks into the build lifecycle (pre-render, post-render, etc.).
- [ ] **Improved Doctor Command:** Deeper analysis of theme compatibility, configuration health, and migration auditing.
- [ ] **Official Theme Organization:** Publish core themes (Minima, etc.) under the `@hydejs` scope on NPM.

## Strategic Goal
To become the go-to alternative for Jekyll users who want to stay in the Node.js ecosystem while maintaining 100% compatibility with their existing content and layouts.
