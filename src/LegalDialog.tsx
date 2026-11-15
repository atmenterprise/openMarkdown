import { useEffect, useRef } from 'react';

export type LegalSection = 'privacy' | 'disclaimer';

export default function LegalDialog({ section, onClose }: { section: LegalSection | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!section || !element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [section]);

  return <dialog ref={dialog} className="legal-dialog" aria-labelledby="legal-title" onCancel={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <div className="legal-dialog-header">
      <div><span className="legal-eyebrow">OPENMARKDOWN</span><h2 id="legal-title">{section === 'privacy' ? 'Privacy' : 'Disclaimer'}</h2></div>
      <button type="button" className="legal-close" aria-label="Close window" onClick={onClose}>×</button>
    </div>
    <div className="legal-dialog-content">
      {section === 'privacy' ? <>
        <p>openMarkdown is a public Markdown editor provided by ATM Enterprise. Here is how this app handles your documents.</p>
        <h3>Your documents stay in your browser</h3>
        <p>Files selected through the upload button or drag and drop are read locally. This app does not send your document contents to an application server.</p>
        <h3>Storage between visits</h3>
        <p>Open documents, filenames, edits, the selected document, and display preferences are stored in this browser’s local storage so you can return to them later. Older session storage may be read to preserve documents from a previous version.</p>
        <p>Close a document using its × button to remove it from the saved document list. To remove all stored app data, clear this website’s site data in your browser settings. Downloaded copies remain on your device until you delete them separately.</p>
        <h3>Shared devices and storage limits</h3>
        <p>Anyone using the same browser profile may be able to reopen saved documents. Browser storage is not a secure vault or a backup. Private browsing, clearing site data, browser cleanup, or storage limits can remove or prevent saved data. Keep downloaded copies of important work.</p>
        <h3>External services and content</h3>
        <p>The site loads fonts from Google Fonts. Images referenced in Markdown may load from external servers, and links you open may take you to third-party websites. These requests can share your IP address and standard browser request information with those services. Their own privacy policies apply.</p>
        <p>The website’s hosting provider may process connection information, such as IP addresses and browser details, when serving the website.</p>
      </> : <>
        <p>openMarkdown is a public tool for viewing and editing Markdown. Documents are provided by the people using the tool; they are not reviewed or approved by ATM Enterprise or the developer.</p>
        <h3>Your content and permissions</h3>
        <p>Only open and use content you have permission to access, edit, and reproduce. You are responsible for checking the accuracy of your documents and respecting copyright, privacy, and other people’s rights.</p>
        <h3>Availability and backups</h3>
        <p>The tool is provided as available. Formatting, browser storage, downloads, and external content may not always work as expected. Keep independent backups and verify important information before relying on it.</p>
        <h3>Third-party content</h3>
        <p>Links and images in a document can lead to content controlled by other parties. Their inclusion does not imply endorsement by ATM Enterprise or the developer.</p>
      </>}
    </div>
    <div className="legal-dialog-footer"><button type="button" className="button primary" onClick={onClose}>Close</button></div>
  </dialog>;
}
