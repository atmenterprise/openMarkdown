export interface MarkdownTab {
  id: string;          // Unique ID (e.g. uuid or timestamp)
  name: string;        // Filename, e.g. "README.md"
  content: string;     // Raw markdown text content
  isDirty: boolean;    // Flag indicating if edits have been made
}

export type LayoutMode = 'split' | 'editor' | 'preview';

export type ThemeMode = 'light' | 'dark' | 'sepia';
