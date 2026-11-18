export type SharedDocument = { name: string; content: string };

const prefix = '#share=v1.';
const maxLinkLength = 24_000;
const maxDocumentBytes = 2 * 1024 * 1024;

export function isShareLink(hash: string) {
  return hash.startsWith('#share=');
}

export async function createShareLink(document: SharedDocument, pageUrl: string) {
  const bytes = new TextEncoder().encode(JSON.stringify(document));
  if (bytes.length > maxDocumentBytes) throw new RangeError('Document exceeds the share limit.');
  const compressed = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  const buffer = new Uint8Array(await new Response(compressed).arrayBuffer());
  if (buffer.length > maxLinkLength) throw new RangeError('Document exceeds the share limit.');
  const payload = btoa(String.fromCharCode(...buffer)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const url = new URL(pageUrl);
  url.search = '';
  url.hash = prefix + payload;
  if (url.href.length > maxLinkLength) throw new RangeError('Document exceeds the share limit.');
  return url.href;
}

export async function readShareLink(hash: string): Promise<SharedDocument> {
  if (!hash.startsWith(prefix) || hash.length > maxLinkLength) throw new Error('Invalid share link.');
  const payload = hash.slice(prefix.length);
  if (!/^[\w-]+$/.test(payload)) throw new Error('Invalid share link.');
  const bytes = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let json = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxDocumentBytes) throw new Error('Invalid share link.');
      json += decoder.decode(value, { stream: true });
    }
    const parsed = JSON.parse(json + decoder.decode());
    if (typeof parsed?.name !== 'string' || !parsed.name.trim() || typeof parsed.content !== 'string') {
      throw new Error('Invalid share link.');
    }
    return { name: parsed.name, content: parsed.content };
  } finally {
    await reader.cancel().catch(() => {});
  }
}
