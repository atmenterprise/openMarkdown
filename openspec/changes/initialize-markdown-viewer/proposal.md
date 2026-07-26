## Why

Currently, the workspace is completely empty. We need a web-based React application that allows users to easily input or upload markdown content and displays it in a clean, visual, and beautifully formatted layout. The application must support uploading multiple files at once, displaying them in a tabbed workspace.

## What Changes

- Initialize a new React web application using Vite, TypeScript, and Vanilla CSS.
- Add a drag-and-drop file uploader that parses multiple `.md` files at once.
- Build a tabbed file manager allowing users to switch between open files, create new blank tabs, edit files, and close tabs.
- Implement a rich markdown renderer that displays formatted headers, lists, code snippets, tables, blockquotes, and tasks in a high-fidelity visual layout.
- Create theme presets (Light Mode, Dark Mode, Sepia Mode) to offer a premium reading and writing experience.

## Capabilities

### New Capabilities

- `markdown-viewer`: Core capability covering multiple file upload, tabbed management, inline editing, and responsive side-by-side rendering with rich markdown styling.

### Modified Capabilities

None.

## Impact

- Creates a new React-Vite-TypeScript project structure in the workspace.
- Installs necessary client-side dependencies (`react-markdown`, `remark-gfm`).
- Client-side only execution with no external backend or database dependencies.
