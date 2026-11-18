export type Selection = { start: number; end: number };
export type Edit = Selection & { text: string; selection: Selection };

export function replaceRange(start: number, end: number, text: string, from = text.length, to = from): Edit {
  return { start, end, text, selection: { start: start + from, end: start + to } };
}

export function wrapSelection(source: string, { start, end }: Selection, marker: string, placeholder: string): Edit {
  const selected = source.slice(start, end);
  if (marker !== '`' && /\n[ \t]*\n/.test(selected)) {
    const text = selected.split(/(\n[ \t]*\n(?:[ \t]*\n)*)/).map((part, index) => {
      if (index % 2 || !part.trim()) return part;
      const edit = wrapSelection(part, { start: 0, end: part.length }, marker, placeholder);
      // Restrict each edit to this paragraph within the selected range.
      return part.slice(0, edit.start) + edit.text + part.slice(edit.end);
    }).join('');
    return replaceRange(start, end, text, 0, text.length);
  }
  if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= marker.length * 2
    && (marker !== '*' || (!selected.startsWith('**') && !selected.endsWith('**')))) {
    const text = selected.slice(marker.length, -marker.length);
    return replaceRange(start, end, text, 0, text.length);
  }

  const leading = selected.match(/^\s*/)?.[0] ?? '';
  const trailing = selected.slice(leading.length).match(/\s*$/)?.[0] ?? '';
  const inner = selected.slice(leading.length, selected.length - trailing.length);
  const from = start + leading.length;
  const to = end - trailing.length;
  const left = source.slice(from - marker.length, from);
  const right = source.slice(to, to + marker.length);
  if (inner && left === marker && right === marker && (marker !== '*' || (source[from - 2] !== '*' && source[to + 1] !== '*'))) {
    return replaceRange(from - marker.length, to + marker.length, inner, 0, inner.length);
  }
  const text = inner || placeholder;
  const delimiter = marker === '`' ? '`'.repeat(Array.from(text.matchAll(/`+/g)).reduce((length, match) => Math.max(length, match[0].length + 1), 1)) : marker;
  const padding = marker === '`' && (text.startsWith('`') || text.endsWith('`')) ? ' ' : '';
  // Leave a word boundary for inserted example text when the caret is inside a paragraph.
  const prefix = !selected && start > 0 && /[\p{L}\p{N}]/u.test(source[start - 1]) ? ' ' : '';
  const opening = prefix + leading + delimiter + padding;
  return replaceRange(start, end, opening + text + padding + delimiter + trailing, opening.length, opening.length + text.length);
}

export type LineFormat = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'number' | 'task' | 'quote';

const heading = /^#{1,6}(?:[ \t]+|$)/;
const bullet = /^[-+*](?:[ \t]+|$)/;
const number = /^\d{1,9}[.)](?:[ \t]+|$)/;
const task = /^[-+*][ \t]+\[[ xX]\](?:[ \t]+|$)/;
const quote = /^>[ \t]?/;

export function formatLines(source: string, { start, end }: Selection, format: LineFormat) {
  const from = start ? source.lastIndexOf('\n', start - 1) + 1 : 0;
  const nextBreak = source.indexOf('\n', end > start && source[end - 1] === '\n' ? end - 1 : end);
  const to = nextBreak === -1 ? source.length : nextBreak;
  const parts = source.slice(from, to).split('\n').map(line => {
    const indent = line.match(/^[ \t]*/)?.[0] ?? '';
    return { indent, body: line.slice(indent.length) };
  });
  const pattern = { paragraph: heading, heading1: /^#(?:\s|$)/, heading2: /^##(?:\s|$)/, heading3: /^###(?:\s|$)/,
    bullet, number, task, quote }[format];
  const toggleOff = ['bullet', 'number', 'task', 'quote'].includes(format)
    && parts.some(({ body }) => body) && parts.every(({ body }) => !body || (pattern.test(body) && (format !== 'bullet' || !task.test(body))));
  const numbering = new Map<string, number>();
  const lines = parts.map(({ indent, body }) => {
    if (!body && parts.length > 1) { numbering.clear(); return indent; }
    if (toggleOff) return indent + body.replace(pattern, '');
    if (format === 'quote') return indent + '> ' + body;
    if (format === 'paragraph') return indent + body.replace(heading, '');
    if (format.startsWith('heading')) return indent + '#'.repeat(Number(format.at(-1))) + ' ' + body.replace(heading, '');
    const existingTask = body.match(task)?.[0];
    const plain = body.replace(task, '').replace(bullet, '').replace(number, '');
    if (format === 'task') return indent + (existingTask ?? '- [ ] ') + plain;
    if (format === 'bullet') return indent + '- ' + plain;
    const next = (numbering.get(indent) ?? 0) + 1;
    numbering.set(indent, next);
    return indent + next + '. ' + plain;
  });

  const text = lines.join('\n');
  if (start !== end) return replaceRange(from, to, text, 0, text.length);
  const caret = Math.max(0, Math.min(text.length, start - from + text.length - (to - from)));
  return replaceRange(from, to, text, caret);
}

export function insertBlock(source: string, { start, end }: Selection, text: string, selectionStart: number, selectionEnd: number) {
  const before = source.slice(0, start);
  const after = source.slice(end);
  const prefix = !before || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const suffix = after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  return replaceRange(start, end, prefix + text + suffix, prefix.length + selectionStart, prefix.length + selectionEnd);
}
