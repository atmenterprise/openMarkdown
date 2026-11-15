/** Read persistent settings, falling back to documents from an older session. */
export function readStored(key: string): string | null {
  try {
    const persisted = localStorage.getItem(key);
    if (persisted !== null) return persisted;
  } catch { /* Storage may be blocked by browser settings. */ }
  try { return sessionStorage.getItem(key); } catch { return null; }
}

/** Remove legacy values only after a successful persistent write. */
export function writeStored(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
  } catch { return false; }
  try { sessionStorage.removeItem(key); } catch { /* Migration cleanup is optional. */ }
  return true;
}
