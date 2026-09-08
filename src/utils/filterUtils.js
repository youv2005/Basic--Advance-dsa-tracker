// Centralized filtering logic. Every filter dimension is combined
// here with AND semantics — components never re-implement any of
// this matching logic themselves, they just call these functions.

export const DEFAULT_FILTERS = {
  difficulty: "All", // "All" | "Easy" | "Medium" | "Hard"
  status: "All", // "All" | "Solved" | "Unsolved"
  starredOnly: false,
  level: "all", // "all" | level id
  category: "all", // "all" | category id
  pattern: "all", // "all" | pattern string (dynamic, from the dataset)
  search: "",
};

// Precomputes a lowercase, space-joined search string per problem so
// typing in the search box doesn't re-concatenate every problem's
// fields on every keystroke — only the cheap `.includes()` scan runs
// per filter pass. Rebuilt only when the dataset itself changes.
export function buildSearchIndex(problems) {
  const index = new Map();
  problems.forEach((p) => {
    const parts = [
      p.title,
      p.id,
      p.pattern,
      p.category,
      p.categoryName,
      p.subcategory,
      ...(Array.isArray(p.tags) ? p.tags : []),
      ...(Array.isArray(p.companies) ? p.companies : []),
    ].filter(Boolean);
    index.set(p.id, parts.join(" ").toLowerCase());
  });
  return index;
}

export function matchesFilters(problem, filters, completedIds, starredIds, searchIndex) {
  if (filters.difficulty !== "All" && problem.difficulty !== filters.difficulty) return false;

  if (filters.status === "Solved" && !completedIds.has(problem.id)) return false;
  if (filters.status === "Unsolved" && completedIds.has(problem.id)) return false;

  if (filters.starredOnly && !starredIds.has(problem.id)) return false;

  if (filters.level !== "all" && problem.level !== filters.level) return false;
  if (filters.category !== "all" && problem.category !== filters.category) return false;
  if (filters.pattern !== "all" && problem.pattern !== filters.pattern) return false;

  const needle = filters.search.trim().toLowerCase();
  if (needle) {
    const haystack = searchIndex.get(problem.id) || "";
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

// One pass over the dataset, applying every active filter dimension
// via matchesFilters. This is the single source of truth for "what's
// currently visible" — nothing else re-filters independently.
export function filterProblems(problems, filters, completedIds, starredIds, searchIndex) {
  return problems.filter((p) => matchesFilters(p, filters, completedIds, starredIds, searchIndex));
}

export function isFiltersActive(filters) {
  return (
    filters.difficulty !== DEFAULT_FILTERS.difficulty ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.starredOnly !== DEFAULT_FILTERS.starredOnly ||
    filters.level !== DEFAULT_FILTERS.level ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.pattern !== DEFAULT_FILTERS.pattern ||
    filters.search.trim() !== ""
  );
}

// Turns the current filter state into removable-pill descriptors.
// Each pill knows only its own key/label — the component decides how
// to render and remove it via clearFilterKey.
export function describeActiveFilters(filters, { levelsById, categoriesById }) {
  const pills = [];
  if (filters.difficulty !== DEFAULT_FILTERS.difficulty) {
    pills.push({ key: "difficulty", label: filters.difficulty });
  }
  if (filters.status !== DEFAULT_FILTERS.status) {
    pills.push({ key: "status", label: filters.status });
  }
  if (filters.starredOnly) {
    pills.push({ key: "starredOnly", label: "Starred" });
  }
  if (filters.level !== DEFAULT_FILTERS.level) {
    pills.push({ key: "level", label: levelsById.get(filters.level)?.name || filters.level });
  }
  if (filters.category !== DEFAULT_FILTERS.category) {
    pills.push({ key: "category", label: categoriesById.get(filters.category)?.name || filters.category });
  }
  if (filters.pattern !== DEFAULT_FILTERS.pattern) {
    pills.push({ key: "pattern", label: filters.pattern });
  }
  if (filters.search.trim()) {
    pills.push({ key: "search", label: `"${filters.search.trim()}"` });
  }
  return pills;
}

export function clearFilterKey(filters, key) {
  return { ...filters, [key]: DEFAULT_FILTERS[key] };
}
