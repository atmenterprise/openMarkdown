import {
  AlignmentType, Bookmark, BorderStyle, CheckBox, Document, ExternalHyperlink, HeadingLevel, ImageRun,
  InternalHyperlink, LevelFormat, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';
import type { IParagraphOptions, IRunOptions, NumberingDefinition, ParagraphChild } from 'docx';
import type { ExportImage } from './exportImages';

const headings = [
  HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6,
];
const softBorder = { style: BorderStyle.SINGLE, color: 'E4E4E7', size: 4 };
const blockSelector = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, hr, section';

export function exportWord(content: HTMLElement, images: Map<HTMLImageElement, ExportImage>, fontSize: number) {
  const numbering: NumberingDefinition[] = [];
  const bookmarks = new Map(Array.from(content.querySelectorAll('[id]'), (node, index) => [node.id, `Markdown_${index + 1}`]));

  function inline(node: Node, style: IRunOptions = {}): ParagraphChild[] {
    if (node.nodeType === Node.TEXT_NODE) {
      return [new TextRun({ ...style, text: (node.textContent ?? '').replace(/[\t\n ]+/g, ' ') })];
    }
    if (!(node instanceof HTMLElement)) return [];
    if (node.tagName === 'BR') return [new TextRun({ ...style, break: 1 })];
    if (node instanceof HTMLInputElement && node.type === 'checkbox') return [new CheckBox({ checked: node.checked })];
    if (node instanceof HTMLImageElement) {
      const image = images.get(node);
      if (!image) return [];
      const scale = Math.min(1, (node.closest('td, th') ? 96 : 480) / image.width, 540 / image.height);
      return [new ImageRun({
        type: 'png', data: image.data, altText: { name: node.alt || 'Image', description: node.alt },
        transformation: { width: Math.max(1, Math.round(image.width * scale)), height: Math.max(1, Math.round(image.height * scale)) },
      })];
    }

    const href = node instanceof HTMLAnchorElement ? node.getAttribute('href') : null;
    const code = node.matches('code');
    const runStyle: IRunOptions = {
      ...style,
      bold: style.bold || node.matches('strong, b'),
      italics: style.italics || node.matches('em, i'),
      strike: style.strike || node.matches('del, s'),
      superScript: style.superScript || node.matches('sup'),
      font: code ? 'Courier New' : style.font,
      shading: code ? { fill: 'F4F4F5' } : style.shading,
      style: href ? 'Hyperlink' : style.style,
    };
    const children = Array.from(node.childNodes).flatMap(child => inline(child, runStyle));
    const target = href?.startsWith('#') ? bookmarks.get(href.slice(1)) : null;
    const linked = target ? [new InternalHyperlink({ anchor: target, children })]
      : href && !href.startsWith('#') && node instanceof HTMLAnchorElement ? [new ExternalHyperlink({ link: node.href, children })]
      : children;
    const id = bookmarks.get(node.id);
    return id ? [new Bookmark({ id, children: linked })] : linked;
  }

  function blocks(container: Element, depth = 0, quote = false, first: IParagraphOptions = {}): (Paragraph | Table)[] {
    const paragraphs: (Paragraph | Table)[] = [];
    const indent = depth ? { left: depth * 360 } : undefined;
    const quoteStyle = quote ? {
      border: { left: { style: BorderStyle.SINGLE, color: 'D9AA26', size: 12, space: 8 } },
      shading: { fill: 'FFFBEB' },
    } : {};
    const run = quote ? { italics: true, color: '796018' } : {};
    let pending = first;
    let bookmark = bookmarks.get(container.id);
    let inlines: ParagraphChild[] = [];
    function paragraph(options: IParagraphOptions) {
      const anchor = bookmark ? [new Bookmark({ id: bookmark, children: [] })] : [];
      paragraphs.push(new Paragraph({ indent, ...quoteStyle, ...options, ...pending, children: [...anchor, ...(options.children ?? [])] }));
      bookmark = undefined;
      pending = {};
    }
    function flush() {
      if (inlines.length) paragraph({ children: inlines });
      inlines = [];
    }

    for (const node of container.childNodes) {
      if (!(node instanceof HTMLElement) || !node.matches(blockSelector)) {
        if (inlines.length || node.nodeType !== Node.TEXT_NODE || node.textContent?.trim()) inlines.push(...inline(node, run));
        continue;
      }
      flush();

      if (node instanceof HTMLTableElement) {
        if (pending.numbering || bookmark) paragraph({});
        paragraphs.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: softBorder, bottom: softBorder, insideHorizontal: softBorder },
          rows: Array.from(node.rows, row => new TableRow({
            tableHeader: row.parentElement === node.tHead,
            children: Array.from(row.cells, cell => {
              const alignment = cell.style.textAlign === 'right' ? AlignmentType.RIGHT
                : cell.style.textAlign === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT;
              const header = cell.tagName === 'TH';
              return new TableCell({
                margins: { top: 85, bottom: 85, left: 110, right: 110 },
                shading: header ? { fill: 'F4F4F5' } : undefined,
                children: [new Paragraph({ alignment, children: inline(cell, { ...run, bold: header }) })],
              });
            }),
          })),
        }));
      } else if (node.matches('ul, ol')) {
        if (pending.numbering || bookmark) paragraph({});
        const ordered = node instanceof HTMLOListElement;
        const reference = `list-${numbering.length + 1}`;
        numbering.push({ reference, levels: [{
          level: 0,
          format: ordered ? LevelFormat.DECIMAL : LevelFormat.BULLET,
          text: ordered ? '%1.' : '•',
          start: ordered ? node.start : 1,
          style: { paragraph: { indent: { left: (depth + 1) * 360, hanging: 280 } } },
        }] });
        for (const item of node.children) {
          const task = !ordered && item.classList.contains('task-list-item');
          const children = blocks(item, depth + 1, quote, task ? {} : {
            numbering: { reference, level: 0 },
            indent: { left: (depth + 1) * 360, hanging: 280 },
          });
          paragraphs.push(...children);
        }
      } else if (node.matches('blockquote, section')) {
        if (pending.numbering || bookmark) paragraph({});
        const nestedQuote = node.matches('blockquote');
        const children = blocks(node, depth + Number(nestedQuote), quote || nestedQuote);
        paragraphs.push(...children);
      } else if (node.matches('pre')) {
        const lines = (node.textContent ?? '').replace(/\n$/, '').split('\n');
        paragraph({
          shading: { fill: 'F4F4F5' },
          children: lines.map((line, index) => new TextRun({ ...run, text: line, break: index ? 1 : 0, font: 'Courier New' })),
        });
      } else {
        const heading = /^H[1-6]$/.test(node.tagName) ? headings[Number(node.tagName[1]) - 1] : undefined;
        paragraph({ heading, thematicBreak: node.matches('hr'), children: inline(node, run) });
      }
    }
    flush();
    if (pending.numbering || bookmark) paragraph({});
    return paragraphs;
  }

  const children = blocks(content);
  return Packer.toBlob(new Document({
    numbering: { config: numbering },
    styles: { default: { document: {
      run: { size: Math.round(fontSize * 2), font: 'Calibri', color: '27272A' },
      paragraph: { spacing: { after: 160, line: 300 } },
    } } },
    sections: [{ children: children.length ? children : [new Paragraph('')] }],
  }));
}
