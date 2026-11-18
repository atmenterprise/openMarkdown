import SiteHeader from './SiteHeader';

const platforms = [
  { name: 'Windows', fileManager: 'File Explorer', action: 'Right-click the Markdown file. Choose Open with, then OpenMarkdown. If needed, select Choose another app.' },
  { name: 'macOS', fileManager: 'Finder', action: 'Control-click the Markdown file. Choose Open With, then OpenMarkdown.' },
  { name: 'Linux', fileManager: 'Your file manager', action: 'Right-click the Markdown file. Choose Open With, then OpenMarkdown. Menu wording and availability vary by desktop environment.' },
];

export default function LocalFilesView() {
  return <div className="app">
    <SiteHeader editorHref="./" desktopSetupCurrent/>
    <main className="desktop-guide">
      <header className="guide-intro">
        <h1>Open Markdown files from your desktop</h1>
        <p>Open <code>.md</code> and <code>.markdown</code> files straight from your file manager. Your document is read on your device.</p>
        <a className="button primary" href="./">Open editor</a>
      </header>

      <aside className="guide-compatibility" aria-label="Desktop browser compatibility">
        <strong>Supported browsers</strong>
        <p><strong>Open with → OpenMarkdown</strong> works after you install OpenMarkdown from desktop <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>. In Safari, use drag-and-drop or <strong>Upload files</strong>.</p>
      </aside>

      <section className="guide-step" aria-labelledby="desktop-install">
        <div className="guide-step-copy">
          <h2 id="desktop-install"><span aria-hidden="true">1</span> Install OpenMarkdown</h2>
          <p>Open the editor in desktop Chrome or Microsoft Edge. Select <strong>Install app</strong> in the site header or use the install icon in the address bar. Confirm the browser prompt.</p>
          <ul className="guide-browser-options">
            <li><strong>Chrome</strong> · Menu → Cast, save, and share → Install page as app</li>
            <li><strong>Edge</strong> · Menu → More tools → Apps → Install app</li>
          </ul>
        </div>
        <figure className="guide-figure">
          <img src="./desktop-install.png" width="670" height="128" alt="OpenMarkdown’s header with the Install app button focused."/>
          <figcaption>The <strong>Install app</strong> button in the editor header.</figcaption>
        </figure>
      </section>

      <section className="guide-step guide-platforms" aria-labelledby="desktop-open">
        <div className="guide-step-copy">
          <h2 id="desktop-open"><span aria-hidden="true">2</span> Open a file</h2>
          <p>Find your Markdown file and choose OpenMarkdown from its <strong>Open with</strong> menu. Allow file access if your browser asks.</p>
        </div>
        <div className="guide-platform-grid">
          {platforms.map(({ name, fileManager, action }) => <section key={name} className="guide-platform">
            <h3>{name}</h3>
            <strong>{fileManager}</strong>
            <p>{action}</p>
          </section>)}
        </div>
      </section>

      <section className="guide-step" aria-labelledby="desktop-preview">
        <div className="guide-step-copy">
          <h2 id="desktop-preview"><span aria-hidden="true">3</span> Read or edit</h2>
          <p>Your file opens in <strong>Preview</strong>. Choose <strong>Editor</strong> to make changes or <strong>Split</strong> to edit and preview side by side.</p>
          <p>If OpenMarkdown doesn’t appear in your file manager, drag the file into the editor or select <strong>Upload files</strong>.</p>
        </div>
        <figure className="guide-figure">
          <img src="./desktop-preview.png" width="640" height="324" alt="A local Markdown file displayed in Preview, with Editor and Split controls available." loading="lazy"/>
          <figcaption>A local Markdown file opened in <strong>Preview</strong>.</figcaption>
        </figure>
      </section>

      <section className="guide-step guide-platforms" aria-labelledby="desktop-safari">
        <div className="guide-step-copy">
          <h2 id="desktop-safari">Using Safari or another browser?</h2>
          <p>Safari users on macOS Sonoma 14 or later can use <strong>File → Add to Dock</strong> for quick access. Safari doesn’t let web apps register for the desktop <strong>Open With</strong> menu. In Safari and other browsers without this feature, drag the file into OpenMarkdown or select <strong>Upload files</strong>.</p>
        </div>
      </section>
    </main>
  </div>;
}
