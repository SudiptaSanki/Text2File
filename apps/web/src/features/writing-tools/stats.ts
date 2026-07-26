import { htmlToPlainText } from "../../lib/security/html";

export function getDocumentStats(contentHtml: string) {
  const content = htmlToPlainText(contentHtml);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  const readingMinutes = Math.max(1, Math.ceil(words / 220));

  return {
    words,
    characters,
    readingMinutes,
  };
}
