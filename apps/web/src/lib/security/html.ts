export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "DIV",
  "EM",
  "FONT",
  "H1",
  "H2",
  "H3",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "SPAN",
  "S",
  "STRIKE",
  "STRONG",
  "SUB",
  "SUP",
  "U",
  "UL",
]);

const allowedStyleProperties = new Set([
  "color",
  "background-color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "line-height",
]);

export function sanitizeHtml(input: string) {
  const template = document.createElement("template");
  template.innerHTML = input;
  sanitizeNode(template.content);
  return template.innerHTML;
}

export function htmlToPlainText(input: string) {
  const template = document.createElement("template");
  template.innerHTML = sanitizeHtml(input);
  return template.content.textContent ?? "";
}

export function htmlToMarkdown(input: string) {
  const container = document.createElement("div");
  container.innerHTML = sanitizeHtml(input);

  return Array.from(container.childNodes)
    .map((node) => nodeToMarkdown(node))
    .join("\n\n")
    .trim();
}

function sanitizeNode(node: Node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = child as HTMLElement;
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name === "style") {
        element.setAttribute("style", sanitizeStyle(value));
        return;
      }

      if (element.tagName === "A" && name === "href" && isSafeUrl(value)) {
        element.setAttribute("rel", "noreferrer");
        return;
      }

      if (element.tagName === "IMG" && name === "src" && isSafeImageUrl(value)) {
        return;
      }

      if (["alt", "title"].includes(name)) {
        return;
      }

      element.removeAttribute(attribute.name);
    });

    sanitizeNode(element);
  });
}

function sanitizeStyle(value: string) {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf(":");
      if (separator === -1) {
        return "";
      }

      const property = part.slice(0, separator).trim().toLowerCase();
      const rawValue = part.slice(separator + 1).trim();
      if (!allowedStyleProperties.has(property) || /url|expression|javascript/i.test(rawValue)) {
        return "";
      }

      return `${property}: ${rawValue}`;
    })
    .filter(Boolean)
    .join("; ");
}

function isSafeUrl(value: string) {
  return /^(https?:|mailto:|#)/i.test(value);
}

function isSafeImageUrl(value: string) {
  return /^(data:image\/(png|jpeg|jpg|gif|webp);base64,|blob:|https?:)/i.test(value);
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const text = Array.from(element.childNodes).map((child) => nodeToMarkdown(child)).join("");

  if (element.tagName === "H1") {
    return `# ${text}`;
  }
  if (element.tagName === "H2") {
    return `## ${text}`;
  }
  if (element.tagName === "H3") {
    return `### ${text}`;
  }
  if (element.tagName === "LI") {
    return `- ${text}`;
  }
  if (element.tagName === "BR") {
    return "\n";
  }
  if (element.tagName === "STRONG" || element.tagName === "B") {
    return `**${text}**`;
  }
  if (element.tagName === "EM" || element.tagName === "I") {
    return `*${text}*`;
  }
  if (element.tagName === "A") {
    const href = element.getAttribute("href");
    return href ? `[${text}](${href})` : text;
  }

  return text;
}
