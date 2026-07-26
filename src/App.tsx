import { useState, useEffect, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MarkdownTab, LayoutMode, ThemeMode } from './types';

const DEFAULT_WELCOME_MARKDOWN = `# Welcome to openMarkdown! ✦

Your premium web-based markdown editor and formatter.

### How to use this editor:
1. **Upload Files**: Drag & drop multiple \`.md\` or \`.txt\` files directly into this window, or click the **Upload Files** button in the top right.
2. **Manage Tabs**: Each file opens in its own tab. You can click on the filename to rename it, or click the \`×\` to close.
3. **Workspace Layout**: Use the layout toggle below the tabs to choose between **Split View**, **Editor-only**, or **Preview-only**.
4. **Custom Themes**: Swap between **Light**, **Dark**, and **Sepia** presets using the theme selector on the right.
5. **Adjust Font Size**: Scale the text using the **A-** and **A+** options in the toolbar.

---

### GFM Markdown Cheat Sheet

#### 1. Tasks List
- [x] Create a stunning UI
- [x] Install react-markdown
- [ ] Add real-time collab (Future)

#### 2. Clean Formatting Tables
| Feature | Supported | Premium Aesthetic |
| :--- | :---: | :---: |
| Drag & Drop | Yes | Yes |
| Tabbed Workspace | Yes | Yes |
| Custom Presets | Yes | Yes |

#### 3. Blockquotes
> "This editor was built from scratch with custom Vanilla CSS variables for maximum flexibility, fluid animations, and absolute control over reading styles."

#### 4. Inline & Block Code
Here is an inline snippet: \`const test = 'openMarkdown';\` and below is a block of TypeScript code:

\`\`\`typescript
function greet(user: string): string {
  return \`Welcome back, \${user}!\`;
}
\`\`\`

Enjoy formatting! If you have any feedback, edit this tab or start a new document.
`;

function App() {
  // --- States ---
  const [tabs, setTabs] = useState<MarkdownTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [layout, setLayout] = useState<LayoutMode>('split');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [fontSize, setFontSize] = useState<number>(15);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [editingTabId, setEditingTabId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initial Load ---
  useEffect(() => {
    const savedTabs = sessionStorage.getItem('openmarkdown_tabs');
    const savedActiveTab = sessionStorage.getItem('openmarkdown_active_tab');
    const savedLayout = sessionStorage.getItem('openmarkdown_layout') as LayoutMode;
    const savedTheme = sessionStorage.getItem('openmarkdown_theme') as ThemeMode;
    const savedFontSize = sessionStorage.getItem('openmarkdown_font_size');

    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        setTabs(parsed);
        if (savedActiveTab) {
          setActiveTabId(savedActiveTab);
        } else if (parsed.length > 0) {
          setActiveTabId(parsed[0].id);
        }
      } catch (e) {
        initializeDefaultTab();
      }
    } else {
      initializeDefaultTab();
    }

    if (savedLayout) setLayout(savedLayout);
    if (savedTheme) setTheme(savedTheme);
    if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
  }, []);

  // --- Sync Effects ---
  useEffect(() => {
    if (tabs.length > 0) {
      sessionStorage.setItem('openmarkdown_tabs', JSON.stringify(tabs));
    } else {
      sessionStorage.removeItem('openmarkdown_tabs');
    }
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      sessionStorage.setItem('openmarkdown_active_tab', activeTabId);
    } else {
      sessionStorage.removeItem('openmarkdown_active_tab');
    }
  }, [activeTabId]);

  useEffect(() => {
    sessionStorage.setItem('openmarkdown_layout', layout);
  }, [layout]);

  useEffect(() => {
    sessionStorage.setItem('openmarkdown_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    sessionStorage.setItem('openmarkdown_font_size', fontSize.toString());
  }, [fontSize]);

  // --- Helper Helpers ---
  const initializeDefaultTab = () => {
    const defaultId = Date.now().toString();
    const defaultTab: MarkdownTab = {
      id: defaultId,
      name: 'Welcome.md',
      content: DEFAULT_WELCOME_MARKDOWN,
      isDirty: false
    };
    setTabs([defaultTab]);
    setActiveTabId(defaultId);
  };

  const getActiveTab = (): MarkdownTab | undefined => {
    return tabs.find(t => t.id === activeTabId);
  };

  // --- Tab Action Functions ---
  const createNewTab = () => {
    const newId = Date.now().toString();
    const newTab: MarkdownTab = {
      id: newId,
      name: `Untitled_${tabs.length + 1}.md`,
      content: '',
      isDirty: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setEditingTabId(newId); // Focus renaming instantly
  };

  const closeTab = (idToClose: string) => {
    const tabIndex = tabs.findIndex(t => t.id === idToClose);
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(t => t.id !== idToClose);
    setTabs(newTabs);

    if (activeTabId === idToClose) {
      if (newTabs.length > 0) {
        // Set active tab to nearest neighbor
        const nextActiveIndex = tabIndex === 0 ? 0 : tabIndex - 1;
        setActiveTabId(newTabs[nextActiveIndex].id);
      } else {
        setActiveTabId('');
      }
    }
  };

  const updateActiveContent = (newContent: string) => {
    setTabs(prevTabs =>
      prevTabs.map(t =>
        t.id === activeTabId ? { ...t, content: newContent, isDirty: true } : t
      )
    );
  };

  const renameTab = (idToRename: string, newName: string) => {
    let cleanName = newName.trim();
    if (!cleanName) return;
    if (!cleanName.endsWith('.md') && !cleanName.endsWith('.txt')) {
      cleanName += '.md';
    }

    setTabs(prevTabs =>
      prevTabs.map(t =>
        t.id === idToRename ? { ...t, name: cleanName } : t
      )
    );
  };

  // --- File Import Operations ---
  const processFiles = (fileList: FileList) => {
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB Limit
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the 2MB size limit and was skipped.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    let processedCount = 0;
    const newTabsList: MarkdownTab[] = [];

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string || '';
        const newId = (Date.now() + index).toString();
        newTabsList.push({
          id: newId,
          name: file.name,
          content: text,
          isDirty: false
        });

        processedCount++;

        // Once all files are asynchronously read, append them to state
        if (processedCount === validFiles.length) {
          setTabs(prevTabs => {
            const updated = [...prevTabs, ...newTabsList];
            // Set active tab to the first newly uploaded file
            setActiveTabId(newTabsList[0].id);
            return updated;
          });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleNativeUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // --- Drag & Drop Handlers ---
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) {
      setDragActive(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // --- Font Scale Adjusters ---
  const increaseFont = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };

  const decreaseFont = () => {
    setFontSize(prev => Math.max(prev - 1, 11));
  };

  const activeTab = getActiveTab();

  return (
    <div 
      className="app-layout"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Indicator overlay */}
      <div className={`dropzone-overlay ${dragActive ? 'active' : ''}`}>
        <div className="dropzone-msg">
          <h3>✦ Drop Markdown Files Here</h3>
          <p>You can drag and drop multiple .md files directly to load them as tabs</p>
        </div>
      </div>

      {/* Glassmorphism Header */}
      <header className="app-header">
        <div className="brand-section">
          <img src="./favicon.svg" className="brand-logo" alt="openMarkdown Logo" />
          <h1 className="app-title">openMarkdown</h1>
        </div>
        <div className="header-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleNativeUploadChange} 
            multiple 
            accept=".md,.txt" 
            className="file-input-hidden"
          />
          <button onClick={triggerUploadClick} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Files
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="app-workspace">
        
        {/* Tabs Bar */}
        <div className="workspace-tabs">
          {tabs.map(tab => (
            <div 
              key={tab.id} 
              className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.8 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              
              {editingTabId === tab.id ? (
                <input 
                  type="text"
                  defaultValue={tab.name}
                  autoFocus
                  className="tab-title-input"
                  onBlur={(e) => {
                    renameTab(tab.id, e.target.value);
                    setEditingTabId('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      renameTab(tab.id, (e.target as HTMLInputElement).value);
                      setEditingTabId('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingTabId(tab.id);
                  }}
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {tab.name} {tab.isDirty ? '•' : ''}
                </span>
              )}

              <button 
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}

          <button onClick={createNewTab} className="btn-new-tab" title="Create new tab">
            +
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="workspace-controls">
          <div className="control-group">
            <span>Layout:</span>
            <div className="layout-toggle">
              <button 
                onClick={() => setLayout('editor')} 
                className={`layout-btn ${layout === 'editor' ? 'active' : ''}`}
                title="Editor Mode"
              >
                Editor
              </button>
              <button 
                onClick={() => setLayout('split')} 
                className={`layout-btn ${layout === 'split' ? 'active' : ''}`}
                title="Split Side-by-Side View"
              >
                Split
              </button>
              <button 
                onClick={() => setLayout('preview')} 
                className={`layout-btn ${layout === 'preview' ? 'active' : ''}`}
                title="Preview Focus Mode"
              >
                Preview
              </button>
            </div>
          </div>

          <div className="control-group">
            <span>Text Scale:</span>
            <button onClick={decreaseFont} className="font-ctrl-btn" title="Decrease Font size">A-</button>
            <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '500' }}>{fontSize}px</span>
            <button onClick={increaseFont} className="font-ctrl-btn" title="Increase Font size">A+</button>
            
            <span style={{ marginLeft: '12px' }}>Theme:</span>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as ThemeMode)}
              className="theme-selector"
            >
              <option value="light">Light Presets</option>
              <option value="dark">Sleek Dark</option>
              <option value="sepia">Warm Sepia</option>
            </select>
          </div>
        </div>

        {/* Editor and Preview Split Grid */}
        {activeTab ? (
          <div className={`panels-container layout-${layout}`}>
            
            {/* Left Editor */}
            <div className="panel panel-editor">
              <textarea
                value={activeTab.content}
                onChange={(e) => updateActiveContent(e.target.value)}
                placeholder="Type your Markdown markup syntax here..."
                className="markdown-editor-input"
                style={{ fontSize: `${fontSize}px` }}
              />
            </div>

            {/* Right Formatted Preview */}
            <div className="panel panel-preview">
              <div className="markdown-preview-container">
                <article className="markdown-preview" style={{ fontSize: `${fontSize}px` }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeTab.content || '_No markdown content entered yet._'}
                  </ReactMarkdown>
                </article>
              </div>
            </div>

          </div>
        ) : (
          /* Empty Workspace Welcome Panel */
          <div className="empty-workspace-state">
            <div className="empty-illustration">✦</div>
            <h2>Create or Import Documents</h2>
            <p>Load multiple markdown files via drag-and-drop or start typing by creating a new blank tab.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={createNewTab} className="btn btn-primary">
                + New Document Tab
              </button>
              <button onClick={triggerUploadClick} className="btn">
                Select Files to Import
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="app-footer">
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} <a href="https://linktr.ee/atmenterprise" target="_blank" rel="noopener noreferrer">ATM Enterprise</a>. All rights reserved.
        </div>
        <div className="footer-donation">
          <a href="https://buymeacoffee.com/atmenterpr4" target="_blank" rel="noopener noreferrer" className="coffee-link">
            <svg className="coffee-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="5" />
              <line x1="10" y1="2" x2="10" y2="5" />
              <line x1="14" y1="2" x2="14" y2="5" />
            </svg>
            Buy me a coffee
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
