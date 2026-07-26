## Context

The repository is currently empty. We must set up a client-side web application from scratch. The application will allow users to upload or input markdown files and render them with high visual quality in a tabbed view. All operations must run locally in the browser with no backend database requirements.

## Goals / Non-Goals

**Goals:**
- Zero-config local development setup using Vite, React, and TypeScript.
- Drag-and-drop area supporting multiple simultaneous file uploads.
- Smooth tabbed management interface (add, switch, rename, close tabs).
- Fully responsive screen layout featuring split editor/preview and focused reading/writing panels.
- Highly premium CSS variables-based theme support (Light, Dark, Sepia presets).

**Non-Goals:**
- Setting up a database, user login, or real-time sync server.
- Supporting visual WYSIWYG editing; the application will focus purely on editing raw markdown source code and showing the parsed output.
- Supporting file formats other than Markdown (`.md`) or plain text (`.txt`).

## Decisions

### Decision 1: Project Setup with Vite + TypeScript
- **Rationale**: Vite provides extremely fast HMR (Hot Module Replacement) and a clean build pipeline. TypeScript enforces typing for state management interfaces (e.g., Tab state, File uploads).
- **Alternatives considered**: Create React App (CRA) is deprecated and slow. Next.js is overkill for a purely client-side static page.

### Decision 2: Vanilla CSS for Styling and Themes
- **Rationale**: Keeps bundle sizes small, offers complete design flexibility, and enables clean glassmorphic components using modern CSS features (`backdrop-filter`, standard CSS variables for color tokens, custom scrollbars).
- **Alternatives considered**: Tailwind CSS would require additional configuration and boilerplate setup. Vanilla CSS fits the project perfectly.

### Decision 3: react-markdown for Rendering
- **Rationale**: Safe parsing that prevents Cross-Site Scripting (XSS). It has a modular architecture supporting plugins like `remark-gfm` for tables, task lists, and strikethroughs.
- **Alternatives considered**: `marked` or dangerously setting raw HTML. These present security vulnerabilities and are harder to integrate cleanly with React components.

### Decision 4: In-Memory Tab State with Optional LocalStorage Backup
- **Rationale**: Keeps application state reactive and simple using standard React hooks. Tab state is serialized to `localStorage` to survive page refreshes.
- **Alternatives considered**: Redux or Context API. The component hierarchy is flat enough that a top-level state is simple to pass down, avoiding redux boilerplate.

## Risks / Trade-offs

- **[Risk] Browser Refresh Data Loss** → *Mitigation*: Automatically serialize open tabs to `localStorage` under a workspace key so that the workspace state is restored on load.
- **[Risk] Extremely Large Files** → *Mitigation*: Set a threshold of 2MB for uploaded files and skip parsing if exceeded, prompting the user with an alert.
