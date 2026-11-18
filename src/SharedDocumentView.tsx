import SiteHeader from './SiteHeader';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readShareLink } from './shareLink';
import type { SharedDocument } from './shareLink';

export default function SharedDocumentView({ hash }: { hash: string }) {
  const [shared, setShared] = useState<SharedDocument | null>(null);
  const [invalid, setInvalid] = useState(false);
  const editorUrl = window.location.pathname + window.location.search;

  useEffect(() => {
    let active = true;
    void readShareLink(hash).then(document => {
      if (active) setShared(document);
    }, () => {
      if (active) setInvalid(true);
    });
    return () => { active = false; };
  }, [hash]);

  return <div className="app">
    <SiteHeader editorHref={editorUrl}/>
    <main className="shared-document">
      <div className="shared-document-heading">
        <h1>{shared?.name ?? 'Shared document'}</h1>
        {shared && <span>Read-only</span>}
      </div>
      {shared && <p className="shared-document-warning">This is a public website. Only forward this link if the document contains no confidential information.</p>}
      {shared ? <article className="markdown-preview" onClick={event => {
        const href = event.target instanceof Element ? event.target.closest('a')?.getAttribute('href') : null;
        if (!href?.startsWith('#')) return;
        event.preventDefault();
        const id = href.slice(1);
        const target = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[id]')).find(node => node.id === id || encodeURIComponent(node.id) === id);
        if (target) {
          target.tabIndex = -1;
          target.focus({ preventScroll: true });
          target.scrollIntoView();
        }
      }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{shared.content}</ReactMarkdown>
      </article> : <p role="status">{invalid ? 'This share link is invalid or incomplete. Ask the sender for a new link.' : 'Opening shared document…'}</p>}
    </main>
  </div>;
}
