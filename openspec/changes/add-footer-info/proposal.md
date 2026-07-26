## Why

Currently, the openMarkdown workspace lacks a footer section. Adding a footer provides copyright attribution, links to the owner (ATM Enterprise), and incorporates a "Buy Me A Coffee" donation option to allow users to support the project.

## What Changes

- Add a responsive footer container at the bottom of the main application layout.
- Include a copyright notice for ATM Enterprise with a link to their official Linktree profile (https://linktr.ee/atmenterprise).
- Add a "Buy Me A Coffee" call-to-action button and icon linking to the official donation page (https://buymeacoffee.com/atmenterpr4).
- Ensure the footer container matches the light, dark, and sepia presets with appropriate styling and transitions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `markdown-viewer`: Add layout specs for the footer area including copyright, links, and donation actions.

## Impact

- Modifies the main page layout in `src/App.tsx` (modifying the CSS Grid of the workspace/layout shell).
- Modifies the style sheet `src/index.css` to add footer visual parameters and adjust grid rows.
