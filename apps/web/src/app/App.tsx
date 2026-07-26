import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  FileText,
  Fullscreen,
  Highlighter,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Palette,
  Pilcrow,
  Printer,
  Quote,
  Redo2,
  RotateCcw,
  Settings2,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  Undo2,
} from "lucide-react";
import {
  defaultDocument,
  fontOptions,
  getMarginMm,
  getPaperDimensions,
  marginOptions,
  paperOptions,
  type DocumentSettings,
  type ExportFormat,
  type TextDocument,
} from "../features/document/document-model";
import { exportDocument, printDocument } from "../features/export/export-document";
import { useLastDraft } from "../features/recovery/use-last-draft";
import { getDocumentStats } from "../features/writing-tools/stats";
import { sanitizeHtml } from "../lib/security/html";

const colorPresets = ["#1f2937", "#0f766e", "#b91c1c", "#7c3aed", "#0f172a"];
const accentPresets = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

const exportOptions: Array<{ format: ExportFormat; label: string; hint: string }> = [
  { format: "pdf", label: "PDF", hint: "Print or save as PDF" },
  { format: "docx", label: "Word DOCX", hint: "Editable Word file" },
  { format: "doc", label: "Word DOC", hint: "Classic Word-compatible file" },
  { format: "png", label: "PNG", hint: "Image of the canvas" },
  { format: "txt", label: "TXT", hint: "Plain text" },
  { format: "md", label: "Markdown", hint: "Simple Markdown" },
  { format: "html", label: "HTML", hint: "Standalone HTML" },
];

type EditableField = "headerHtml" | "contentHtml" | "footerHtml";

export function App() {
  const [document, setDocument] = useState<TextDocument>(defaultDocument);
  const headerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const recovery = useLastDraft(document, setDocument);
  const stats = useMemo(() => getDocumentStats(document.contentHtml), [document.contentHtml]);
  const dimensions = getPaperDimensions(document.settings);
  const margin = getMarginMm(document.settings);

  useEffect(() => {
    syncDomFromState(headerRef, document.headerHtml);
    syncDomFromState(editorRef, document.contentHtml);
    syncDomFromState(footerRef, document.footerHtml);
  }, [document.headerHtml, document.contentHtml, document.footerHtml]);

  function updateDocument(next: Partial<TextDocument>) {
    setDocument((current) => ({
      ...current,
      ...next,
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateSettings(next: Partial<DocumentSettings>) {
    setDocument((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...next,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function syncEditable(field: EditableField, ref: React.RefObject<HTMLDivElement>) {
    if (!ref.current) {
      return;
    }

    updateDocument({ [field]: sanitizeHtml(ref.current.innerHTML) });
  }

  function syncAllEditables() {
    updateDocument({
      headerHtml: sanitizeHtml(headerRef.current?.innerHTML ?? ""),
      contentHtml: sanitizeHtml(editorRef.current?.innerHTML ?? ""),
      footerHtml: sanitizeHtml(footerRef.current?.innerHTML ?? ""),
    });
  }

  function saveSelection() {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const root = globalThis.document.getElementById("printable-document");
    if (root?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const selection = globalThis.getSelection();
    if (!selection || !savedRangeRef.current) {
      editorRef.current?.focus();
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }

  function runCommand(command: string, value?: string) {
    restoreSelection();
    documentExec("styleWithCSS", "true");
    documentExec(command, value);
    syncAllEditables();
  }

  function applyInlineStyle(style: Partial<CSSStyleDeclaration>) {
    restoreSelection();
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const span = globalThis.document.createElement("span");
    Object.assign(span.style, style);

    try {
      range.surroundContents(span);
    } catch {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }

    selection.removeAllRanges();
    syncAllEditables();
  }

  function resetDocument() {
    const shouldReset = window.confirm("Start a new document and replace the local draft?");
    if (!shouldReset) {
      return;
    }

    setDocument({
      ...defaultDocument,
      updatedAt: new Date().toISOString(),
    });
  }

  async function handleExport(format: ExportFormat) {
    await exportDocument(document, format);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"));
    if (image) {
      event.preventDefault();
      const reader = new FileReader();
      reader.onload = () => {
        runCommand("insertHTML", `<img src="${reader.result}" alt="Pasted image">`);
      };
      reader.readAsDataURL(image);
      return;
    }

    const html = event.clipboardData.getData("text/html");
    if (html) {
      event.preventDefault();
      runCommand("insertHTML", sanitizeHtml(html));
    }
  }

  function insertLink() {
    const url = window.prompt("Paste link URL");
    if (!url) {
      return;
    }
    runCommand("createLink", url);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <FileText aria-hidden="true" size={26} />
          <div>
            <input
              className="document-name-input"
              value={document.title}
              onChange={(event) => updateDocument({ title: event.target.value || "Untitled document - Text2File" })}
              aria-label="Document name"
            />
            <span>{recovery.statusText}</span>
          </div>
        </div>

        <div className="topbar-actions" aria-label="Document actions">
          <button className="icon-button subtle" type="button" onClick={resetDocument} title="New document">
            <RotateCcw aria-hidden="true" size={18} />
          </button>
          <button className="icon-button subtle danger" type="button" onClick={recovery.clear} title="Clear local draft">
            <Trash2 aria-hidden="true" size={18} />
          </button>
          <button className="command-button" type="button" onClick={() => printDocument()}>
            <Printer aria-hidden="true" size={18} />
            PDF
          </button>
          <details className="download-menu">
            <summary className="command-button primary">
              <Download aria-hidden="true" size={18} />
              Download
            </summary>
            <div className="download-list">
              {exportOptions.map((option) => (
                <button key={option.format} type="button" onClick={() => void handleExport(option.format)}>
                  <span>{option.label}</span>
                  <small>{option.hint}</small>
                </button>
              ))}
            </div>
          </details>
        </div>
      </header>

      <div
        className="toolbar"
        aria-label="Editor toolbar"
        onMouseDownCapture={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest("button")) {
            event.preventDefault();
          }
        }}
      >
        <div className="toolbar-group">
          <button type="button" onClick={() => runCommand("undo")} title="Undo">
            <Undo2 aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("redo")} title="Redo">
            <Redo2 aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="toolbar-group settings-inline">
          <Settings2 aria-hidden="true" size={16} />
          <select
            value={document.settings.paperSize}
            onChange={(event) => updateSettings({ paperSize: event.target.value as DocumentSettings["paperSize"] })}
            title="Page size"
          >
            {paperOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={document.settings.margin}
            onChange={(event) => updateSettings({ margin: event.target.value as DocumentSettings["margin"] })}
            title="Margin"
          >
            {marginOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={document.settings.orientation === "landscape" ? "active" : ""}
            onClick={() =>
              updateSettings({
                orientation: document.settings.orientation === "portrait" ? "landscape" : "portrait",
              })
            }
            title="Toggle orientation"
          >
            {document.settings.orientation === "portrait" ? "Portrait" : "Landscape"}
          </button>
          <button
            type="button"
            className={!document.settings.showHeaderFooter ? "active" : ""}
            onClick={() => updateSettings({ showHeaderFooter: !document.settings.showHeaderFooter })}
            title="Toggle header and footer"
          >
            <Fullscreen aria-hidden="true" size={16} />
            {document.settings.showHeaderFooter ? "Header" : "Full"}
          </button>
        </div>

        <div className="toolbar-group settings-inline">
          <Type aria-hidden="true" size={16} />
          <select
            defaultValue="p"
            onChange={(event) => {
              runCommand("formatBlock", event.target.value);
              event.target.value = "p";
            }}
            title="Text style"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="blockquote">Quote</option>
          </select>
          <select
            value={document.settings.fontFamily}
            onChange={(event) => {
              updateSettings({ fontFamily: event.target.value });
              runCommand("fontName", event.target.value);
            }}
            title="Font"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <input
            min="10"
            max="32"
            type="number"
            value={document.settings.fontSize}
            onChange={(event) => {
              const fontSize = Number(event.target.value);
              updateSettings({ fontSize });
              applyInlineStyle({ fontSize: `${fontSize}px` });
            }}
            title="Base font size"
          />
          <select
            value={document.settings.lineHeight}
            onChange={(event) => {
              const lineHeight = Number(event.target.value);
              updateSettings({ lineHeight });
              applyInlineStyle({ lineHeight: String(lineHeight) });
            }}
            title="Line height"
          >
            <option value="1.2">1.2</option>
            <option value="1.4">1.4</option>
            <option value="1.6">1.6</option>
            <option value="1.8">1.8</option>
            <option value="2">2.0</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={() => runCommand("bold")} title="Bold">
            <Bold aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("italic")} title="Italic">
            <Italic aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("underline")} title="Underline">
            <Underline aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("strikeThrough")} title="Strikethrough">
            <Strikethrough aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("removeFormat")} title="Clear formatting">
            <Pilcrow aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("insertUnorderedList")} title="Bulleted list">
            <List aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("insertOrderedList")} title="Numbered list">
            <ListOrdered aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={() => runCommand("justifyLeft")} title="Align left">
            <AlignLeft aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("justifyCenter")} title="Align center">
            <AlignCenter aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("justifyRight")} title="Align right">
            <AlignRight aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="toolbar-group color-tools">
          <ColorTool
            icon={<Palette aria-hidden="true" size={18} />}
            label="Text color"
            value={document.settings.textColor}
            presets={colorPresets}
            onChange={(value) => {
              updateSettings({ textColor: value });
              runCommand("foreColor", value);
            }}
          />
          <ColorTool
            icon={<Highlighter aria-hidden="true" size={18} />}
            label="Highlight"
            value={document.settings.accentColor}
            presets={accentPresets}
            onChange={(value) => {
              updateSettings({ accentColor: value });
              runCommand("hiliteColor", value);
            }}
          />
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={insertLink} title="Link">
            <Link aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => runCommand("formatBlock", "blockquote")} title="Quote">
            <Quote aria-hidden="true" size={18} />
          </button>
          <label className="image-button" title="Insert image">
            <Image aria-hidden="true" size={18} />
            <input type="file" accept="image/*" onChange={(event) => insertImageFile(event, runCommand)} />
          </label>
        </div>
      </div>

      {recovery.warningText ? <div className="storage-warning">{recovery.warningText}</div> : null}

      <main className="canvas-workspace">
        <section
          className="canvas-shell"
          style={
            {
              "--paper-width": `${dimensions.widthMm}mm`,
              "--paper-height": `${dimensions.heightMm}mm`,
              "--paper-margin": `${margin}mm`,
              "--doc-font": document.settings.fontFamily,
              "--doc-size": `${document.settings.fontSize}px`,
              "--doc-line": document.settings.lineHeight,
              "--doc-color": document.settings.textColor,
              "--doc-accent": document.settings.accentColor,
            } as React.CSSProperties
          }
        >
          <div id="printable-document" className={`paper editing-paper ${document.settings.showHeaderFooter ? "" : "full-canvas"}`}>
            {document.settings.showHeaderFooter ? (
              <div
                ref={headerRef}
                className="page-region page-header"
                contentEditable
                suppressContentEditableWarning
                spellCheck
                onInput={() => syncEditable("headerHtml", headerRef)}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onFocus={saveSelection}
                onPaste={handlePaste}
                data-placeholder="Header"
              />
            ) : null}
            <div
              ref={editorRef}
              className="rich-canvas page-body"
              contentEditable
              suppressContentEditableWarning
              spellCheck
              onInput={() => syncEditable("contentHtml", editorRef)}
              onKeyUp={saveSelection}
              onMouseUp={saveSelection}
              onFocus={saveSelection}
              onPaste={handlePaste}
              data-placeholder="Start writing..."
            />
            {document.settings.showHeaderFooter ? (
              <div
                ref={footerRef}
                className="page-region page-footer"
                contentEditable
                suppressContentEditableWarning
                spellCheck
                onInput={() => syncEditable("footerHtml", footerRef)}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onFocus={saveSelection}
                onPaste={handlePaste}
                data-placeholder="Footer"
              />
            ) : null}
          </div>
        </section>
      </main>

      <footer className="stats-row">
        <span>{stats.words} words</span>
        <span>{stats.characters} characters</span>
        <span>{stats.readingMinutes} min read</span>
      </footer>
    </div>
  );
}

type ColorToolProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  presets: string[];
  onChange: (value: string) => void;
};

function ColorTool({ icon, label, value, presets, onChange }: ColorToolProps) {
  return (
    <div className="color-tool">
      <label title={label}>
        {icon}
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
      <div className="swatches compact" aria-label={`${label} presets`}>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={preset.toLowerCase() === value.toLowerCase() ? "active" : ""}
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
}

function insertImageFile(event: React.ChangeEvent<HTMLInputElement>, runCommand: (command: string, value?: string) => void) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    runCommand("insertHTML", `<img src="${reader.result}" alt="${file.name}">`);
    event.target.value = "";
  };
  reader.readAsDataURL(file);
}

function documentExec(command: string, value?: string) {
  globalThis.document.execCommand(command, false, value);
}

function syncDomFromState(ref: React.RefObject<HTMLDivElement>, value: string) {
  if (ref.current && ref.current.innerHTML !== value) {
    ref.current.innerHTML = value;
  }
}
