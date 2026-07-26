## ADDED Requirements

### Requirement: Multi-file Markdown Uploader
The system SHALL support drag-and-drop and native file selection of multiple files with `.md` extensions, reading their contents on the client side.

#### Scenario: Dropping multiple markdown files
- **WHEN** the user drags and drops two `.md` files (e.g., `doc1.md` and `doc2.md`) onto the dropzone area
- **THEN** the system SHALL create two separate tabs with their respective filenames and contents, activating the first tab.

#### Scenario: Using native file select
- **WHEN** the user clicks the file upload selector and selects multiple `.md` files
- **THEN** the system SHALL read the files and display them in new tabs in the workspace.

### Requirement: Document Tab Management
The system SHALL display open files as tabs in a tab bar, allowing switching between tabs, closing tabs, and creating new empty document tabs.

#### Scenario: Creating a new blank document tab
- **WHEN** the user clicks the "New Tab" button
- **THEN** the system SHALL append a new tab titled "Untitled.md" with empty content and set it as active.

#### Scenario: Switching active tabs
- **WHEN** the user clicks on an inactive tab header
- **THEN** the system SHALL render the corresponding document contents and update the active tab visual styling.

#### Scenario: Closing a tab
- **WHEN** the user clicks the close (`x`) button on a tab header
- **THEN** the system SHALL remove the tab from the open list and transition focus to the adjacent tab.

### Requirement: Split Screen Workspace
The system SHALL provide layout options to toggle between Editor-only, Preview-only, and side-by-side Split View.

#### Scenario: Toggling to Split View
- **WHEN** the user selects the "Split View" layout option
- **THEN** the system SHALL divide the workspace into an editable text field on the left and a live formatted preview on the right.

#### Scenario: Toggling to Editor-only view
- **WHEN** the user selects the "Editor" layout option
- **THEN** the system SHALL display only the raw text editor panel across the entire workspace width.

#### Scenario: Toggling to Preview-only view
- **WHEN** the user selects the "Preview" layout option
- **THEN** the system SHALL display only the formatted markdown preview panel across the entire workspace width.

### Requirement: Beautiful Markdown Rendering
The system SHALL parse raw markdown text dynamically and render it using a premium styling theme, supporting headers, list items, tables, code blocks, blockquotes, and checklist tasks.

#### Scenario: Live text preview synchronization
- **WHEN** the user types markdown content in the editor panel
- **THEN** the system SHALL parse the text and update the preview pane in real time.

#### Scenario: Formatting GFM elements
- **WHEN** the document content contains GFM elements like tables, code blocks, and checkboxes
- **THEN** the system SHALL display them with distinct styling including formatted boundaries, dark syntax containers, and checklist icons.

### Requirement: Theme Presets
The system SHALL support Light, Dark, and Sepia themes with modern visual features such as glassmorphism headers, smooth color transitions, and custom typography.

#### Scenario: Switching to Sepia Mode
- **WHEN** the user selects the "Sepia" option from the theme toggle
- **THEN** the system SHALL apply a warm cream-colored palette to the background and adjust font colors to reduce eye strain.

### Requirement: Brand Icon Synchronization
The system SHALL display the same brand logo icon in both the browser tab favicon and the header navigation bar.

#### Scenario: Rendering synchronized logo in header
- **WHEN** the application interface is loaded
- **THEN** the system SHALL render the custom SVG logo (matching the favicon asset) in the header branding area.

