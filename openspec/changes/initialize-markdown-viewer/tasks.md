## 1. Project Initialization & Setup

- [x] 1.1 Initialize a new Vite project in the current directory with React and TypeScript templates using `npx -y create-vite@latest ./ --template react-ts`
- [x] 1.2 Install runtime dependencies including `react-markdown` and `remark-gfm` for advanced markdown rendering
- [x] 1.3 Clean up unnecessary Vite boilerplate files (like default icons, mock assets, and CSS files) to start with a blank layout

## 2. Design System & CSS Variables

- [x] 2.1 Write the custom styling system in `src/index.css` declaring the theme color tokens for Light, Dark, and Sepia modes
- [x] 2.2 Design the overall workspace grid layout including header, active tab bar, controls bar, and editor/viewer split panels
- [x] 2.3 Add layout control buttons to easily toggle between Split View, Editor-only, and Preview-only focus modes
- [x] 2.5 Update the header brand logo in App.tsx to use the official favicon.svg asset, ensuring visual branding synchronization

## 3. Tab State & Local Storage

- [x] 3.1 Create TypeScript types and local state tracking for open tabs (ID, filename, content text, isDirty status)
- [x] 3.2 Integrate the synchronization logic to load/save state from browser `localStorage` on page refresh
- [x] 3.3 Build the Tab Bar interface component with active tab highlights, hover styles, close buttons, and a "New Tab" button

## 4. File Dropzone & Uploader

- [x] 4.1 Implement the drag-and-drop file dropzone listeners with dynamic CSS highlight overlays
- [x] 4.2 Add a native file input button for manual selection of multiple files
- [x] 4.3 Write the file loader utility using HTML5 `FileReader` to process selected markdown files, filtering out files larger than 2MB

## 5. Markdown Viewer Panel

- [x] 5.1 Add the `react-markdown` parser inside the preview pane, equipping it with the GFM plugin
- [x] 5.2 Add premium CSS formatting rules for markdown headings, lists, tables, checklist items, and blockquotes
- [x] 5.3 Build a custom toolbar to scale markdown text size dynamically (font-size selectors)

## 6. Validation & Polish

- [x] 6.1 Verify drag-and-drop and file input uploading works correctly with multiple simultaneous files
- [x] 6.2 Verify document tabs can be switched, closed, and renamed successfully without state issues
- [x] 6.3 Verify themes (Light, Dark, Sepia) apply visual styles correctly across all components
- [x] 6.4 Fix the layout-preview grid structure bug where preview panel becomes invisible or collapses
