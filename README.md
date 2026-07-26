# openMarkdown

> A premium, easy, and secure web-based Markdown Collaborator and Viewer.

**openMarkdown** is a fast, responsive, and locally-secure Markdown editor and formatter built using modern web technologies. Designed with a focus on user experience, it features a fluid tabbed workspace, real-time live preview rendering, drag-and-drop file imports, session persistence, and fully customizable themes.

---

## ✦ Key Features

- **Tabbed Workspace**: Edit and preview multiple Markdown files simultaneously. Rename tabs on the fly by double-clicking on the tab title.
- **Drag-and-Drop file imports**: Drop `.md` or `.txt` files directly into the browser window to open them as new tabs instantly.
- **Live GFM Preview**: Real-time side-by-side rendering using GitHub Flavored Markdown (GFM) logic (including checklists, custom tables, blockquotes, code-blocks, etc.).
- **Multiple Workspace Layouts**: Swap layouts on the fly depending on your current focus:
  - **Split View** (Side-by-side Editor & Preview)
  - **Editor Mode** (Full width code input)
  - **Preview Mode** (Full width formatted reading view)
- **Visual Theme Presets**:
  - **Sleek Dark**: Custom-tailored dark theme with subtle glows.
  - **Light Presets**: A clean, accessible light mode.
  - **Warm Sepia**: Optimized for long reading sessions and reduced eye strain.
- **Dynamic Text Scale**: Adjust font size dynamically from `11px` to `24px` for optimal viewing and coding readability across both editor and preview sections.
- **Session Persistence**: Safe and secure browser session state management. Your active layout, theme, font size, active tab, and tab contents are cached in the browser's session storage. You won't lose your work on accidental page refreshes.
- **Privacy First**: Completely client-side execution. Your drafts and files are processed locally in your browser and never sent to external servers or databases.

---

## 🛠️ Tech Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vite.dev/)
- **Styling**: Vanilla CSS (Fluid layouts, glassmorphism borders, theme-aware CSS variables, and dynamic transition animations)
- **Markdown Processing**: Powered by `react-markdown` and `remark-gfm`

---

## 🏗️ Architecture & OpenSpec Design

This application was architected and built using the **OpenSpec** methodology. 

By employing OpenSpec guidelines, features and system updates—such as layout optimizations, theme configurations, file drop mechanics, session states, and build processes—were designed, specified, and systematically updated using delta specs. This approach ensures:
- Rigorous design considerations before writing any code.
- Clean separation of concerns and clear functional boundaries.
- Incremental, verifiable feature updates and stable transitions.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/atmenterprise/openMarkdown.git
   cd openMarkdown
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server:
   ```bash
   npm run dev
   ```
Open your browser and navigate to `http://localhost:5173`.

### Production Build

To compile the application code and optimize it for production deployment:
   ```bash
   npm run build
   ```
The output assets will be built into the `dist/` directory, ready to be served from any static hosting service.

---

## 📂 Project Structure

```text
├── .agent/              # Agent workflow configurations
├── openspec/            # System designs and project specifications
├── public/              # Static assets (Favicons, logos)
├── src/
│   ├── App.tsx          # Main Application component & layout logic
│   ├── index.css        # Premium style sheet and theme variables
│   ├── main.tsx         # Application entry point
│   └── types.ts         # Global TypeScript interfaces
├── index.html           # Main HTML entry point
├── package.json         # Node.js dependencies and scripts
└── tsconfig.json        # TypeScript configuration settings
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](file:///Users/rishushrivastava/Document/GitHub/openMarkdown/LICENSE) file for details.
