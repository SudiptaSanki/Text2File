import { type TextDocument } from "../document/document-model";
import { draftSchema, type StoredDraft } from "./draft-schema";

const DB_NAME = "text2file";
const STORE_NAME = "drafts";
const DRAFT_KEY = "last-session";
export const MAX_DRAFT_BYTES = 1024 * 1024;
export const WARNING_DRAFT_BYTES = Math.floor(MAX_DRAFT_BYTES * 0.8);

export type SaveDraftResult =
  | { ok: true; bytes: number }
  | { ok: false; reason: "too-large" | "unavailable" | "invalid"; bytes: number };

export async function loadDraft(): Promise<TextDocument | null> {
  try {
    const db = await openDraftDb();
    const stored = await requestToPromise<StoredDraft | undefined>(
      db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DRAFT_KEY),
    );
    db.close();

    if (!stored) {
      return null;
    }

    const parsed = draftSchema.safeParse(stored);
    if (!parsed.success) {
      return null;
    }

    return {
      title: parsed.data.title,
      headerHtml: parsed.data.headerHtml ?? "",
      contentHtml: parsed.data.contentHtml,
      footerHtml: parsed.data.footerHtml ?? "",
      settings: {
        ...parsed.data.settings,
        showHeaderFooter: parsed.data.settings.showHeaderFooter ?? true,
      },
      updatedAt: parsed.data.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function saveDraft(document: TextDocument): Promise<SaveDraftResult> {
  const stored: StoredDraft = {
    version: 1,
    title: document.title.slice(0, 200),
    headerHtml: document.headerHtml,
    contentHtml: document.contentHtml,
    footerHtml: document.footerHtml,
    settings: document.settings,
    updatedAt: document.updatedAt,
  };
  const bytes = getSerializedBytes(stored);

  if (bytes > MAX_DRAFT_BYTES) {
    return { ok: false, reason: "too-large", bytes };
  }

  if (!draftSchema.safeParse(stored).success) {
    return { ok: false, reason: "invalid", bytes };
  }

  try {
    const db = await openDraftDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(stored, DRAFT_KEY);
    await transactionToPromise(tx);
    db.close();
    return { ok: true, bytes };
  } catch {
    return { ok: false, reason: "unavailable", bytes };
  }
}

export async function clearDraft() {
  const db = await openDraftDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(DRAFT_KEY);
  await transactionToPromise(tx);
  db.close();
}

export function getSerializedBytes(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
