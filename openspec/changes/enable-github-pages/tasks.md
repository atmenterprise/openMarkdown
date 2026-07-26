## 1. Vite Base Path Configuration

- [x] 1.1 Update the Vite configuration file `vite.config.ts` to include the `base: './'` property within the define config block to resolve asset relative paths correctly

## 2. GitHub Actions Workflow Configuration

- [x] 2.1 Create the target workflow directory `.github/workflows/` in the workspace root
- [x] 2.2 Create the configuration file `.github/workflows/deploy.yml` with checking out source, node caching setup, building runtime, uploading `dist/` directory pages artifacts, and deploying actions

## 3. Validation & Verification

- [x] 3.1 Run a local compilation build check (`npm run build`) and verify that links inside `dist/index.html` resolve relatively (e.g. references contain `./assets/` instead of `/assets/`)
- [x] 3.2 Confirm that the workflow file triggers on pushes to the main branch and contains correct actions and permissions
