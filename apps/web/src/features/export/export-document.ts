import { getMarginMm, getPaperDimensions, type ExportFormat, type TextDocument } from "../document/document-model";
import { downloadBlob, downloadFile } from "../../lib/files/download";
import { escapeHtml, htmlToMarkdown, htmlToPlainText, sanitizeHtml } from "../../lib/security/html";

type DocxModule = typeof import("docx");
type DocxTools = Pick<DocxModule, "AlignmentType" | "Document" | "HeadingLevel" | "Packer" | "Paragraph" | "TextRun">;
type RunOptions = import("docx").IRunOptions;
type DocxTextRun = InstanceType<DocxTools["TextRun"]>;

export async function exportDocument(document: TextDocument, format: ExportFormat) {
  if (format === "pdf") {
    printDocument();
    return;
  }

  if (format === "png") {
    await exportCanvasPng(document);
    return;
  }

  if (format === "docx") {
    await exportDocx(document);
    return;
  }

  const filename = createFilename(document.title, format);
  const exportHtml = getExportContentHtml(document);
  const plainText = htmlToPlainText(exportHtml);

  if (format === "txt") {
    downloadBlob(filename, "text/plain;charset=utf-8", `${document.title}\n\n${plainText}`);
    return;
  }

  if (format === "md") {
    downloadBlob(
      filename,
      "text/markdown;charset=utf-8",
      `# ${document.title || "Untitled document"}\n\n${htmlToMarkdown(exportHtml)}`,
    );
    return;
  }

  const html = createStandaloneHtml(document);
  const mime = format === "doc" ? "application/msword;charset=utf-8" : "text/html;charset=utf-8";
  downloadBlob(filename, mime, html);
}

export function printDocument() {
  window.print();
}

function createFilename(title: string, format: ExportFormat) {
  const extension = format;
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "text2file-document"}.${extension}`;
}

function createStandaloneHtml(document: TextDocument) {
  const dimensions = getPaperDimensions(document.settings);
  const margin = getMarginMm(document.settings);
  const headerHtml = document.settings.showHeaderFooter ? sanitizeHtml(document.headerHtml) : "";
  const contentHtml = sanitizeHtml(document.contentHtml);
  const footerHtml = document.settings.showHeaderFooter ? sanitizeHtml(document.footerHtml) : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(document.title || "Untitled document")}</title>
  <style>
    @page { size: ${dimensions.widthMm}mm ${dimensions.heightMm}mm; margin: ${margin}mm; }
    body {
      color: ${document.settings.textColor};
      font-family: ${document.settings.fontFamily};
      font-size: ${document.settings.fontSize}px;
      line-height: ${document.settings.lineHeight};
    }
    h1 {
      color: ${document.settings.accentColor};
      font-size: 1.8em;
      margin: 0 0 16px;
      text-align: left;
    }
    p, div, li { margin: 0 0 1em; }
    header, footer { color: #667085; font-size: .86em; }
    header { margin-bottom: 22px; }
    footer { margin-top: 22px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${headerHtml ? `<header>${headerHtml}</header>` : ""}
  ${contentHtml || "<p></p>"}
  ${footerHtml ? `<footer>${footerHtml}</footer>` : ""}
</body>
</html>`;
}

async function exportDocx(document: TextDocument) {
  const docxTools = await import("docx");
  const { Document, HeadingLevel, Packer, Paragraph } = docxTools;
  const container = documentFromHtml(getExportContentHtml(document));
  const children = [
    new Paragraph({
      text: document.title || "Untitled document",
      heading: HeadingLevel.HEADING_1,
    }),
    ...htmlToDocxParagraphs(container, document, docxTools),
  ];

  const docx = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(docx);
  downloadFile(createFilename(document.title, "docx"), blob);
}

async function exportCanvasPng(document: TextDocument) {
  const dimensions = getPaperDimensions(document.settings);
  const mmToPx = 3.7795275591;
  const width = Math.round(dimensions.widthMm * mmToPx * 2);
  const height = Math.round(dimensions.heightMm * mmToPx * 2);
  const margin = getMarginMm(document.settings);
  const title = escapeHtml(document.title || "Untitled document");
  const header = document.settings.showHeaderFooter ? sanitizeHtml(document.headerHtml) : "";
  const content = sanitizeHtml(document.contentHtml);
  const footer = document.settings.showHeaderFooter ? sanitizeHtml(document.footerHtml) : "";
  const html = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width / 2}px; min-height:${height / 2}px; padding:${margin}mm; background:#fff; color:${document.settings.textColor}; font-family:${document.settings.fontFamily}; font-size:${document.settings.fontSize}px; line-height:${document.settings.lineHeight};">
    ${header ? `<div style="color:#667085; font-size:.86em; min-height:24px;">${header}</div>` : ""}
    <div>${content || ""}</div>
    ${footer ? `<div style="color:#667085; font-size:.86em; border-top:1px solid #e5e7eb; padding-top:12px; margin-top:22px;">${footer}</div>` : ""}
  </div>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%" transform="scale(2)">
    ${html}
  </foreignObject>
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = globalThis.document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is unavailable");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0);

    canvas.toBlob((pngBlob) => {
      if (pngBlob) {
        downloadFile(createFilename(document.title, "png"), pngBlob);
      }
    }, "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function documentFromHtml(input: string) {
  const container = globalThis.document.createElement("div");
  container.innerHTML = sanitizeHtml(input);
  return container;
}

function getExportContentHtml(document: TextDocument) {
  if (!document.settings.showHeaderFooter) {
    return document.contentHtml;
  }

  return `${document.headerHtml}${document.contentHtml}${document.footerHtml}`;
}

function htmlToDocxParagraphs(container: HTMLElement, document: TextDocument, docxTools: DocxTools) {
  const { Paragraph } = docxTools;
  const blocks = Array.from(container.childNodes).filter((node) => node.textContent?.trim() || (node as HTMLElement).tagName === "IMG");

  if (blocks.length === 0) {
    return [new Paragraph("")];
  }

  return blocks.map((node) => nodeToParagraph(node, document, docxTools));
}

function nodeToParagraph(node: Node, document: TextDocument, docxTools: DocxTools) {
  const { AlignmentType, HeadingLevel, Paragraph, TextRun } = docxTools;

  if (node.nodeType === Node.TEXT_NODE) {
    return new Paragraph({
      children: [new TextRun({ text: node.textContent ?? "", size: document.settings.fontSize * 2 })],
    });
  }

  const element = node as HTMLElement;
  const align = element.style.textAlign;
  const paragraphOptions = {
    children: runsFromNode(element, docxTools, {
      size: document.settings.fontSize * 2,
      color: document.settings.textColor.replace("#", ""),
      font: document.settings.fontFamily.split(",")[0],
    }),
    ...(element.tagName === "H1" ? { heading: HeadingLevel.HEADING_1 } : {}),
    ...(element.tagName === "H2" ? { heading: HeadingLevel.HEADING_2 } : {}),
    ...(align === "center" ? { alignment: AlignmentType.CENTER } : {}),
    ...(align === "right" ? { alignment: AlignmentType.RIGHT } : {}),
  };

  return new Paragraph(paragraphOptions);
}

function runsFromNode(node: Node, docxTools: DocxTools, inherited: RunOptions): DocxTextRun[] {
  const { TextRun } = docxTools;

  if (node.nodeType === Node.TEXT_NODE) {
    return [new TextRun({ ...inherited, text: node.textContent ?? "" })];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const next: RunOptions = {
    ...inherited,
    ...(["B", "STRONG"].includes(element.tagName) || element.style.fontWeight === "bold" ? { bold: true } : {}),
    ...(["I", "EM"].includes(element.tagName) || element.style.fontStyle === "italic" ? { italics: true } : {}),
    ...(element.tagName === "U" || element.style.textDecoration.includes("underline") ? { underline: {} } : {}),
    ...(element.style.color ? { color: cssColorToHex(element.style.color) } : {}),
    ...(element.style.fontFamily ? { font: element.style.fontFamily.split(",")[0].replace(/"/g, "") } : {}),
  };

  if (element.tagName === "IMG") {
    return [new TextRun({ ...next, text: "[Image]" })];
  }

  return Array.from(element.childNodes).flatMap((child) => runsFromNode(child, docxTools, next));
}

function cssColorToHex(color: string) {
  if (color.startsWith("#")) {
    return color.replace("#", "");
  }

  const match = color.match(/\d+/g);
  if (!match || match.length < 3) {
    return "1F2937";
  }

  return match
    .slice(0, 3)
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image export failed"));
    image.src = src;
  });
}
