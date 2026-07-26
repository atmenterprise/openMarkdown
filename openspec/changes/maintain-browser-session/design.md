## Context

The current implementation utilizes browser `window.localStorage` to persist state keys (`openmarkdown_tabs`, `openmarkdown_active_tab`, `openmarkdown_layout`, `openmarkdown_theme`, and `openmarkdown_font_size`). This keeps data persistently across different tab openings and browser closing/reopenings. We must transition this data to session-scoped storage.

## Goals / Non-Goals

**Goals:**
- Scope workspace state persistence (tabs list, active selection, theme mode, layout view, and font size) to the browser session.
- Ensure state persists during page refreshes/reloads.
- Ensure state resets when the browser tab or browser application is closed.

**Non-Goals:**
- Modifying React state variable structures, type definitions, or business logic.
- Building custom cookie expiration rules.

## Decisions

### Decision 1: Using sessionStorage API instead of localStorage
- **Rationale**: The HTML5 `sessionStorage` API is scoped exactly to the page session. It survives page reloads and restores, but is completely cleared when the top-level tab context or browser process is closed. This behaves exactly as the user specified with zero configuration or library overhead.
- **Alternatives considered**: Keeping state strictly in-memory (fails refresh requirement). Using cookies with short timeouts (unreliable and adds overhead).

## Risks / Trade-offs

- **[Risk] State Loss on Accidental Tab Closure** → *Mitigation*: This is the defined and expected behavior of a session-scoped editor. No mitigation is required as it aligns exactly with the user's specification.
