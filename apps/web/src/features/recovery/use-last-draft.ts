import { useEffect, useMemo, useRef, useState } from "react";
import { type TextDocument } from "../document/document-model";
import { clearDraft, loadDraft, MAX_DRAFT_BYTES, saveDraft, WARNING_DRAFT_BYTES } from "./draft-storage";

type DraftState = {
  bytes: number;
  lastSavedAt: string | null;
  status: "idle" | "saving" | "saved" | "too-large" | "unavailable";
};

export function useLastDraft(document: TextDocument, setDocument: (document: TextDocument) => void) {
  const [draftState, setDraftState] = useState<DraftState>({
    bytes: 0,
    lastSavedAt: null,
    status: "idle",
  });
  const hasLoaded = useRef(false);

  useEffect(() => {
    let ignore = false;

    loadDraft().then((draft) => {
      if (!ignore && draft) {
        setDocument(draft);
        setDraftState({
          bytes: 0,
          lastSavedAt: draft.updatedAt,
          status: "saved",
        });
      }
      hasLoaded.current = true;
    });

    return () => {
      ignore = true;
    };
  }, [setDocument]);

  useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }

    setDraftState((current) => ({ ...current, status: "saving" }));
    const timer = window.setTimeout(async () => {
      const result = await saveDraft(document);
      setDraftState({
        bytes: result.bytes,
        lastSavedAt: result.ok ? document.updatedAt : null,
        status: result.ok ? "saved" : result.reason === "too-large" ? "too-large" : "unavailable",
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [document]);

  useEffect(() => {
    function saveBeforeHide() {
      void saveDraft(document);
    }

    window.addEventListener("pagehide", saveBeforeHide);
    return () => window.removeEventListener("pagehide", saveBeforeHide);
  }, [document]);

  const statusText = useMemo(() => {
    if (draftState.status === "saving") {
      return "Saving locally";
    }
    if (draftState.status === "too-large") {
      return "Draft is too large";
    }
    if (draftState.status === "unavailable") {
      return "Local recovery unavailable";
    }
    if (draftState.lastSavedAt) {
      return `Saved ${formatTime(draftState.lastSavedAt)}`;
    }
    return "Local draft ready";
  }, [draftState]);

  const warningText = useMemo(() => {
    if (draftState.status === "too-large") {
      return `This draft is over the ${formatBytes(MAX_DRAFT_BYTES)} local recovery limit. Download a backup before closing.`;
    }
    if (draftState.bytes >= WARNING_DRAFT_BYTES) {
      return `Local recovery is near its ${formatBytes(MAX_DRAFT_BYTES)} limit.`;
    }
    if (draftState.status === "unavailable") {
      return "This browser could not save the local draft. Downloads and printing still work.";
    }
    return "";
  }, [draftState]);

  async function clear() {
    const shouldClear = window.confirm("Clear the local browser draft for this device?");
    if (!shouldClear) {
      return;
    }

    await clearDraft();
    setDraftState({
      bytes: 0,
      lastSavedAt: null,
      status: "idle",
    });
  }

  return {
    statusText,
    warningText,
    clear,
  };
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "locally";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(value: number) {
  return `${(value / 1024 / 1024).toFixed(0)} MiB`;
}
