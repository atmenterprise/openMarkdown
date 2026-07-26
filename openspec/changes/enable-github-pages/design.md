## Context

The application is a client-side React single-page application built using Vite. To make it publicly accessible, we will configure a deployment pipeline on GitHub Actions that targets GitHub Pages.

## Goals / Non-Goals

**Goals:**
- Add a GitHub Actions CI/CD workflow `.github/workflows/deploy.yml` that builds and deploys on pushes to the `main` branch.
- Update `vite.config.ts` base configuration to ensure assets are resolved properly when served under a subfolder.

**Non-Goals:**
- Deploying to dynamic server environments (e.g. AWS EC2, Heroku, Node server).
- Setting up custom domain names or SSL certificates outside of GitHub's native provisioning.

## Decisions

### Decision 1: Target GitHub Actions deploy-pages and upload-pages-artifact
- **Rationale**: GitHub offers first-party actions (`actions/upload-pages-artifact` and `actions/deploy-pages`) that deploy compiled static files natively to the Pages hosting environment. This avoids setting up separate Git deployments or storing deployment keys/tokens.
- **Alternatives considered**: Using `gh-pages` npm package. However, this commits built artifacts back to a git branch, cluttering repo history. CI/CD actions are cleaner.

### Decision 2: Use Relative Base Path (base: './') in vite.config.ts
- **Rationale**: By default, Vite outputs absolute asset paths (e.g. `/assets/index.js`), which breaks when hosted in a GitHub Pages subdirectory (e.g. `domain.com/openMarkdown/`). Setting `base: './'` forces relative asset paths, enabling the project to run on any domain subpath without needing to hardcode the repository name.
- **Alternatives considered**: Setting `base: '/openMarkdown/'`. This is less portable as it breaks if the repository name is changed. Relative paths are fully portable.

### Decision 3: Grant workflow permissions explicitly
- **Rationale**: GitHub Pages deployments require write permissions to upload deployment bundles. We will add `permissions: contents: read, pages: write, id-token: write` directly inside the workflow configuration to avoid permission errors.

## Risks / Trade-offs

- **[Risk] GitHub Actions Quotas** → *Mitigation*: Our build is extremely fast and lightweight (typically builds in < 10 seconds), resulting in minimal minutes consumption.
