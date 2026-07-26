## Context

The React application is fully initialized. We need to introduce a footer area at the bottom of the viewport. Currently, the page layout grid (`.app-layout`) is set to two rows: header (64px) and workspace (auto). We will adjust the grid structure to accommodate the footer seamlessly.

## Goals / Non-Goals

**Goals:**
- Update the page container CSS Grid to support a 3-row layout: header, workspace, footer.
- Implement a footer containing copyright ownership linked to ATM Enterprise's Linktree (https://linktr.ee/atmenterprise).
- Implement a Buy Me A Coffee link containing a custom inline SVG icon pointing to the donation page (https://buymeacoffee.com/atmenterpr4).
- Ensure the footer matches active presets (Light, Dark, Sepia) with smooth transitions.

**Non-Goals:**
- Creating dedicated routing or sub-pages for copyright or licensing agreements.

## Decisions

### Decision 1: Page Grid Structure Modification
- **Rationale**: Currently, `.app-layout` is `grid-template-rows: 64px auto`. To place the footer cleanly at the bottom without causing vertical viewport scrolling of the main layout, we will update it to `grid-template-rows: 64px 1fr 40px` (or `36px`), where the workspace is `1fr` and the footer has a fixed height.
- **Alternatives considered**: Position absolute/fixed. This is brittle and can lead to content overlaps on short screens. CSS Grid is cleaner and standard.

### Decision 2: Direct Insertion in App.tsx
- **Rationale**: Since the app structure is self-contained and modular layouts are defined in `App.tsx`, we will append the semantic `<footer>` container directly inside the primary return block of the App component.
- **Alternatives considered**: Creating a separate `Footer.tsx` file. Since the footer is static and only contains two links, direct embedding in the core shell keeps the repository clean.

### Decision 3: Custom SVG Coffee Icon
- **Rationale**: We will write an inline SVG representation of a coffee cup inside the Buy Me A Coffee button to guarantee rendering with zero additional packages.

## Risks / Trade-offs

- **[Risk] Workspace Viewport Space Reductions** → *Mitigation*: Set the footer height to a compact 36px and adjust padding so that the editor and preview panels retain maximum screen real estate.
