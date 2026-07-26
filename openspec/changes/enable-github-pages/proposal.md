## Why

Currently, openMarkdown is a client-side static web application without a deployment or hosting pipeline. We need a GitHub Actions CI/CD workflow to automatically compile, build, and deploy the application to GitHub Pages whenever changes are merged into the main repository branch.

## What Changes

- Add a GitHub Actions deployment workflow configuration file at `.github/workflows/deploy.yml`.
- Update `vite.config.ts` to specify a base path configuration (e.g. base: './' or base: '/openMarkdown/') so that CSS, JS, and image assets load correctly when hosted in a GitHub Pages subdirectory.

## Capabilities

### New Capabilities

- `pages-deployment`: Automated build and deployment pipeline for hosting the static site on GitHub Pages.

### Modified Capabilities

None.

## Impact

- Adds `.github/workflows/deploy.yml` to specify GitHub Actions steps.
- Modifies `vite.config.ts` to include base path configurations.
