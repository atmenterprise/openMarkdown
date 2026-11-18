export type ExportImage = { data: string; width: number; height: number };

async function readImage(url: string): Promise<ExportImage | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const objectUrl = URL.createObjectURL(await response.blob());
    try {
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      const ratio = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return { data: canvas.toDataURL('image/png'), width: image.naturalWidth, height: image.naturalHeight };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadExportImages(content: HTMLElement) {
  const requests = new Map<string, Promise<ExportImage | null>>();
  const images = new Map<HTMLImageElement, ExportImage>();
  await Promise.all(Array.from(content.querySelectorAll<HTMLImageElement>('img[src]'), async image => {
    if (!image.getAttribute('src')) return;
    let request = requests.get(image.src);
    if (!request) {
      request = readImage(image.src);
      requests.set(image.src, request);
    }
    const rendered = await request;
    if (rendered) images.set(image, rendered);
  }));
  return images;
}
