export function downloadBlob(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  downloadFile(filename, blob);
}

export function downloadFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
