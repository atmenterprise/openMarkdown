function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/[\t\n ]+/g, ' ');
  if (!(node instanceof HTMLElement)) return '';
  if (node instanceof HTMLImageElement) return node.alt || '[Image]';
  if (node instanceof HTMLInputElement && node.type === 'checkbox') return node.checked ? '[x]' : '[ ]';
  if (node.tagName === 'BR') return '\n';
  if (node.hasAttribute('data-footnote-backref')) return '';
  const text = Array.from(node.childNodes, inline).join('');
  if (node.hasAttribute('data-footnote-ref')) return '[' + text + ']';
  const href = node instanceof HTMLAnchorElement ? node.getAttribute('href') : null;
  return href && !href.startsWith('#') && text !== href ? `${text} (${href})` : text;
}

function tableText(table: HTMLTableElement) {
  const rows = Array.from(table.rows, row => Array.from(row.cells, cell => inline(cell).trim()));
  const widths = rows[0]?.map((_, column) => rows.reduce((width, row) => Math.max(width, row[column]?.length ?? 0), 3)) ?? [];
  const render = (row: string[]) => row.map((cell, column) => {
    const padding = widths[column] - cell.length;
    const alignment = table.rows[0].cells[column].style.textAlign;
    if (alignment === 'right') return cell.padStart(widths[column]);
    if (alignment === 'center') return ' '.repeat(Math.floor(padding / 2)) + cell + ' '.repeat(Math.ceil(padding / 2));
    return cell.padEnd(widths[column]);
  }).join(' | ').trimEnd();
  return rows.flatMap((row, index) => index === 0
    ? [render(row), widths.map(width => '-'.repeat(width)).join('-+-')]
    : [render(row)]).join('\n');
}

function block(node: Element): string {
  if (node.matches('h1, h2')) {
    const heading = inline(node).trim();
    return heading + '\n' + (node.matches('h1') ? '=' : '-').repeat(Math.max(3, heading.length));
  }
  if (node.matches('hr')) return '────────────────────';
  if (node.matches('pre')) return (node.textContent ?? '').replace(/\n$/, '').split('\n').map(line => '    ' + line).join('\n');
  if (node instanceof HTMLTableElement) return tableText(node);
  if (node.matches('blockquote')) return blocks(node).split('\n').map(line => line ? `> ${line}` : '>').join('\n');
  if (node.matches('section')) return blocks(node);
  if (node.matches('ol, ul')) {
    const start = node instanceof HTMLOListElement ? node.start : 1;
    return Array.from(node.children, (item, index) => {
      const marker = node.matches('ol') ? `${start + index}. ` : '• ';
      const parts = Array.from(item.childNodes, child =>
        child instanceof Element && child.matches('p, ul, ol, blockquote, pre, table, hr') ? `\n${block(child)}\n` : inline(child));
      const lines = parts.join('').trim().split('\n');
      return marker + lines.map((line, i) => i && line ? ' '.repeat(marker.length) + line : line).join('\n');
    }).join('\n');
  }
  return inline(node).trim();
}

function blocks(container: Element) {
  return Array.from(container.children, block).filter(Boolean).join('\n\n');
}

export function exportText(content: HTMLElement) {
  const text = blocks(content);
  return text ? text + '\n' : '';
}
