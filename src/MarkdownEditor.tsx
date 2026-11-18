import { defaultUrlTransform } from 'react-markdown';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { formatLines, insertBlock, replaceRange, wrapSelection } from './markdownEditing';
import type { Edit, LineFormat, Selection } from './markdownEditing';

type Props = { value: string; fontSize: number; onChange: (value: string) => void };
type LinkKind = 'link' | 'image';

const inlineOptions = [
  { name: 'Bold', label: 'B', marker: '**', placeholder: 'bold text', shortcut: 'b' },
  { name: 'Italic', label: 'I', marker: '*', placeholder: 'italic text', shortcut: 'i' },
  { name: 'Strikethrough', label: 'S', marker: '~~', placeholder: 'text to cross out' },
  { name: 'Inline code', label: '< >', marker: '`', placeholder: 'code' },
];
const lineOptions = [
  { name: 'Bulleted list', label: '• List', format: 'bullet' },
  { name: 'Numbered list', label: '1. List', format: 'number' },
  { name: 'Checklist', label: '☑ Checklist', format: 'task' },
  { name: 'Quote', label: '❝ Quote', format: 'quote' },
] satisfies { name: string; label: string; format: LineFormat }[];

export default function MarkdownEditor({ value, fontSize, onChange }: Props) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const pending = useRef<Selection | null>(null);
  const formId = useId();
  const [insert, setInsert] = useState<{ kind: LinkKind; range: Selection } | null>(null);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [addressError, setAddressError] = useState('');

  const selection = (): Selection => {
    const field = textarea.current!;
    return { start: field.selectionStart, end: field.selectionEnd };
  };

  useLayoutEffect(() => {
    if (pending.current && textarea.current) {
      textarea.current.setSelectionRange(pending.current.start, pending.current.end);
      pending.current = null;
    }
  }, [value]);

  function apply(edit: Edit) {
    const field = textarea.current!;
    const scroll = { top: field.scrollTop, left: field.scrollLeft };
    const next = value.slice(0, edit.start) + edit.text + value.slice(edit.end);
    field.focus();
    if (next !== value) {
      field.setSelectionRange(edit.start, edit.end);
      // Use the browser's editing transaction so toolbar changes can be undone with typing.
      const inserted = document.execCommand('insertText', false, edit.text);
      if (!inserted || field.value !== next) pending.current = edit.selection;
      onChange(next);
    }
    field.setSelectionRange(edit.selection.start, edit.selection.end);
    field.scrollTop = scroll.top;
    field.scrollLeft = scroll.left;
  }

  function openInsert(kind: LinkKind) {
    const range = selection();
    const text = value.slice(range.start, range.end).trim();
    setLabel(text);
    setUrl('');
    setAddressError('');
    setInsert({ kind, range });
  }

  function closeInsert() {
    setInsert(null);
    textarea.current?.focus();
  }

  function addBlock(kind: 'code' | 'table') {
    const range = selection();
    const lineEnd = value.indexOf('\n', range.end);
    const position = lineEnd === -1 ? value.length : lineEnd;
    const lineStart = range.start === 0 ? 0 : value.lastIndexOf('\n', range.start - 1) + 1;
    const onEmptyLine = range.start === range.end && !value.slice(lineStart, position).trim();
    const insertion = onEmptyLine ? range : { start: position, end: position };
    if (kind === 'table') {
      const table = '| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
      apply(insertBlock(value, insertion, table, 2, 10));
      return;
    }
    const code = value.slice(range.start, range.end) || 'Type code here';
    const fence = '`'.repeat(Array.from(code.matchAll(/^`+/gm)).reduce((length, match) => Math.max(length, match[0].length + 1), 3));
    const first = fence.length + 1;
    apply(insertBlock(value, range.start === range.end ? insertion : range, fence + '\n' + code + '\n' + fence, first, first + code.length));
  }

  return <>
    <div className="format-toolbar" role="group" aria-label="Text formatting">
      <select aria-label="Paragraph style" value="" onChange={event => apply(formatLines(value, selection(), event.target.value as LineFormat))}>
        <option value="" disabled>Text style</option>
        <option value="paragraph">Normal text</option>
        <option value="heading1">Heading 1</option>
        <option value="heading2">Heading 2</option>
        <option value="heading3">Heading 3</option>
      </select>
      <div className="format-group">
        {inlineOptions.map(({ name, label, marker, placeholder }) => <button key={name} type="button" aria-label={name} title={name} data-format={name} onClick={() => apply(wrapSelection(value, selection(), marker, placeholder))}>{label}</button>)}
      </div>
      <div className="format-group">
        {lineOptions.map(({ name, label, format }) => <button key={format} type="button" aria-label={name} title={name} onClick={() => apply(formatLines(value, selection(), format))}>{label}</button>)}
      </div>
      <div className="format-group">
        <button type="button" onClick={() => openInsert('link')} aria-expanded={insert?.kind === 'link'} aria-controls={insert?.kind === 'link' ? formId : undefined}>Link</button>
        <button type="button" onClick={() => openInsert('image')} aria-expanded={insert?.kind === 'image'} aria-controls={insert?.kind === 'image' ? formId : undefined}>Image</button>
        <button type="button" onClick={() => addBlock('code')}>Code block</button>
        <button type="button" onClick={() => addBlock('table')}>Table</button>
      </div>
    </div>
    {insert && <form id={formId} className="format-insert" aria-label={insert.kind === 'link' ? 'Insert link' : 'Insert image'} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); closeInsert(); }
    }} onSubmit={event => {
      event.preventDefault();
      const entered = url.trim();
      if (!entered) return;
      const address = /^(?:[\w-]+\.)+[a-z]{2,}(?=[:/?#]|$)/i.test(entered) ? 'https://' + entered : entered;
      const title = (label.trim() || (insert.kind === 'image' ? 'Image' : address)).replace(/[\\[\]]/g, '\\$&').replace(/\r?\n/g, ' ');
      const target = address.replace(/[\s<>\\]/g, character => encodeURIComponent(character));
      if (!defaultUrlTransform(target)) {
        setAddressError('Enter a web address or a relative path.');
        return;
      }
      const syntax = (insert.kind === 'image' ? '![' : '[') + title + '](<' + target + '>)';
      setInsert(null);
      apply(replaceRange(insert.range.start, insert.range.end, syntax));
    }}>
      <label>{insert.kind === 'link' ? 'Link text' : 'Image description'}<input value={label} onChange={event => setLabel(event.target.value)} /></label>
      <label>{insert.kind === 'link' ? 'Link address' : 'Image address'}<input autoFocus required value={url} aria-invalid={Boolean(addressError)} aria-describedby={addressError ? formId + '-error' : undefined}
        onChange={event => { setUrl(event.target.value); setAddressError(''); }} placeholder="https://example.com" /></label>
      <button className="button primary" type="submit">Insert</button>
      <button className="button" type="button" onClick={closeInsert}>Cancel</button>
      {addressError && <span id={formId + '-error'} className="format-error" role="alert">{addressError}</span>}
    </form>}
    <div className="source-body">
      <div className="line-numbers" aria-hidden="true">{value.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div>
      <textarea ref={textarea} aria-label="Markdown editor" spellCheck={false} value={value} placeholder="Write here, then use the toolbar to format your text." style={{ fontSize }}
        onChange={event => {
          if (insert) setInsert(null);
          onChange(event.target.value);
        }}
        onKeyDown={event => {
          if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
          const option = inlineOptions.find(item => item.shortcut === event.key.toLowerCase());
          if (option) {
            event.preventDefault();
            apply(wrapSelection(value, selection(), option.marker, option.placeholder));
          }
        }}/>
    </div>
  </>;
}
