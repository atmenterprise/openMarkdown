import pdfMake from 'pdfmake/build/pdfmake';
import fonts from 'pdfmake/build/vfs_fonts';
import courier from 'pdfmake/build/standard-fonts/Courier';
import htmlToPdfmake from 'html-to-pdfmake';

const pageMargin = 48;
const contentWidth = 595.28 - pageMargin * 2;
const asciiCode = /^[\t\r\n -~]*$/;

pdfMake.addVirtualFileSystem(fonts);
pdfMake.addFontContainer(courier);

export function exportPdf(content: HTMLElement, fontSize: number) {
  for (const code of content.querySelectorAll('code')) {
    // Courier covers ASCII. Roboto keeps the extended characters supported by the main text font.
    if (asciiCode.test(code.textContent ?? '')) code.style.fontFamily = 'Courier';
  }
  for (const pre of content.querySelectorAll('pre')) {
    pre.style.whiteSpace = 'pre';
    pre.textContent = (pre.textContent ?? '').replace(/\n$/, '');
    if (asciiCode.test(pre.textContent)) pre.style.fontFamily = 'Courier';
  }
  for (const checkbox of content.querySelectorAll<HTMLInputElement>('input[type=checkbox]')) {
    const item = checkbox.closest('li');
    if (item && item.parentElement?.matches('ul')) item.dataset.pdfmake = '{"listType":"none"}';
    checkbox.replaceWith(document.createTextNode(checkbox.checked ? '[x]' : '[ ]'));
  }
  for (const hr of content.querySelectorAll('hr')) {
    const depth = Array.from(content.querySelectorAll('li, blockquote')).filter(parent => parent.contains(hr)).length;
    hr.dataset.pdfmake = JSON.stringify({ width: Math.max(0, contentWidth - depth * 24), color: '#d4d4d8' });
  }
  for (const table of content.querySelectorAll('table')) {
    const columns = table.rows[0]?.cells.length ?? 0;
    if (columns) table.dataset.pdfmake = JSON.stringify({
      widths: Array.from({ length: columns }, () => '*'),
      headerRows: table.tHead?.rows.length ?? 0,
      layout: 'lightHorizontalLines',
    });
  }

  return pdfMake.createPdf({
    pageSize: 'A4',
    pageMargins: pageMargin,
    defaultStyle: { fontSize, lineHeight: 1.25, color: '#27272a' },
    content: htmlToPdfmake(content.innerHTML, {
      defaultStyles: {
        h1: { fontSize: fontSize * 1.9, margin: [0, 5, 0, 14] },
        h2: { fontSize: fontSize * 1.4, margin: [0, 14, 0, 8] },
        h3: { fontSize: fontSize * 1.2, margin: [0, 12, 0, 7] },
        h4: { fontSize, margin: [0, 10, 0, 6] },
        h5: { fontSize, margin: [0, 10, 0, 6] },
        h6: { fontSize, margin: [0, 10, 0, 6] },
        p: { margin: [0, 0, 0, 10] },
        pre: { background: '#f4f4f5', fontSize: fontSize * 0.9, margin: [0, 4, 0, 12] },
        code: { background: '#f4f4f5', fontSize: fontSize * 0.9 },
        blockquote: { italics: true, color: '#796018', margin: [14, 8, 0, 8] },
        a: { color: '#796018' },
        ul: { margin: [6, 2, 0, 8] },
        ol: { margin: [6, 2, 0, 8] },
        table: { margin: [0, 4, 0, 12] },
      },
    }),
  }).getBlob();
}
