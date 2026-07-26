## Why

Currently, openMarkdown persists the open tabs and active selections permanently using the browser's `localStorage` API. If a user closes the browser or tab and returns later, their old files remain. We want to enable session-based persistence so that files are preserved across page refreshes, but reset to the default welcoming state when the browser tab or browser itself is closed.

## What Changes

- Transition workspace persistence (tabs list, active tab ID, layout mode, theme, and font sizes) from `localStorage` to `sessionStorage`.
- Ensure that opening a new tab or reopening the browser starts a clean session containing only the default welcome layout.
- Maintain persistence during page reloads/refreshes within the active browser tab session.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `markdown-viewer`: Modify tab management and persistence specification from permanent localStorage to session-scoped sessionStorage.

## Impact

- Modifies `src/App.tsx` state loading and saving effects, switching references from `localStorage` to `sessionStorage`.
- Does not affect visual design or style variables.
