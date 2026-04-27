"use client";

import { type RefObject } from "react";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react";

interface MarkdownToolbarProps {
  /** Ref to the textarea this toolbar formats. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Current textarea value (controlled). */
  value: string;
  /** Setter for the textarea value (controlled). */
  onChange: (next: string) => void;
}

interface FormatAction {
  label: string;
  icon: typeof Bold;
  /**
   * Apply markdown formatting to the current selection. Receives the
   * full text plus the current selection range and returns the new text
   * + new selection range.
   */
  apply: (text: string, start: number, end: number) => {
    text: string;
    selectionStart: number;
    selectionEnd: number;
  };
}

/** Wraps the selection in `marker` on both sides. If the selection is
 *  empty, inserts the marker pair at the cursor and places the caret
 *  in between. */
function wrapSelection(marker: string) {
  return (text: string, start: number, end: number) => {
    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);
    const next = `${before}${marker}${selected}${marker}${after}`;
    return {
      text: next,
      selectionStart: start + marker.length,
      selectionEnd: end + marker.length,
    };
  };
}

/** Prefixes each line of the selection with `prefix`. Empty selection
 *  inserts a single line at the cursor. */
function prefixLines(prefix: (lineIndex: number) => string) {
  return (text: string, start: number, end: number) => {
    // Expand the selection out to whole lines so we don't split a line
    // in the middle when applying a list prefix.
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = (() => {
      const next = text.indexOf("\n", end);
      return next === -1 ? text.length : next;
    })();
    const block = text.slice(lineStart, lineEnd) || prefix(0).trim();
    const lines = block.split("\n");
    const prefixed = lines.map((line, i) => `${prefix(i)}${line}`).join("\n");
    const next = `${text.slice(0, lineStart)}${prefixed}${text.slice(lineEnd)}`;
    return {
      text: next,
      selectionStart: lineStart,
      selectionEnd: lineStart + prefixed.length,
    };
  };
}

/** Inserts a `[selection](url)` link snippet. Empty selection inserts
 *  a `[نص](رابط)` placeholder and selects the URL part for quick
 *  typing. */
function insertLink(text: string, start: number, end: number) {
  const selected = text.slice(start, end) || "نص";
  const url = "رابط";
  const snippet = `[${selected}](${url})`;
  const next = `${text.slice(0, start)}${snippet}${text.slice(end)}`;
  // Place the caret on the URL placeholder so the user can type it.
  const urlStart = start + selected.length + 3;
  return {
    text: next,
    selectionStart: urlStart,
    selectionEnd: urlStart + url.length,
  };
}

const ACTIONS: FormatAction[] = [
  { label: "جريء", icon: Bold, apply: wrapSelection("**") },
  { label: "مائل", icon: Italic, apply: wrapSelection("*") },
  { label: "قائمة نقطية", icon: List, apply: prefixLines(() => "- ") },
  { label: "قائمة مرقّمة", icon: ListOrdered, apply: prefixLines((i) => `${i + 1}. `) },
  { label: "رابط", icon: LinkIcon, apply: insertLink },
];

/**
 * Compact toolbar that adds bold / italic / list / link buttons above a
 * markdown textarea. Operates on the textarea's current selection so
 * supervisors can format snippets without learning the markdown syntax.
 *
 * Stateless — owns no React state, just calls `onChange` with the
 * transformed text and re-focuses the textarea so the user can keep
 * typing without an extra click.
 */
export default function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  const handle = (action: FormatAction) => () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const result = action.apply(value, start, end);
    onChange(result.text);
    // Re-focus + restore the selection on the next paint, after React
    // has flushed the new value to the DOM.
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  return (
    <div
      className="flex items-center gap-1 mb-1"
      role="toolbar"
      aria-label="تنسيق Markdown"
    >
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={handle(action)}
          className="w-7 h-7 nb-border rounded-md flex items-center justify-center bg-card hover:bg-muted text-foreground"
          title={action.label}
          aria-label={action.label}
        >
          <action.icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
