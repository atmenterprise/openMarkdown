## ADDED Requirements

### Requirement: Continuous Deployment Workflow Trigger
The system SHALL launch a deployment workflow on GitHub Actions when new commits are pushed to the `main` branch.

#### Scenario: Branch commit push trigger
- **WHEN** code is pushed to the `main` branch
- **THEN** the system SHALL invoke the deploy workflow pipeline.

### Requirement: Production Static Asset Compilation
The deployment workflow SHALL set up Node.js, install dependencies, and build the React production bundle, ensuring the assets are compiled with base paths compatible with subfolder hosting.

#### Scenario: Compilation bundle success
- **WHEN** the workspace environment runs the build script in CI
- **THEN** the system SHALL output correct static HTML, CSS, and JS bundles to the `dist` directory.

### Requirement: Automated Deploy Actions
The deployment workflow SHALL upload the compiled files and deploy them automatically to GitHub Pages.

#### Scenario: Deployment completion
- **WHEN** the static files build finishes successfully
- **THEN** the system SHALL publish the bundle to the GitHub Pages environment.
