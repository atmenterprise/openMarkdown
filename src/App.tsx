import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MarkdownTab, LayoutMode, ThemeMode } from './types';
import { readStored, writeStored } from './storage';

const welcome = `# A little space for big ideas.

Welcome to **openMarkdown** — a calm, focused place to write, edit, and bring your words to life.

## Make yourself at home

Start writing on the left and watch your document take shape on the right. No setup, no distractions. Just you and your ideas.

### Your next great document starts here

- **Write naturally.** Use simple Markdown to format your thoughts.
- **Bring your files.** Upload several documents at once, or drag them into this window.
- **Find your focus.** Switch between editor, split, and preview views.
- **Make it yours.** Choose a theme and a text size that feels right.

> The secret of getting ahead is getting started.

## A few things you can do

| Feature | Ready to go |
| :--- | :--- |
| Live Markdown preview | ✓ |
| Multiple documents | ✓ |
| Tables & task lists | ✓ |
| Download your work | ✓ |

### A small checklist

- [x] Find a quiet place to write
- [x] Open a fresh page
- [ ] Put your next idea into words

\`\`\`javascript
const idea = "Something worth sharing";
const nextStep = () => startWriting(idea);
\`\`\`

---

Made for your words. Built to stay out of their way.
`;

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    collapse: <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>,
    upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></>,
    download: <><path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    split: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/></>,
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    coffee: <><path d="M4 8h13v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3ZM17 9h2a3 3 0 1 1 0 6h-2M7 3v2m4-2v2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.file}</svg>;
}

function readSaved<T,>(key: string, fallback: T): T {
  try { const value = readStored(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}
const defaultTabs: MarkdownTab[] = [{ id: 'welcome', name: 'Welcome.md', content: welcome, isDirty: false }];

export default function App() {
  const [tabs, setTabs] = useState<MarkdownTab[]>(() => {
    const saved = readSaved<MarkdownTab[]>('openmarkdown_tabs', defaultTabs);
    return Array.isArray(saved) && saved.every(t => typeof t.id === 'string' && typeof t.name === 'string' && typeof t.content === 'string') ? saved : defaultTabs;
  });
  const [activeId, setActiveId] = useState(() => readStored('openmarkdown_active_tab') || 'welcome');
  const [layout, setLayout] = useState<LayoutMode>(() => {
    const saved = readStored('openmarkdown_layout');
    return saved === 'editor' || saved === 'preview' ? saved : 'split';
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = readStored('openmarkdown_theme');
    return saved === 'dark' || saved === 'sepia' ? saved : 'light';
  });
  const [fontSize, setFontSize] = useState(() => Math.max(11, Math.min(24, Number(readStored('openmarkdown_font_size')) || 14)));
  const [saveFailed, setSaveFailed] = useState(false);
  const [notice, setNotice] = useState('');
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [renaming, setRenaming] = useState('');
  const [fullScreen, setFullScreen] = useState(false);
  const reader = useRef<HTMLDivElement>(null);
  const fullScreenButton = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const active = tabs.find(t => t.id === activeId) || tabs[0];
  const words = active?.content.trim().split(/\s+/).filter(Boolean).length || 0;

  useEffect(() => { setSaveFailed(!writeStored('openmarkdown_tabs', JSON.stringify(tabs))); }, [tabs]);
  useEffect(() => { writeStored('openmarkdown_active_tab', active?.id || ''); }, [active?.id]);
  useEffect(() => { writeStored('openmarkdown_layout', layout); }, [layout]);
  useEffect(() => { writeStored('openmarkdown_theme', theme); document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { writeStored('openmarkdown_font_size', String(fontSize)); }, [fontSize]);

  useEffect(() => {
    if (!fullScreen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = fullScreenButton.current;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullScreen(false);
        if (document.fullscreenElement === reader.current) void document.exitFullscreen();
      }
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFullScreen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      trigger?.focus();
    };
  }, [fullScreen]);

  const toggleFullScreen = async () => {
    if (fullScreen) {
      setFullScreen(false);
      if (document.fullscreenElement === reader.current) await document.exitFullscreen();
      return;
    }
    setFullScreen(true);
    try {
      await reader.current?.requestFullscreen?.();
    } catch {
      // The viewport-filling reader remains available when browser fullscreen is unavailable.
    }
    fullScreenButton.current?.focus();
  };

  const create = () => {
    const tab = { id: crypto.randomUUID(), name: `Untitled ${tabs.length + 1}.md`, content: '', isDirty: false };
    setTabs(prev => [...prev, tab]); setActiveId(tab.id); setRenaming(tab.id);
  };
  const close = (id: string) => {
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (active?.id === id) setActiveId(next[Math.max(0, tabs.findIndex(t => t.id === id) - 1)]?.id || '');
  };
  const rename = (id: string, name: string) => {
    if (name.trim()) setTabs(prev => prev.map(t => t.id === id ? { ...t, name: /\.(md|markdown|txt)$/i.test(name.trim()) ? name.trim() : `${name.trim()}.md` } : t));
    setRenaming('');
  };
  const importFiles = async (files: FileList) => {
    setImporting(true);
    const selected = Array.from(files);
    const valid = selected.filter(f => /\.(md|markdown|txt)$/i.test(f.name) && f.size <= 2 * 1024 * 1024);
    const results = await Promise.allSettled(valid.map(async file => ({ id: crypto.randomUUID(), name: file.name, content: await file.text(), isDirty: false })));
    const imported = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    if (imported.length) { setTabs(prev => [...prev, ...imported]); setActiveId(imported[0].id); }
    const skipped = selected.length - imported.length;
    setNotice(`${imported.length} ${imported.length === 1 ? 'document' : 'documents'} imported.${skipped ? ` ${skipped} skipped. Use .md, .markdown or .txt files up to 2 MB each.` : ''}`);
    setImporting(false);
  };
  const download = () => {
    if (!active) return;
    const url = URL.createObjectURL(new Blob([active.content], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = active.name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setTabs(prev => prev.map(t => t.id === active.id ? { ...t, isDirty: false } : t));
    setNotice(`${active.name} downloaded.`);
  };

  return <div className="app" onDragEnter={e => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }} onDragOver={e => e.preventDefault()} onDragLeave={e => { e.preventDefault(); if (--dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }} onDrop={e => { e.preventDefault(); dragDepth.current = 0; setDragging(false); if (e.dataTransfer.files.length) void importFiles(e.dataTransfer.files); }}>
    <input ref={input} type="file" multiple accept=".md,.markdown,.txt" hidden onChange={e => { if (e.target.files?.length) void importFiles(e.target.files); e.target.value = ''; }}/>
    <header className="header">
      <a className="brand" href="./"><img className="brand-mark" src="./favicon.svg?v=2" alt=""/><span>open<span className="brand-light">Markdown</span><small>YOUR WORDS, BEAUTIFULLY.</small></span></a>
      <div className="header-right"><span className="local-badge"><span className="status-dot"/> A little room to think</span><span className="header-divider"/><a className="support" href="https://buymeacoffee.com/atmenterpr4" target="_blank" rel="noreferrer"><Icon name="coffee"/> Support the project <span>↗</span></a></div>
    </header>
    <div className="workspace-shell">
      <aside className="sidebar">
        <button className="button primary upload-button" onClick={() => input.current?.click()} disabled={importing}><Icon name="upload"/>{importing ? 'Importing…' : 'Upload files'}<span className="button-plus">+</span></button>
        <div className="section-label">DOCUMENTS <span>{tabs.length}</span><button onClick={create} aria-label="New document"><Icon name="plus" size={16}/></button></div>
        <nav className="document-list" aria-label="Documents">{tabs.map(tab => <div key={tab.id} className={`document-row ${active?.id === tab.id ? 'selected' : ''}`}>
          <button className="document-select" onClick={() => setActiveId(tab.id)} onDoubleClick={() => setRenaming(tab.id)}><Icon name="file" size={17}/><span>{tab.name}</span>{tab.isDirty && <i title="Changed since download"/>}</button>
          <button className="close-document" aria-label={`Close ${tab.name}`} onClick={() => close(tab.id)}>×</button>
        </div>)}</nav>
        <button className="new-document" onClick={create}><Icon name="plus" size={16}/> New document</button>
        <div className="sidebar-bottom"><button className="import-card" onClick={() => input.current?.click()}><span className="import-icon"><Icon name="upload" size={20}/></span><strong>Bring your ideas along</strong><span>Drop multiple Markdown files<br/>anywhere to get started.</span><small>.md, .markdown, .txt · up to 2 MB each</small></button><div className="privacy-note"><Icon name="check" size={14}/> Your files stay in your browser</div></div>
      </aside>
      <main className="main">
        <div ref={reader} className={`editor-card ${fullScreen ? 'is-fullscreen' : ''}`} role={fullScreen ? 'region' : undefined} aria-label={fullScreen ? 'Full-screen document reader' : undefined}>
          <div className="document-toolbar"><div className="current-document"><span className="file-badge"><Icon name="file"/></span>{active ? renaming === active.id ? <input aria-label="Document name" autoFocus defaultValue={active.name} onBlur={e => rename(active.id, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setRenaming(''); }}/> : <button title="Rename document" onClick={() => setRenaming(active.id)}>{active.name}<span>⌄</span></button> : <strong>No document open</strong>}<span className="saved-badge"><Icon name="check" size={13}/> {saveFailed ? 'Not saved' : 'Saved in browser'}</span></div><button className="button download-button" disabled={!active} onClick={download}><Icon name="download" size={16}/> Download <span className="extension">.md</span></button></div>
          <div className="view-toolbar"><div className="view-switch" aria-label="Editor layout">{(['editor', 'split', 'preview'] as LayoutMode[]).map(mode => <button key={mode} aria-pressed={layout === mode} className={layout === mode ? 'active' : ''} onClick={() => setLayout(mode)}><Icon name={mode === 'editor' ? 'code' : mode === 'split' ? 'split' : 'eye'} size={15}/>{mode[0].toUpperCase() + mode.slice(1)}</button>)}</div><div className="appearance-controls"><button ref={fullScreenButton} className="fullscreen-button" disabled={!active} aria-label={fullScreen ? 'Exit full screen' : 'View document in full screen'} aria-pressed={fullScreen} onClick={() => void toggleFullScreen()}><Icon name={fullScreen ? 'collapse' : 'expand'} size={15}/><span>{fullScreen ? 'Exit full screen' : 'Full screen'}</span></button><span className="toolbar-divider"/><button aria-label="Decrease font size" disabled={fontSize <= 11} onClick={() => setFontSize(s => s - 1)}>A−</button><span>{fontSize}px</span><button aria-label="Increase font size" disabled={fontSize >= 24} onClick={() => setFontSize(s => s + 1)}>A+</button><span className="toolbar-divider"/><select aria-label="Color theme" value={theme} onChange={e => setTheme(e.target.value as ThemeMode)}><option value="light">☼ Light</option><option value="dark">☾ Dark</option><option value="sepia">◐ Sepia</option></select></div></div>
          {active ? <div className={`panels layout-${layout}`}><section className="source-panel"><div className="panel-label"><span><Icon name="code" size={14}/> MARKDOWN</span><span>Plain text</span></div><div className="source-body"><div className="line-numbers" aria-hidden="true">{active.content.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div><textarea aria-label="Markdown editor" spellCheck={false} value={active.content} placeholder="Every idea starts with a word…" style={{ fontSize }} onChange={e => { const content = e.target.value; setTabs(prev => prev.map(t => t.id === active.id ? { ...t, content, isDirty: true } : t)); }}/></div></section><section className="preview-panel"><div className="panel-label"><span><Icon name="eye" size={14}/> PREVIEW</span><span className="live"><i/> Live preview</span></div><div className="preview-scroll"><article className="markdown-preview" style={{ fontSize }}><ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content || '*Your words will come to life here.*'}</ReactMarkdown></article></div></section></div> : <div className="empty-state"><Icon name="file" size={40}/><h2>A fresh start awaits</h2><p>Create a document or upload your Markdown files.</p><button className="button primary" onClick={create}><Icon name="plus"/> New document</button></div>}
          <div className="editor-status"><span><span className="status-dot"/> {saveFailed ? 'Browser storage unavailable or full. Download your documents to keep them.' : active ? 'Saved in this browser · available next visit' : 'Ready when you are'}</span><div><span>{words} words</span><span>{active?.content.length || 0} characters</span><span>Markdown</span><span>UTF-8</span></div></div>
        </div>
        <div className="workspace-footnote"><span>Less friction. More flow.</span><span>Made for the way you think. <span className="tiny-spark">✧</span></span></div>
      </main>
    </div>
    <footer className="footer"><span>© {new Date().getFullYear()} <a href="https://linktr.ee/atmenterprise" target="_blank" rel="noreferrer">ATM Enterprise</a></span><span>Made with care. Open for everyone. <span>↗</span></span></footer>
    {notice && <div className="toast" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
    {dragging && <div className="drop-overlay"><div><Icon name="upload" size={42}/><h2>Make room for your ideas.</h2><p>Drop your Markdown files to open them together.</p><small>.md, .markdown, .txt · up to 2 MB per file</small></div></div>}
  </div>;
}
