import { useEffect, useState } from 'react';

type InstallPrompt = Event & { prompt: () => Promise<unknown> };

export default function InstallButton() {
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const showInstall = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const hideInstall = () => setInstall(null);
    window.addEventListener('beforeinstallprompt', showInstall);
    window.addEventListener('appinstalled', hideInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', showInstall);
      window.removeEventListener('appinstalled', hideInstall);
    };
  }, []);

  if (!install) return null;
  return <button type="button" className="button" aria-label="Install OpenMarkdown" onClick={() => {
    setInstall(null);
    void install.prompt().catch(() => {});
  }}>Install app</button>;
}
