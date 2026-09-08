import { useState, useRef, useEffect } from "react";
import { X, Upload, Download, AlertTriangle, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { validateDataset, detectImportShape, extractProblems } from "../utils/dataValidation";
import { downloadJSON } from "../utils/storage";
import { FOCUS_RING_ON_SURFACE as FOCUS_RING } from "../utils/uiConstants";

function timestamp() {
  return new Date().toISOString();
}

export default function DataSettings({
  isOpen,
  onClose,
  problems,
  completedIds,
  starredIds,
  notesText,
  completedAt,
  onMergeProblems,
  onReplaceProblems,
  onRestoreBackup,
  onClearProgress,
  triggerRef,
}) {
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState(null); // { shape, problems, raw, valid, errors }
  const [replaceDuplicates, setReplaceDuplicates] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus the close button when the drawer opens, and let Escape close
  // it — standard dialog keyboard behavior that native elements alone
  // don't give us here.
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to whatever opened the drawer once it closes, so
      // keyboard users don't lose their place on the page.
      triggerRef?.current?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  function runValidation(text) {
    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      setParsed(null);
      setStatus({ type: "error", message: `Invalid JSON: ${err.message}` });
      return;
    }

    const shape = detectImportShape(json);
    if (shape === "unknown") {
      setParsed(null);
      setStatus({ type: "error", message: "This JSON doesn't match a recognized dataset, backup, or progress shape." });
      return;
    }
    if (shape === "progress") {
      setParsed(null);
      setStatus({
        type: "error",
        message: "This looks like a progress-only export, not a problem dataset. Use a dataset or full backup file here.",
      });
      return;
    }

    const extracted = extractProblems(json);
    const result = validateDataset(extracted);
    setParsed({ shape, problems: extracted, raw: json, ...result });
    setStatus(
      result.valid
        ? { type: "success", message: `${extracted.length} problem${extracted.length === 1 ? "" : "s"} validated successfully.` }
        : { type: "error", message: `${result.errors.length} validation error${result.errors.length === 1 ? "" : "s"} found — fix these before importing.` }
    );
  }

  function handlePasteValidate() {
    if (!pasteText.trim()) {
      setStatus({ type: "error", message: "Paste some JSON first." });
      return;
    }
    runValidation(pasteText);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsReadingFile(true);
    setStatus(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setPasteText(text);
      runValidation(text);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setStatus({ type: "error", message: "Could not read that file." });
      setIsReadingFile(false);
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-selecting the same file later
  }

  function handleMerge() {
    if (!parsed?.valid) return;
    const { addedCount, duplicateIds, replacedCount } = onMergeProblems(parsed.problems, { replaceDuplicates });
    const parts = [`${addedCount} new problem${addedCount === 1 ? "" : "s"} added`];
    if (duplicateIds.length > 0) {
      parts.push(
        replaceDuplicates
          ? `${replacedCount} duplicate${replacedCount === 1 ? "" : "s"} replaced`
          : `${duplicateIds.length} duplicate id${duplicateIds.length === 1 ? "" : "s"} skipped: ${duplicateIds.join(", ")}`
      );
    }
    setStatus({ type: "success", message: parts.join(" — ") });
    setParsed(null);
    setPasteText("");
  }

  function handleReplace() {
    if (!parsed?.valid) return;
    if (!window.confirm(`Replace all ${problems.length} current problems with the ${parsed.problems.length} imported problems? This cannot be undone.`)) {
      return;
    }
    onReplaceProblems(parsed.problems);
    setStatus({ type: "success", message: `Dataset replaced with ${parsed.problems.length} problems.` });
    setParsed(null);
    setPasteText("");
  }

  function handleRestoreBackup() {
    if (!parsed?.valid || parsed.shape !== "backup") return;
    if (!window.confirm("Restore this backup? This replaces your current problems, completed/starred state, and notes. This cannot be undone.")) {
      return;
    }
    onRestoreBackup({
      problems: parsed.problems,
      completed: Array.isArray(parsed.raw.completed) ? parsed.raw.completed : [],
      starred: Array.isArray(parsed.raw.starred) ? parsed.raw.starred : [],
      notes: parsed.raw.notes && typeof parsed.raw.notes === "object" ? parsed.raw.notes : {},
      completedAt: parsed.raw.completedAt && typeof parsed.raw.completedAt === "object" ? parsed.raw.completedAt : {},
    });
    setStatus({ type: "success", message: "Backup restored." });
    setParsed(null);
    setPasteText("");
  }

  function handleClearProgress() {
    if (!window.confirm("This clears all completed, starred, and note data. Your problem dataset is kept. This cannot be undone.")) {
      return;
    }
    onClearProgress();
    setStatus({ type: "success", message: "Progress cleared." });
  }

  function buildProgressPayload() {
    return {
      completed: Array.from(completedIds),
      starred: Array.from(starredIds),
      notes: notesText,
      completedAt,
    };
  }

  function exportDataset() {
    downloadJSON("dsa-tracker-dataset.json", { version: 1, exportedAt: timestamp(), problems });
  }
  function exportProgress() {
    downloadJSON("dsa-tracker-progress.json", { version: 1, exportedAt: timestamp(), ...buildProgressPayload() });
  }
  function exportFullBackup() {
    downloadJSON("dsa-tracker-backup.json", { version: 1, exportedAt: timestamp(), problems, ...buildProgressPayload() });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-settings-heading"
        className="relative w-full max-w-md h-full bg-surface border-l border-border overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 id="data-settings-heading" className="font-semibold">
              Data Settings
            </h2>
            <p className="text-xs text-text-muted font-mono">{problems.length} problems loaded</p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close data settings"
            className={`text-text-muted hover:text-text ${FOCUS_RING} rounded`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-5">
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Import</h3>

            <label htmlFor="import-paste" className="sr-only">
              Paste JSON to import
            </label>
            <textarea
              id="import-paste"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste a problems array, dataset export, or full backup JSON..."
              className={`w-full min-h-[120px] bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text placeholder:text-text-muted resize-y ${FOCUS_RING}`}
            />

            <div className="flex gap-2">
              <button
                onClick={handlePasteValidate}
                disabled={isReadingFile}
                className={`flex-1 text-sm font-medium bg-accent/15 text-accent hover:bg-accent/25 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS_RING}`}
              >
                Validate
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isReadingFile}
                className={`flex items-center gap-1.5 text-sm font-medium border border-border hover:bg-surface-hover rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS_RING}`}
              >
                {isReadingFile ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Reading...
                  </>
                ) : (
                  <>
                    <Upload size={14} aria-hidden="true" /> Import file
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Choose a JSON file to import"
              />
            </div>

            <div aria-live="polite">
              {status && (
                <div
                  className={`flex items-start gap-2 text-xs rounded-lg p-3 ${
                    status.type === "success" ? "bg-easy/10 text-easy" : "bg-hard/10 text-hard"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}
            </div>

            {parsed?.errors?.length > 0 && (
              <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto bg-bg border border-border rounded-lg p-3 text-xs font-mono text-hard">
                {parsed.errors.map((err, i) => (
                  <li key={i}>
                    [{err.id}] {err.field}: {err.message}
                  </li>
                ))}
              </ul>
            )}

            {parsed?.valid && parsed.shape !== "backup" && (
              <div className="flex flex-col gap-2 border border-border rounded-lg p-3">
                <label className="flex items-center gap-2 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    checked={replaceDuplicates}
                    onChange={(e) => setReplaceDuplicates(e.target.checked)}
                    className={`accent-accent ${FOCUS_RING}`}
                  />
                  Replace duplicate ids with the imported version
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleMerge}
                    className={`flex-1 text-sm font-medium bg-accent text-bg rounded-lg py-2 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
                  >
                    Merge Dataset
                  </button>
                  <button
                    onClick={handleReplace}
                    className={`flex-1 text-sm font-medium border border-hard/50 text-hard rounded-lg py-2 hover:bg-hard/10 transition-colors ${FOCUS_RING}`}
                  >
                    Replace Dataset
                  </button>
                </div>
              </div>
            )}

            {parsed?.valid && parsed.shape === "backup" && (
              <button
                onClick={handleRestoreBackup}
                className={`text-sm font-medium bg-accent text-bg rounded-lg py-2 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              >
                Restore Full Backup
              </button>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Export</h3>
            <button
              onClick={exportDataset}
              className={`flex items-center gap-2 text-sm border border-border hover:bg-surface-hover rounded-lg px-3 py-2 transition-colors ${FOCUS_RING}`}
            >
              <Download size={14} aria-hidden="true" /> Export Dataset
            </button>
            <button
              onClick={exportProgress}
              className={`flex items-center gap-2 text-sm border border-border hover:bg-surface-hover rounded-lg px-3 py-2 transition-colors ${FOCUS_RING}`}
            >
              <Download size={14} aria-hidden="true" /> Export Progress
            </button>
            <button
              onClick={exportFullBackup}
              className={`flex items-center gap-2 text-sm border border-border hover:bg-surface-hover rounded-lg px-3 py-2 transition-colors ${FOCUS_RING}`}
            >
              <Download size={14} aria-hidden="true" /> Export Full Backup
            </button>
          </section>

          <section className="flex flex-col gap-2 border border-hard/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-hard flex items-center gap-1.5">
              <AlertTriangle size={14} aria-hidden="true" /> Danger Zone
            </h3>
            <p className="text-xs text-text-muted">Clears completed, starred, and notes. Your problem dataset is kept.</p>
            <button
              onClick={handleClearProgress}
              className={`flex items-center justify-center gap-2 text-sm font-medium border border-hard/50 text-hard rounded-lg py-2 hover:bg-hard/10 transition-colors ${FOCUS_RING}`}
            >
              <Trash2 size={14} aria-hidden="true" /> Clear Progress
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
