import { useEffect, useRef, useState } from 'react';
import { createShareLink } from './shareLink';
import type { SharedDocument } from './shareLink';

export default function ShareDialog({ document, onClose }: { document: SharedDocument; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const linkField = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    let active = true;
    void createShareLink(document, window.location.href).then(url => {
      if (active) setLink(url);
    }, error => {
      if (active) setStatus(error instanceof RangeError
        ? 'This document is too large to share as a link. Download it to share the file instead.'
        : 'Could not create the link in this browser. Download the document to share it as a file.');
    });
    return () => { active = false; element.close(); };
  }, [document]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setStatus('Link copied.');
    } catch {
      linkField.current?.focus();
      setStatus('Select and copy the link manually.');
    }
  }

  return <dialog ref={dialog} className="legal-dialog share-dialog" aria-labelledby="share-title" onCancel={onClose}>
    <div className="legal-dialog-header">
      <h2 id="share-title">Share document</h2>
      <button type="button" className="legal-close" aria-label="Close sharing" onClick={onClose}>×</button>
    </div>
    <div className="legal-dialog-content">
      <div className="share-warning">
        <strong>Do not share confidential or sensitive information.</strong>
        <p>This is a public website. Anyone with the link can view and forward this copy of your document. Shared links cannot be revoked.</p>
      </div>
      <p>The link contains a read-only snapshot of <strong>{document.name}</strong>. Later edits won’t appear in it.</p>
      {link && <label className="share-link">Share link
        <input ref={linkField} readOnly value={link} onFocus={event => event.currentTarget.select()} />
      </label>}
      {status && <p role="status">{status}</p>}
    </div>
    <div className="legal-dialog-footer">
      <button type="button" className="button" onClick={onClose}>Close</button>
      <button type="button" className="button primary" disabled={!link} onClick={() => void copyLink()}>Copy link</button>
    </div>
  </dialog>;
}
