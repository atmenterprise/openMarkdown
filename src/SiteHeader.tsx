import InstallButton from './InstallButton';
import DesktopSetupLink from './DesktopSetupLink';

export default function SiteHeader({ editorHref, desktopSetupCurrent }: { editorHref?: string; desktopSetupCurrent?: boolean }) {
  return <header className="header">
    <a className="brand" href={editorHref ?? './'}>
      <img className="brand-mark" src="./favicon.svg?v=2" alt=""/>
      <span>open<span className="brand-light">Markdown</span><small>YOUR WORDS, BEAUTIFULLY.</small></span>
    </a>
    <div className="header-right">
      <DesktopSetupLink current={desktopSetupCurrent}/>
      <a className="support" href="https://buymeacoffee.com/atmenterpr4" target="_blank" rel="noreferrer" aria-label="Support the project">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8h13v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3ZM17 9h2a3 3 0 1 1 0 6h-2M7 3v2m4-2v2"/>
        </svg>
        Support the project <span>↗</span>
      </a>
      {editorHref ? <a href={editorHref} className="button">Open editor</a> : <InstallButton/>}
    </div>
  </header>;
}
