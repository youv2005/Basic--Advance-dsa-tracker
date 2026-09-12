// Scoped browser-local persistence.
// Guest and signed-in accounts get separate progress stores.

export const STORAGE_KEYS = {
  PROBLEMS: "dsa-tracker:problems",
  COMPLETED: "dsa-tracker:completed",
  COMPLETED_AT: "dsa-tracker:completedAt",
  STARRED: "dsa-tracker:starred",
  NOTES: "dsa-tracker:notes",
};

const GUEST_SCOPE = "guest";

function getScopedKey(key, userId = null) {
  const scope = userId || GUEST_SCOPE;

  if (key === STORAGE_KEYS.PROBLEMS) {
    return `dsa-tracker:${scope}:problems`;
  }

  return `dsa-tracker:${scope}:${key.replace("dsa-tracker:", "")}`;
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

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
    // Ignore storage errors.
  }
}

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

// ---------------------------------------------------------
// Problems
// ---------------------------------------------------------

export function loadProblems(fallback, userId = null) {
  const raw = safeGet(getScopedKey(STORAGE_KEYS.PROBLEMS, userId));

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallback;
    }

    const storedById = new Map(
      parsed.map((p) => [p?.id, p])
    );

    const migrated = fallback.map((problem) => {
      const old = storedById.get(problem.id);

      if (!old) return problem;

      return {
        ...problem,
        revisionLevel: Number.isFinite(
          Number(old.revisionLevel)
        )
          ? Number(old.revisionLevel)
          : problem.revisionLevel,
      };
    });

    const bundledIds = new Set(
      fallback.map((p) => p.id)
    );

    for (const problem of parsed) {
      if (
        problem?.id &&
        !bundledIds.has(problem.id)
      ) {
        migrated.push(problem);
      }
    }

    return migrated;
  } catch {
    return fallback;
  }
}

export function saveProblems(problems, userId = null) {
  return safeSet(
    getScopedKey(STORAGE_KEYS.PROBLEMS, userId),
    JSON.stringify(problems)
  );
}

// ---------------------------------------------------------
// Sets
// ---------------------------------------------------------

export function loadIdSet(key, userId = null) {
  const raw = safeGet(getScopedKey(key, userId));

  if (!raw) return new Set();

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? new Set(parsed)
      : new Set();
  } catch {
    return new Set();
  }
}

export function saveIdSet(key, set, userId = null) {
  return safeSet(
    getScopedKey(key, userId),
    JSON.stringify(Array.from(set))
  );
}

// ---------------------------------------------------------
// Objects
// ---------------------------------------------------------

export function loadObject(key, userId = null) {
  const raw = safeGet(getScopedKey(key, userId));

  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export function saveObject(key, obj, userId = null) {
  return safeSet(
    getScopedKey(key, userId),
    JSON.stringify(obj)
  );
}

// ---------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------

export const loadNotes = (userId = null) =>
  loadObject(STORAGE_KEYS.NOTES, userId);

export const saveNotes = (notes, userId = null) =>
  saveObject(STORAGE_KEYS.NOTES, notes, userId);

export const loadCompletedAt = (userId = null) =>
  loadObject(STORAGE_KEYS.COMPLETED_AT, userId);

export const saveCompletedAt = (
  completedAt,
  userId = null
) =>
  saveObject(
    STORAGE_KEYS.COMPLETED_AT,
    completedAt,
    userId
  );

// ---------------------------------------------------------
// Clear current scope
// ---------------------------------------------------------

export function clearProgressStorage(userId = null) {
  safeRemove(getScopedKey(STORAGE_KEYS.COMPLETED, userId));
  safeRemove(getScopedKey(STORAGE_KEYS.COMPLETED_AT, userId));
  safeRemove(getScopedKey(STORAGE_KEYS.STARRED, userId));
  safeRemove(getScopedKey(STORAGE_KEYS.NOTES, userId));
}

// ---------------------------------------------------------
// JSON download
// ---------------------------------------------------------

export function downloadJSON(filename, data) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
