import previewStyles from './markdownPreview.css?raw';
import { loadExportImages } from './exportImages';
import { exportText } from './exportText';

export const exportFormats = {
  md: 'Markdown (.md)',
  txt: 'Plain text (.txt)',
  pdf: 'PDF (.pdf)',
  docx: 'Word (.docx)',
  html: 'HTML (.html)',
};

export type ExportFormat = keyof typeof exportFormats;

export function exportFilename(name: string, format: ExportFormat) {
  const base = name.replace(/\.(md|markdown|txt)$/i, '') || 'document';
  return format === 'md' && /\.(md|markdown)$/i.test(name) ? name : `${base}.${format}`;
}

function exportHtml(content: HTMLElement, preview: HTMLElement, filename: string) {
  const title = document.createElement('title');
  title.textContent = filename;
  const theme = getComputedStyle(preview);
  const colors = ['bg', 'ink', 'muted', 'border', 'accent', 'accent-ink', 'tint', 'code']
    .map(name => `--${name}:${theme.getPropertyValue('--' + name)};`).join('');

  return new Blob([`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${title.outerHTML}
<style>
:root {${colors}color-scheme:${theme.colorScheme}}
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 2rem 1rem; background: var(--bg); font-family: ${theme.fontFamily}; }
${previewStyles}
.markdown-preview img { height: auto; }
@media print {
  :root { --bg:#fff; --ink:#18181b; --muted:#52525b; --border:#e4e4e7; --accent:#ffde59; --accent-ink:#796018; --tint:#fffbeb; --code:#f4f4f5; color-scheme: light; }
  body { padding: 0; }
  .markdown-preview { max-width: none; }
  .markdown-preview pre { white-space: pre-wrap; }
}
</style>
</head>
<body>${content.outerHTML}</body>
</html>`], { type: 'text/html;charset=utf-8' });
}

export async function exportDocument(format: ExportFormat, source: string, preview: HTMLElement, filename: string) {
  if (format === 'md') return new Blob([source], { type: 'text/markdown;charset=utf-8' });

  const content = preview.cloneNode(true) as HTMLElement;
  if (!source.trim()) content.replaceChildren();
  for (const checkbox of content.querySelectorAll<HTMLInputElement>('input[type=checkbox]')) {
    checkbox.toggleAttribute('checked', checkbox.checked);
  }
  if (format === 'txt') return new Blob([exportText(content)], { type: 'text/plain;charset=utf-8' });

  const fontSize = (parseFloat(preview.style.fontSize) || 14) * 0.75;
  const images = await loadExportImages(content);

  if (format === 'html') {
    for (const [image, rendered] of images) image.src = rendered.data;
    return exportHtml(content, preview, filename);
  }

  for (const image of content.querySelectorAll('img')) {
    const rendered = images.get(image);
    if (!rendered) {
      image.replaceWith(document.createTextNode(image.alt ? `[${image.alt}]` : '[Image]'));
    } else if (format === 'pdf') {
      image.src = rendered.data;
      image.dataset.pdfmake = JSON.stringify({ fit: [Math.min(rendered.width * 0.75, image.closest('td, th') ? 72 : 360), 420] });
    }
  }
  if (format === 'docx') {
    const { exportWord } = await import('./exportWord');
    return exportWord(content, images, fontSize);
  }

  const { exportPdf } = await import('./exportPdf');
  return exportPdf(content, fontSize);
}
