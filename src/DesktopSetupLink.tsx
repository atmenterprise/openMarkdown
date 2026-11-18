import { desktopSetupLabel, localFilesHash } from './siteRoutes';

export default function DesktopSetupLink({ current }: { current?: boolean }) {
  return <a className="desktop-setup-link" href={'./' + localFilesHash} aria-current={current ? 'page' : undefined}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2"/>
      <path d="M12 16v4m-4 0h8"/>
    </svg>
    {desktopSetupLabel}
  </a>;
}
