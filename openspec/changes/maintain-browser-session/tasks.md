## 1. Storage API Transition in App.tsx

- [x] 1.1 Update the initial loading effect in `src/App.tsx` to retrieve state parameters (`openmarkdown_tabs`, `openmarkdown_active_tab`, `openmarkdown_layout`, `openmarkdown_theme`, `openmarkdown_font_size`) from `sessionStorage` instead of `localStorage`
- [x] 1.2 Update the synchronization effects in `src/App.tsx` to store and remove workspace state parameters using `sessionStorage` instead of `localStorage`

## 2. Validation & Verification

- [x] 2.1 Verify that page reloads within the same browser tab preserve all open tabs, custom edits, layout modes, and active selection
- [x] 2.2 Verify that closing the tab or opening the app in a new window/tab completely resets the workspace to the default welcome layout
