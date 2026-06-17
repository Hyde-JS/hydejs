# HydeJS Project Instructions

## Critical Constraints
- **GitHub Actions Workflows:** DO NOT EDIT `.github/workflows/publish.yml` in either the `hydejs` or `theme-default` repositories without explicit user approval. These files are configured for Trusted Publishing (OIDC) and must remain untouched.

## Development Workflow
- **Ecosystem Releases:** Always publish the theme (`@hydejs/theme-default`) first, then update the core engine (`@hydejs/hydejs`) to depend on the new theme version before bumping the engine's version.
- **NPM Organization:** All packages must be scoped under the `@hydejs` organization.
- **Branching:** The default branch for all repositories is `main`.

## Architectural Patterns
- **Theme Resolution:** The engine prioritizes themes found in `node_modules` before falling back to internal directories.
- **Node-Native:** Maintain 100% Jekyll parity while utilizing only Node.js-native dependencies (e.g., Shiki for highlighting, LiquidJS for templating).
