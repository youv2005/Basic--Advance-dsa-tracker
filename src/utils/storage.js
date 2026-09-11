// All browser-local persistence lives here. No backend, no network
// calls — everything is localStorage plus client-side file downloads.

export const STORAGE_KEYS = {
  PROBLEMS: "dsa-tracker:problems",
  COMPLETED: "dsa-tracker:completed",
  COMPLETED_AT: "dsa-tracker:completedAt",
  STARRED: "dsa-tracker:starred",
  NOTES: "dsa-tracker:notes",
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private browsing / storage disabled
  }
}

// Returns true on success, false if the write was blocked (private
// browsing, storage disabled, quota exceeded) — callers can surface
// that to the user instead of silently losing data.
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

// A real write/read/remove round trip, not just "does the API exist" —
// private browsing in some browsers exposes localStorage but throws
// on the first write, which a typeof check alone wouldn't catch.
export function isStorageAvailable() {
  const probeKey = "dsa-tracker:__probe__";
  try {
    localStorage.setItem(probeKey, "1");
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function loadProblems(fallback) {
  const raw = safeGet(STORAGE_KEYS.PROBLEMS);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;

    // Dataset upgrades are metadata migrations, not progress resets.
    // Replace bundled problem metadata with the newest version while
    // preserving user-owned fields such as revisionLevel on matching IDs.
    const storedById = new Map(parsed.map((p) => [p?.id, p]));
    const migrated = fallback.map((problem) => {
      const old = storedById.get(problem.id);
      if (!old) return problem;
      return {
        ...problem,
        revisionLevel: Number.isFinite(Number(old.revisionLevel)) ? Number(old.revisionLevel) : problem.revisionLevel,
      };
    });

    // Preserve genuinely custom imported problems that are not part of the
    // bundled curriculum. They remain available after an app upgrade.
    const bundledIds = new Set(fallback.map((p) => p.id));
    for (const problem of parsed) {
      if (problem?.id && !bundledIds.has(problem.id)) migrated.push(problem);
    }
    return migrated;
  } catch {
    return fallback;
  }
}

export function saveProblems(problems) {
  return safeSet(STORAGE_KEYS.PROBLEMS, JSON.stringify(problems));
}

export function loadIdSet(key) {
  const raw = safeGet(key);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function saveIdSet(key, set) {
  return safeSet(key, JSON.stringify(Array.from(set)));
}

// Generic plain-object store, shared by notes and completedAt so the
// load/save/fallback/error-handling logic exists in exactly one place.
export function loadObject(key) {
  const raw = safeGet(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveObject(key, obj) {
  return safeSet(key, JSON.stringify(obj));
}

export const loadNotes = () => loadObject(STORAGE_KEYS.NOTES);
export const saveNotes = (notes) => saveObject(STORAGE_KEYS.NOTES, notes);

export const loadCompletedAt = () => loadObject(STORAGE_KEYS.COMPLETED_AT);
export const saveCompletedAt = (completedAt) => saveObject(STORAGE_KEYS.COMPLETED_AT, completedAt);

// Clears completed/starred/notes/completedAt only — the problem
// dataset itself is left untouched, per the "Clear Progress" spec.
export function clearProgressStorage() {
  safeRemove(STORAGE_KEYS.COMPLETED);
  safeRemove(STORAGE_KEYS.COMPLETED_AT);
  safeRemove(STORAGE_KEYS.STARRED);
  safeRemove(STORAGE_KEYS.NOTES);
}

// Triggers a browser download of `data` as a formatted JSON file.
// Pure client-side Blob + object URL — no server involved.
export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
