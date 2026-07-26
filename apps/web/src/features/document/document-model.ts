export type PaperSize = "a4" | "letter" | "legal";
export type Orientation = "portrait" | "landscape";
export type MarginSize = "compact" | "normal" | "wide";
export type DocumentAlignment = "left" | "center" | "right";
export type ExportFormat = "pdf" | "docx" | "doc" | "png" | "txt" | "md" | "html";

export type DocumentSettings = {
  paperSize: PaperSize;
  orientation: Orientation;
  margin: MarginSize;
  showHeaderFooter: boolean;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textColor: string;
  accentColor: string;
  alignment: DocumentAlignment;
};

export type TextDocument = {
  title: string;
  headerHtml: string;
  contentHtml: string;
  footerHtml: string;
  settings: DocumentSettings;
  updatedAt: string;
};

export const defaultSettings: DocumentSettings = {
  paperSize: "a4",
  orientation: "portrait",
  margin: "normal",
  showHeaderFooter: true,
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: 16,
  lineHeight: 1.6,
  textColor: "#1f2937",
  accentColor: "#2563eb",
  alignment: "left",
};

export const defaultDocument: TextDocument = {
  title: "Untitled document - Text2File",
  headerHtml: "",
  contentHtml: "",
  footerHtml: "",
  settings: defaultSettings,
  updatedAt: new Date().toISOString(),
};

export const paperOptions: Array<{ value: PaperSize; label: string; widthMm: number; heightMm: number }> = [
  { value: "a4", label: "A4", widthMm: 210, heightMm: 297 },
  { value: "letter", label: "Letter", widthMm: 216, heightMm: 279 },
  { value: "legal", label: "Legal", widthMm: 216, heightMm: 356 },
];

export const marginOptions: Array<{ value: MarginSize; label: string; mm: number }> = [
  { value: "compact", label: "Compact", mm: 12 },
  { value: "normal", label: "Normal", mm: 20 },
  { value: "wide", label: "Wide", mm: 28 },
];

export const fontOptions = [
  { label: "Clean Sans", value: "Inter, Arial, sans-serif" },
  { label: "Classic Serif", value: "Georgia, Times New Roman, serif" },
  { label: "Modern System", value: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
  { label: "Mono", value: "Consolas, Menlo, Monaco, monospace" },
];

export const alignmentOptions: Array<{ value: DocumentAlignment; label: string }> = [
  { value: "left", label: "Align left" },
  { value: "center", label: "Align center" },
  { value: "right", label: "Align right" },
];

export function getPaperDimensions(settings: DocumentSettings) {
  const paper = paperOptions.find((option) => option.value === settings.paperSize) ?? paperOptions[0];

  if (settings.orientation === "landscape") {
    return {
      widthMm: paper.heightMm,
      heightMm: paper.widthMm,
    };
  }

  return {
    widthMm: paper.widthMm,
    heightMm: paper.heightMm,
  };
}

export function getMarginMm(settings: DocumentSettings) {
  return marginOptions.find((option) => option.value === settings.margin)?.mm ?? 20;
}
